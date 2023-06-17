// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./type/Proposal.sol"; // Import the Proposal struct from the separate file;
import "./event/Events.sol"; // Import the Events contract;

contract MyGovernor is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    Events // Inherit from the Events contract
{
    mapping(uint256 => Proposal) private proposals;

    mapping(uint256 => Campaign) private campaigns;
    // uint256 proposalId ;
    uint256 campaignsCounter;
    uint256 proposalCounter;
    address private owner;
    ERC20 private _rewardToken; // Declare the ERC20 token contract variable

    constructor(
        address rewardToken // Pass the ERC20 token contract address during deployment
    )
        Governor("MyGovernor")
        GovernorSettings(7200 /* 1 day */, 7200 /* 1 day */, 0)
        GovernorVotes(IVotes(rewardToken)) // Pass the reward token address to the GovernorVotes constructor
        GovernorVotesQuorumFraction(4)
    {
        owner = msg.sender; // Set the contract deployer as the owner
        _rewardToken = ERC20(rewardToken); // Initialize the ERC20 token contract
    }

    // Create a new project proposal
    // !! Campagine start and end blocks are not used in this example
    // !! Campagine ID is not used in this example
    function createCampaign(
        string memory description, // !! Discription of the proposal
        uint256 rewardAmount, // !! Ex 1000 APE COIN
        uint256 startBlock, // !! Time to start the proposal
        uint256 endBlock // !! End to end the proposal
    ) external {
        campaignsCounter++;
        campaigns[campaignsCounter] = Campaign(
            msg.sender, // !! Set the proposal creator as the sender
            campaignsCounter, // Initialize the campaign array
            new uint256[](0), // !! Set the campaign ID
            startBlock, // !! Set the start block
            endBlock, //  !! Set the end block
            rewardAmount // !! Set the reward amount
        );
        emit ProposalCreated(
            proposalCounter,
            msg.sender,
            description,
            rewardAmount
        );
    }

    function getAllCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory allCampaigns = new Campaign[](campaignsCounter);
        for (uint256 i = 1; i <= campaignsCounter; i++) {
            allCampaigns[i - 1] = campaigns[i];
        }
        return allCampaigns;
    }

    function getProposalsInCampaign(
        uint256 campaignId
    ) public view returns (Proposal[] memory) {
        Campaign storage campaign = campaigns[campaignId];
        uint256[] memory proposalIds = campaign.proposalId;
        Proposal[] memory proposalsInCampaign = new Proposal[](
            proposalIds.length
        );

        for (uint256 i = 0; i < proposalIds.length; i++) {
            proposalsInCampaign[i] = proposals[proposalIds[i]];
        }

        return proposalsInCampaign;
    }

    // !! Campagine start and end blocks are not used in this example
    // !! Proposal have CID ?
    function submitWork(
        bytes memory cid,
        // uint256 proposalId,
        uint256 id,
        string memory workDescription,
        address owner
    ) external {
        Campaign storage campaign = campaigns[id];
        Proposal storage proposal = proposals[proposalCounter];
        proposalCounter++;
        proposals[proposalCounter] = Proposal(
            proposalCounter,
            owner, // !! Set the proposal creator as the sender
            workDescription, // !! Set the proposal description
            0, // Set the yes votes to 0
            0, //   Set the no votes to 0
            false, // Set the executed flag to false
            false, // Set the canceled flag to false
            new address[](0), // Initialize the voters array
            new uint256[](0) // Initialize the votes array
        );

        campaign.proposalId.push(proposalCounter);
        require(!proposal.canceled, "Proposal was canceled");
        require(!proposal.executed, "Proposal was already executed");
        // proposal.winningEntry = owner;
        proposal.executed = true;
        emit WorkSubmitted(cid, proposalCounter, owner, workDescription);

        // distributeRewards(proposalId);
    }

    // !! Campagine start and end blocks are not used in this example
    function claimRewards(
        uint256 campaignId,
        address claimer,
        uint256 proposalId
    ) external {
        Campaign storage campaigns = campaigns[campaignId];
        uint256 winnerId = getWinner(campaignId);
        Proposal storage proposal = proposals[winnerId];
        require(proposal.creator == claimer, "Unauthorized claimer");

        uint256 rewardAmount = calculateRewardAmount(
            proposalId,
            campaignId,
            claimer
        );
        require(rewardAmount > 0, "No rewards to claim");

        _rewardToken.transfer(claimer, rewardAmount);
    }

    function calculateRewardAmount(
        uint256 proposalId,
        uint256 campaignId,
        address claimer
    ) internal view returns (uint256) {
        Campaign storage campaign = campaigns[campaignId];
        uint256 winnerId = getWinner(campaignId);
        Proposal storage proposal = proposals[winnerId];

        uint256 totalRewards = campaign.rewardAmount;
        uint256 winnerReward = (totalRewards * 70) / 100;

        uint256 voterRewards = (totalRewards * 30) / 100;
        uint256 rewardAmount = 0;
        // !! ถ้าเป็นคนสร้างงานสามารถ ได้รับ 70% ของเงินรางวัล
        if (proposal.creator == claimer) {
            rewardAmount = winnerReward;

            // !! ถ้าเป็นผู้มาโหวตงาน สามารถ ได้รับ 30% ของเงินรางวัล
        } else if (isVoter(proposalId, claimer)) {
            uint256 votes = getVotes(claimer, block.number);
            rewardAmount = (voterRewards * votes) / proposal.yesVotes;
        }

        return rewardAmount;
    }

    function getWinner(uint256 campaignId) public view returns (uint256) {
        Campaign storage campaign = campaigns[campaignId];
        uint256 bestScore = 0;
        uint256 winnerId;

        for (uint256 i = 0; i < campaign.proposalId.length; i++) {
            Proposal storage proposal = proposals[campaign.proposalId[i]];
            if (proposal.voters.length > bestScore) {
                bestScore = proposal.voters.length;
                winnerId = proposal.proposalId;
            }
        }

        return bestScore;
    }

    function getCampaignStartTime(
        uint256 campaignId
    ) public view returns (uint256) {
        require(campaignId <= campaignsCounter, "Invalid proposalId");

        return campaigns[campaignId].startBlock;
    }

    function getCampaignEndTime(
        uint256 campaignId
    ) public view returns (uint256) {
        require(campaignId <= campaignsCounter, "Invalid proposalId");

        return campaigns[campaignId].endBlock;
    }

    function isVoter(
        uint256 proposalId, //!! proposalCounter
        address voter
    ) internal view returns (bool) {
        Proposal storage proposal = proposals[proposalId];
        for (uint256 i = 0; i < proposal.voters.length; i++) {
            if (proposal.voters[i] == voter) {
                return true;
            }
        }
        return false;
    }

    // !! เวลาให้กดโหวดส่งเข้ามาตัวนี้นะ
    function vote(
        uint256 proposalId,
        address voter,
        uint256 campaignId
    ) external {
        Campaign storage campaign = campaigns[campaignId];
        require(
            block.number >= campaigns[campaignId].startBlock,
            "Campaign has not started yet"
        );
        require(
            block.number <= campaigns[campaignId].endBlock,
            "Campaign has ended"
        );

        uint256 votes = getVotes(voter, block.number);
        require(votes > 0, "You do not have any voting power");

        require(!isVoter(proposalId, voter), "Already voted");

        proposals[proposalId].yesVotes += votes;

        proposals[proposalId].voters.push(voter);
        proposals[proposalId].votes.push(votes);

        // !! Check Votes
        emit Voted(proposalId, voter);
    }

    // !! Below functions are not used in this example form Goveror

    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor) returns (uint256) {
        require(
            proposals[proposalCounter].creator == owner,
            "Unauthorized canceller"
        );
        proposals[proposalCounter].canceled = true;

        return proposalCounter;
    }

    function _execute(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor) {
        require(
            proposals[proposalId].creator == owner,
            "Unauthorized executor"
        );
        proposals[proposalId].executed = true;
    }

    function _executor() internal view override(Governor) returns (address) {
        return owner;
    }

    function state(
        uint256 proposalId
    ) public view override(Governor) returns (ProposalState) {
        return super.state(proposalId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(Governor) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function proposalThreshold()
        public
        pure
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return 1; // Only one proposal is required to start voting
    }
}
