/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { ProxyRegistry, ProxyRegistryInterface } from "../ProxyRegistry";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "proxies",
    outputs: [
      {
        internalType: "contract OwnableDelegateProxy",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b5061016e806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c8063c455279114610030575b600080fd5b61006661003e3660046100be565b60006020819052908152604090205473ffffffffffffffffffffffffffffffffffffffff1681565b604051610073919061012a565b60405180910390f35b600073ffffffffffffffffffffffffffffffffffffffff82165b92915050565b6100a58161007c565b81146100b057600080fd5b50565b80356100968161009c565b6000602082840312156100d3576100d3600080fd5b60006100df84846100b3565b949350505050565b600073ffffffffffffffffffffffffffffffffffffffff8216610096565b6000610096826100e7565b600061009682610105565b61012481610110565b82525050565b60208101610096828461011b56fea264697066735822122009c564f38e749d51fa663fa370a150b5ecb0713e6cdd3eb12d8121ba7a482ed164736f6c634300080c0033";

export class ProxyRegistry__factory extends ContractFactory {
  constructor(
    ...args: [signer: Signer] | ConstructorParameters<typeof ContractFactory>
  ) {
    if (args.length === 1) {
      super(_abi, _bytecode, args[0]);
    } else {
      super(...args);
    }
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ProxyRegistry> {
    return super.deploy(overrides || {}) as Promise<ProxyRegistry>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): ProxyRegistry {
    return super.attach(address) as ProxyRegistry;
  }
  connect(signer: Signer): ProxyRegistry__factory {
    return super.connect(signer) as ProxyRegistry__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ProxyRegistryInterface {
    return new utils.Interface(_abi) as ProxyRegistryInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ProxyRegistry {
    return new Contract(address, _abi, signerOrProvider) as ProxyRegistry;
  }
}