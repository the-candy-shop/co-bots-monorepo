// noinspection JSUnusedGlobalSymbols

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { loadPalettesEncoded, TAGS } from "../utils/constants";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { execute } = deployments;

  const { deployer } = await getNamedAccounts();

  const palettesEncoded = loadPalettesEncoded();

  await execute(
    "CoBotsRendererV2",
    {
      from: deployer,
      log: true,
    },
    "setFillPalette",
    palettesEncoded.fillBytes
  );
};

export default func;
func.tags = [TAGS.CO_BOTS_PALETTES];
func.dependencies = [TAGS.CO_BOTS];
