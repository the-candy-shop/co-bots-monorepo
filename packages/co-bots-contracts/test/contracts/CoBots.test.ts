import { setupUser, setupUsers } from "./utils";
import chai from "chai";
import {
  deployments,
  ethers,
  getNamedAccounts,
  getUnnamedAccounts,
  network,
} from "hardhat";
import { solidity } from "ethereum-waffle";
import { TAGS } from "../../utils/constants";

chai.use(solidity);
const { expect } = chai;

const setup = async () => {
  await deployments.fixture([TAGS.CO_BOTS, TAGS.CO_BOTS_PALETTES]);
  const contracts = {
    CoBots: await ethers.getContract("CoBots"),
  };
  const { deployer } = await getNamedAccounts();
  const users = await setupUsers(await getUnnamedAccounts(), contracts);
  return {
    ...contracts,
    users,
    deployer: await setupUser(deployer, contracts),
  };
};

const publicSaleFixture = deployments.createFixture(async ({ network }) => {
  const contractsAndUsers = await setup();
  const currentBlockNumber = await ethers.provider.getBlockNumber();
  const currentTimestamp = await ethers.provider
    .getBlock(currentBlockNumber)
    .then((block) => block.timestamp);
  await contractsAndUsers.deployer.CoBots.setPublicSaleTimestamp(
    currentTimestamp
  );
  await network.provider.send("evm_mine");
  return contractsAndUsers;
});

describe("CoBots", function () {
  describe("mintBatchPublicSale", async function () {
    it("should revert when minting is not open", async () => {
      const { users } = await setup();
      expect(users[0].CoBots.mintPublicSale(1)).to.be.revertedWith(
        "Public sale not open"
      );
    });
    it("should revert when price does not match", async () => {
      const { users } = await publicSaleFixture();
      expect(users[0].CoBots.mintPublicSale(1)).to.be.revertedWith(
        "Price does not match"
      );
    });
    it("should revert when quantity is too high", async () => {
      const { users } = await publicSaleFixture();
      expect(
        users[0].CoBots.mintPublicSale(21, {
          value: ethers.utils.parseEther("1.05"),
        })
      ).to.be.revertedWith(
        "Co-Bots: the requested quantity exceeds the maximum allowed"
      );
    });
    it("should mint quantity to sender", async () => {
      const { users } = await publicSaleFixture();
      await users[0].CoBots.mintPublicSale(20, {
        value: ethers.utils.parseEther("1"),
      });
      const balance = await users[0].CoBots.balanceOf(users[0].address);
      expect(balance).to.eq(20);
    });
    it("should revert when mint is closed", async () => {
      const { users } = await publicSaleFixture();
      await network.provider.send("evm_increaseTime", [168 * 60 * 60 + 1]);
      expect(
        users[0].CoBots.mintPublicSale(20, {
          value: ethers.utils.parseEther("1"),
        })
      ).to.be.revertedWith("Public sale not open");
    });
  });
});
