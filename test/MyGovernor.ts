// import { ethers } from 'hardhat';
// import { expect } from 'chai';
// import { Signer } from 'ethers';

// describe('MyGovernor', async () => {
//   let myGovernor: any;
//   let owner: Signer;
//   let voter1: Signer;
//   let voter2: Signer;

//   // beforeEach(async () => {
//     [owner, voter1, voter2] = await ethers.getSigners();

//     const MyGovernor = await ethers.getContractFactory('MyGovernor');
//     const MockVotes = await ethers.getContractFactory('MockVotes');
//     const TimelockController = await ethers.getContractFactory('TimelockController');

//     const mockVotes = await MockVotes.deploy();
//     const timelockController = await TimelockController.deploy();

//     myGovernor = await MyGovernor.deploy(mockVotes.address, timelockController.address);
//     await myGovernor.deployed();
//   // });

//   it('should allow the owner to create a project', async function () {
//     const projectName = 'My Project';
//     const createProjectTx = await myGovernor.createProject(projectName);
//     await createProjectTx.wait();

//     const projectCount = await myGovernor.getProjectCount();
//     expect(projectCount).to.equal(1);

//     const project = await myGovernor.projects(0);
//     expect(project.name).to.equal(projectName);
//     expect(project.creator).to.equal(await owner.getAddress());
//   });

//   it('should allow voters to vote on a project', async function () {
//     const projectName = 'My Project';
//     await myGovernor.createProject(projectName);

//     const projectCount = await myGovernor.getProjectCount();
//     expect(projectCount).to.equal(1);

//     const project = await myGovernor.projects(0);
//     expect(project.name).to.equal(projectName);

//     const voteTx = await myGovernor.vote(0);
//     await voteTx.wait();

//     const voteCount = await myGovernor.getVoteCount(0);
//     expect(voteCount).to.equal(1);

//     const hasVoted = await myGovernor.hasVoted(0, await voter1.getAddress());
//     expect(hasVoted).to.be.true;
//   });

//   it('should not allow non-owners to create a project', async function () {
//     const projectName = 'My Project';
//     const createProjectTx = myGovernor.connect(voter1).createProject(projectName);

//     await expect(createProjectTx).to.be.revertedWith('Only the owner can create a project');
//   });
// });
