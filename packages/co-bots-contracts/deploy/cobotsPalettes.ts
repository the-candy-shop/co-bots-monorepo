// noinspection JSUnusedGlobalSymbols

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { loadPalettesEncoded, TAGS } from "../utils/constants";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { BigNumber } = ethers;
  const { execute } = deployments;

  const { deployer } = await getNamedAccounts();
  await deployments.get("CoBotsRenderer");

  const palettesEncoded = loadPalettesEncoded();

  let gas = BigNumber.from(0);
  let tx;
  tx = await execute(
    "CoBotsRenderer",
    {
      from: deployer,
      log: true,
    },
    "setFillPalette",
    palettesEncoded.fillBytes
  );
  gas = gas.add(BigNumber.from(tx.gasUsed));
  tx = await execute(
    "CoBotsRenderer",
    {
      from: deployer,
      log: true,
    },
    "setTraitPalette",
    palettesEncoded.traitBytes
  );
  gas = gas.add(BigNumber.from(tx.gasUsed));
  tx = await execute(
    "CoBotsRenderer",
    {
      from: deployer,
      log: true,
    },
    "setTraitPaletteIndexes",
    palettesEncoded.traitBytesIndexes
  );
  gas = gas.add(BigNumber.from(tx.gasUsed));

  tx = await execute(
    "CoBotsRenderer",
    {
      from: deployer,
      log: true,
    },
    "setLayerIndexes",
    palettesEncoded.layerIndexes
  );
  gas = gas.add(BigNumber.from(tx.gasUsed));

  console.log(`Palettes gas: ${gas.toString()}`);
};

export default func;
func.tags = [TAGS.CO_BOTS_PALETTES];
func.dependencies = [TAGS.CO_BOTS];
