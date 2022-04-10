// noinspection JSUnusedGlobalSymbols

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { TAGS } from "../utils/constants";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network, ethers } = hre;
  const { deploy, execute } = deployments;
  const { deployer, linkToken, linkETHPriceFeed } = await getNamedAccounts();

  if (!network.tags.local) {
    return;
  }

  await deploy("VRFCoordinatorV2TestHelper", {
    from: deployer,
    log: true,
    args: [linkToken, ethers.constants.AddressZero, linkETHPriceFeed],
    contract:
      "contracts/test/VRFCoordinatorV2TestHelper.sol:VRFCoordinatorV2TestHelper",
  });
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
};
export default func;
func.tags = [TAGS.VRF_COORDINATOR];
