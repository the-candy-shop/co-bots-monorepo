import chai from "chai";
import { solidity } from "ethereum-waffle";
import { deployments, ethers } from "hardhat";
import { loadPalettes, TAGS } from "../../utils/constants";

import { jestSnapshotPlugin } from "mocha-chai-jest-snapshot";
import * as path from "path";
import fs from "fs";

chai.use(jestSnapshotPlugin());
chai.use(solidity);
const { expect } = chai;

const palettes = loadPalettes();

describe("CoBotsRenderer", async function () {
  describe("getFill", () => {
    palettes.fill.forEach((fill, index) => {
      it(`Index ${index} should return ${fill}`, async function () {
        await deployments.fixture(TAGS.CO_BOTS_PALETTES);
        const CoBotsRenderer = await ethers.getContract("CoBotsRenderer");
        const res = await CoBotsRenderer.getFill(index);
        expect(res).to.equal(fill);
      });
    });
  });

  describe("getTraitIndex", () => {
    palettes.layerIndexes.forEach((layerIndex, _layerIndex) => {
      const itemIndexes =
        _layerIndex === palettes.layerIndexes.length - 1
          ? [0]
          : [
              ...Array(
                palettes.layerIndexes[_layerIndex + 1] - layerIndex + 1
              ).keys(),
            ];
      itemIndexes.forEach((itemIndex) => {
        const expected =
          itemIndex === palettes.layerIndexes[_layerIndex + 1] - layerIndex
            ? 255
            : layerIndex + itemIndex;

        it(`Layer ${_layerIndex}, item ${itemIndex} should return ${expected}`, async function () {
          await deployments.fixture(TAGS.CO_BOTS_PALETTES);
          const CoBotsRenderer = await ethers.getContract("CoBotsRenderer");
          const res = await CoBotsRenderer.getTraitIndex(
            _layerIndex,
            itemIndex
          );
          expect(res).to.equal(expected);
        });
      });
    });
  });

  describe("getImageURI", () => {
    Object.keys(palettes.trait).forEach((fileName, index) => {
      it(`${fileName} should match snapshot`, async function () {
        await deployments.fixture(TAGS.CO_BOTS_PALETTES);
        const CoBotsRenderer = await ethers.getContract("CoBotsRenderer");
        const traitBytes = await CoBotsRenderer.getTraitBytes(index);
        const res = await CoBotsRenderer.getImageURI(traitBytes);
        const outputFile = `./test/contracts/__snapshots__/TRAITS/${fileName
          .split("/")
          .slice(2)
          .join("/")}`;
        fs.mkdirSync(path.dirname(outputFile), { recursive: true });
        fs.writeFileSync(
          outputFile,
          decodeURI(res.split(",")[1].replace(/%23/g, "#"))
        );
        expect(res).to.matchSnapshot();
      });
    });
  });

  describe("getCoBotImageURI", () => {
    const layerIndexes = [...palettes.layerIndexes, palettes.item.length]
      .map((firstIndex, index, arr) =>
        index === palettes.layerIndexes.length
          ? []
          : [...Array(arr[index + 1] - firstIndex).keys()]
      )
      .slice(0, -1);
    for (const colorIndex of layerIndexes[0]) {
      for (const digitIndex of layerIndexes[1]) {
        for (const eyesIndex of layerIndexes[2]) {
          for (const mouthIndex of layerIndexes[3]) {
            for (const antennaIndex of layerIndexes[4]) {
              for (const feetIndex of layerIndexes[5]) {
                for (const statusIndex of layerIndexes[6]) {
                  const id = `${colorIndex}-${digitIndex}-${eyesIndex}-${mouthIndex}-${antennaIndex}-${feetIndex}-${statusIndex}`;
                  it(`CoBot ${id} should match snapshot`, async function () {
                    await deployments.fixture(TAGS.CO_BOTS_PALETTES);
                    const CoBotsRenderer = await ethers.getContract(
                      "CoBotsRenderer"
                    );
                    const res = await CoBotsRenderer.getCoBotImageURI([
                      colorIndex,
                      digitIndex,
                      eyesIndex,
                      mouthIndex,
                      antennaIndex,
                      feetIndex,
                      statusIndex,
                    ]);
                    const outputFile = `./test/contracts/__snapshots__/CO_BOTS/${id}.svg`;
                    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
                    fs.writeFileSync(
                      outputFile,
                      decodeURI(res.split(",")[1].replace(/%23/g, "#"))
                    );
                    expect(res).to.matchSnapshot();
                  });
                }
              }
            }
          }
        }
      }
    }
  });

  describe.only("tokenURI", () => {
    [...Array(10_000).keys()].map((tokenId) => {
      it(`${tokenId} should match snapshot`, async function () {
        await deployments.fixture(TAGS.CO_BOTS_PALETTES);
        const CoBotsRenderer = await ethers.getContract("CoBotsRenderer");
        const res = await CoBotsRenderer.tokenURI(
          tokenId,
          0,
          true,
          tokenId % 2 === 0
        );
        let outputFile = `./test/contracts/__snapshots__/TOKENS/${tokenId}.json`;
        fs.mkdirSync(path.dirname(outputFile), { recursive: true });
        fs.writeFileSync(outputFile, res.split(",").slice(1).join(","));
        outputFile = `./test/contracts/__snapshots__/TOKENS/${tokenId}.svg`;
        fs.writeFileSync(
          outputFile,
          decodeURI(
            JSON.parse(res.split(",").slice(1).join(","))
              ["image_data"].split(",")[1]
              .replace(/%23/g, "#")
          )
        );
        expect(res).to.matchSnapshot();
      });
    });
  });
});
