import { setupUser, setupUsers } from "./utils";
import chai from "chai";
import {
  deployments,
  ethers,
  getNamedAccounts,
  getUnnamedAccounts,
  network,
} from "hardhat";
import { BigNumber } from "ethers";
import { solidity } from "ethereum-waffle";
import {
  MYSTERY_CHALLENGE,
  PRIZES as PRIZES_INPUT,
  TAGS,
  TEST_NET_PRICE_SCALING,
} from "../../utils/constants";
import { jestSnapshotPlugin } from "mocha-chai-jest-snapshot";
import { CoBotsParameters, Prize } from "../../utils/types";
import {
  CoBots,
  CoBots__factory,
  CoBotsV2,
  VRFCoordinatorV2TestHelper,
} from "../../typechain";

chai.use(jestSnapshotPlugin());
chai.use(solidity);
const { expect } = chai;

const setup = async () => {
  await deployments.fixture([
    TAGS.CO_BOTS,
    TAGS.CO_BOTS_SUBSCRIPTION,
    TAGS.CO_BOTS_PALETTES,
  ]);
  const { deployer, coBotsV1 } = await getNamedAccounts();
  const contracts = {
    CoBotsV1: (await ethers.getContractAt(
      CoBots__factory.abi,
      coBotsV1
    )) as CoBots,
    CoBotsV2: (await ethers.getContract("CoBotsV2")) as CoBotsV2,
    VRFCoordinator: (await ethers.getContract(
      "VRFCoordinatorV2TestHelper"
    )) as VRFCoordinatorV2TestHelper,
  };

  const constants = {
    MINT_BATCH_LIMIT: await contracts.CoBotsV2.MINT_BATCH_LIMIT(),
    MINT_FOUNDERS: await contracts.CoBotsV2.MINT_FOUNDERS(),
    PARAMETERS: (await contracts.CoBotsV2.PARAMETERS()) as CoBotsParameters,
    PRIZES: await Promise.all(
      PRIZES_INPUT.map(
        async (_, i) => (await contracts.CoBotsV2.PRIZES(i)) as Prize
      )
    ),
  };
  const users = await setupUsers(
    (
      await getUnnamedAccounts()
    ).slice(
      0,
      Math.ceil(constants.PARAMETERS.maxCobots / constants.MINT_BATCH_LIMIT)
    ),
    contracts
  );

  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [contracts.VRFCoordinator.address],
  });
  await (
    await ethers.getSigner(users[0].address)
  ).sendTransaction({
    to: contracts.VRFCoordinator.address,
    value: ethers.utils.parseEther("100"),
  });

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
  await contractsAndUsers.deployer.CoBotsV2.openPublicSale();
  await network.provider.send("evm_mine");
  return contractsAndUsers;
});

const mintedOutFixture = deployments.createFixture(
  async ({ network }, contestOver) => {
    const contractsAndUsers = await publicSaleFixture();
    await network.provider.send("evm_increaseTime", [
      contestOver ? contractsAndUsers.PARAMETERS.contestDuration : 0,
    ]);
    await Promise.all(
      contractsAndUsers.users.map(async (user, i) => {
        const quantity =
          i === contractsAndUsers.users.length - 1
            ? contractsAndUsers.PARAMETERS.maxCobots %
              contractsAndUsers.MINT_BATCH_LIMIT
            : contractsAndUsers.MINT_BATCH_LIMIT;
        await user.CoBotsV2.mintPublicSale(quantity, [], {
          value: BigNumber.from(
            contractsAndUsers.PARAMETERS.mintPublicPrice
          ).mul(quantity),
        });
      })
    );
    return contractsAndUsers;
  }
);

describe("CoBotsV2", function () {
  describe("constructor", async function () {
    it("should set the raffle prizes correctly", async () => {
      const { PRIZES } = await setup();
      expect(
        PRIZES.map((prize) => ({
          checkpoint: prize.checkpoint,
          amount: prize.amount,
          isContest: prize.isContest,
        }))
      ).to.deep.eq(
        PRIZES_INPUT.map((prize) => ({
          ...prize,
          amount: ethers.utils
            .parseEther(prize.amount.toString())
            .div(TEST_NET_PRICE_SCALING),
        }))
      );
    });
  });
  describe("mintPublicSale", async function () {
    it("should revert when minting is not open", async () => {
      const { users } = await setup();
      await expect(users[0].CoBotsV2.mintPublicSale(1, [])).to.be.revertedWith(
        "PublicSaleNotOpen"
      );
    });
    it("should revert when price does not match", async () => {
      const { users } = await publicSaleFixture();
      await expect(users[0].CoBotsV2.mintPublicSale(1, [])).to.be.revertedWith(
        "WrongPrice"
      );
    });
    it("should revert when quantity is too high", async () => {
      const { users, MINT_BATCH_LIMIT, PARAMETERS } = await publicSaleFixture();
      await expect(
        users[0].CoBotsV2.mintPublicSale(MINT_BATCH_LIMIT + 1, [], {
          value: BigNumber.from(PARAMETERS.mintPublicPrice).mul(
            MINT_BATCH_LIMIT + 1
          ),
        })
      ).to.be.revertedWith("BatchLimitExceeded");
    });
    it("should mint quantity to sender", async () => {
      const { users, MINT_BATCH_LIMIT, PARAMETERS } = await publicSaleFixture();
      await users[0].CoBotsV2.mintPublicSale(MINT_BATCH_LIMIT, [], {
        value: BigNumber.from(PARAMETERS.mintPublicPrice).mul(MINT_BATCH_LIMIT),
      });
      const balance = await users[0].CoBotsV2.balanceOf(users[0].address);
      expect(balance).to.eq(MINT_BATCH_LIMIT);
    });
    it("should mint with metta off", async () => {
      const { users, CoBotsV2, MINT_BATCH_LIMIT, PARAMETERS } =
        await publicSaleFixture();
      await users[0].CoBotsV2.mintPublicSale(MINT_BATCH_LIMIT, [], {
        value: BigNumber.from(PARAMETERS.mintPublicPrice).mul(MINT_BATCH_LIMIT),
      });
      const statuses = await Promise.all(
        [...Array(MINT_BATCH_LIMIT).keys()].map(
          async (i) => await CoBotsV2.isMettaEnabled(i)
        )
      );
      expect(statuses).to.deep.eq(Array(MINT_BATCH_LIMIT).fill(false));
    });
    it("should mint with random seeds", async () => {
      const { users, CoBotsV2, MINT_BATCH_LIMIT, PARAMETERS } =
        await publicSaleFixture();
      await users[0].CoBotsV2.mintPublicSale(MINT_BATCH_LIMIT, [], {
        value: BigNumber.from(PARAMETERS.mintPublicPrice).mul(MINT_BATCH_LIMIT),
      });
      const seeds = await Promise.all(
        [...Array(MINT_BATCH_LIMIT).keys()].map(
          async (i) => await CoBotsV2.coBotsSeeds(i)
        )
      );
      expect(new Set(seeds).size).to.be.greaterThanOrEqual(
        MINT_BATCH_LIMIT * 0.7
      ); // Magic number, there is a chance that some seeds are the same
    });
    it("should mint up to id MAX_COBOTS - 1", async () => {
      const { users, PARAMETERS } = await mintedOutFixture();
      await expect(
        users[0].CoBotsV2.mintPublicSale(1, [], {
          value: BigNumber.from(PARAMETERS.mintPublicPrice),
        })
      ).to.be.revertedWith("TotalSupplyExceeded");
    });
    it("should mint with discount price", async () => {
      const { deployer, CoBotsV1, PARAMETERS, MINT_BATCH_LIMIT } =
        await publicSaleFixture();
      const deployerBalance = await CoBotsV1.balanceOf(deployer.address);
      const deployerTokenIdsV1 = await Promise.all(
        [...Array(deployerBalance.toNumber()).keys()].map((i) =>
          CoBotsV1.tokenOfOwnerByIndex(deployer.address, i)
        )
      );
      const mintedV2 = Math.min(deployerBalance.toNumber(), MINT_BATCH_LIMIT);
      await deployer.CoBotsV2.mintPublicSale(mintedV2, deployerTokenIdsV1, {
        value: BigNumber.from(PARAMETERS.mintPublicPrice)
          .mul(mintedV2)
          .div(PARAMETERS.cobotsV1Discount),
      });
    });
    it("should redeem only the required number of tokens", async () => {
      const { deployer, CoBotsV1, PARAMETERS, CoBotsV2 } =
        await publicSaleFixture();
      const deployerBalance = await CoBotsV1.balanceOf(deployer.address);
      const deployerTokenIdsV1 = await Promise.all(
        [...Array(deployerBalance).keys()].map((i) =>
          CoBotsV1.tokenOfOwnerByIndex(deployer.address, i)
        )
      );
      await deployer.CoBotsV2.mintPublicSale(1, deployerTokenIdsV1, {
        value: BigNumber.from(PARAMETERS.mintPublicPrice).div(
          PARAMETERS.cobotsV1Discount
        ),
      });
      const redeemed = (
        await Promise.all(
          deployerTokenIdsV1.map(
            async (tokenId) => await CoBotsV2.coBotsV1Redeemed(tokenId)
          )
        )
      ).reduce((acc, val) => (val ? acc + 1 : acc), 0);
      expect(redeemed).to.eq(1);
    });
    it("should not be able to redeem the same token twice", async () => {
      const { deployer, CoBotsV1, PARAMETERS } = await publicSaleFixture();
      const deployerBalance = await CoBotsV1.balanceOf(deployer.address);
      const deployerTokenIdsV1 = await Promise.all(
        [...Array(deployerBalance).keys()].map((i) =>
          CoBotsV1.tokenOfOwnerByIndex(deployer.address, i)
        )
      );
      await deployer.CoBotsV2.mintPublicSale(
        1,
        deployerTokenIdsV1.slice(0, 1),
        {
          value: BigNumber.from(PARAMETERS.mintPublicPrice).div(
            PARAMETERS.cobotsV1Discount
          ),
        }
      );
      await expect(
        deployer.CoBotsV2.mintPublicSale(1, deployerTokenIdsV1.slice(0, 1), {
          value: BigNumber.from(PARAMETERS.mintPublicPrice).div(
            PARAMETERS.cobotsV1Discount
          ),
        })
      ).to.be.revertedWith("WrongPrice");
    });
    it("should not be able to redeem a token not owned by sender", async () => {
      const { users, deployer, CoBotsV1, PARAMETERS } =
        await publicSaleFixture();
      const deployerBalance = await CoBotsV1.balanceOf(deployer.address);
      const deployerTokenIdsV1 = await Promise.all(
        [...Array(deployerBalance).keys()].map((i) =>
          CoBotsV1.tokenOfOwnerByIndex(deployer.address, i)
        )
      );
      await expect(
        users[0].CoBotsV2.mintPublicSale(1, deployerTokenIdsV1.slice(0, 1), {
          value: BigNumber.from(PARAMETERS.mintPublicPrice).div(
            PARAMETERS.cobotsV1Discount
          ),
        })
      ).to.be.revertedWith("RedeemTokenNotOwner");
    });
  });
  describe("mintFounders", async function () {
    it("should revert when user is not owner", async () => {
      const { users } = await setup();
      await expect(
        users[0].CoBotsV2.mintFounders(users[0].address, 1)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("should revert when deployer try to mint more than allowed", async () => {
      const { deployer, users, MINT_FOUNDERS } = await setup();
      await expect(
        deployer.CoBotsV2.mintFounders(users[0].address, MINT_FOUNDERS + 1)
      ).to.be.revertedWith("AllocationExceeded");
    });
    it("should revert when totalSupply is already minted", async () => {
      const { deployer } = await mintedOutFixture();
      await expect(
        deployer.CoBotsV2.mintFounders(deployer.address, 1)
      ).to.be.revertedWith("TotalSupplyExceeded");
    });
    it("should mint to the given user", async () => {
      const { deployer, users, CoBotsV2 } = await setup();
      await deployer.CoBotsV2.mintFounders(users[0].address, 1);
      const owner = await CoBotsV2.ownerOf(0);
      expect(owner).to.eq(users[0].address);
    });
  });
  describe("isMettaEnabled", async function () {
    it("should return false for newly minted token", async () => {
      const { deployer, CoBotsV2 } = await setup();
      await deployer.CoBotsV2.mintFounders(deployer.address, 1);
      expect(await CoBotsV2.isMettaEnabled(0)).to.eq(false);
    });
    it("should return true after toggling the state", async () => {
      const { deployer, CoBotsV2 } = await setup();
      await deployer.CoBotsV2.mintFounders(deployer.address, 1);
      await deployer.CoBotsV2.toggleMetta([0]);
      expect(await CoBotsV2.isMettaEnabled(0)).to.eq(true);
    });
  });
  describe("toggleMetta", async function () {
    it("should revert when caller is not owner", async () => {
      const { deployer, users } = await setup();
      await deployer.CoBotsV2.mintFounders(deployer.address, 2);
      await expect(users[0].CoBotsV2.toggleMetta([0, 1])).to.be.revertedWith(
        "ToggleMettaCallerNotOwner"
      );
    });
    it("should batch toggle token states", async () => {
      const { deployer, CoBotsV2 } = await setup();
      await deployer.CoBotsV2.mintFounders(deployer.address, 2);
      const prevState = await Promise.all(
        [0, 1].map(async (tokenId) => await CoBotsV2.isMettaEnabled(tokenId))
      );
      await deployer.CoBotsV2.toggleMetta([0, 1]);
      const newState = await Promise.all(
        [0, 1].map(async (tokenId) => await CoBotsV2.isMettaEnabled(tokenId))
      );
      expect(prevState).to.deep.eq(newState.map((s) => !s));
    });
  });
  describe("draw", async function () {
    it("should draw unlocked giveaways iteratively", async () => {
      const { users, CoBotsV2, PARAMETERS, MINT_BATCH_LIMIT } =
        await publicSaleFixture();
      await expect(users[0].CoBotsV2.draw()).to.be.revertedWith(
        "NoGiveawayToTrigger"
      );
      const prizes = PRIZES_INPUT.slice(0, -1);
      for (const prize of prizes) {
        const currentSupply = await CoBotsV2.totalSupply();
        const checkpoint = prize.checkpoint;
        const nUsers = Math.ceil(
          (checkpoint - currentSupply.toNumber()) / MINT_BATCH_LIMIT
        );
        if (nUsers === 0) {
          continue;
        }
        await Promise.all(
          users.slice(0, nUsers).map(async (user, i) => {
            const quantity =
              i === nUsers - 1
                ? (checkpoint - currentSupply.toNumber()) % MINT_BATCH_LIMIT
                : MINT_BATCH_LIMIT;
            await user.CoBotsV2.mintPublicSale(quantity, [], {
              value: BigNumber.from(PARAMETERS.mintPublicPrice).mul(quantity),
            });
          })
        );
        const tx = await users[0].CoBotsV2.draw();
        const receipt = await tx.wait();
        expect(receipt.events?.length).to.eq(
          prizes
            .filter((_p) => _p.checkpoint === prize.checkpoint)
            .map((_p) => (_p.isContest ? 1 : 2))
            .reduce((a, b) => a + b, 0)
        );
        await expect(users[0].CoBotsV2.draw()).to.be.revertedWith(
          "NoGiveawayToTrigger"
        );
      }
      await network.provider.send("evm_increaseTime", [
        PARAMETERS.grandPrizeDelay + 1,
      ]);
      const tx = await users[0].CoBotsV2.draw();
      const receipt = await tx.wait();
      expect(receipt.events?.length).to.eq(3); // 1 more for end of giveaways
      await expect(users[0].CoBotsV2.draw()).to.be.revertedWith(
        "NoGiveawayToTrigger"
      );
    });
    it("should draw all giveaways at once when minted out and grand prize delay passed", async () => {
      const { users, PARAMETERS } = await mintedOutFixture();
      await network.provider.send("evm_increaseTime", [
        PARAMETERS.grandPrizeDelay + 1,
      ]);
      const tx = await users[0].CoBotsV2.draw();
      const receipt = await tx.wait();
      expect(receipt.events?.length).to.eq(
        PRIZES_INPUT.map((_p) => (_p.isContest ? 1 : 2)).reduce(
          (a, b) => a + b,
          0
        ) + 1
      );
      await expect(users[0].CoBotsV2.draw()).to.be.revertedWith(
        "NoGiveawayToTrigger"
      );
    });
    it("should draw all giveaways apart mystery challenge randomly after delay", async () => {
      const { users, PARAMETERS } = await mintedOutFixture(true);
      await network.provider.send("evm_increaseTime", [
        PARAMETERS.grandPrizeDelay + 1,
      ]);
      const tx = await users[0].CoBotsV2.draw();
      const receipt = await tx.wait();
      expect(receipt.events?.length).to.eq(PRIZES_INPUT.length * 2); // 2 events per prize, minus 1 for mystery challenge + 1 for final draw
    });
  });
  describe("redrawPendingFulfillments", async function () {
    it("should update requestIds and fulfillments for non contest fulfillments", async () => {
      const { users, PRIZES, CoBotsV2, vrfCoordinator } =
        await mintedOutFixture();
      await users[0].CoBotsV2.draw();
      const ids = PRIZES.slice(0, -1)
        .map((p, i) => ({ ...p, i }))
        .filter((p) => !p.isContest)
        .map((p) => p.i);
      const prevRequestIds = await Promise.all(
        ids.map(async (p) => (await CoBotsV2.requestIds(p)).toString())
      );
      await users[0].CoBotsV2.redrawPendingFulfillments();
      await Promise.all(
        prevRequestIds.map(
          async (id) =>
            await expect(
              vrfCoordinator.CoBotsV2.rawFulfillRandomWords(id, [0])
            ).to.be.revertedWith("FulfillRequestRedrawn")
        )
      );
      const newRequestIds = await Promise.all(
        ids.map(async (p) => (await CoBotsV2.requestIds(p)).toString())
      );
      expect(
        newRequestIds
          .map((r, i) => r !== prevRequestIds[i])
          .reduce((a, b) => a && b, true)
      ).to.be.true;
      await Promise.all(
        newRequestIds.map(
          async (id) =>
            await vrfCoordinator.CoBotsV2.rawFulfillRandomWords(id, [0])
              .then((tx) => tx.wait())
              .then((receipt) => expect(receipt.events?.length).to.eq(1))
        )
      );
    });
    it("should not update requestIds when prize is already fulfilled", async () => {
      const { users, PRIZES, CoBotsV2, vrfCoordinator } =
        await mintedOutFixture();
      await users[0].CoBotsV2.draw();
      const ids = PRIZES.slice(0, -1)
        .map((p, i) => ({ ...p, i }))
        .filter((p) => !p.isContest)
        .map((p) => p.i);
      const prevRequestIds = await Promise.all(
        ids.map(async (p) => (await CoBotsV2.requestIds(p)).toString())
      );
      await Promise.all(
        prevRequestIds.map(
          async (id) =>
            await vrfCoordinator.CoBotsV2.rawFulfillRandomWords(id, [0])
        )
      );
      await users[0].CoBotsV2.redrawPendingFulfillments();
      const newRequestIds = await Promise.all(
        ids.map(async (p) => (await CoBotsV2.requestIds(p)).toString())
      );
      expect(
        newRequestIds
          .map((r, i) => r === prevRequestIds[i])
          .reduce((a, b) => a && b, true)
      ).to.be.true;
      await Promise.all(
        newRequestIds.map(
          async (id) =>
            await expect(
              vrfCoordinator.CoBotsV2.rawFulfillRandomWords(id, [0])
            ).to.be.revertedWith("FulfillmentAlreadyFulfilled")
        )
      );
    });
  });
  describe("fulfillContest", async function () {
    it("should revert when caller is not owner", async () => {
      const { users } = await publicSaleFixture();
      await expect(
        users[0].CoBotsV2.fulfillContest(0, users[0].address, 0)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("should revert when prize is not a contest", async () => {
      const { users, deployer } = await publicSaleFixture();
      await expect(
        deployer.CoBotsV2.fulfillContest(0, users[0].address, 0)
      ).to.be.revertedWith("FulfillRequestForNonExistentContest");
    });
    it("should revert when giveaway is locked", async () => {
      const { users, deployer, PRIZES } = await publicSaleFixture();
      await expect(
        deployer.CoBotsV2.fulfillContest(
          PRIZES.findIndex((p) => p.isContest),
          users[0].address,
          0
        )
      ).to.be.revertedWith("FulfillRequestForNonExistentContest");
    });
    it("should revert when winner does not own selected token", async () => {
      const { users, deployer, PRIZES } = await mintedOutFixture();
      await users[0].CoBotsV2.draw();
      await expect(
        deployer.CoBotsV2.fulfillContest(
          PRIZES.findIndex((p) => p.isContest),
          users[1].address,
          0
        )
      ).to.be.revertedWith("FulfillRequestWithTokenNotOwnedByWinner");
    });
    it("should revert when tokenId is greater than checkpoint", async () => {
      const { users, deployer, PRIZES, CoBotsV2 } = await mintedOutFixture();
      await users[0].CoBotsV2.draw();
      for (const [i, prize] of PRIZES.slice(0, -1).entries()) {
        if (!prize.isContest) {
          continue;
        }
        const user = await CoBotsV2.ownerOf(prize.checkpoint);
        await expect(
          deployer.CoBotsV2.fulfillContest(i, user, prize.checkpoint)
        ).to.be.revertedWith("FulfillRequestWithTokenOutOfBounds");
      }
    });
    it("should send money to winner and revert other attempts", async () => {
      const { users, deployer, PRIZES } = await mintedOutFixture();
      await users[0].CoBotsV2.draw();
      for (const [i, prize] of PRIZES.entries()) {
        if (!prize.isContest) {
          continue;
        }
        const balancePrev = await ethers.provider.getBalance(users[0].address);
        await deployer.CoBotsV2.fulfillContest(i, users[0].address, 0);
        await expect(
          deployer.CoBotsV2.fulfillContest(i, users[0].address, 0)
        ).to.be.revertedWith("FulfillmentAlreadyFulfilled");
        const balanceNext = await ethers.provider.getBalance(users[0].address);
        expect(balanceNext.sub(balancePrev)).to.eq(prize.amount);
      }
    });
  });
  describe("TheAnswer", async function () {
    it("should revert when caller does not own the ENS", async () => {
      const { users } = await publicSaleFixture();
      await expect(users[0].CoBotsV2.TheAnswer(42, 0)).to.be.revertedWith(
        "MysteryChallengeSenderDoesNotOwnENS"
      );
    });
    it("should revert when prize is not unlocked", async () => {
      const { deployer } = await publicSaleFixture();
      await expect(deployer.CoBotsV2.TheAnswer(42, 0)).to.be.revertedWith(
        "FulfillRequestForNonExistentContest"
      );
    });
    it("should revert when answer is incorrect", async () => {
      const { deployer } = await mintedOutFixture();
      await deployer.CoBotsV2.draw();
      await expect(deployer.CoBotsV2.TheAnswer(0, 0)).to.be.revertedWith(
        "MysteryChallengeValueDoesNotMatch"
      );
    });
    it("should revert when caller does not own selected token", async () => {
      const { deployer, MINT_BATCH_LIMIT } = await mintedOutFixture();
      await deployer.CoBotsV2.draw();
      await expect(
        deployer.CoBotsV2.TheAnswer(42, MINT_BATCH_LIMIT + 1)
      ).to.be.revertedWith("FulfillRequestWithTokenNotOwnedByWinner");
    });
    it("should revert when tokenId is greater than checkpoint", async () => {
      const { deployer, users } = await mintedOutFixture();
      await deployer.CoBotsV2.draw();
      const tokenId = await users[
        users.length - 1
      ].CoBotsV2.tokenOfOwnerByIndex(users[users.length - 1].address, 0);
      await users[users.length - 1].CoBotsV2[
        "safeTransferFrom(address,address,uint256)"
      ](users[users.length - 1].address, deployer.address, tokenId);
      await expect(deployer.CoBotsV2.TheAnswer(42, tokenId)).to.be.revertedWith(
        "FulfillRequestWithTokenOutOfBounds"
      );
    });
    it("should send money to winner and revert other attempts", async () => {
      const { deployer, users, PRIZES } = await mintedOutFixture();
      await deployer.CoBotsV2.draw();
      await users[0].CoBotsV2["safeTransferFrom(address,address,uint256)"](
        users[0].address,
        deployer.address,
        0
      );
      const balancePrev = await ethers.provider.getBalance(deployer.address);
      const tx = await deployer.CoBotsV2.TheAnswer(42, 0);
      const receipt = await tx.wait();
      const paidFees = receipt.cumulativeGasUsed.mul(receipt.effectiveGasPrice);
      const balanceNext = await ethers.provider.getBalance(deployer.address);
      expect(balanceNext.add(paidFees).sub(balancePrev)).to.eq(
        PRIZES[MYSTERY_CHALLENGE.prizeIndex].amount
      );
      await expect(deployer.CoBotsV2.TheAnswer(42, 0)).to.be.revertedWith(
        "FulfillmentAlreadyFulfilled"
      );
    });
  });
  describe("fulfillRandomWords", async function () {
    it("should send money to owner of selected token", async () => {
      const { deployer, users, vrfCoordinator } = await mintedOutFixture();
      const tx = await deployer.CoBotsV2.draw();
      const receipt = await tx.wait();
      const requests =
        receipt.events
          ?.filter((e) => e.event === "CheckpointDrawn")
          .filter((e) => !e.args?.prize?.isContest) || [];
      for (const request of requests) {
        const balancePrev = await ethers.provider.getBalance(users[0].address);
        await vrfCoordinator.CoBotsV2.rawFulfillRandomWords(
          request.args?.requestId,
          [0]
        );
        const balanceNext = await ethers.provider.getBalance(users[0].address);
        expect(balanceNext.sub(balancePrev)).to.eq(request.args?.prize.amount);
      }
    });
  });
  describe("getOrderedFulfillments", async function () {
    it("should return ordered prizes list", async () => {
      const { users, CoBotsV2, PRIZES, PARAMETERS } = await mintedOutFixture();
      await network.provider.send("evm_increaseTime", [
        PARAMETERS.grandPrizeDelay + 1,
      ]);
      await users[0].CoBotsV2.draw();
      const fulfillments = await CoBotsV2.getOrderedFulfillments();
      expect(fulfillments.map((fulfillment) => fulfillment.prize)).to.deep.eq(
        PRIZES
      );
    });
  });
  describe("withdraw", async function () {
    it("should revert when caller is not owner", async () => {
      const { users } = await mintedOutFixture();
      await expect(users[0].CoBotsV2.withdraw()).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });
    it("should withdrawn all funds after the end of the game", async () => {
      const { deployer, PRIZES, PARAMETERS } = await mintedOutFixture();
      await deployer.CoBotsV2.draw();
      const balancePrev = await ethers.provider.getBalance(deployer.address);
      const tx = await deployer.CoBotsV2.withdraw();
      const receipt = await tx.wait();
      const paidFees = receipt.cumulativeGasUsed.mul(receipt.effectiveGasPrice);
      const balanceNext = await ethers.provider.getBalance(deployer.address);
      const mintOutRevenue = BigNumber.from(PARAMETERS.mintPublicPrice).mul(
        PARAMETERS.maxCobots
      );
      expect(balanceNext.sub(balancePrev).add(paidFees)).to.eq(
        mintOutRevenue.sub(
          PRIZES.reduce(
            (acc, prize) => acc.add(prize.amount),
            BigNumber.from(0)
          )
        )
      );
    });
    it("should draw before withdrawing all funds", async () => {
      const { deployer } = await mintedOutFixture();
      const tx = await deployer.CoBotsV2.withdraw();
      const receipt = await tx.wait();
      expect(
        receipt.events?.filter((e) => e.event === "DrawBeforeWithdrawal").length
      ).to.eq(1);
    });
    it("should withdraw limited funds at any checkpoint without compromising the giveaways", async () => {
      const {
        deployer,
        users,
        CoBotsV2,
        PRIZES,
        PARAMETERS,
        MINT_BATCH_LIMIT,
      } = await publicSaleFixture();
      await expect(deployer.CoBotsV2.withdraw()).to.be.revertedWith(
        "InsufficientFunds"
      );
      const withdrawnAmounts = [];
      const steps = 10;
      for (
        let checkpoint = 0;
        checkpoint <= PARAMETERS.maxCobots;
        checkpoint += steps
      ) {
        const currentSupply = await CoBotsV2.totalSupply();
        const nUsers = Math.ceil(
          (checkpoint - currentSupply.toNumber()) / MINT_BATCH_LIMIT
        );
        if (nUsers === 0) {
          continue;
        }
        await Promise.all(
          users.slice(0, nUsers).map(async (user, i) => {
            const quantity =
              i === nUsers - 1
                ? (checkpoint - currentSupply.toNumber()) % MINT_BATCH_LIMIT
                : MINT_BATCH_LIMIT;
            await user.CoBotsV2.mintPublicSale(quantity, [], {
              value: BigNumber.from(PARAMETERS.mintPublicPrice).mul(quantity),
            });
          })
        );
        try {
          await users[0].CoBotsV2.draw();
        } catch (e) {
          await expect(users[0].CoBotsV2.draw()).to.be.revertedWith(
            "NoGiveawayToTrigger"
          );
        }
        try {
          const balancePrev = await ethers.provider.getBalance(
            deployer.address
          );
          const tx = await deployer.CoBotsV2.withdraw();
          const receipt = await tx.wait();
          const paidFees = receipt.cumulativeGasUsed.mul(
            receipt.effectiveGasPrice
          );
          const balanceNext = await ethers.provider.getBalance(
            deployer.address
          );
          withdrawnAmounts.push(
            balanceNext.sub(balancePrev).add(paidFees).toString()
          );
        } catch (e) {
          await expect(deployer.CoBotsV2.withdraw()).to.be.revertedWith(
            "InsufficientFunds"
          );
          withdrawnAmounts.push("0");
        }
      }
      await network.provider.send("evm_increaseTime", [
        PARAMETERS.grandPrizeDelay + 1,
      ]);
      try {
        await users[0].CoBotsV2.draw();
      } catch (e) {
        await expect(users[0].CoBotsV2.draw()).to.be.revertedWith(
          "NoGiveawayToTrigger"
        );
      }
      await expect(deployer.CoBotsV2.withdraw()).to.be.revertedWith(
        "InsufficientFunds"
      );
      withdrawnAmounts.push("0");
      const mintOutRevenue = BigNumber.from(PARAMETERS.mintPublicPrice).mul(
        PARAMETERS.maxCobots
      );
      expect(
        withdrawnAmounts
          .map((amount) => BigNumber.from(amount))
          .reduce((acc, amount) => acc.add(amount))
      ).to.eq(
        mintOutRevenue.sub(
          PRIZES.reduce(
            (acc, prize) => acc.add(prize.amount),
            BigNumber.from(0)
          )
        )
      );
    });
  });
  describe("failsafeWithdraw", async function () {
    it("should revert when collection is not minted out", async () => {
      const { deployer, PARAMETERS } = await publicSaleFixture();
      await deployer.CoBotsV2.mintPublicSale(1, [], {
        value: PARAMETERS.mintPublicPrice,
      });
      await expect(deployer.CoBotsV2.failsafeWithdraw()).to.be.revertedWith(
        "TokenNotMintedOut"
      );
    });
    it("should revert when delay is not passed", async () => {
      const { deployer } = await mintedOutFixture();
      await expect(deployer.CoBotsV2.failsafeWithdraw()).to.be.revertedWith(
        "FailSafeWithdrawalNotEnabled"
      );
    });
    it("should revert when caller is not the owner", async () => {
      const { users, PARAMETERS } = await mintedOutFixture();
      await network.provider.send("evm_increaseTime", [
        PARAMETERS.mintOutFoundersWithdrawalDelay + 1,
      ]);
      await expect(users[0].CoBotsV2.failsafeWithdraw()).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });
    it("should withdraw all funds to deployer", async () => {
      const { deployer, PARAMETERS } = await mintedOutFixture();
      await network.provider.send("evm_increaseTime", [
        PARAMETERS.mintOutFoundersWithdrawalDelay + 1,
      ]);
      const balancePrev = await ethers.provider.getBalance(deployer.address);
      const tx = await deployer.CoBotsV2.failsafeWithdraw();
      const receipt = await tx.wait();
      const paidFees = receipt.gasUsed.mul(receipt.effectiveGasPrice);
      const balanceNext = await ethers.provider.getBalance(deployer.address);
      expect(balanceNext.sub(balancePrev).add(paidFees).toString()).to.eq(
        PARAMETERS.mintPublicPrice.mul(PARAMETERS.maxCobots).toString()
      );
    });
    it("should withdraw all funds to deployer including drawn but no fulfilled prizes", async () => {
      const { deployer, PARAMETERS } = await mintedOutFixture();
      await network.provider.send("evm_increaseTime", [
        PARAMETERS.mintOutFoundersWithdrawalDelay + 1,
      ]);
      await deployer.CoBotsV2.draw();
      const balancePrev = await ethers.provider.getBalance(deployer.address);
      const tx = await deployer.CoBotsV2.failsafeWithdraw();
      const receipt = await tx.wait();
      const paidFees = receipt.gasUsed.mul(receipt.effectiveGasPrice);
      const balanceNext = await ethers.provider.getBalance(deployer.address);
      expect(balanceNext.sub(balancePrev).add(paidFees).toString()).to.eq(
        PARAMETERS.mintPublicPrice.mul(PARAMETERS.maxCobots).toString()
      );
    });
  });
});
