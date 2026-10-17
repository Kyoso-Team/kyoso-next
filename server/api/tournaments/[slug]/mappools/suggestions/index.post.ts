import { Result } from "better-result";
import { getModsEnum } from "osu-web.js";
import * as v from "valibot";
import { db } from "~~/server/database/client";
import { beatmaps, osuBeatmapFile, tournamentMappoolEntry } from "~~/server/database/schema";
import { beatmapService } from "~~/server/services/beatmap";
import { isOsuMod } from "~~/shared/osu/mods";
import { mappoolEntryCreateSchema } from "~~/shared/validation/tournament/mappools";

const ensureBeatmap = async (osuBeatmapId: number) => {
  const existingBeatmap = await db.query.beatmaps.findFirst({
    where: {
      beatmapId: osuBeatmapId,
    },
    columns: {
      id: true,
    },
  });

  if (existingBeatmap) {
    return existingBeatmap.id;
  }

  const result = await Result.gen(async function* () {
    const beatmapFileContent = yield* Result.await(beatmapService.downloadBeatmap(osuBeatmapId));
    const { parsedBeatmap, checksum } = yield* beatmapService.beatmapParse(beatmapFileContent);
    // Old osu file formats don't contain beatmap/beatmapset IDs
    // so we fetch them from API as fallback
    const { beatmapId, beatmapsetId } = yield* Result.await(
      beatmapService.resolveBeatmapIds(parsedBeatmap, checksum),
    );
    parsedBeatmap.metadata.beatmapId = beatmapId;
    parsedBeatmap.metadata.beatmapSetId = beatmapsetId;
    return Result.ok({
      beatmap: parsedBeatmap,
      fileContents: beatmapFileContent,
      checksum,
    });
  });

  if (result.isErr()) {
    throw createError({
      status: result.error.status,
      message: result.error.message,
    });
  }

  const { beatmap, fileContents, checksum } = result.value;

  return await db.transaction(async (tx) => {
    const [newBeatmapRecord] = await tx
      .insert(beatmaps)
      .values({
        beatmapId: beatmap.metadata.beatmapId,
        beatmapsetId: beatmap.metadata.beatmapSetId,
        artist: beatmap.metadata.artist,
        artistUnicode: beatmap.metadata.artistUnicode,
        title: beatmap.metadata.title,
        titleUnicode: beatmap.metadata.titleUnicode,
        difficulty: beatmap.metadata.version,
        bpm: beatmap.bpm,
        hitLength: Math.round(beatmap.length / 1000),
        maxCombo: beatmap.hitObjects.length - 1,
        ar: beatmap.difficulty.approachRate,
        cs: beatmap.difficulty.circleSize,
        od: beatmap.difficulty.overallDifficulty,
        hp: beatmap.difficulty.drainRate,
        checksum,
      })
      .onConflictDoNothing()
      .returning();

    await tx.insert(osuBeatmapFile).values({
      beatmapId: newBeatmapRecord!.id,
      fileContents,
    });

    return newBeatmapRecord!.id;
  });
};

export default defineProtectedTournamentHandler(async (event, { session }) => {
  const body = await readBody(event);

  const payload: typeof tournamentMappoolEntry.$inferInsert = {
    ...body,
    submittedByUserId: Number(session.user.id),
  };

  const mappoolEntry = v.parse(mappoolEntryCreateSchema, payload);

  const existingMappoolEntry = await db.query.tournamentMappoolEntry.findFirst({
    where: {
      roundId: mappoolEntry.roundId,
      beatmap: {
        beatmapId: mappoolEntry.beatmapId,
      },
    },
    columns: {
      id: true,
    },
  });

  if (existingMappoolEntry) {
    throw createError({
      status: 400,
      message: "This mappool entry already exists",
      data: {
        error: "This mappool entry already exists",
      },
    });
  }

  const beatmapId = await ensureBeatmap(mappoolEntry.beatmapId);

  await db.insert(tournamentMappoolEntry).values({
    ...mappoolEntry,
    beatmapId,
    isFm: mappoolEntry.slot === "FM",
    modBits:
      mappoolEntry.slot && isOsuMod(mappoolEntry.slot) ? getModsEnum([mappoolEntry.slot]) : 0,
  });
});
