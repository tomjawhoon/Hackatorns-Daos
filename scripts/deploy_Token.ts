import { ethers } from "hardhat";
import hre from "hardhat";
import fs from "fs";
import { getAddressList, saveAddresses } from "../utils/address";

async function main() {
  const [deployer] = await ethers.getSigners();

  const ERC20Token = await hre.ethers.getContractFactory("ERC20");
  const rewardToken = await ERC20Token.deploy(deployer, 1000000 * 10 ** 18);

  console.log(`RewardToken deployed to ${rewardToken.address}`);

  await saveAddresses(hre.network.name, {
    RewardToken: rewardToken.address,
  });
}

(async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
