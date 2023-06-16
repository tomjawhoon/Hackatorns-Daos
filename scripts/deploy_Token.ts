import { ethers } from 'hardhat';
import hre from 'hardhat'
import fs from 'fs';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);
  console.log('Deploying ERC20Token...');
  const ERC20Token = await hre.ethers.getContractFactory('ERC20');
  const rewardToken = await ERC20Token.deploy(deployer,1000000 * 10 ** 18);
  console.log('ERC20Token deployed to:', rewardToken.address);
  console.log('Deployer:', deployer.address);

  // const deploymentData = {
  //   RewardToken: {
  //     address: rewardToken.address,
  //   },
  // };
  
  // fs.writeFileSync(
  //   './deployments.json',
  //   JSON.stringify(deploymentData, null, 2)
  // );
  
  console.log('Deployment artifacts saved to deployments.json');
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
