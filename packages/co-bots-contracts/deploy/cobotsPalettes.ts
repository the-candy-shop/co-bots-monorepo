// noinspection JSUnusedGlobalSymbols

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { loadPalettes, TAGS } from "../utils/constants";
import {
  RectEncoder,
  RectEncoder__factory,
  RendererCommons,
  RendererCommons__factory,
} from "../../../../eth-projects-monorepo/packages/eth-projects-contracts/typechain";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { execute } = deployments;

  const { deployer, rendererCommons, rectEncoder } = await getNamedAccounts();

  const palettes = loadPalettes();

  const RendererCommons = (await ethers.getContractAt(
    RendererCommons__factory.abi,
    rendererCommons
  )) as RendererCommons;
  const paletteEncoded = await RendererCommons.encodePalette(palettes.palette);

  await execute(
    "CoBotsRendererV2",
    {
      from: deployer,
      log: true,
    },
    "storePalette",
    paletteEncoded
  );

  const RectEncoder = (await ethers.getContractAt(
    RectEncoder__factory.abi,
    rectEncoder
  )) as RectEncoder;

  const collectionEncoded = await RectEncoder.encodeCollection(
    palettes.collection
  );

  await execute(
    "CoBotsRendererV2",
    {
      from: deployer,
      log: true,
    },
    "storeCollection",
    collectionEncoded
  );
};

export default func;
func.tags = [TAGS.CO_BOTS_PALETTES];
func.dependencies = [TAGS.CO_BOTS];
