import { ethers } from "hardhat";
import hre from "hardhat";
import { getAddressList, saveAddresses } from "../utils/address";

async function main() {
  const addressList = await getAddressList(hre.network.name);

  // !! Reward : 0x89B7A97F3610Aab7Da907340742873D0d4026453
  const rewardToken = addressList.RewardToken;

  // Deploy MyGovernor contract

  const MyGovernor = await ethers.getContractFactory("MyGovernor");
  const myGovernor = await MyGovernor.deploy(rewardToken);
  await myGovernor.deployed();

  // const DealClient = await ethers.getContractFactory("DealClient");
  // const dealClient = await DealClient.deploy();
  // await dealClient.deployed();

  console.log(`MyGovernor deployed to ${myGovernor.address}`);
  // console.log(`DealClient deployed to ${dealClient.address}`);

  await saveAddresses(hre.network.name, {
    MyGovernor: myGovernor.address,
    // DealClient: dealClient.address,
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
