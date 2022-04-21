import fs from "fs";
import { CoBotsParameters, MysteryChallenge, Palettes, Prize } from "./types";
import { ethers } from "ethers";

// Rendering constants
export const PALETTES_FILE =
  "../../packages/co-bots-image-processing/data/palettes.json";

export const loadPalettes = (): Palettes => {
  try {
    return JSON.parse(fs.readFileSync(PALETTES_FILE, "utf8"));
  } catch (e) {
    console.error(e);
    throw new Error("Could not load palettes");
  }
};

// Deploy constants
export const TAGS = {
  CO_BOTS: "CoBots",
  CO_BOTS_PALETTES: "CoBotsPalettes",
  CO_BOTS_SUBSCRIPTION: "CoBotsSubscription",
  VRF_COORDINATOR: "VrfCoordinator",
};

// Contract constants
export const PARAMETERS: CoBotsParameters = {
  cobotsV1Discount: 2,
  mintOutFoundersWithdrawalDelay: 2 * 60 * 60, // 2 hours
  grandPrizeDelay: 60 * 60, // 1 hour
  maxCobots: 10_000,
  contestDuration: 28 * 24 * 60 * 60, // 28 days
  mintPublicPrice: ethers.utils.parseEther("0.05"),
};

// Prizes constants
export const TEST_NET_PRICE_SCALING = 1_000;

export const PRIZES: Prize[] = [
  {
    checkpoint: 100,
    amount: 1,
    isContest: false,
  },
  {
    checkpoint: 200,
    amount: 2,
    isContest: false,
  },
  {
    checkpoint: 300,
    amount: 3,
    isContest: false,
  },
  {
    checkpoint: 400,
    amount: 4,
    isContest: false,
  },
  {
    checkpoint: 500,
    amount: 1,
    isContest: true,
  },
  {
    checkpoint: 500,
    amount: 1,
    isContest: true,
  },
  {
    checkpoint: 500,
    amount: 1,
    isContest: true,
  },
  {
    checkpoint: 500,
    amount: 1,
    isContest: true,
  },
  {
    checkpoint: 500,
    amount: 1,
    isContest: true,
  },
  {
    checkpoint: 750,
    amount: 6,
    isContest: false,
  },
  {
    checkpoint: 1000,
    amount: 7,
    isContest: false,
  },
  {
    checkpoint: 1500,
    amount: 8,
    isContest: false,
  },
  {
    checkpoint: 2000,
    amount: 9,
    isContest: false,
  },
  {
    checkpoint: 3000,
    amount: 2,
    isContest: true,
  },
  {
    checkpoint: 3000,
    amount: 2,
    isContest: true,
  },
  {
    checkpoint: 3000,
    amount: 2,
    isContest: true,
  },
  {
    checkpoint: 3000,
    amount: 2,
    isContest: true,
  },
  {
    checkpoint: 3000,
    amount: 2,
    isContest: true,
  },
  {
    checkpoint: 4000,
    amount: 12,
    isContest: false,
  },
  {
    checkpoint: 5000,
    amount: 14,
    isContest: false,
  },
  {
    checkpoint: 5000,
    amount: 50, // Mystery challenge
    isContest: true,
  },
  {
    checkpoint: 6000,
    amount: 16,
    isContest: false,
  },
  {
    checkpoint: 7000,
    amount: 18,
    isContest: false,
  },
  {
    checkpoint: 8000,
    amount: 4,
    isContest: true,
  },
  {
    checkpoint: 8000,
    amount: 4,
    isContest: true,
  },
  {
    checkpoint: 8000,
    amount: 4,
    isContest: true,
  },
  {
    checkpoint: 8000,
    amount: 4,
    isContest: true,
  },
  {
    checkpoint: 8000,
    amount: 4,
    isContest: true,
  },
  {
    checkpoint: 9000,
    amount: 22,
    isContest: false,
  },
  {
    checkpoint: 10000,
    amount: 24,
    isContest: false,
  },
  {
    checkpoint: 10000,
    amount: 69,
    isContest: false,
  },
];

export const MYSTERY_CHALLENGE: MysteryChallenge = {
  ensId: ethers.BigNumber.from(
    "50339762084112735281647694152894396699789156759838299774246919152996091353870"
  ),
  value: 42,
  prizeIndex: 20,
};
