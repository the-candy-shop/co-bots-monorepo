import { deployments, ethers } from "hardhat";
import { TAGS } from "../../utils/constants";
import { CoBotsRendererV2 } from "../../typechain";
import * as path from "path";
import fs from "fs";
import chai from "chai";

const { expect } = chai;

const setup = async () => {
  await deployments.fixture([TAGS.CO_BOTS, TAGS.CO_BOTS_SUBSCRIPTION]);
  const contracts = {
    CoBotsRendererV2: (await ethers.getContract(
      "CoBotsRendererV2"
    )) as CoBotsRendererV2,
  };

  return {
    ...contracts,
  };
};

describe("CoBotsRendererV2", function () {
  describe("tokenURI", async () => {
    await Promise.all(
      [...Array(1).keys()].map((tokenId) => {
        it(`Token ${tokenId} should match snapshot`, async function () {
          const { CoBotsRendererV2 } = await setup();
          const tokenURI = JSON.parse(
            (await CoBotsRendererV2.tokenURI(tokenId, 0)).replace(
              "data:application/json,",
              ""
            )
          );
          const tokenData = await CoBotsRendererV2.tokenData(tokenId, 0);

          expect(tokenURI).to.deep.equal({
            image: tokenData.image,
            name: tokenData.name,
            description: tokenData.description,
            attributes: tokenData.attributes.map((a) => ({
              trait_type: a.trait_type,
              value: a.value,
            })),
          });
          let outputFile = `./test/contracts/__snapshots__/TOKENS/${tokenId}.json`;

          fs.mkdirSync(path.dirname(outputFile), { recursive: true });
          fs.writeFileSync(outputFile, JSON.stringify(tokenURI));
          outputFile = `./test/contracts/__snapshots__/TOKENS/${tokenId}.svg`;
          fs.writeFileSync(
            outputFile,
            decodeURI(tokenData.image.split(",")[1].replace(/%23/g, "#"))
          );
        });
      })
    );
  });
});
