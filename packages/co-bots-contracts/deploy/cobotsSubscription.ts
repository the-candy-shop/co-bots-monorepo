// noinspection JSUnusedGlobalSymbols

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { TAGS } from "../utils/constants";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network, ethers } = hre;
  const { execute, get } = deployments;
  const { deployer } = await getNamedAccounts();
  let linkAddress;

  if (network.tags.mainnet) {
    linkAddress = "0x514910771af9ca656af840dff83e8264ecf986ca";
  } else {
    linkAddress = "0x01BE23585060835E02B77ef475b0Cc51aA1e0709";
  }

  const CoBots = await get("CoBots");
  const LinkToken = await ethers.getContractAt(
    [
      "function balanceOf(address owner) view returns (uint256 balance)",
      "function transferFrom(address from, address to, uint256 value) returns (bool success)",
      "function approve(address _spender, uint256 _value) returns (bool)",
    ],
    linkAddress,
    deployer
  );
  const deployerBalance = await LinkToken.balanceOf(deployer);
  await LinkToken.approve(deployer, deployerBalance, {
    from: deployer,
  });
  const txTransfer = await LinkToken.transferFrom(
    deployer,
    CoBots.address,
    deployerBalance
  );
  await txTransfer.wait();
  await execute(
    "CoBots",
    { from: deployer },
    "createSubscriptionAndFund",
    deployerBalance
  );
};
export default func;
func.tags = [TAGS.CO_BOTS_SUBSCRIPTION];
func.dependencies = [TAGS.CO_BOTS];
