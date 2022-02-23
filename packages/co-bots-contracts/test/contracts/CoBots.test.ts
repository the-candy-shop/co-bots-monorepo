import { setupUser, setupUsers } from "./utils";
import chai from "chai";
import {
  deployments,
  ethers,
  getNamedAccounts,
  getUnnamedAccounts,
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

describe("CoBots", function () {
  describe("mintBatchPublicSale", async function () {
    it("should revert when minting is not open", async () => {
      const { users, CoBots } = await setup();
      await users[0].CoBots.mint(1);
      const owner = await CoBots.ownerOf(0);
      expect(owner).to.equal(users[0].address);
    });
  });
});
