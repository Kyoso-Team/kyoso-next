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
  avatar: { fileId: string; originalFileName: string } | null;
  rank: number;
  participants: Participant[];
};
