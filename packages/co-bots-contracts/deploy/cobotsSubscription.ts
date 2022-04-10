// noinspection JSUnusedGlobalSymbols

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { TAGS } from "../utils/constants";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { execute, get } = deployments;
  const { deployer, linkToken } = await getNamedAccounts();

  const LinkToken = await ethers.getContractAt(
    [
      "function balanceOf(address owner) view returns (uint256 balance)",
      "function transferFrom(address from, address to, uint256 value) returns (bool success)",
      "function approve(address _spender, uint256 _value) returns (bool)",
    ],
    linkToken,
    deployer
  );
  const deployerBalance = await LinkToken.balanceOf(deployer);

  await LinkToken.approve(deployer, deployerBalance, {
    from: deployer,
  });
  const txTransfer = await LinkToken.transferFrom(
    deployer,
    (
      await get("CoBotsV2")
    ).address,
    deployerBalance
  );
  await txTransfer.wait();
  await execute(
    "CoBotsV2",
    { from: deployer },
    "createSubscriptionAndFund",
    deployerBalance
  );
};
export default func;
func.tags = [TAGS.CO_BOTS_SUBSCRIPTION];
func.dependencies = [TAGS.CO_BOTS];
