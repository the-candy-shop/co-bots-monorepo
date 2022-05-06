import { task, types } from "hardhat/config";
import { CoBotsV2 } from "../typechain";

task("mint-batch", "Mint a batch of token")
  .addOptionalParam("batchSize", "The number of token to mint", 32, types.int)
  .setAction(
    async ({ batchSize }, { deployments, getNamedAccounts, ethers }) => {
      const { deployer } = await getNamedAccounts();
      const { execute } = deployments;

      const CoBotsV2 = (await ethers.getContract("CoBotsV2")) as CoBotsV2;
      const MINT_BATCH_LIMIT = await CoBotsV2.MINT_BATCH_LIMIT();
      const PARAMETERS = await CoBotsV2.PARAMETERS();
      let total = 0;

      for (let i = 0; i < Math.ceil(batchSize / MINT_BATCH_LIMIT); i++) {
        const count =
          MINT_BATCH_LIMIT * (i + 1) > batchSize
            ? batchSize % MINT_BATCH_LIMIT
            : MINT_BATCH_LIMIT;
        await execute(
          "CoBotsV2",
          {
            from: deployer,
            log: true,
            value: PARAMETERS.mintPublicPrice.mul(count),
          },
          "mintPublicSale",
          count,
          []
        );
        total += count;
        console.log(`Minted ${count} tokens`);
      }
      console.log(`Minted a total of ${total} tokens`);
      const totalSupply = await CoBotsV2.totalSupply();
      console.log(`Total supply: ${totalSupply}`);
    }
  );
