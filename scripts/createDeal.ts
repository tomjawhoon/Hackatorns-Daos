import { ContractTransaction } from "ethers";
import hre, { ethers } from "hardhat";
import { getAddressList, saveAddresses } from "../utils/address";
import CID from "cids";

export default async function main() {
  const [deployer] = await ethers.getSigners();
  const addressList = await getAddressList(hre.network.name);

  const DealClientAddr = addressList.DealClient;

  const DealClient = await ethers.getContractFactory("DealClient");
  const dealClient = DealClient.attach(DealClientAddr);

  const cid =
    "baga6ea4seaqkxmkazzwmkcfe5bxwxxkyd5n2vyeindbj7nf2xxgnf7lw327rqei";

  const cidHexRaw = new CID(cid).toString("base16").substring(1);

  const cidHex = "0x" + cidHexRaw;
  const pieceSize = 1048576;
  const verified = false;
  const label = cidHex;
  const startEpoch = 655000;
  const endEpoch = 658000;
  const storagePricePerEpoch = 0;
  const providerCollateral = 0;
  const clientCollateral = 0;
  const extraParamsVersion = 1;
  const locationRef =
    "https://data-depot.lighthouse.storage/api/download/download_car?fileId=e000fca4-1af4-475a-a7b5-5615d047461e.car";
  const carSize = 682740;
  const skipIpniAnnounce = false;
  const removeUnsealedCopy = false;
  const extraParamsV1 = [
    locationRef,
    carSize,
    skipIpniAnnounce,
    removeUnsealedCopy,
  ];

  const DealRequestStruct = [
    cidHex,
    pieceSize,
    verified,
    label,
    startEpoch,
    endEpoch,
    storagePricePerEpoch,
    providerCollateral,
    clientCollateral,
    extraParamsVersion,
    extraParamsV1,
  ];

  //send a transaction to call makeDealProposal() method
  const transaction = await dealClient.makeDealProposal(DealRequestStruct);
  const transactionReceipt = await transaction.wait();

  //listen for DealProposalCreate event
  const event = transactionReceipt.events[0].topics[1];
  console.log("Complete! Event Emitted. ProposalId is:", event);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
