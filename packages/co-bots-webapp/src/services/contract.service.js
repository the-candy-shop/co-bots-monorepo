import { ethers } from "ethers";
import abi from "./abi.json";
import store from "@/store";

export var provider = new ethers.getDefaultProvider(
  import.meta.env.VITE_NETWORK,
  {
    etherscan: import.meta.env.VITE_ETHERSCAN_ID,
    infura: import.meta.env.VITE_INFURA_ID,
  }
);

export var contract = new ethers.Contract(
  import.meta.env.VITE_CONTRACT_ADDRESS,
  abi,
  provider
);

export const setSigner = (p) => {
  const signer = p.getSigner();
  contract = contract.connect(signer);
};

const accountsChanged = (accounts) => {
  let address = accounts.length > 0 ? accounts[0] : "";
  let p = new ethers.providers.Web3Provider(window.ethereum);
  setSigner(p);
  store.dispatch("eth/setWalletAddress", address);
};
const connected = async () => {
  const [address] = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  let p = new ethers.providers.Web3Provider(window.ethereum);
  setSigner(p);
  store.dispatch("eth/setWalletAddress", address);
};

const disconnected = () => {
  store.dispatch("eth/setWalletAddress", "");
};

export function connect() {
  connected();
  window.ethereum.on("accountsChanged", accountsChanged);
  window.ethereum.on("connect", connected);
  window.ethereum.on("disconnect", disconnected);
}

export function disconnect() {
  window.ethereum.removeListener("accountsChanged", accountsChanged);
  window.ethereum.removeListener("connect", connected);
  window.ethereum.removeListener("disconnect", disconnected);
}
