import { ethers } from 'hardhat';
import { expect } from 'chai';

describe('MyGovernor', async () => {
  let myGovernor: any;
  let rewardToken: any;
  let owner: any;
  let voter1: any;
  let voter2: any;

  const rewardTokenAddress = '0x1234567890123456789012345678901234567890'; // Replace with the actual address

  const TimelockController = await ethers.getContractFactory('TimelockController');
  const timelock = await TimelockController.deploy( );

  const MyGovernor = await ethers.getContractFactory('MyGovernor');
  myGovernor = await MyGovernor.deploy(rewardTokenAddress, timelock.address);

  const RewardToken = await ethers.getContractFactory('RewardToken');
  rewardToken = await RewardToken.deploy();
  [owner, voter1, voter2] = await ethers.getSigners();

  // Transfer some reward tokens to the contract
  await rewardToken.transfer(myGovernor.address, ethers.utils.parseEther('100'));

  it('should distribute rewards to voters and owner', async () => {
    // Create a new project proposal
    await myGovernor.createProject('Proposal 1');

    // Cast votes on the proposal
    await myGovernor.connect(voter1).vote(1, true);
    await myGovernor.connect(voter2).vote(1, false);

    // Execute the proposal
    await myGovernor.execute(1);

    // Check the balances before distributing rewards
    const ownerBalanceBefore = await rewardToken.balanceOf(owner.address);
    const voter1BalanceBefore = await rewardToken.balanceOf(voter1.address);
    const voter2BalanceBefore = await rewardToken.balanceOf(voter2.address);

    // Distribute rewards
    await myGovernor.distributeRewards(1);

    // Check the balances after distributing rewards
    const ownerBalanceAfter = await rewardToken.balanceOf(owner.address);
    const voter1BalanceAfter = await rewardToken.balanceOf(voter1.address);
    const voter2BalanceAfter = await rewardToken.balanceOf(voter2.address);

    // Assertions
    expect(ownerBalanceAfter.sub(ownerBalanceBefore)).to.equal(ethers.utils.parseEther('50'));
    expect(voter1BalanceAfter.sub(voter1BalanceBefore)).to.equal(ethers.utils.parseEther('25'));
    expect(voter2BalanceAfter.sub(voter2BalanceBefore)).to.equal(ethers.utils.parseEther('25'));
  });

  it('should not distribute rewards if no votes were cast', async () => {
    // Create a new project proposal
    await myGovernor.createProject('Proposal 2');

    // Execute the proposal without any votes
    await myGovernor.execute(2);

    // Check the balances before distributing rewards
    const ownerBalanceBefore = await rewardToken.balanceOf(owner.address);
    const voter1BalanceBefore = await rewardToken.balanceOf(voter1.address);
    const voter2BalanceBefore = await rewardToken.balanceOf(voter2.address);

    // Distribute rewards
    await myGovernor.distributeRewards(2);

    // Check the balances after distributing rewards
    const ownerBalanceAfter = await rewardToken.balanceOf(owner.address);
    const voter1BalanceAfter = await rewardToken.balanceOf(voter1.address);
    const voter2BalanceAfter = await rewardToken.balanceOf(voter2.address);

    // Assertions
    expect(ownerBalanceAfter.sub(ownerBalanceBefore)).to.equal(ethers.utils.parseEther('0'));
    expect(voter1BalanceAfter.sub(voter1BalanceBefore)).to.equal(ethers.utils.parseEther('0'));
    expect(voter2BalanceAfter.sub(voter2BalanceBefore)).to.equal(ethers.utils.parseEther('0'));
  });
});
