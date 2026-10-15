import { TaggedError } from "better-result";

export class OsuApiError extends TaggedError("OsuApiError")<{
  status: number;
  message: string;
  cause: unknown;
}> {}

export class BeatmapDecodingError extends TaggedError("BeatmapDecodingError")<{
  status: number;
  cause: unknown;
}> {}
