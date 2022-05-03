import { ethers } from "ethers";
import abi from "./v1abi.json";
import store from "@/store";

export var provider = new ethers.getDefaultProvider(
  import.meta.env.VITE_NETWORK,
  {
    etherscan: import.meta.env.VITE_ETHERSCAN_ID,
    infura: import.meta.env.VITE_INFURA_ID,
  }
);

export var v1contract = new ethers.Contract(
  import.meta.env.VITE_V1_CONTRACT_ADDRESS,
  abi,
  provider
);
