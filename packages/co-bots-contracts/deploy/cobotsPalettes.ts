// noinspection JSUnusedGlobalSymbols

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { loadPalettesEncoded, TAGS } from "../utils/constants";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { execute } = deployments;

  const { deployer } = await getNamedAccounts();
  await deployments.get("CoBotsRenderer");

  const palettesEncoded = loadPalettesEncoded();

  await execute(
    "CoBotsRenderer",
    {
      from: deployer,
      log: true,
    },
    "setFillPalette",
    palettesEncoded.fillBytes
  );
  await execute(
    "CoBotsRenderer",
    {
      from: deployer,
      log: true,
    },
    "setTraitPalette",
    palettesEncoded.traitBytes
  );
  await execute(
    "CoBotsRenderer",
    {
      from: deployer,
      log: true,
    },
    "setTraitPaletteIndexes",
    palettesEncoded.traitBytesIndexes
  );
  await execute(
    "CoBotsRenderer",
    {
      from: deployer,
      log: true,
    },
    "setLayerIndexes",
    palettesEncoded.layerIndexes
  );
};

export default func;
func.tags = [TAGS.CO_BOTS_PALETTES];
func.dependencies = [TAGS.CO_BOTS];
