import { setupUser, setupUsers } from "./utils";
import chai from "chai";
import {
  deployments,
  ethers,
  getNamedAccounts,
  getUnnamedAccounts,
} from "hardhat";
import { BigNumber } from "ethers";
import { solidity } from "ethereum-waffle";
import { PRIZES as PRIZES_INPUT, TAGS } from "../../utils/constants";
import { jestSnapshotPlugin } from "mocha-chai-jest-snapshot";
import { CoBotsParameters, Prize } from "../../utils/types";
import { CoBotsV2, VRFCoordinatorV2TestHelper } from "../../typechain";

chai.use(jestSnapshotPlugin());
chai.use(solidity);
const { expect } = chai;

const setup = async () => {
  await deployments.fixture([TAGS.CO_BOTS, TAGS.CO_BOTS_SUBSCRIPTION]);
  const contracts = {
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
  const { deployer } = await getNamedAccounts();
  const users = await setupUsers(
    (
      await getUnnamedAccounts()
    ).slice(0, constants.PARAMETERS.maxCobots / constants.MINT_BATCH_LIMIT),
    contracts
  );
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

// const vrfFixture = deployments.createFixture(async ({}) => {
//   const contractsAndUsers = await publicSaleFixture();
//   const { users, VRFCoordinator } = contractsAndUsers;
//   await network.provider.request({
//     method: "hardhat_impersonateAccount",
//     params: [VRFCoordinator.address],
//   });
//   await (
//     await ethers.getSigner(users[0].address)
//   ).sendTransaction({
//     to: VRFCoordinator.address,
//     value: ethers.utils.parseEther("100"),
//   });
//
//   return contractsAndUsers;
// });

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
          amount: ethers.utils.parseEther(prize.amount.toString()),
        }))
      );
    });
  });
  describe("mintPublicSale", async function () {
    it("should revert when minting is not open", async () => {
      const { users } = await setup();
      expect(users[0].CoBotsV2.mintPublicSale(1, [])).to.be.revertedWith(
        "PublicSaleNotOpen"
      );
    });
    it("should revert when price does not match", async () => {
      const { users } = await publicSaleFixture();
      expect(users[0].CoBotsV2.mintPublicSale(1, [])).to.be.revertedWith(
        "WrongPrice"
      );
    });
    it("should revert when quantity is too high", async () => {
      const { users, MINT_BATCH_LIMIT, PARAMETERS } = await publicSaleFixture();
      expect(
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
    it("should mint out up to id MAX_COBOTS - 1", async () => {
      const { users, PARAMETERS, MINT_BATCH_LIMIT } = await publicSaleFixture();
      await Promise.all(
        users.map((user) =>
          user.CoBotsV2.mintPublicSale(MINT_BATCH_LIMIT, [], {
            value: BigNumber.from(PARAMETERS.mintPublicPrice).mul(
              MINT_BATCH_LIMIT
            ),
          })
        )
      );
      const currentId = await users[0].CoBotsV2.totalSupply();
      expect(
        users[0].CoBotsV2.mintPublicSale(
          PARAMETERS.maxCobots - currentId.toNumber() + 1,
          [],
          {
            value: BigNumber.from(PARAMETERS.mintPublicPrice).mul(
              PARAMETERS.maxCobots - currentId.toNumber() + 1
            ),
          }
        )
      ).to.be.revertedWith("TotalSupplyExceeded");
    });
  });
  describe("mintFounders", async function () {
    it("should revert when user is not owner", async () => {
      const { users } = await setup();
      expect(
        users[0].CoBotsV2.mintFounders(users[0].address, 1)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("should revert when deployer try to mint more than allowed", async () => {
      const { deployer, users, MINT_FOUNDERS } = await setup();
      expect(
        deployer.CoBotsV2.mintFounders(users[0].address, MINT_FOUNDERS + 1)
      ).to.be.revertedWith("AllocationExceeded");
    });
    it("should mint to the given user", async () => {
      const { deployer, users, CoBotsV2 } = await setup();
      await deployer.CoBotsV2.mintFounders(users[0].address, 1);
      const owner = await CoBotsV2.ownerOf(0);
      expect(owner).to.eq(users[0].address);
    });
  });
});
