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
    VRFCoordinator: await ethers.getContract("VRFCoordinatorV2TestHelper"),
  };
  const constants = {
    MAX_COBOTS: await contracts.CoBots.MAX_COBOTS(),
    MINT_PUBLIC_PRICE: ethers.BigNumber.from(
      (await contracts.CoBots.MINT_PUBLIC_PRICE()).toString()
    ),
    MAX_MINT_PER_ADDRESS: await contracts.CoBots.MAX_MINT_PER_ADDRESS(),
    MINT_GIVEAWAYS: await contracts.CoBots.MINT_GIVEAWAYS(),
    MINT_FOUNDERS_AND_GIVEAWAYS:
      await contracts.CoBots.MINT_FOUNDERS_AND_GIVEAWAYS(),
    COBOTS_MINT_DURATION: (
      await contracts.CoBots.COBOTS_MINT_DURATION()
    ).toNumber(),
    COBOTS_MINT_RAFFLE_DELAY: (
      await contracts.CoBots.COBOTS_MINT_RAFFLE_DELAY()
    ).toNumber(),
    COBOTS_REFUND_DURATION: (
      await contracts.CoBots.COBOTS_REFUND_DURATION()
    ).toNumber(),
    RAFFLE_DRAW_DELAY: (await contracts.CoBots.RAFFLE_DRAW_DELAY()).toNumber(),
    MAIN_RAFFLE_PRIZE: ethers.BigNumber.from(
      (await contracts.CoBots.MAIN_RAFFLE_PRIZE()).toString()
    ),
    MAIN_RAFFLE_WINNERS_COUNT:
      await contracts.CoBots.MAIN_RAFFLE_WINNERS_COUNT(),
    COORDINATION_RAFFLE_PRIZE: ethers.BigNumber.from(
      (await contracts.CoBots.COORDINATION_RAFFLE_PRIZE()).toString()
    ),
    COORDINATION_RAFFLE_WINNERS_COUNT:
      await contracts.CoBots.COORDINATION_RAFFLE_WINNERS_COUNT(),
    COORDINATION_RAFFLE_THRESHOLD:
      await contracts.CoBots.COORDINATION_RAFFLE_THRESHOLD(),
  };
  const { deployer } = await getNamedAccounts();
  const users = await setupUsers(await getUnnamedAccounts(), contracts);
  return {
    ...contracts,
    users,
    ...constants,
    deployer: await setupUser(deployer, contracts),
    vrfCoordinator: await setupUser(
      contracts.VRFCoordinator.address,
      contracts
    ),
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
  const { MAX_MINT_PER_ADDRESS, MINT_PUBLIC_PRICE } = contractsAndUsers;
  await Promise.all(
    contractsAndUsers.users.map((user) =>
      user.CoBots.mintPublicSale(MAX_MINT_PER_ADDRESS, {
        value: MINT_PUBLIC_PRICE.mul(MAX_MINT_PER_ADDRESS),
      })
    )
  );
  return contractsAndUsers;
});

const cooperationFixture = deployments.createFixture(async ({}) => {
  const contractsAndUsers = await mintedOutFixture();
  const { MAX_MINT_PER_ADDRESS } = contractsAndUsers;
  await Promise.all(
    contractsAndUsers.users.map(
      async (user, i) =>
        await user.CoBots.toggleColors(
          [...Array(MAX_MINT_PER_ADDRESS).keys()]
            .map((j) => j + i * MAX_MINT_PER_ADDRESS)
            .filter((j) => j % 2 === 0)
        )
    )
  );
  return contractsAndUsers;
});

const vrfFixture = deployments.createFixture(async ({}) => {
  const contractsAndUsers = await cooperationFixture();
  const { users, VRFCoordinator } = contractsAndUsers;
  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [VRFCoordinator.address],
  });
  await (
    await ethers.getSigner(users[0].address)
  ).sendTransaction({
    to: VRFCoordinator.address,
    value: ethers.utils.parseEther("1"),
  });

  return contractsAndUsers;
});

const partiallyMintedFixture = deployments.createFixture(async ({}) => {
  const contractsAndUsers = await publicSaleFixture();
  const { MAX_MINT_PER_ADDRESS, MINT_PUBLIC_PRICE } = contractsAndUsers;
  await Promise.all(
    contractsAndUsers.users.map((user) =>
      user.CoBots.mintPublicSale(MAX_MINT_PER_ADDRESS / 2, {
        value: MINT_PUBLIC_PRICE.mul(MAX_MINT_PER_ADDRESS).div(2),
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
      const { users, MAX_MINT_PER_ADDRESS, MINT_PUBLIC_PRICE } =
        await publicSaleFixture();
      expect(
        users[0].CoBots.mintPublicSale(MAX_MINT_PER_ADDRESS + 1, {
          value: MINT_PUBLIC_PRICE.mul(MAX_MINT_PER_ADDRESS + 1),
        })
      ).to.be.revertedWith(
        "Co-Bots: the requested quantity exceeds the maximum allowed"
      );
    });
    it("should mint quantity to sender", async () => {
      const { users, MAX_MINT_PER_ADDRESS, MINT_PUBLIC_PRICE } =
        await publicSaleFixture();
      await users[0].CoBots.mintPublicSale(MAX_MINT_PER_ADDRESS, {
        value: MINT_PUBLIC_PRICE.mul(MAX_MINT_PER_ADDRESS),
      });
      const balance = await users[0].CoBots.balanceOf(users[0].address);
      expect(balance).to.eq(MAX_MINT_PER_ADDRESS);
    });
    it("should revert when mint is closed", async () => {
      const {
        users,
        COBOTS_MINT_DURATION,
        MAX_MINT_PER_ADDRESS,
        MINT_PUBLIC_PRICE,
      } = await publicSaleFixture();
      await network.provider.send("evm_increaseTime", [
        COBOTS_MINT_DURATION + 1,
      ]);
      expect(
        users[0].CoBots.mintPublicSale(MAX_MINT_PER_ADDRESS, {
          value: MINT_PUBLIC_PRICE.mul(MAX_MINT_PER_ADDRESS),
        })
      ).to.be.revertedWith("Public sale not open");
    });
    it("should mint with online status", async () => {
      const { users, CoBots, MAX_MINT_PER_ADDRESS, MINT_PUBLIC_PRICE } =
        await publicSaleFixture();
      await users[0].CoBots.mintPublicSale(MAX_MINT_PER_ADDRESS / 2, {
        value: MINT_PUBLIC_PRICE.mul(MAX_MINT_PER_ADDRESS / 2),
      });
      const statuses = await Promise.all(
        [...Array(MAX_MINT_PER_ADDRESS / 2).keys()].map(
          async (i) => await CoBots.coBotsStatusDisabled(i)
        )
      );
      expect(statuses).to.deep.eq(Array(MAX_MINT_PER_ADDRESS / 2).fill(false));
    });
    it("should mint with random seeds", async () => {
      const { users, CoBots, MAX_MINT_PER_ADDRESS, MINT_PUBLIC_PRICE } =
        await publicSaleFixture();
      await users[0].CoBots.mintPublicSale(MAX_MINT_PER_ADDRESS, {
        value: MINT_PUBLIC_PRICE.mul(MAX_MINT_PER_ADDRESS),
      });
      const seeds = await Promise.all(
        [...Array(MAX_MINT_PER_ADDRESS).keys()].map(
          async (i) => await CoBots.coBotsSeeds(i)
        )
      );
      expect(new Set(seeds).size).to.be.greaterThanOrEqual(
        MAX_MINT_PER_ADDRESS - 5
      ); // Magic number, there is a chance that the seeds are the same
    });
    it("should mint with blue and red for even and odd", async () => {
      const { users, CoBots, MAX_MINT_PER_ADDRESS, MINT_PUBLIC_PRICE } =
        await publicSaleFixture();
      await users[0].CoBots.mintPublicSale(MAX_MINT_PER_ADDRESS, {
        value: MINT_PUBLIC_PRICE.mul(MAX_MINT_PER_ADDRESS),
      });
      const colors = (
        await Promise.all(
          [...Array(MAX_MINT_PER_ADDRESS).keys()].map(
            async (i) => await CoBots.coBotsColors(i)
          )
        )
      ).map((color, index) => (index % 2 == 1 ? !color : color));
      expect(colors).to.deep.eq(Array(MAX_MINT_PER_ADDRESS).fill(true));
    });
    it("should mint out up to token 9999", async () => {
      const { CoBots, MAX_COBOTS } = await mintedOutFixture();
      await CoBots.ownerOf(MAX_COBOTS - 1);
      expect(CoBots.ownerOf(MAX_COBOTS)).to.be.revertedWith(
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
      const { deployer, users, MINT_FOUNDERS_AND_GIVEAWAYS } = await setup();
      expect(
        deployer.CoBots.mintFoundersAndGiveaways(
          users[0].address,
          MINT_FOUNDERS_AND_GIVEAWAYS + 1
        )
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
  describe("toggleColors", async function () {
    it("should revert when caller does not own all the tokens", async () => {
      const { users } = await mintedOutFixture();
      const tokenIds = [...Array(11).keys()].map((i) => 2 * i);
      expect(users[0].CoBots.toggleColors(tokenIds)).to.be.revertedWith(
        "Only owner can toggle color"
      );
    });
    it("should revert when all token do not have the same color", async () => {
      const { users, CoBots, MAX_MINT_PER_ADDRESS } = await mintedOutFixture();
      const tokenIds = await Promise.all(
        [...Array(MAX_MINT_PER_ADDRESS).keys()].map((i) =>
          CoBots.tokenOfOwnerByIndex(users[0].address, i)
        )
      );
      expect(users[0].CoBots.toggleColors(tokenIds)).to.be.revertedWith(
        "Toggling colors in two different colors!"
      );
    });
    it("should toggle all the tokens", async () => {
      const { users, CoBots, MAX_MINT_PER_ADDRESS } = await mintedOutFixture();
      const tokenIds = await Promise.all(
        [...Array(MAX_MINT_PER_ADDRESS).keys()].map((i) =>
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
      const { users, CoBots, MAX_MINT_PER_ADDRESS } = await mintedOutFixture();
      const tokenIds = await Promise.all(
        [...Array(MAX_MINT_PER_ADDRESS).keys()].map((i) =>
          CoBots.tokenOfOwnerByIndex(users[0].address, i)
        )
      );
      const prevColorCount = await CoBots.coBotsColorAgreement();
      await users[0].CoBots.toggleColors(tokenIds.filter((i) => i % 2 === 0));
      const newColorCount = await CoBots.coBotsColorAgreement();
      expect(Math.abs(prevColorCount - newColorCount)).to.eq(
        MAX_MINT_PER_ADDRESS / 2
      );
    });
    [0, 1].forEach((color) =>
      it(`should enable the collaborative raffle with color ${
        color === 0 ? "blue" : "red"
      }`, async () => {
        const { users, CoBots, MAX_MINT_PER_ADDRESS } =
          await mintedOutFixture();
        await Promise.all(
          users.map(
            async (user, i) =>
              await user.CoBots.toggleColors(
                [...Array(MAX_MINT_PER_ADDRESS).keys()]
                  .map((j) => j + i * MAX_MINT_PER_ADDRESS)
                  .filter((j) => j % 2 === color)
              )
          )
        );
        const enabled = await CoBots.cooperativeRaffleEnabled();
        expect(enabled).to.eq(true);
      })
    );
  });
  describe("withdraw", async function () {
    it("should revert when raffle is not drawn", async () => {
      const { deployer } = await mintedOutFixture();
      expect(deployer.CoBots.withdraw()).to.be.revertedWith(
        "Dev cannot withdraw before the end of the game"
      );
    });
    it("should revert when caller is not owner", async () => {
      const { users } = await mintedOutFixture();
      expect(users[0].CoBots.withdraw()).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });
    it("should withdraw after refund relay", async () => {
      const {
        deployer,
        COBOTS_MINT_DURATION,
        COBOTS_REFUND_DURATION,
        MINT_PUBLIC_PRICE,
        MAX_COBOTS,
      } = await partiallyMintedFixture();
      await network.provider.send("evm_increaseTime", [
        COBOTS_MINT_DURATION + COBOTS_REFUND_DURATION + 1,
      ]);
      const prevContractBalance = await ethers.provider.getBalance(
        deployer.CoBots.address
      );
      await deployer.CoBots.withdraw();
      const newContractBalance = await ethers.provider.getBalance(
        deployer.CoBots.address
      );
      expect(prevContractBalance).to.eq(
        MINT_PUBLIC_PRICE.mul(MAX_COBOTS).div(2)
      );
      expect(newContractBalance).to.eq(ethers.utils.parseEther("0"));
    });
    it("should withdraw after all winners are drawn (cooperation prize disabled)", async () => {
      const {
        deployer,
        CoBots,
        COBOTS_MINT_DURATION,
        COBOTS_MINT_RAFFLE_DELAY,
        MAIN_RAFFLE_WINNERS_COUNT,
        RAFFLE_DRAW_DELAY,
      } = await mintedOutFixture();
      await network.provider.send("evm_increaseTime", [
        COBOTS_MINT_DURATION + COBOTS_MINT_RAFFLE_DELAY + 1,
      ]);
      for (let i = 0; i < MAIN_RAFFLE_WINNERS_COUNT; i++) {
        await expect(deployer.CoBots.withdraw()).to.be.revertedWith(
          "Dev cannot withdraw before the end of the game"
        );
        await deployer.CoBots.draw();
        await network.provider.send("evm_increaseTime", [
          RAFFLE_DRAW_DELAY + 1,
        ]);
        await network.provider.send("evm_mine");
      }
      await deployer.CoBots.withdraw();
      expect(await ethers.provider.getBalance(CoBots.address)).to.eq(
        ethers.utils.parseEther("0")
      );
    });
    it("should withdraw after all winners are drawn (cooperation prize enabled)", async () => {
      const {
        deployer,
        CoBots,
        COBOTS_MINT_DURATION,
        COBOTS_MINT_RAFFLE_DELAY,
        MAIN_RAFFLE_WINNERS_COUNT,
        COORDINATION_RAFFLE_WINNERS_COUNT,
        RAFFLE_DRAW_DELAY,
      } = await cooperationFixture();
      await network.provider.send("evm_increaseTime", [
        COBOTS_MINT_DURATION + COBOTS_MINT_RAFFLE_DELAY + 1,
      ]);
      for (
        let i = 0;
        i < MAIN_RAFFLE_WINNERS_COUNT + COORDINATION_RAFFLE_WINNERS_COUNT;
        i++
      ) {
        await expect(deployer.CoBots.withdraw()).to.be.revertedWith(
          "Dev cannot withdraw before the end of the game"
        );
        await deployer.CoBots.draw();
        await network.provider.send("evm_increaseTime", [
          RAFFLE_DRAW_DELAY + 1,
        ]);
        await network.provider.send("evm_mine");
      }
      await deployer.CoBots.withdraw();
      expect(await ethers.provider.getBalance(CoBots.address)).to.eq(
        ethers.utils.parseEther("0")
      );
    });
  });
  [
    { key: "claimRefund()", tokenIds: undefined },
    {
      key: "claimRefund(uint256[])",
      tokenIds: [...Array(10).keys()].map((i) => i + 100),
    },
  ].forEach(({ key, tokenIds }) => {
    describe(key, async function () {
      it("should revert when minting is still open", async () => {
        const { users } = await partiallyMintedFixture();
        await expect(
          tokenIds
            ? users[10].CoBots.functions[key](tokenIds)
            : users[10].CoBots.functions[key]()
        ).to.be.revertedWith("Refund period not open");
      });
      it("should revert when co-bots are minted out", async () => {
        const { users, COBOTS_MINT_DURATION } = await mintedOutFixture();
        await network.provider.send("evm_increaseTime", [
          COBOTS_MINT_DURATION + 1,
        ]);
        await expect(
          tokenIds
            ? users[10].CoBots.functions[key](tokenIds)
            : users[10].CoBots.functions[key]()
        ).to.be.revertedWith("Co-Bots are minted out");
      });
      it("should revert when delay is passed", async () => {
        const { users, COBOTS_MINT_DURATION, COBOTS_REFUND_DURATION } =
          await partiallyMintedFixture();
        await network.provider.send("evm_increaseTime", [
          COBOTS_MINT_DURATION + COBOTS_REFUND_DURATION + 1,
        ]);
        await expect(
          tokenIds
            ? users[0].CoBots.functions[key](tokenIds)
            : users[0].CoBots.functions[key]()
        ).to.be.revertedWith("Refund period not open");
      });
      it("should revert when co-bots are giveaways", async () => {
        const { users, COBOTS_MINT_DURATION } = await partiallyMintedFixture();
        await network.provider.send("evm_increaseTime", [
          COBOTS_MINT_DURATION + 1,
        ]);
        await expect(
          tokenIds
            ? users[0].CoBots.functions[key]([...Array(10).keys()])
            : users[0].CoBots.functions[key]()
        ).to.be.revertedWith("No Co-Bots to refund");
      });
      it("should refund user with correct amount", async () => {
        const { users, COBOTS_MINT_DURATION, MINT_PUBLIC_PRICE } =
          await partiallyMintedFixture();
        await network.provider.send("evm_increaseTime", [
          COBOTS_MINT_DURATION + 1,
        ]);
        const prevUserBalance = await ethers.provider.getBalance(
          users[10].address
        );
        const tx = await (tokenIds
          ? users[10].CoBots.functions[key](tokenIds)
          : users[10].CoBots.functions[key]());
        const receipt = await tx.wait();
        const paidFees = receipt.cumulativeGasUsed.mul(
          receipt.effectiveGasPrice
        );
        const newUserBalance = await ethers.provider.getBalance(
          users[10].address
        );
        expect(newUserBalance.toString()).to.eq(
          prevUserBalance
            .add(MINT_PUBLIC_PRICE.mul(10))
            .sub(paidFees)
            .toString()
        );
      });
      it("should revert a second claim for the same token", async () => {
        const { users, COBOTS_MINT_DURATION } = await partiallyMintedFixture();
        await network.provider.send("evm_increaseTime", [
          COBOTS_MINT_DURATION + 1,
        ]);
        await (tokenIds
          ? users[10].CoBots.functions[key](tokenIds)
          : users[10].CoBots.functions[key]());
        await expect(
          tokenIds
            ? users[10].CoBots.functions[key](tokenIds)
            : users[10].CoBots.functions[key]()
        ).to.be.revertedWith("No Co-Bots to refund");
      });
      if (tokenIds) {
        it("should revert when claiming tokens that are not owned", async () => {
          const { users, COBOTS_MINT_DURATION } =
            await partiallyMintedFixture();
          await network.provider.send("evm_increaseTime", [
            COBOTS_MINT_DURATION + 1,
          ]);
          await expect(
            users[10].CoBots.functions[key](
              [...Array(10).keys()].map((i) => i + 200)
            )
          ).to.be.revertedWith(
            "You cannot claim a refund for a token you do not own"
          );
        });
      }
    });
  });
  describe("draw", async function () {
    it("should revert when co-bots are not minted out", async () => {
      const { users, COBOTS_MINT_DURATION, COBOTS_MINT_RAFFLE_DELAY } =
        await partiallyMintedFixture();
      await network.provider.send("evm_increaseTime", [
        COBOTS_MINT_DURATION + COBOTS_MINT_RAFFLE_DELAY + 1,
      ]);
      await expect(users[0].CoBots.draw()).to.be.revertedWith(
        "Co-Bots are not minted out"
      );
    });
    it("should revert when draw is not open", async () => {
      const { users, COBOTS_MINT_DURATION } = await mintedOutFixture();
      await network.provider.send("evm_increaseTime", [
        COBOTS_MINT_DURATION + 1,
      ]);
      await expect(users[0].CoBots.draw()).to.be.revertedWith(
        "Draw not active"
      );
    });
    it("should revert a second draw less than 1 minute after a first draw", async () => {
      const { users, COBOTS_MINT_DURATION, COBOTS_MINT_RAFFLE_DELAY } =
        await mintedOutFixture();
      await network.provider.send("evm_increaseTime", [
        COBOTS_MINT_DURATION + COBOTS_MINT_RAFFLE_DELAY + 1,
      ]);
      await users[0].CoBots.draw();
      await expect(users[0].CoBots.draw()).to.be.revertedWith(
        "Draws take place once per minute"
      );
    });
    it("should draw 10 times and revert when only main raffle is enabled", async () => {
      const {
        users,
        COBOTS_MINT_DURATION,
        COBOTS_MINT_RAFFLE_DELAY,
        MAIN_RAFFLE_WINNERS_COUNT,
        RAFFLE_DRAW_DELAY,
      } = await mintedOutFixture();
      await network.provider.send("evm_increaseTime", [
        COBOTS_MINT_DURATION + COBOTS_MINT_RAFFLE_DELAY + 1,
      ]);
      for (let i = 0; i < MAIN_RAFFLE_WINNERS_COUNT; i++) {
        await users[0].CoBots.draw();
        await network.provider.send("evm_increaseTime", [
          RAFFLE_DRAW_DELAY + 1,
        ]);
        await network.provider.send("evm_mine");
      }
      await expect(users[0].CoBots.draw()).to.be.revertedWith(
        "Draw limit reached"
      );
    });
    it("should draw 30 times and revert when the cooperation raffle is enabled", async () => {
      const {
        users,
        COBOTS_MINT_DURATION,
        COBOTS_MINT_RAFFLE_DELAY,
        MAIN_RAFFLE_WINNERS_COUNT,
        COORDINATION_RAFFLE_WINNERS_COUNT,
        RAFFLE_DRAW_DELAY,
      } = await cooperationFixture();
      await network.provider.send("evm_increaseTime", [
        COBOTS_MINT_DURATION + COBOTS_MINT_RAFFLE_DELAY + 1,
      ]);
      for (
        let i = 0;
        i < MAIN_RAFFLE_WINNERS_COUNT + COORDINATION_RAFFLE_WINNERS_COUNT;
        i++
      ) {
        await users[0].CoBots.draw();
        await network.provider.send("evm_increaseTime", [
          RAFFLE_DRAW_DELAY + 1,
        ]);
        await network.provider.send("evm_mine");
      }
      await expect(users[0].CoBots.draw()).to.be.revertedWith(
        "Draw limit reached"
      );
    });
  });
  describe("fulfillRandomWords", async function () {
    it("should send prize to winner with correct amount", async () => {
      const {
        users,
        vrfCoordinator,
        CoBots,
        COBOTS_MINT_DURATION,
        COBOTS_MINT_RAFFLE_DELAY,
        MAIN_RAFFLE_WINNERS_COUNT,
        MAIN_RAFFLE_PRIZE,
        COORDINATION_RAFFLE_WINNERS_COUNT,
        COORDINATION_RAFFLE_PRIZE,
        MAX_MINT_PER_ADDRESS,
        RAFFLE_DRAW_DELAY,
      } = await vrfFixture();

      await network.provider.send("evm_increaseTime", [
        COBOTS_MINT_DURATION + COBOTS_MINT_RAFFLE_DELAY + 1,
      ]);
      for (
        let i = 0;
        i < MAIN_RAFFLE_WINNERS_COUNT + COORDINATION_RAFFLE_WINNERS_COUNT;
        i++
      ) {
        const tokenId = MAX_MINT_PER_ADDRESS * (i + 10);
        const owner = await CoBots.ownerOf(tokenId);
        const tx = await users[0].CoBots.draw();
        const receipt = await tx.wait();
        const requestId = receipt.events[0].data.slice(0, 2 + 32 * 2);
        const balancePrev = await ethers.provider.getBalance(owner);
        await vrfCoordinator.CoBots.rawFulfillRandomWords(requestId, [tokenId]);
        const balanceNext = await ethers.provider.getBalance(owner);
        const winner = await CoBots.winners(i);
        expect(winner).to.equal(owner);
        expect(balanceNext.sub(balancePrev)).to.eq(
          i < MAIN_RAFFLE_WINNERS_COUNT
            ? MAIN_RAFFLE_PRIZE
            : COORDINATION_RAFFLE_PRIZE
        );
        await network.provider.send("evm_increaseTime", [
          RAFFLE_DRAW_DELAY + 1,
        ]);
        await network.provider.send("evm_mine");
      }
    });
    it("should skip founders tokens", async () => {
      const {
        users,
        vrfCoordinator,
        CoBots,
        COBOTS_MINT_RAFFLE_DELAY,
        COBOTS_MINT_DURATION,
        MAIN_RAFFLE_PRIZE,
      } = await vrfFixture();

      await network.provider.send("evm_increaseTime", [
        COBOTS_MINT_RAFFLE_DELAY + COBOTS_MINT_DURATION + 1,
      ]);
      const tokenId = 40;
      const winner = await CoBots.ownerOf(tokenId / 2);
      const tx = await users[0].CoBots.draw();
      const receipt = await tx.wait();
      const requestId = receipt.events[0].data.slice(0, 2 + 32 * 2);
      const balancePrev = await ethers.provider.getBalance(winner);
      await vrfCoordinator.CoBots.rawFulfillRandomWords(requestId, [tokenId]);
      const balanceNext = await ethers.provider.getBalance(winner);
      expect(balanceNext.sub(balancePrev)).to.eq(MAIN_RAFFLE_PRIZE);
    });
    it("should skip winner if it has already won", async () => {
      const {
        users,
        vrfCoordinator,
        CoBots,
        COBOTS_MINT_DURATION,
        COBOTS_MINT_RAFFLE_DELAY,
        MAIN_RAFFLE_PRIZE,
      } = await vrfFixture();

      await network.provider.send("evm_increaseTime", [
        COBOTS_MINT_DURATION + COBOTS_MINT_RAFFLE_DELAY + 1,
      ]);
      const tokenId = 100;
      const firstWinner = await CoBots.ownerOf(tokenId);
      const secondWinner = await CoBots.ownerOf(tokenId / 2);
      const tx = await users[0].CoBots.draw();
      const receipt = await tx.wait();
      const requestId = receipt.events[0].data.slice(0, 2 + 32 * 2);
      let balancePrev = await ethers.provider.getBalance(firstWinner);
      await vrfCoordinator.CoBots.rawFulfillRandomWords(requestId, [tokenId]);
      let balanceNext = await ethers.provider.getBalance(firstWinner);
      expect(balanceNext.sub(balancePrev)).to.eq(MAIN_RAFFLE_PRIZE);

      balancePrev = await ethers.provider.getBalance(secondWinner);
      await vrfCoordinator.CoBots.rawFulfillRandomWords(requestId, [tokenId]);
      balanceNext = await ethers.provider.getBalance(secondWinner);
      expect(balanceNext.sub(balancePrev)).to.eq(MAIN_RAFFLE_PRIZE);
    });
  });
});
