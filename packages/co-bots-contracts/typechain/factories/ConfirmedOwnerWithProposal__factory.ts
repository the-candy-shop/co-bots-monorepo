/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  ConfirmedOwnerWithProposal,
  ConfirmedOwnerWithProposalInterface,
} from "../ConfirmedOwnerWithProposal";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
      {
        internalType: "address",
        name: "pendingOwner",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "OwnershipTransferRequested",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [],
    name: "acceptOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b506040516105e03803806105e083398101604081905261002f91610144565b6001600160a01b03821661005e5760405162461bcd60e51b8152600401610055906101b5565b60405180910390fd5b600080546001600160a01b0319166001600160a01b038481169190911790915581161561008e5761008e81610095565b5050610207565b6001600160a01b0381163314156100be5760405162461bcd60e51b8152600401610055906101f7565b600180546001600160a01b0319166001600160a01b0383811691821790925560008054604051929316917fed8889f560326eb138920d842192f0eb3dd22b4f139c87a2c57538e05bae12789190a350565b60006001600160a01b0382165b92915050565b61012b8161010f565b811461013657600080fd5b50565b805161011c81610122565b6000806040838503121561015a5761015a600080fd5b60006101668585610139565b925050602061017785828601610139565b9150509250929050565b60188152602081017f43616e6e6f7420736574206f776e657220746f207a65726f0000000000000000815290505b60200190565b6020808252810161011c81610181565b60178152602081017f43616e6e6f74207472616e7366657220746f2073656c66000000000000000000815290506101af565b6020808252810161011c816101c5565b6103ca806102166000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c806379ba5097146100465780638da5cb5b14610050578063f2fde38b1461007f575b600080fd5b61004e610092565b005b60005473ffffffffffffffffffffffffffffffffffffffff166040516100769190610276565b60405180910390f35b61004e61008d3660046102a3565b61014e565b60015473ffffffffffffffffffffffffffffffffffffffff1633146100d25760405162461bcd60e51b81526004016100c990610300565b60405180910390fd5b60008054337fffffffffffffffffffffffff00000000000000000000000000000000000000008083168217845560018054909116905560405173ffffffffffffffffffffffffffffffffffffffff90921692909183917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e091a350565b610156610162565b61015f8161019b565b50565b60005473ffffffffffffffffffffffffffffffffffffffff1633146101995760405162461bcd60e51b81526004016100c990610342565b565b73ffffffffffffffffffffffffffffffffffffffff81163314156101d15760405162461bcd60e51b81526004016100c990610384565b600180547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff83811691821790925560008054604051929316917fed8889f560326eb138920d842192f0eb3dd22b4f139c87a2c57538e05bae12789190a350565b600073ffffffffffffffffffffffffffffffffffffffff82165b92915050565b61027081610247565b82525050565b602081016102618284610267565b61028d81610247565b811461015f57600080fd5b803561026181610284565b6000602082840312156102b8576102b8600080fd5b60006102c48484610298565b949350505050565b60168152602081017f4d7573742062652070726f706f736564206f776e657200000000000000000000815290505b60200190565b60208082528101610261816102cc565b60168152602081017f4f6e6c792063616c6c61626c65206279206f776e657200000000000000000000815290506102fa565b6020808252810161026181610310565b60178152602081017f43616e6e6f74207472616e7366657220746f2073656c66000000000000000000815290506102fa565b602080825281016102618161035256fea2646970667358221220fcae3da5f4725cf1b44918b37c52c208070155aabd6027d4142e9f932ba20f9d64736f6c634300080c0033";

export class ConfirmedOwnerWithProposal__factory extends ContractFactory {
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
    newOwner: string,
    pendingOwner: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ConfirmedOwnerWithProposal> {
    return super.deploy(
      newOwner,
      pendingOwner,
      overrides || {}
    ) as Promise<ConfirmedOwnerWithProposal>;
  }
  getDeployTransaction(
    newOwner: string,
    pendingOwner: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(newOwner, pendingOwner, overrides || {});
  }
  attach(address: string): ConfirmedOwnerWithProposal {
    return super.attach(address) as ConfirmedOwnerWithProposal;
  }
  connect(signer: Signer): ConfirmedOwnerWithProposal__factory {
    return super.connect(signer) as ConfirmedOwnerWithProposal__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ConfirmedOwnerWithProposalInterface {
    return new utils.Interface(_abi) as ConfirmedOwnerWithProposalInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ConfirmedOwnerWithProposal {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as ConfirmedOwnerWithProposal;
  }
}