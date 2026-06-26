import { S3Client } from "@aws-sdk/client-s3";

const runtimeConfig = useRuntimeConfig();

export const s3Client = new S3Client({
  region: "cn-east-1",
  credentials: {
    accessKeyId: runtimeConfig.s3.accessKey,
    secretAccessKey: runtimeConfig.s3.secretKey,
  },
  endpoint: runtimeConfig.s3.endpointUrl,
  forcePathStyle: true,
});

export const getAssetUrl = (key: string) => {
  return `${runtimeConfig.s3.assetUrl}/${key}`;
};
