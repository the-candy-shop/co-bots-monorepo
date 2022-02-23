import { task } from "hardhat/config";
import fs from "fs";
import { Palettes } from "../utils/types";
import {
  MAX_CONTRACT_SIZE,
  PALETTES_ENCODED_FILE,
  PALETTES_FILE,
} from "../utils/constants";
import { encodeTrait } from "../utils/encoding";

task(
  "encode-palettes",
  "Take the rect and fill palettes and turns them into bytes for storage"
)
  .addOptionalParam("input", "The output file", PALETTES_FILE)
  .addOptionalParam("output", "The output file", PALETTES_ENCODED_FILE)
  .setAction(async ({ input, output }, { ethers }) => {
    const {
      utils: { hexDataLength, hexlify },
    } = ethers;

    const palettes: Palettes = JSON.parse(
      fs.readFileSync(input, { encoding: "utf-8" })
    );

    const fillBytes = "0x" + palettes.fill.join("");
    console.assert(
      hexDataLength(fillBytes) < MAX_CONTRACT_SIZE,
      "Fill is greater than 24k"
    );

    const traitBytesArray = Object.values(palettes.trait).map(encodeTrait);

    let traitBytes = "0x";
    let traitBytesIndexes = "0x0000";
    for (const trait of traitBytesArray) {
      traitBytes += trait;
      traitBytesIndexes += hexDataLength(traitBytes)
        .toString(16)
        .padStart(4, "0");
    }

    const layerIndexes = hexlify([
      ...palettes.layerIndexes,
      Object.keys(palettes.trait).length,
    ]);

    const paletteBytes = {
      fillBytes,
      traitBytesIndexes,
      traitBytes,
      layerIndexes,
      layer: palettes.layer,
      item: palettes.item,
    };

    fs.writeFileSync(output, JSON.stringify(paletteBytes, null, 2));
  });
