import { task } from "hardhat/config";

task("open-mint", "Open public sale").setAction(
  async ({}, { deployments, getNamedAccounts, ethers }) => {
    const { deployer } = await getNamedAccounts();
    const { execute } = deployments;

    const blockNumber = await ethers.provider.getBlockNumber();
    const currentTimestamp = await ethers.provider
      .getBlock(blockNumber)
      .then((block) => block.timestamp);
    console.log(`Current timestamp: ${currentTimestamp}`);

    await execute(
      "CoBots",
      { from: deployer, log: true },
      "setPublicSaleTimestamp",
      currentTimestamp
    );
  }
);
