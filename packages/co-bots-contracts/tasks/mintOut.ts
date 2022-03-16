import { task } from "hardhat/config";
import { SingleBar } from "cli-progress";

task("mint-out", "Mint out co-bots").setAction(
  async ({}, { getNamedAccounts, getUnnamedAccounts, network, ethers }) => {
    if (network.tags.mainnet) {
      return;
    }
    if (network.tags.local) {
      await network.provider.send("evm_setIntervalMining", [1_000]);
    }

    const { deployer } = await getNamedAccounts();
    const deployerSigner = await ethers.getSigner(deployer);
    const CoBots = await ethers.getContract("CoBots");
    const constants = {
      MAX_COBOTS: await CoBots.MAX_COBOTS(),
      MINT_PUBLIC_PRICE: ethers.BigNumber.from(
        (await CoBots.MINT_PUBLIC_PRICE()).toString()
      ),
      MAX_MINT_PER_ADDRESS: await CoBots.MAX_MINT_PER_ADDRESS(),
    };
    const value = constants.MINT_PUBLIC_PRICE.mul(
      constants.MAX_MINT_PER_ADDRESS
    );
    const users = await getUnnamedAccounts().then(
      async (users) =>
        await Promise.all(
          users
            .slice(0, constants.MAX_COBOTS / constants.MAX_MINT_PER_ADDRESS)
            .map(async (user) => ({
              address: user,
              CoBots: await ethers.getContract(
                "CoBots",
                await ethers.getSigner(user)
              ),
            }))
        )
    );
    const bar = new SingleBar({});
    bar.start(constants.MAX_COBOTS, 0);
    await Promise.all(
      users.map(async (user) => {
        const balance = await user.CoBots.balanceOf(user.address);
        if (balance.toNumber() === constants.MAX_MINT_PER_ADDRESS) {
          bar.increment(constants.MAX_MINT_PER_ADDRESS);
          return;
        }
        let tx = await deployerSigner.sendTransaction({
          to: user.address,
          value: value.add(value.div(2)),
        });
        await tx.wait(5);
        tx = await user.CoBots.mintPublicSale(constants.MAX_MINT_PER_ADDRESS, {
          value,
        });
        await tx.wait();
        bar.increment(constants.MAX_MINT_PER_ADDRESS);
      })
    );
    bar.stop();

    const isMintedOut = await CoBots.isMintedOut();
    if (!isMintedOut) {
      throw new Error("CoBots is not minted out");
    }
  }
);
