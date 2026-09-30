export type AssetMetadata = {
  fileId: string;
  originalFileName: string;
};

export type Nullish<T> = T | null | undefined;

export type Participant = {
  id: number;
  osuId: number;
  username: string;
  countryCode: string;
  discord: string | null;
  rank: number;
};

export type Team = {
  id: number;
  name: string;
  avatar: AssetMetadata | null;
  rank: number;
  participants: Participant[];
};
