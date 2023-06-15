import { ethers } from 'hardhat'
import { Contract, ContractFactory } from 'ethers'
import { expect } from 'chai'

describe('MyGovernor', () => {
  let myGovernor: any
  let rewardToken: any
  let owner: any
  let alice: any
  let bob: any

  beforeEach(async () => {
    const RewardToken: ContractFactory = await ethers.getContractFactory(
      'RewardToken',
    )
    rewardToken = await RewardToken.deploy()
    await rewardToken.deployed()

    const MyGovernor: ContractFactory = await ethers.getContractFactory(
      'MyGovernor',
    )
    myGovernor = await MyGovernor.deploy(rewardToken.address)
    await myGovernor.deployed()
    ;[owner, alice, bob] = await ethers.getSigners()
  })

  it('should create a campaign', async () => {
    const description = 'Sample campaign'
    const rewardAmount = 1000
    const startBlock = 1000
    const endBlock = 2000
    await myGovernor.createCampaign(
      description,
      rewardAmount,
      startBlock,
      endBlock,
    )

    // Assert the proposal was created
    const proposalId = 1
    const proposal = await myGovernor.proposals(proposalId)
    expect(proposal.creator).to.equal(
      await (await ethers.getSigner(0 as any)).getAddress(),
    )
    expect(proposal.description).to.equal(description)
    expect(proposal.rewardAmount).to.equal(rewardAmount)
    expect(proposal.startBlock).to.equal(startBlock)
    expect(proposal.endBlock).to.equal(endBlock)
  })

  it('should submit work and distribute rewards', async () => {
    // !! Create a campaign
    const description = 'Sample campaign'
    const rewardAmount = 1000
    const startBlock = 1000
    const endBlock = 2000
    await myGovernor.createCampaign(
      description,
      rewardAmount,
      startBlock,
      endBlock,
    )

    // !! Submit work for the campaign
    const proposalId = 1
    const workDescription = 'Sample work'
    const nameOwner = 'John Doe'
    await myGovernor.submitWork('CID', proposalId, workDescription, nameOwner)

    // Assert the work was submitted and rewards were distributed
    const proposal = await myGovernor.proposals(proposalId)
    expect(proposal.winningEntry).to.equal(
      await (await ethers.getSigner(0 as any)).getAddress(),
    )
    expect(proposal.executed).to.be.true

    const winnerReward = (rewardAmount * 70) / 100
    const voterRewards = (rewardAmount * 30) / 100

    // !! Balance = 0 Ape
    const winnerBalance = await rewardToken.balanceOf(
      await (await ethers.getSigner(0 as any)).getAddress(),
    )
    expect(winnerBalance).to.equal(winnerReward)

    const voterBalance = await rewardToken.balanceOf(
      await (await ethers.getSigner(1 as any)).getAddress(),
    )
    const votes = await myGovernor.getVotes(
      await (await ethers.getSigner(1 as any)).getAddress(),
      0,
    )
    const expectedVoterReward = (voterRewards * votes) / proposal.yesVotes
    expect(voterBalance).to.equal(expectedVoterReward)
  })

  it('should allow claiming rewards', async () => {
    // Create a campaign
    const description = 'Sample campaign'
    const rewardAmount = 1000
    const startBlock = 1000
    const endBlock = 2000
    await myGovernor.createCampaign(
      description,
      rewardAmount,
      startBlock,
      endBlock,
    )

    // Submit work for the campaign
    const proposalId = 1
    const workDescription = 'Sample work'
    const nameOwner = 'John Doe'
    await myGovernor.submitWork('CID', proposalId, workDescription, nameOwner)

    // Claim rewards
    await myGovernor.claimRewards(proposalId)

    // Assert rewards were claimed
    const winnerBalance = await rewardToken.balanceOf(
      await (await ethers.getSigner(0 as any)).getAddress(),
    )
    expect(winnerBalance).to.equal(0)

    const voterBalance = await rewardToken.balanceOf(
      await (await ethers.getSigner(0 as any)).getAddress(),
    )
    expect(voterBalance).to.equal(0)
  })

  it('should create a campaign and distribute rewards', async () => {
    // Create a campaign
    await myGovernor.createCampaign('Campaign 1', 1000, 0, 0)

    // Transfer reward tokens to the MyGovernor contract
    const rewardAmount = 1000
    await rewardToken.transfer(myGovernor.address, rewardAmount)

    // Submit a work for the campaign
    await myGovernor.submitWork('CID1', 1, 'Work 1 for Campaign 1', 'Alice', {
      from: alice.address,
    })

    // Claim rewards for the winning entry
    const winningEntry = await myGovernor.proposals(1).winningEntry
    const initialBalance = await rewardToken.balanceOf(winningEntry)
    await myGovernor.claimRewards(1, { from: winningEntry })
    const finalBalance = await rewardToken.balanceOf(winningEntry)

    // Assert the rewards were distributed correctly
    const expectedReward = rewardAmount * 0.7
    expect(finalBalance.sub(initialBalance)).to.equal(expectedReward)
  })

  it('should create multiple campaigns and distribute rewards', async () => {
    // Create Campaign 1
    await myGovernor.createCampaign('Campaign 1', 1000, 0, 0)
    await rewardToken.transfer(myGovernor.address, 1000)
    await myGovernor.submitWork('CID1', 1, 'Work 1 for Campaign 1', 'Alice', {
      from: alice.address,
    })

    // Create Campaign 2
    await myGovernor.createCampaign('Campaign 2', 2000, 0, 0)
    await rewardToken.transfer(myGovernor.address, 2000)
    await myGovernor.submitWork('CID2', 2, 'Work 1 for Campaign 2', 'Bob', {
      from: bob.address,
    })

    // Claim rewards for Campaign 1
    const winningEntry1 = await myGovernor.proposals(1).winningEntry
    const initialBalance1 = await rewardToken.balanceOf(winningEntry1)
    await myGovernor.claimRewards(1, { from: winningEntry1 })
    const finalBalance1 = await rewardToken.balanceOf(winningEntry1)

    // Claim rewards for Campaign 2
    const winningEntry2 = await myGovernor.proposals(2).winningEntry
    const initialBalance2 = await rewardToken.balanceOf(winningEntry2)
    await myGovernor.claimRewards(2, { from: winningEntry2 })
    const finalBalance2 = await rewardToken.balanceOf(winningEntry2)

    // Assert the rewards were distributed correctly for Campaign 1
    const expectedReward1 = 1000 * 0.7
    expect(finalBalance1.sub(initialBalance1)).to.equal(expectedReward1)

    // Assert the rewards were distributed correctly for Campaign 2
    const expectedReward2 = 2000 * 0.7
    expect(finalBalance2.sub(initialBalance2)).to.equal(expectedReward2)
  })
})
