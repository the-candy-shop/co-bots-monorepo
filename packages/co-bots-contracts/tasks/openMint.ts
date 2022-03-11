import { task } from "hardhat/config";

task("open-mint", "Open public sale").setAction(
  async ({}, { deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const { execute } = deployments;

    await execute("CoBots", { from: deployer, log: true }, "openPublicSale");
  }
);
