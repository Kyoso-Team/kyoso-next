import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";
import * as v from "valibot";

import { validateTournamentAccess } from "../utils/handlers/tournament-access.handler";

const schema = v.object({
  slug: v.string(),
  filename: v.string(),
  contentType: v.string(),
  assetType: v.picklist(["banner", "logo"]),
});

export default defineProtectedEventHandler(async (event, { session }) => {
  const body = await readValidatedBody(event, (body) => v.parse(schema, body));

  const ext = body.contentType.split("/").at(-1);

  if (!ext) throw new Error("Invalid content type");

  const tournament = await validateTournamentAccess(session, body.slug);

  const key = `${tournament.slug}/${body.assetType}/${nanoid()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: "assets",
    Key: key,
    ContentType: body.contentType,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });

  return { url, key };
});
