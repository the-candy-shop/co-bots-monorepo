// noinspection JSUnusedGlobalSymbols

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { MYSTERY_CHALLENGE, PRIZES, TAGS } from "../utils/constants";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network, ethers } = hre;
  const { deploy, execute } = deployments;
  const { deployer, integers, linkToken, ens, coBotsV1 } =
    await getNamedAccounts();
  let { vrfCoordinator } = await getNamedAccounts();
  const parameters = {
    cobotsV1Discount: 2,
    mintOutFoundersWithdrawalDelay: 2 * 60 * 60, // 2 hours
    grandPrizeDelay: 60 * 60, // 1 hour
    maxCobots: 10_000,
    contestDuration: 28 * 24 * 60 * 60, // 28 days
    mintPublicPrice: ethers.utils.parseEther("0.05"),
  };

  let gasKeyHash;
  if (network.tags.mainnet) {
    gasKeyHash =
      "0x9fe0eebf5e446e3c998ec9bb19951541aee00bb90ea201ae456421a2ded86805";
  } else {
    gasKeyHash =
      "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc";
  }

  if (network.tags.local) {
    const linkEthFeed = "0xFABe80711F3ea886C3AC102c81ffC9825E16162E";

    const vrfTx = await deploy("VRFCoordinatorV2TestHelper", {
      from: deployer,
      log: true,
      args: [linkToken, ethers.constants.AddressZero, linkEthFeed],
      contract:
        "contracts/test/VRFCoordinatorV2TestHelper.sol:VRFCoordinatorV2TestHelper",
    });
    vrfCoordinator = vrfTx.address;
    await execute(
      "VRFCoordinatorV2TestHelper",
      { from: deployer },
      "setConfig",
      3,
      2500000,
      86400,
      33285,
      "60000000000000000",
      {
        fulfillmentFlatFeeLinkPPMTier1: 250000,
        fulfillmentFlatFeeLinkPPMTier2: 250000,
        fulfillmentFlatFeeLinkPPMTier3: 250000,
        fulfillmentFlatFeeLinkPPMTier4: 250000,
        fulfillmentFlatFeeLinkPPMTier5: 250000,
        reqsForTier2: 0,
        reqsForTier3: 0,
        reqsForTier4: 0,
        reqsForTier5: 0,
      }
    );
  }

  // Deploy renderer
  const rendererTx = await deploy("CoBotsRendererV2", {
    from: deployer,
    log: true,
    args: [],
    libraries: { Integers: integers },
  });

  // Deploy token
  if (PRIZES.reduce((acc, prize) => acc + prize.amount, 0) !== 300) {
    throw new Error(
      "The total prize amount must be 300 ETH. Please update the PRIZES constant."
    );
  }

  await deploy("CoBotsV2", {
    from: deployer,
    log: true,
    args: [
      "Co-Bots Extravaganza",
      "CBTE",
      rendererTx.address,
      vrfCoordinator,
      linkToken,
      gasKeyHash,
      parameters,
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
