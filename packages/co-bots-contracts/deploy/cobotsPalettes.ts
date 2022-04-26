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
  const { deployments, getNamedAccounts, ethers, network } = hre;
  const { execute, fetchIfDifferent, log } = deployments;
  const {
    deployer,
    rendererCommons,
    rectEncoder,
    coBotsRendererV1,
    rectRenderer,
    array,
    integers,
  } = await getNamedAccounts();

  const rendererOptions = {
    from: deployer,
    log: true,
    args: [coBotsRendererV1],
    libraries: {
      RendererCommons: rendererCommons,
      RectRenderer: rectRenderer,
      RectEncoder: rectEncoder,
      Array: array,
      Integers: integers,
    },
  };
  const { differences } = await fetchIfDifferent(
    "CoBotsRendererV2",
    rendererOptions
  );
  if (!differences && !network.tags.local) {
    log(
      `skipping "${TAGS.CO_BOTS_PALETTES}" as CoBotsRendererV2 didn't change`
    );
    return;
  }
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
    collectionEncoded.traits
  );
};

export default func;
func.tags = [TAGS.CO_BOTS_PALETTES];
func.dependencies = [TAGS.CO_BOTS];
