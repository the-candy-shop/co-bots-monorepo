// noinspection JSUnusedGlobalSymbols

import * as dotenv from "dotenv";

import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@typechain/hardhat";
import "hardhat-deploy";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "hardhat-spdx-license-identifier";
import { removeConsoleLog } from "hardhat-preprocessor";
import "./tasks";
import "@clemlaflemme.eth/contracts/tasks";
import { accounts, node_url } from "./utils/network";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.12",
    settings: {
      optimizer: {
        enabled: true,
        runs: 2000,
        details: {
          yul: true,
          // Tuning options for the Yul optimizer.
          yulDetails: {
            //   // Improve allocation of stack slots for variables, can free up stack slots early.
            //   // Activated by default if the Yul optimizer is activated.
            stackAllocation: true,
            //   // Select optimization steps to be applied.
            //   // Optional, the optimizer will use the default sequence if omitted.
            optimizerSteps: "dhfoDgvulfnTUtnIf",
          },
        },
      },
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    ens: {
      default: "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85",
    },
    vrfCoordinator: {
      mainnet: "0x271682DEB8C4E0901D1a1550aD2e64D568E69909",
      default: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
    },
    linkToken: {
      mainnet: "0x514910771af9ca656af840dff83e8264ecf986ca",
      default: "0x01BE23585060835E02B77ef475b0Cc51aA1e0709",
    },
    linkETHPriceFeed: {
      mainnet: "0xDC530D9457755926550b59e8ECcdaE7624181557",
      default: "0xFABe80711F3ea886C3AC102c81ffC9825E16162E",
    },
    coBotsV1: {
      mainnet: "0x2eFa2743B863F3Bd6f624Ac0d58445bC5fB62bf6",
      default: "0x111de4Fa9c705B51D243504E61bE0737D2CdCaBc",
    },
    coBotsRendererV1: {
      mainnet: "0x824d304b7C17FF1E03bEA9b0f752BA9A2aff3426",
      default: "0xAB23145aC706A2454cCAD3ED7c76569CAf3D3fAD",
    },
    array: {
      default: "0x1FA6A2152871D5A4D1f56511110C9a353CA48339",
    },
    bytes: {
      default: "0xB0464EBF65D8F453a9056eEFE11167411B1d1855",
    },
    integers: {
      mainnet: "0xe5d03576716d2D66Becf01a3F3BC7B80eb05952E",
      default: "0xFD60cDD345feB6011fDeb4Dc3d69aD2319f8508C",
    },
    rectEncoder: {
      default: "0xc8AD48942deb7BAa9B15665aa72656A259277eaF",
    },
    rectRenderer: {
      default: "0x9D7FeA76a906A67DE351b657CD73E6bf8F04b840",
    },
    rendererCommons: {
      default: "0x91F59E8d53061DD2F7C4a405984D9a4297C54A0C",
    },
  },
  networks: {
    mainnet: {
      url: node_url("mainnet"),
      accounts: accounts("mainnet"),
      tags: ["mainnet"],
    },
    rinkeby: {
      url: node_url("rinkeby"),
      accounts: accounts("rinkeby"),
      tags: ["staging"],
    },
    hardhat: {
      tags: ["local"],
      blockGasLimit: 10 * 50_000_000, // Geth new default is 50M, increased here for tests
      forking: {
        url: node_url("rinkeby"),
      },
      accounts: {
        count: 501,
        ...accounts("rinkeby"),
      },
    },
    localhost: {
      tags: ["local"],
      timeout: 1_000_000,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  mocha: {
    timeout: 500_000,
  },
  spdxLicenseIdentifier: {
    overwrite: true,
    runOnCompile: true,
  },
  preprocess: {
    eachLine: removeConsoleLog(
      (hre) =>
        hre.network.name !== "hardhat" && hre.network.name !== "localhost"
    ),
  },
};

export default config;
