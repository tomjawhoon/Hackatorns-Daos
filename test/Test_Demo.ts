import { ethers } from 'hardhat'
import { Signer } from 'ethers'
import { expect } from 'chai'

describe('MyGovernor', async () => {
  let owner: Signer
  let user1: Signer
  let user2: Signer
  let governor: any
  let rewardToken: any

  

  beforeEach(async function () {
    ;[owner, user1, user2] = await ethers.getSigners()

    const ERC20 = await ethers.getContractFactory('ERC20')
    rewardToken = await ERC20.deploy('RewardToken', 'RT')

    const timelockAddress = '0xYOUR_TIMELOCK_ADDRESS' // Replace with the actual timelock address

    const MyGovernor = await ethers.getContractFactory('MyGovernor')
    governor = await MyGovernor.deploy(rewardToken.address, timelockAddress)
    await governor.deployed()
  })

  it('should distribute rewards after executing a proposal', async function () {
    const proposalId = 1
    const rewardAmount = 1000

    // Create a new campaign
    await governor.createCampaign('Test campaign', rewardAmount, 1000, 2000)

    // Submit work for the campaign
    await governor.submitWork(
      '0x1234567890abcdef',
      proposalId,
      'Test work',
      'John Doe',
    )

    // Vote for the campaign
    await governor.vote(proposalId)

    // Execute the proposal
    await governor.execute(proposalId, [], [], [], 'To the moon')

    // Retrieve the reward token balance for the winning entry and voters
    const winningEntryBalance = await rewardToken.balanceOf(
      await user2.getAddress(),
    )

    console.log("winningEntryBalance", winningEntryBalance)
    const voterBalance = await rewardToken.balanceOf(await user1.getAddress())

    console.log("voterBalance", voterBalance)

    // Calculate the expected reward amounts
    const winnerReward = Math.floor((rewardAmount * 70) / 100)
    const voterRewards = Math.floor((rewardAmount * 30) / 100)

    expect(winningEntryBalance).to.equal(winnerReward)
    expect(voterBalance).to.equal(voterRewards)
  })

  it('should not distribute rewards if the proposal is canceled', async function () {
    const proposalId = 1
    const rewardAmount = 1000

    // Create a new campaign
    await governor.createCampaign('Test campaign', rewardAmount, 1000, 2000)

    // Cancel the proposal
    await governor.cancelProposal([], [], [], '0x')

    // Submit work for the campaign
    await governor.submitWork(
      '0x1234567890abcdef',
      proposalId,
      'Test work',
      'John Doe',
    )

    // Vote for the campaign
    await governor.vote(proposalId)

    // Execute the proposal (should not distribute rewards)
    const test = await governor.execute(proposalId, [], [], [], '0x')
      console.log(test)

    // Retrieve the reward token balance for the winning entry and voters
    const winningEntryBalance = await rewardToken.balanceOf(
      await user2.getAddress(),
    )
    const voterBalance = await rewardToken.balanceOf(await user1.getAddress())

    expect(winningEntryBalance).to.equal(0)
    expect(voterBalance).to.equal(0)
  })

  it('should not distribute rewards if the campaign has not started yet', async function () {
    const proposalId = 1
    const rewardAmount = 1000

    // Create a new campaign with a future start block
    await governor.createCampaign('Test campaign', rewardAmount, 2000, 3000)

    // Submit work for the campaign
    await governor.submitWork(
      '0x1234567890abcdef',
      proposalId,
      'Test work',
      'John Doe',
    )

    // Vote for the campaign
    await governor.vote(proposalId)

    // Execute the proposal (should not distribute rewards)
    await governor.execute(proposalId, [], [], [], '0x')

    // Retrieve the reward token balance for the winning entry and voters
    const winningEntryBalance = await rewardToken.balanceOf(
      await user2.getAddress(),
    )
    const voterBalance = await rewardToken.balanceOf(await user1.getAddress())

    expect(winningEntryBalance).to.equal(0)
    expect(voterBalance).to.equal(0)
  })

  it('should not distribute rewards if the campaign has ended', async function () {
    const proposalId = 1
    const rewardAmount = 1000

    // Create a new campaign with a past end block
    await governor.createCampaign('Test campaign', rewardAmount, 1000, 1500)

    // Submit work for the campaign
    await governor.submitWork(
      '0x1234567890abcdef',
      proposalId,
      'Test work',
      'John Doe',
    )

    // Vote for the campaign
    await governor.vote(proposalId)

    // Execute the proposal (should not distribute rewards)
    await governor.execute(proposalId, [], [], [], '0x')

    // Retrieve the reward token balance for the winning entry and voters
    const winningEntryBalance = await rewardToken.balanceOf(
      await user2.getAddress(),
    )
    const voterBalance = await rewardToken.balanceOf(await user1.getAddress())

    expect(winningEntryBalance).to.equal(0)
    expect(voterBalance).to.equal(0)
  })

  it('should distribute rewards equally if there are multiple winning entries', async function () {
    const proposalId = 1
    const rewardAmount = 1000

    // Create a new campaign
    await governor.createCampaign('Test campaign', rewardAmount, 1000, 2000)

    // Submit work for multiple winning entries
    await governor.submitWork(
      '0x1234567890abcdef',
      proposalId,
      'Test work 1',
      'John Doe',
    )
    await governor.submitWork(
      '0xabcdef1234567890',
      proposalId,
      'Test work 2',
      'Jane Smith',
    )

    // Vote for the campaign
    await governor.vote(proposalId)

    // Execute the proposal
    await governor.execute(proposalId, [], [], [], '0x')

    // Retrieve the reward token balance for the winning entries and voters
    const entry1Balance = await rewardToken.balanceOf(await user2.getAddress())
    const entry2Balance = await rewardToken.balanceOf(await user1.getAddress())
    const voterBalance = await rewardToken.balanceOf(await user1.getAddress())

    // Calculate the expected reward amounts
    const winnerReward = Math.floor((rewardAmount * 70) / 100 / 2)
    const voterRewards = Math.floor((rewardAmount * 30) / 100)

    expect(entry1Balance).to.equal(winnerReward)
    expect(entry2Balance).to.equal(winnerReward)
    expect(voterBalance).to.equal(voterRewards)
  })
})
