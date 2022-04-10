// noinspection JSUnusedGlobalSymbols

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import {
  MYSTERY_CHALLENGE,
  PARAMETERS,
  PRIZES,
  TAGS,
} from "../utils/constants";
import { BigNumber } from "ethers";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network, ethers } = hre;
  const { deploy, get } = deployments;
  const { deployer, integers, linkToken, ens, coBotsV1 } =
    await getNamedAccounts();
  let { vrfCoordinator } = await getNamedAccounts();
  if (network.tags.local) {
    vrfCoordinator = (await get("VRFCoordinatorV2TestHelper")).address;
  }

  let gasKeyHash;
  if (network.tags.mainnet) {
    gasKeyHash =
      "0x9fe0eebf5e446e3c998ec9bb19951541aee00bb90ea201ae456421a2ded86805";
  } else {
    gasKeyHash =
      "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc";
  }

  // Deploy renderer
  const rendererTx = await deploy("CoBotsRendererV2", {
    from: deployer,
    log: true,
    args: [],
    libraries: { Integers: integers },
  });

  // Deploy token
  if (
    PRIZES.reduce(
      (acc, prize) => acc.add(prize.amount),
      BigNumber.from(0)
    ).toNumber() !== 300
  ) {
    throw new Error(
      "The total prize amount must be 300 ETH. Please update the PRIZES constant."
    );
  }

  await deploy("CoBotsV2", {
    from: deployer,
    log: true,
    args: [
      "Co-Bots 2.0",
      "CBTE",
      rendererTx.address,
      vrfCoordinator,
      linkToken,
      gasKeyHash,
      PARAMETERS,
      PRIZES.map((prize) => ({
        ...prize,
        amount: ethers.utils.parseEther(prize.amount.toString()),
      })),
      ens,
      coBotsV1,
      MYSTERY_CHALLENGE,
    ],
  });
};
export default func;
func.tags = [TAGS.CO_BOTS];
func.dependencies = [TAGS.VRF_COORDINATOR];
