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
  let vrfCoordinatorAddress;
  let linkAddress;
  let subscriptionId;
  let gasKeyHash;

  if (network.tags.staging) {
    openseaAddress = "0xa5409ec958c83c3f309868babaca7c86dcb077c1";
    looksrareAddress = "0xf42aa99f011a1fa7cda90e5e98b277e306bca83e";
    integersAddress = "0x03abFda4e7cec3484D518848B5e6aa10965F91DD";
    vrfCoordinatorAddress = "0x6168499c0cFfCaCD319c818142124B7A15E857ab";
    linkAddress = "0x01BE23585060835E02B77ef475b0Cc51aA1e0709";
    subscriptionId = 755;
    gasKeyHash =
      "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc";
  } else {
    openseaAddress = "0xf57b2c51ded3a29e6891aba85459d600256cf317";
    looksrareAddress = "0x3f65a762f15d01809cdc6b43d8849ff24949c86a";
    integersAddress = "0xe5d03576716d2D66Becf01a3F3BC7B80eb05952E";
    vrfCoordinatorAddress = "0x271682DEB8C4E0901D1a1550aD2e64D568E69909";
    linkAddress = "0x514910771af9ca656af840dff83e8264ecf986ca";
    subscriptionId = 0;
    gasKeyHash =
      "0x9fe0eebf5e446e3c998ec9bb19951541aee00bb90ea201ae456421a2ded86805";
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
      subscriptionId,
      vrfCoordinatorAddress,
      linkAddress,
      gasKeyHash,
    ],
  });
};
export default func;
func.tags = [TAGS.CO_BOTS];
