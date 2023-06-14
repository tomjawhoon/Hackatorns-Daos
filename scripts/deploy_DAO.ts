import { ethers } from 'hardhat';
import fs from 'fs';

async function main() {
  // Deploy RewardToken contract
  const RewardToken = await ethers.getContractFactory('RewardToken');
  const rewardToken = await RewardToken.deploy();
  await rewardToken.deployed();

  console.log('RewardToken deployed to:', rewardToken.address);

  // Deploy MyGovernor contract
  const MyGovernor = await ethers.getContractFactory('MyGovernor');
  const myGovernor = await MyGovernor.deploy(rewardToken.address);
  await myGovernor.deployed();

  console.log('MyGovernor deployed to:', myGovernor.address);

  // Save deployment artifacts to JSON file
  const deploymentData = {
    RewardToken: {
      address: rewardToken.address,
    },
    MyGovernor: {
      address: myGovernor.address,
    },
  };

  fs.writeFileSync(
    './deployments.json',
    JSON.stringify(deploymentData, null, 2)
  );

  console.log('Deployment artifacts saved to deployments.json');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});
