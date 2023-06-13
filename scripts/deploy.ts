// import { ethers } from "hardhat";

// async function main() {
//   const MyGovernor = await ethers.getContractFactory("MyGovernor");
//   // const MockVotes = await ethers.getContractFactory("MockVotes");
//   const TimelockController = await ethers.getContractFactory("TimelockController");

//   // Deploy MockVotes contract
//   // const mockVotes = await MockVotes.deploy();

//   // Deploy TimelockController contract
//   const timelockController = await TimelockController.deploy();

//   // Deploy MyGovernor contract with MockVotes and TimelockController addresses
//   const myGovernor = await MyGovernor.deploy("", timelockController.address);

//   console.log("MyGovernor deployed to:", myGovernor.address);
// }

// main()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
// });
