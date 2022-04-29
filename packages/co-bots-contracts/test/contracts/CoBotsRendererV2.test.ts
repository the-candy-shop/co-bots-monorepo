import { deployments, ethers } from "hardhat";
import { TAGS } from "../../utils/constants";
import { CoBotsRendererV2 } from "../../typechain";
import * as path from "path";
import fs from "fs";

const setup = async () => {
  await deployments.fixture([
    TAGS.CO_BOTS,
    TAGS.CO_BOTS_SUBSCRIPTION,
    TAGS.CO_BOTS_PALETTES,
  ]);
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
      [...Array(10_000).keys()].map((tokenId) => {
        it(`Token ${tokenId} should match snapshot`, async function () {
          const { CoBotsRendererV2 } = await setup();
          const res = await CoBotsRendererV2.tokenURI(tokenId, 0);
          let outputFile = `./test/contracts/__snapshots__/TOKENS/${tokenId}.json`;
          fs.mkdirSync(path.dirname(outputFile), { recursive: true });
          fs.writeFileSync(outputFile, res.split(",").slice(1).join(","));
          outputFile = `./test/contracts/__snapshots__/TOKENS/${tokenId}.svg`;
          fs.writeFileSync(
            outputFile,
            decodeURI(
              JSON.parse(res.split(",").slice(1).join(","))
                ["image"].split(",")[1]
                .replace(/%23/g, "#")
            )
          );
        });
      })
    );
  });
});
