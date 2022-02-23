// noinspection JSUnusedGlobalSymbols

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { TAGS } from "../utils/constants";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  let openseaAddress;
  let looksrareAddress;
  let integersAddress;

  if (network.tags.staging) {
    openseaAddress = "0xa5409ec958c83c3f309868babaca7c86dcb077c1";
    looksrareAddress = "0xf42aa99f011a1fa7cda90e5e98b277e306bca83e";
    integersAddress = "0x03abFda4e7cec3484D518848B5e6aa10965F91DD";
  } else {
    openseaAddress = "0xf57b2c51ded3a29e6891aba85459d600256cf317";
    looksrareAddress = "0x3f65a762f15d01809cdc6b43d8849ff24949c86a";
    integersAddress = "0xe5d03576716d2D66Becf01a3F3BC7B80eb05952E";
  }

  // Deploy renderer
  const rendererTx = await deploy("CoBotsRenderer", {
    from: deployer,
    log: true,
    args: [],
    libraries: { Integers: integersAddress },
  });

  // Deploy token
  await deploy("CoBots", {
    from: deployer,
    log: true,
    args: [
      "CoBots",
      "CBTS",
      rendererTx.address,
      openseaAddress,
      looksrareAddress,
    ],
  });
};
export default func;
func.tags = [TAGS.CO_BOTS];
