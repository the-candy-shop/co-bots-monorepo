import { providers } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { setSigner, contract } from "@/services/contract.service"
import store from "@/store";

//  Create WalletConnect Provider
const provider = new WalletConnectProvider({
  infuraId: import.meta.env.VITE_INFURA_ID,
});

const web3Provider = new providers.Web3Provider(provider);

export function connectWC() {
  // Subscribe to accounts change
  provider.on("accountsChanged", (accounts) => {
    setSigner(web3Provider)
    console.log(contract)
    store.dispatch('eth/setWalletAddress', accounts[0])
  });

  provider.enable()
}

export function disconnectWC() {
  provider.disconnect()
  store.dispatch('eth/setWalletAddress', '')
}