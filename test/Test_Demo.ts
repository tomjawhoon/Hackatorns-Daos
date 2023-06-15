import { ethers } from 'hardhat'
import { Contract, ContractFactory } from 'ethers'
import { expect } from 'chai'

describe('MyGovernor', async () => {
  let myGovernor: Contract
  let owner: any
  let owner1: any
  let owner2: any
  let voter1: any
  let voter2: any
  let voter3: any
  let signers

//   const MyGovernor: ContractFactory = await ethers.getContractFactory('MyGovernor')
//   myGovernor = await MyGovernor.deploy('0x123', 'Hello World') as Contract
//  await myGovernor.deployed()

  beforeEach(async () => {
    const MyGovernor: ContractFactory = await ethers.getContractFactory('MyGovernor')
     myGovernor = await MyGovernor.deploy('0x123', 'Hello World') as Contract
    await myGovernor.deployed()
  })

  it('should create a campaign', async () => {
    // Create a campaign
    const description = 'New Campaign'
    const rewardAmount = 1000
    const startBlock = 1000
    const endBlock = 2000

  //   const MyGovernor: ContractFactory = await ethers.getContractFactory('MyGovernor')
  //   myGovernor = await MyGovernor.deploy('0x123', 'Hello World') as Contract
  //  await myGovernor.deployed()


    await myGovernor.createCampaign(
      description,
      rewardAmount,
      startBlock,
      endBlock,
    )

    // Verify the campaign creation
    const campaignCount = await myGovernor.campaignsCounter()
    const campaign = await myGovernor.campaigns(campaignCount)

    expect(campaign.description).to.equal(description)
    expect(campaign.rewardAmount).to.equal(rewardAmount)
    expect(campaign.startBlock).to.equal(startBlock)
    expect(campaign.endBlock).to.equal(endBlock)
  })

  it('should submit work for a proposal', async () => {
    // Submit work for a proposal
    const cid = '123456789'
    const workDescription = 'New Work'
    signers = await ethers.getSigners()
    owner = signers[0]

    // const owner = await ethers.getSigner();

    await myGovernor.submitWork(cid, workDescription, owner.address)

    // Verify the work submission
    const proposalCount = await myGovernor.proposalCounter()
    const proposal = await myGovernor.proposals(proposalCount)

    expect(proposal.cid).to.equal(cid)
    expect(proposal.workDescription).to.equal(workDescription)
    expect(proposal.creator).to.equal(owner.address)
    expect(proposal.executed).to.be.true
  })

  it('should claim rewards', async () => {
    // Create a campaign
    const description = 'New Campaign'
    const rewardAmount = 1000
    const startBlock = 1000
    const endBlock = 2000

    await myGovernor.createCampaign(
      description,
      rewardAmount,
      startBlock,
      endBlock,
    )

    // Submit work for a proposal
    signers = await ethers.getSigners()
    owner = signers[0]
    const cid = '123456789'
    const workDescription = 'New Work'
    // const owner = await ethers.getSigner();

    await myGovernor.submitWork(cid, workDescription, owner.address)

    // Claim rewards
    const campaignId = 1
    const claimer = owner.address
    const proposalId = 1

    await myGovernor.claimRewards(campaignId, claimer, proposalId)

    // Verify the reward claim
    const rewardTokenAddress = '0x123456789...' // Replace with the actual address
    const rewardToken = await ethers.getContractAt('ERC20', rewardTokenAddress)
    const balance = await rewardToken.balanceOf(claimer)

    expect(balance).to.equal(rewardAmount)
  })

  it('should not allow unauthorized claimer to claim rewards', async () => {
    // Create a campaign
    const description = 'New Campaign'
    const rewardAmount = 1000
    const startBlock = 1000
    const endBlock = 2000

    await myGovernor.createCampaign(
      description,
      rewardAmount,
      startBlock,
      endBlock,
    )

    // Submit work for a proposal
    const cid = '123456789'
    const workDescription = 'New Work'
    signers = await ethers.getSigners()
    owner = signers[0]
    owner1 = signers[1]

    await myGovernor.submitWork(cid, workDescription, owner.address)

    // Claim rewards with unauthorized claimer
    const campaignId = 1

    // const unauthorizedClaimer = ethers.utils.getAddress(owner1)
    const proposalId = 1

    // !! จำลองเครมมั่ว ๆ แบบไม่ได้โอน
    await expect(
      myGovernor.claimRewards(campaignId, owner1.address, proposalId),
    ).to.be.revertedWith('Unauthorized claimer')
  })

  it('should calculate correct reward amounts', async () => {
    // Create a campaign
    const description = 'New Campaign'
    const rewardAmount = 1000
    const startBlock = 1000
    const endBlock = 2000

    await myGovernor.createCampaign(
      description,
      rewardAmount,
      startBlock,
      endBlock,
    )

    // Submit work for a proposal
    const cid = '123456789'
    const workDescription = 'New Work'
    signers = await ethers.getSigners()
    owner = signers[0]
    voter1 = signers[1]

    await myGovernor.submitWork(cid, workDescription, owner.address)

    // Calculate reward amount for the proposal creator
    const proposalId = 1
    const campaignId = 1
    const claimer = owner.address

    const rewardAmountCreator = await myGovernor.calculateRewardAmount(
      proposalId,
      campaignId,
      claimer,
    )

    expect(rewardAmountCreator).to.equal(rewardAmount * 0.7)

    // Calculate reward amount for a voter
    const voter = voter1.address
    const votes = 10

    // Vote for the proposal
    await myGovernor.vote(proposalId, voter, campaignId)

    const rewardAmountVoter = await myGovernor.calculateRewardAmount(
      proposalId,
      campaignId,
      voter,
    )

    expect(rewardAmountVoter).to.equal(
      (rewardAmount * 0.3 * votes) /
        (await myGovernor.getVotes(voter, ethers.provider.getBlockNumber)),
    )
  })

  it('should create a campaign with multiple proposals, simulate voting, and distribute rewards', async () => {
    // Create a campaign
    const description = 'Campaign with Multiple Proposals'
    const rewardAmount = 5000
    const startBlock = 1000
    const endBlock = 2000

    await myGovernor.createCampaign(
      description,
      rewardAmount,
      startBlock,
      endBlock,
    )

    // Submit work for proposal 1
    const cid1 = 'proposal-1'
    const workDescription1 = 'Work for Proposal 1'
    signers = await ethers.getSigners()
    owner = signers[0]
    owner1 = signers[1]
    owner2 = signers[2]
    voter1 = signers[3]
    voter2 = signers[4]
    voter3 = signers[5]

    await myGovernor.submitWork(cid1, workDescription1, owner.address)

    // Submit work for proposal 2
    const cid2 = 'proposal-2'
    const workDescription2 = 'Work for Proposal 2'
    // const owner2 = await ethers.getSigner()

    await myGovernor.submitWork(cid2, workDescription2, owner1.address)

    // Simulate voting for proposal 1
    const proposalId1 = 1
    signers = await ethers.getSigners()
    // const voter1 = await ethers.getSigner()
    const campaignId = 1

    await myGovernor.vote(proposalId1, voter1.address, campaignId)

    // Simulate voting for proposal 2
    const proposalId2 = 2
    // const voter2 = await ethers.getSigner()

    await myGovernor.vote(proposalId2, voter2.address, campaignId)

    // Claim rewards for proposal 1
    const claimer1 = owner1.address

    await myGovernor.claimRewards(campaignId, claimer1, proposalId1)

    // Claim rewards for proposal 2
    const claimer2 = owner2.address

    await myGovernor.claimRewards(campaignId, claimer2, proposalId2)

    // Verify reward transfer for proposal 1
    const rewardTokenAddress = '0x123456789...'
    const rewardToken = await ethers.getContractAt('ERC20', rewardTokenAddress)
    const balance1 = await rewardToken.balanceOf(claimer1)

    expect(balance1).to.equal(rewardAmount / 2)

    // Verify reward transfer for proposal 2
    const balance2 = await rewardToken.balanceOf(claimer2)

    expect(balance2).to.equal(rewardAmount / 2)
  })

  it('should create multiple campaigns, submit work, and simulate voting', async () => {
    // Create campaign 1
    const description1 = 'Campaign 1'
    const rewardAmount1 = 1000
    const startBlock1 = 1000
    const endBlock1 = 2000
    signers = await ethers.getSigners()
    owner = signers[0]
    owner1 = signers[1]
    owner2 = signers[2]
    voter1 = signers[3]
    voter2 = signers[4]
    voter3 = signers[5]

    await myGovernor.createCampaign(
      description1,
      rewardAmount1,
      startBlock1,
      endBlock1,
    )

    // Create campaign 2
    const description2 = 'Campaign 2'
    const rewardAmount2 = 2000
    const startBlock2 = 2000
    const endBlock2 = 3000

    await myGovernor.createCampaign(
      description2,
      rewardAmount2,
      startBlock2,
      endBlock2,
    )

    // Submit work for campaign 1

    const cid1 = '123456789'
    const workDescription1 = 'Work for Campaign 1'
    // const owner1 = await ethers.getSigner()

    await myGovernor.submitWork(cid1, workDescription1, owner1.address)

    // Simulate voting for campaign 1
    const proposalId1 = 1
    // const voter1 = await ethers.getSigner()
    const campaignId1 = 1

    await myGovernor.vote(proposalId1, voter1.address, campaignId1)

    // Submit work for campaign 2
    const cid2 = '987654321'
    const workDescription2 = 'Work for Campaign 2'
    // const owner2 = await ethers.getSigner()

    await myGovernor.submitWork(cid2, workDescription2, owner2.address)

    // Simulate voting for campaign 2
    const proposalId2 = 2
    // const voter2 = await ethers.getSigner()
    const campaignId2 = 2

    await myGovernor.vote(proposalId2, voter2.address, campaignId2)

    // Claim rewards for campaign 1
    const claimer1 = owner1.address

    await myGovernor.claimRewards(campaignId1, claimer1, proposalId1)

    // Claim rewards for campaign 2
    const claimer2 = owner2.address

    await myGovernor.claimRewards(campaignId2, claimer2, proposalId2)

    // Verify reward transfer for campaign 1
    const rewardTokenAddress = '0x123456789...'
    const rewardToken = await ethers.getContractAt('ERC20', rewardTokenAddress)
    const balance1 = await rewardToken.balanceOf(claimer1)

    expect(balance1).to.equal(rewardAmount1)

    // Verify reward transfer for campaign 2
    const balance2 = await rewardToken.balanceOf(claimer2)

    expect(balance2).to.equal(rewardAmount2)
  })

})
