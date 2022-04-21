import { BigNumber, BigNumberish } from "ethers";
import { Collection } from "@clemlaflemme.eth/contracts/utils/types";

export type Palettes = {
  palette: Array<string>;
  collection: Collection;
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
  mintPublicPrice: BigNumber;
};
