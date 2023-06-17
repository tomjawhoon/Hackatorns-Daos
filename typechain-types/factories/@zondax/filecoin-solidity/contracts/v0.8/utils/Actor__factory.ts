/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../../../common";
import type {
  Actor,
  ActorInterface,
} from "../../../../../../@zondax/filecoin-solidity/contracts/v0.8/utils/Actor";

const _abi = [
  {
    inputs: [
      {
        internalType: "int256",
        name: "errorCode",
        type: "int256",
      },
    ],
    name: "ActorError",
    type: "error",
  },
  {
    inputs: [],
    name: "ActorNotFound",
    type: "error",
  },
  {
    inputs: [],
    name: "FailToCallActor",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "CommonTypes.FilActorId",
        name: "actorId",
        type: "uint64",
      },
    ],
    name: "InvalidActorID",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "addr",
        type: "bytes",
      },
    ],
    name: "InvalidAddress",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "",
        type: "uint64",
      },
    ],
    name: "InvalidCodec",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidResponseLength",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "balance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "NotEnoughBalance",
    type: "error",
  },
] as const;

const _bytecode =
  "0x60566037600b82828239805160001a607314602a57634e487b7160e01b600052600060045260246000fd5b30600052607381538281f3fe73000000000000000000000000000000000000000030146080604052600080fdfea26469706673582212203006f3901156255259ab46a95368f7b9c12903c4b761047f34063595eb1b9d5a64736f6c63430008130033";

type ActorConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ActorConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Actor__factory extends ContractFactory {
  constructor(...args: ActorConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<Actor> {
    return super.deploy(overrides || {}) as Promise<Actor>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): Actor {
    return super.attach(address) as Actor;
  }
  override connect(signer: Signer): Actor__factory {
    return super.connect(signer) as Actor__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ActorInterface {
    return new utils.Interface(_abi) as ActorInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): Actor {
    return new Contract(address, _abi, signerOrProvider) as Actor;
  }
}
