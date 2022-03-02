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
import { jestSnapshotPlugin } from "mocha-chai-jest-snapshot";

chai.use(jestSnapshotPlugin());
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

const mintedOutFixture = deployments.createFixture(async ({}) => {
  const contractsAndUsers = await publicSaleFixture();
  await Promise.all(
    contractsAndUsers.users.map((user) =>
      user.CoBots.mintPublicSale(20, {
        value: ethers.utils.parseEther("1"),
      })
    )
  );
  return contractsAndUsers;
});

describe("CoBots", function () {
  describe("mintPublicSale", async function () {
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
    it("should mint with online status", async () => {
      const { users, CoBots } = await publicSaleFixture();
      await users[0].CoBots.mintPublicSale(10, {
        value: ethers.utils.parseEther("0.5"),
      });
      const statuses = await Promise.all(
        [...Array(10).keys()].map(
          async (i) => await CoBots.coBotsStatusDisabled(i)
        )
      );
      expect(statuses).to.deep.eq([
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ]);
    });
    it("should mint with random seeds", async () => {
      const { users, CoBots } = await publicSaleFixture();
      await users[0].CoBots.mintPublicSale(10, {
        value: ethers.utils.parseEther("0.5"),
      });
      const seeds = await Promise.all(
        [...Array(10).keys()].map(async (i) => await CoBots.coBotsSeeds(i))
      );
      expect(seeds).toMatchSnapshot();
    });
    it("should mint with blue and red for even and odd", async () => {
      const { users, CoBots } = await publicSaleFixture();
      await users[0].CoBots.mintPublicSale(10, {
        value: ethers.utils.parseEther("0.5"),
      });
      const colors = await Promise.all(
        [...Array(10).keys()].map(async (i) => await CoBots.coBotsColors(i))
      );
      expect(colors).to.deep.eq([
        true,
        false,
        true,
        false,
        true,
        false,
        true,
        false,
        true,
        false,
      ]);
    });
    it("should mint out up to token 9999", async () => {
      const { CoBots } = await mintedOutFixture();
      await CoBots.ownerOf(9999);
      expect(CoBots.ownerOf(10_000)).to.be.revertedWith(
        "OwnerQueryForNonexistentToken"
      );
    });
  });
  describe("mintFoundersAndGiveaways", async function () {
    it("should revert when user is not owner", async () => {
      const { users } = await setup();
      expect(
        users[0].CoBots.mintFoundersAndGiveaways(users[0].address, 1)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("should revert when deployer try to mint more than allowed", async () => {
      const { deployer, users } = await setup();
      expect(
        deployer.CoBots.mintFoundersAndGiveaways(users[0].address, 51)
      ).to.be.revertedWith("Quantity exceeds founders and giveaways allowance");
    });
    it("should mint to the given user", async () => {
      const { deployer, users, CoBots } = await setup();
      await deployer.CoBots.mintFoundersAndGiveaways(users[0].address, 1);
      const owner = await CoBots.ownerOf(0);
      expect(owner).to.eq(users[0].address);
    });
  });
  describe("toggleColor", async function () {
    it("should revert when caller is not owner", async () => {
      const { users, CoBots } = await mintedOutFixture();
      let tokenId = 0;
      let owner = await CoBots.ownerOf(tokenId);
      while (owner == users[0].address) {
        tokenId++;
        owner = await CoBots.ownerOf(tokenId);
      }
      expect(users[0].CoBots.toggleColor(tokenId)).to.be.revertedWith(
        "Only owner can toggle color"
      );
    });
    it("should toggle color", async () => {
      const { users, CoBots } = await mintedOutFixture();
      let tokenId = 0;
      let owner = await CoBots.ownerOf(tokenId);
      while (owner != users[0].address) {
        tokenId++;
        owner = await CoBots.ownerOf(tokenId);
      }
      const prevColor = await CoBots.coBotsColors(tokenId);
      await users[0].CoBots.toggleColor(tokenId);
      const newColor = await CoBots.coBotsColors(tokenId);
      expect(prevColor).to.eq(!newColor);
    });
    it("should update global color count", async () => {
      const { users, CoBots } = await mintedOutFixture();
      let tokenId = 0;
      let owner = await CoBots.ownerOf(tokenId);
      while (owner != users[0].address) {
        tokenId++;
        owner = await CoBots.ownerOf(tokenId);
      }
      const prevColorCount = await CoBots.coBotsColorAgreement();
      await users[0].CoBots.toggleColor(tokenId);
      const newColorCount = await CoBots.coBotsColorAgreement();
      expect(Math.abs(prevColorCount - newColorCount)).to.eq(1);
    });
  });
  describe.only("toggleColors", async function () {
    it("should revert when caller does not own all the tokens", async () => {
      const { users } = await mintedOutFixture();
      const tokenIds = [...Array(11).keys()].map((i) => 2 * i);
      expect(users[0].CoBots.toggleColors(tokenIds)).to.be.revertedWith(
        "Only owner can toggle color"
      );
    });
    it("should revert when all token do not have the same color", async () => {
      const { users, CoBots } = await mintedOutFixture();
      const tokenIds = await Promise.all(
        [...Array(20).keys()].map((i) =>
          CoBots.tokenOfOwnerByIndex(users[0].address, i)
        )
      );
      expect(users[0].CoBots.toggleColors(tokenIds)).to.be.revertedWith(
        "Toggling colors in two different colors!"
      );
    });
    it("should toggle all the tokens", async () => {
      const { users, CoBots } = await mintedOutFixture();
      const tokenIds = await Promise.all(
        [...Array(20).keys()].map((i) =>
          CoBots.tokenOfOwnerByIndex(users[0].address, i)
        )
      );
      await users[0].CoBots.toggleColors(tokenIds.filter((i) => i % 2 === 0));
      const newColors = await Promise.all(
        tokenIds.map(async (tokenId) => await CoBots.coBotsColors(tokenId))
      );
      expect(new Set(newColors).size).to.eq(1);
    });
    it("should update the global color count", async () => {
      const { users, CoBots } = await mintedOutFixture();
      const tokenIds = await Promise.all(
        [...Array(20).keys()].map((i) =>
          CoBots.tokenOfOwnerByIndex(users[0].address, i)
        )
      );
      const prevColorCount = await CoBots.coBotsColorAgreement();
      await users[0].CoBots.toggleColors(tokenIds.filter((i) => i % 2 === 0));
      const newColorCount = await CoBots.coBotsColorAgreement();
      expect(Math.abs(prevColorCount - newColorCount)).to.eq(10);
    });
  });
});
