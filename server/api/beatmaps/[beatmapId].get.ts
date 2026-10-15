import * as v from "valibot";

import { db } from "../../database/client";

export default defineCachedEventHandler(
  async (event) => {
    const { beatmapId } = await getValidatedRouterParams(event, (params) =>
      v.parse(
        v.object({
          beatmapId: v.pipe(v.string(), v.toNumber(), v.integer()),
        }),
        params,
      ),
    );

    const result = await db.query.osuBeatmapFile.findFirst({
      where: {
        beatmapId,
      },
      columns: {
        fileContents: true,
      },
    });

    return result?.fileContents;
  },
  {
    maxAge: 60 * 60 * 24 * 7,
    name: "osu-beatmap-file",
  },
);
