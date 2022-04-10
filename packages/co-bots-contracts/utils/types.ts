import { BigNumberish } from "ethers";

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: number;
};

export type Trait = Rect[];

export type Palettes = {
  fill: string[];
  trait: Record<string, Rect[]>;
  layer: string[];
  layerIndexes: number[];
  item: string[];
};

export type PalettesStorage = {
  fillBytes: string;
  traitBytes: string;
  traitBytesIndexes: string;
  layerIndexes: string;
};

export type Prize = {
  checkpoint: number;
  amount: BigNumberish;
  isContest: boolean;
};

export type MysteryChallenge = {
  ensId: BigNumberish;
  value: number;
  prizeIndex: number;
};

export type CoBotsParameters = {
  cobotsV1Discount: number;
  mintOutFoundersWithdrawalDelay: number;
  grandPrizeDelay: number;
  maxCobots: number;
  contestDuration: number;
  mintPublicPrice: BigNumberish;
};
