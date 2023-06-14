// import { ethers } from 'hardhat';
// import hre from 'hardhat'

// async function main() {
//   const [deployer] = await ethers.getSigners();

//   console.log('Deploying ERC20Token...');
//   const ERC20Token = await hre.ethers.getContractFactory('ERC20');
//   const name = 'My Token';
//   const symbol = 'MTK';
//   const decimals = 18;
//   const initialSupply = ethers.utils.parseEther('1000000');
//   const token = await ERC20Token.deploy(name, symbol, decimals, initialSupply);
//   console.log('ERC20Token deployed to:', token.address);
//   console.log('Deployer:', deployer.address);
// }

// main()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });
