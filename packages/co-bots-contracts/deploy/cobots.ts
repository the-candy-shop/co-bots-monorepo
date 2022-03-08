// noinspection JSUnusedGlobalSymbols

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { TAGS } from "../utils/constants";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network, ethers } = hre;
  const { deploy, execute } = deployments;
  const { deployer } = await getNamedAccounts();
  let openseaAddress;
  let looksrareAddress;
  let integersAddress;
  let vrfCoordinatorAddress;
  let linkAddress;
  let gasKeyHash;
  let linkEthFeed;
  let blockHashStore;

  if (network.tags.mainnet) {
    openseaAddress = "0xf57b2c51ded3a29e6891aba85459d600256cf317";
    looksrareAddress = "0x3f65a762f15d01809cdc6b43d8849ff24949c86a";
    integersAddress = "0xe5d03576716d2D66Becf01a3F3BC7B80eb05952E";
    vrfCoordinatorAddress = "0x271682DEB8C4E0901D1a1550aD2e64D568E69909";
    linkAddress = "0x514910771af9ca656af840dff83e8264ecf986ca";
    gasKeyHash =
      "0x9fe0eebf5e446e3c998ec9bb19951541aee00bb90ea201ae456421a2ded86805";
    linkEthFeed = "0xDC530D9457755926550b59e8ECcdaE7624181557";
    blockHashStore = "0xAA25602bccF3bBdE8E2F0F09f3a1f6DEF54593c0";
  } else {
    openseaAddress = "0xa5409ec958c83c3f309868babaca7c86dcb077c1";
    looksrareAddress = "0xf42aa99f011a1fa7cda90e5e98b277e306bca83e";
    integersAddress = "0x03abFda4e7cec3484D518848B5e6aa10965F91DD";
    vrfCoordinatorAddress = "0x6168499c0cFfCaCD319c818142124B7A15E857ab";
    linkAddress = "0x01BE23585060835E02B77ef475b0Cc51aA1e0709";
    gasKeyHash =
      "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc";
    linkEthFeed = "0xFABe80711F3ea886C3AC102c81ffC9825E16162E";
    blockHashStore = ethers.constants.AddressZero;
  }
  if (network.tags.local) {
    const vrfTx = await deploy("VRFCoordinatorV2TestHelper", {
      from: deployer,
      log: true,
      args: [linkAddress, blockHashStore, linkEthFeed],
    });
    vrfCoordinatorAddress = vrfTx.address;
    await execute(
      "VRFCoordinatorV2TestHelper",
      { from: deployer },
      "setConfig",
      3,
      2500000,
      86400,
      33285,
      "60000000000000000",
      {
        fulfillmentFlatFeeLinkPPMTier1: 250000,
        fulfillmentFlatFeeLinkPPMTier2: 250000,
        fulfillmentFlatFeeLinkPPMTier3: 250000,
        fulfillmentFlatFeeLinkPPMTier4: 250000,
        fulfillmentFlatFeeLinkPPMTier5: 250000,
        reqsForTier2: 0,
        reqsForTier3: 0,
        reqsForTier4: 0,
        reqsForTier5: 0,
      }
    );
  }

  // Deploy renderer
  const rendererTx = await deploy("CoBotsRenderer", {
    from: deployer,
    log: true,
    args: [],
    libraries: { Integers: integersAddress },
  });

  // Deploy token
  const coBotsTx = await deploy("CoBots", {
    from: deployer,
    log: true,
    args: [
      "Co-Bots",
      "CBTS",
      rendererTx.address,
      openseaAddress,
      looksrareAddress,
      vrfCoordinatorAddress,
      linkAddress,
      gasKeyHash,
    ],
  });

  if (network.tags.local) {
    const LinkToken = await ethers.getContractAt(
      [
        "function balanceOf(address owner) view returns (uint256 balance)",
        "function transferFrom(address from, address to, uint256 value) returns (bool success)",
        "function approve(address _spender, uint256 _value) returns (bool)",
      ],
      linkAddress,
      deployer
    );
    const deployerBalance = await LinkToken.balanceOf(deployer);
    await LinkToken.approve(deployer, deployerBalance, {
      from: deployer,
    });
    const txTransfer = await LinkToken.transferFrom(
      deployer,
      coBotsTx.address,
      deployerBalance
    );
    await txTransfer.wait();
    await execute(
      "CoBots",
      { from: deployer },
      "createSubscriptionAndFund",
      deployerBalance
    );
  }
};
export default func;
func.tags = [TAGS.CO_BOTS];
