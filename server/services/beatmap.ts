import crypto from "node:crypto";

import { Result } from "better-result";
import { APIError } from "osu-api-v2-js";
import { BeatmapDecoder } from "osu-parsers";
import { OsuApiError, BeatmapDecodingError } from "~~/server/utils/osu/errors";

import { osuClient } from "../osu-client";

type ParsedBeatmap = ReturnType<BeatmapDecoder["decodeFromString"]>;

export class BeatmapService {
  constructor() {}

  private async fetchBeatmapByChecksum(checksum: string) {
    return Result.tryPromise({
      try: () =>
        osuClient.lookupBeatmap({
          checksum,
        }),
      catch: (cause) =>
        new OsuApiError({
          cause,
          status: cause instanceof APIError ? (cause.response?.status_code ?? 500) : 500,
          message: cause instanceof APIError ? cause.message : "Something wrong with osu! api",
        }),
    });
  }

  public async resolveBeatmapIds(parsedBeatmap: ParsedBeatmap, checksum: string) {
    if (parsedBeatmap.metadata.beatmapId !== 0 && parsedBeatmap.metadata.beatmapSetId !== 0) {
      return Result.ok({
        beatmapId: parsedBeatmap.metadata.beatmapId,
        beatmapsetId: parsedBeatmap.metadata.beatmapSetId,
      });
    }

    return (await this.fetchBeatmapByChecksum(checksum)).map((res) => {
      return {
        beatmapId: res.id,
        beatmapsetId: res.beatmapset_id,
      };
    });
  }

  public async downloadBeatmap(beatmapId: number) {
    return Result.tryPromise({
      try: () => $fetch<string>(`https://osu.ppy.sh/osu/${beatmapId}`),
      catch: (cause) =>
        new OsuApiError({
          cause,
          status: cause instanceof APIError ? (cause.response?.status_code ?? 500) : 500,
          message: cause instanceof APIError ? cause.message : "Something wrong with osu! api",
        }),
    });
  }

  public beatmapParse(beatmapContent: string) {
    return Result.try({
      try: () => {
        const parsedBeatmap = new BeatmapDecoder().decodeFromString(beatmapContent, {
          parseColours: false,
          parseEditor: false,
          parseStoryboard: false,
          parseEvents: false,
        });

        const checksum = crypto.createHash("md5").update(beatmapContent).digest("hex");

        return {
          parsedBeatmap,
          checksum,
        };
      },
      catch: (cause) => new BeatmapDecodingError({ cause, status: 422 }),
    });
  }
}

export const beatmapService = new BeatmapService();
