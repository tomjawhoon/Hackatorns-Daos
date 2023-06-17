import { ethers } from 'hardhat';
import { Contract, Signer } from 'ethers';

import { expect } from 'chai'

describe('MyGovernor', () => {
  let governor: Contract;
  let owner: Signer;
  let voter: Signer;

  before(async () => {
    const Governor = await ethers.getContractFactory('MyGovernor');
    governor = await Governor.deploy('TOKEN_ADDRESS');

    [owner, voter] = await ethers.getSigners();
  });

  it('should allow a voter to cast a vote', async () => {
    // Create a campaign
    await governor.createCampaign('Campaign Description', 1000, 0, 100);

    // Get the campaign ID
    const campaigns = await governor.getAllCampaigns();
    const campaignId = campaigns[0].id;

    // Submit a work for the campaign
    await governor.submitWork('CID', campaignId, 'Work Description', await owner.getAddress());

    // Get the proposal ID
    const proposals = await governor.getProposalsInCampaign(campaignId);
    const proposalId = proposals[0].id;

    // Voter casts a vote
    const test = await governor.connect(voter).vote(proposalId, await voter.getAddress(), campaignId);
    console.log("test",test)

    // Check if the vote is recorded
    const proposal = await governor.proposals(proposalId);
    expect(proposal.yesVotes).to.equal(1);
    expect(proposal.voters.length).to.equal(1);
    expect(proposal.voters[0]).to.equal(await voter.getAddress());
    expect(proposal.votes[0]).to.equal(1);
  });

  it('should revert if the campaign has not started', async () => {
    // Create a campaign with a future start block
    await governor.createCampaign('Campaign Description', 1000, 100, 200);

    // Get the campaign ID
    const campaigns = await governor.getAllCampaigns();
    const campaignId = campaigns[1].id;

    // Submit a work for the campaign
    await governor.submitWork('CID', campaignId, 'Work Description', await owner.getAddress());

    // Get the proposal ID
    const proposals = await governor.getProposalsInCampaign(campaignId);
    const proposalId = proposals[0].id;

    // Attempt to vote before the campaign starts
    await expect(governor.connect(voter).vote(proposalId, await voter.getAddress(), campaignId)).to.be.revertedWith(
      'Campaign has not started yet'
    );
  });

  it('should revert if the campaign has ended', async () => {
    // Create a campaign with a past end block
    await governor.createCampaign('Campaign Description', 1000, 0, 100);

    // Get the campaign ID
    const campaigns = await governor.getAllCampaigns();
    const campaignId = campaigns[2].id;

    // Submit a work for the campaign
    await governor.submitWork('CID', campaignId, 'Work Description', await owner.getAddress());

    // Get the proposal ID
    const proposals = await governor.getProposalsInCampaign(campaignId);
    const proposalId = proposals[0].id;

    // Advance the block to the end of the campaign
    await ethers.provider.send('evm_increaseTime', [200]);

    // Attempt to vote after the campaign has ended
    await expect(governor.connect(voter).vote(proposalId, await voter.getAddress(), campaignId)).to.be.revertedWith(
      'Campaign has ended'
    );
  });

  it('should revert if the voter does not have any voting power', async () => {
    // Create a campaign
    await governor.createCampaign('Campaign Description', 1000, 0, 100);

    // Get the campaign ID
    const campaigns = await governor.getAllCampaigns();
    const campaignId = campaigns[3].id;

    // Submit a work for the campaign
    await governor.submitWork('CID', campaignId, 'Work Description', await owner.getAddress());

    // Get the proposal ID
    const proposals = await governor.getProposalsInCampaign(campaignId);
    const proposalId = proposals[0].id;

    // Attempt to vote without any voting power
    await expect(governor.connect(voter).vote(proposalId, await voter.getAddress(), campaignId)).to.be.revertedWith(
      'You do not have any voting power'
    );
  });

  it('should revert if the voter has already voted', async () => {
    // Create a campaign
    await governor.createCampaign('Campaign Description', 1000, 0, 100);

    // Get the campaign ID
    const campaigns = await governor.getAllCampaigns();
    const campaignId = campaigns[4].id;

    // Submit a work for the campaign
    await governor.submitWork('CID', campaignId, 'Work Description', await owner.getAddress());

    // Get the proposal ID
    const proposals = await governor.getProposalsInCampaign(campaignId);
    const proposalId = proposals[0].id;

    // Voter casts the first vote
    await governor.connect(voter).vote(proposalId, await voter.getAddress(), campaignId);

    // Attempt to vote again
    await expect(governor.connect(voter).vote(proposalId, await voter.getAddress(), campaignId)).to.be.revertedWith(
      'Already voted'
    );
  });
});
