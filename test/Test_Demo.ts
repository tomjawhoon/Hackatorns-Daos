import { ethers } from 'hardhat'
import { Contract, ContractFactory } from 'ethers'
import { expect } from 'chai'
import { Governor } from '../typechain-types'

describe('MyGovernor', () => {
  let myGovernor: any
  let rewardToken: any

  beforeEach(async () => {
    // Deploy ERC20 reward token contract
    const RewardToken: ContractFactory = await ethers.getContractFactory(
      'RewardToken',
    )
    rewardToken = await RewardToken.deploy()
    await rewardToken.deployed()

    // Deploy MyGovernor contract
    const MyGovernor: ContractFactory = await ethers.getContractFactory(
      'MyGovernor',
    )
    myGovernor = await MyGovernor.deploy(rewardToken.address)
    await myGovernor.deployed()
  })

  it('should create a campaign', async () => {
    // Call the createCampaign function
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

    // Assert the work was submitted and rewards were distributed
    const proposal = await myGovernor.proposals(proposalId)
    expect(proposal.winningEntry).to.equal(
      await (await ethers.getSigner(0 as any)).getAddress(),
    )
    expect(proposal.executed).to.be.true

    const winnerReward = (rewardAmount * 70) / 100
    const voterRewards = (rewardAmount * 30) / 100

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
})
