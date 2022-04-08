import fs from "fs";
import { MysteryChallenge, Palettes, PalettesStorage, Prize } from "./types";

export const MAX_CONTRACT_SIZE = 24_000;

// Rendering constants
export const PALETTES_FILE =
  "../../packages/co-bots-image-processing/data/palettes.json";
export const PALETTES_ENCODED_FILE = "data/palettes-encoded.json";

export const loadPalettes = (): Palettes => {
  try {
    return JSON.parse(fs.readFileSync(PALETTES_FILE, "utf8"));
  } catch (e) {
    console.error(e);
    return {
      fill: [],
      trait: {},
      layer: [],
      layerIndexes: [],
      item: [],
    };
  }
};

export const loadPalettesEncoded = (): PalettesStorage => {
  try {
    return JSON.parse(fs.readFileSync(PALETTES_ENCODED_FILE, "utf8"));
  } catch (e) {
    console.error(e);
    return {
      fillBytes: "",
      traitBytes: "",
      traitBytesIndexes: "",
      layerIndexes: "",
    };
  }
};

// Deploy constants
export const TAGS = {
  INTEGERS: "Integers",
  CO_BOTS: "CoBots",
  CO_BOTS_PALETTES: "CoBotsPalettes",
  CO_BOTS_SUBSCRIPTION: "CoBotsSubscription",
};

// Prizes constants
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
    amount: 5,
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
    amount: 10,
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
    amount: 20,
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
  ensId: 0,
  value: 42,
  prizeIndex: 11,
};
