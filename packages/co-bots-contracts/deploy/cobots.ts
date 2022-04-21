// noinspection JSUnusedGlobalSymbols

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import {
  MYSTERY_CHALLENGE,
  PARAMETERS,
  PRIZES,
  TAGS,
  TEST_NET_PRICE_SCALING,
} from "../utils/constants";
import { BigNumber } from "ethers";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network, ethers } = hre;
  const { deploy, get } = deployments;
  const {
    deployer,
    linkToken,
    ens,
    coBotsV1,
    coBotsRendererV1,
    rendererCommons,
    rectEncoder,
    rectRenderer,
    array,
    integers,
  } = await getNamedAccounts();
  let { vrfCoordinator } = await getNamedAccounts();
  if (network.tags.local) {
    vrfCoordinator = (await get("VRFCoordinatorV2TestHelper")).address;
  }

  let gasKeyHash;
  let priceDivider: number;
  if (network.tags.mainnet) {
    gasKeyHash =
      "0x9fe0eebf5e446e3c998ec9bb19951541aee00bb90ea201ae456421a2ded86805";
    priceDivider = 1;
  } else {
    gasKeyHash =
      "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc";
    priceDivider = TEST_NET_PRICE_SCALING;
  }

  // Deploy renderer
  const rendererTx = await deploy("CoBotsRendererV2", {
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
      {
        ...PARAMETERS,
        mintPublicPrice: PARAMETERS.mintPublicPrice.div(priceDivider),
      },
      PRIZES.map((prize) => ({
        ...prize,
        amount: ethers.utils
          .parseEther(prize.amount.toString())
          .div(priceDivider),
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
