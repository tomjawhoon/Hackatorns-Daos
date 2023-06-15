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
    GovernorTimelockControl,
    Events // Inherit from the Events contract
{

    mapping(uint256 => Proposal) private proposals;
    uint256 private proposalCounter;
    address private owner;
    ERC20 private _rewardToken; // Declare the ERC20 token contract variable

    constructor(
        address rewardToken, // Pass the ERC20 token contract address during deployment
        TimelockController _timelock
    )
        Governor("MyGovernor")
        GovernorSettings(7200 /* 1 day */, 7200 /* 1 day */, 0)
        GovernorVotes(IVotes(rewardToken)) // Pass the reward token address to the GovernorVotes constructor
        GovernorVotesQuorumFraction(4)
        GovernorTimelockControl(_timelock)
    {
        owner = msg.sender; // Set the contract deployer as the owner
        _rewardToken = ERC20(rewardToken); // Initialize the ERC20 token contract
    }

    // Create a new project proposal
    // !! Campagine start and end blocks are not used in this example
    function createCampaign(
        string memory description, // !! Discription of the proposal
        uint256 rewardAmount, // !! Ex 1000 APE COIN
        uint256 startBlock, // !! Time to start the proposal
        uint256 endBlock // !! End to end the proposal
    ) external {
        proposalCounter++;
        proposals[proposalCounter] = Proposal(
            msg.sender, // !! Set the proposal creator as the sender
            description, // !! Set the proposal description
            0, // Set the yes votes to 0
            0, //   Set the no votes to 0
            false, // Set the executed flag to false
            false, // Set the canceled flag to false
            new address[](0), // Initialize the voters array
            new uint256[](0), // Initialize the votes array
            rewardAmount, // !! Set the reward amount
            address(0), // Set the winning entry to the zero address
            startBlock, // !! Set the start block
            endBlock //  !! Set the end block
        );
        emit ProposalCreated(
            proposalCounter,
            msg.sender,
            description,
            rewardAmount
        );
    }

    // !! Campagine start and end blocks are not used in this example
    // !! Proposal have CID ?
    function submitWork(
        bytes memory cid,
        uint256 proposalId,
        string memory workDescription,
        string memory nameOwner
    ) external {
        require(
            block.number >= proposals[proposalId].startBlock,
            "Campaign has not started yet"
        );
        require(
            block.number <= proposals[proposalId].endBlock,
            "Campaign has already ended"
        );
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.canceled, "Proposal was canceled");
        require(!proposal.executed, "Proposal was already executed");
        proposal.winningEntry = msg.sender;
        proposal.executed = true;
        emit WorkSubmitted(
            cid,
            proposalId,
            msg.sender,
            workDescription,
            nameOwner
        );

        distributeRewards(proposalId);
    }

    //  !! Distribute rewards to the winning entry and voters
    function distributeRewards(uint256 proposalId) internal {
        Proposal storage proposal = proposals[proposalId];
        uint256 totalRewards = proposal.rewardAmount;
        uint256 winnerReward = (totalRewards * 70) / 100;
        _rewardToken.transfer(proposal.winningEntry, winnerReward);
        uint256 voterRewards = (totalRewards * 30) / 100;

        for (uint256 i = 0; i < proposal.voters.length; i++) {
            address voter = proposal.voters[i];
            uint256 votes = proposal.votes[i];
            uint256 reward = (voterRewards * votes) / proposal.yesVotes;
            _rewardToken.transfer(voter, reward);
        }

        emit RewardsDistributed(
            proposalId,
            totalRewards,
            winnerReward,
            voterRewards
        );
    }

    // !! Campagine start and end blocks are not used in this example
    function claimRewards(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(
            proposal.winningEntry == msg.sender ||
                isVoter(proposalId, msg.sender),
            "Unauthorized claimer"
        );
        require(proposal.executed, "Rewards not yet distributed");

        uint256 rewardAmount = calculateRewardAmount(proposalId, msg.sender);
        require(rewardAmount > 0, "No rewards to claim");

        _rewardToken.transfer(msg.sender, rewardAmount);
    }

    function isVoter(
        uint256 proposalId,
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

    function calculateRewardAmount(
        uint256 proposalId,
        address claimer
    ) internal view returns (uint256) {
        Proposal storage proposal = proposals[proposalId];
        uint256 totalRewards = proposal.rewardAmount;
        uint256 winnerReward = (totalRewards * 70) / 100;
        uint256 voterRewards = (totalRewards * 30) / 100;
        uint256 rewardAmount = 0;

        if (proposal.winningEntry == claimer) {
            rewardAmount = winnerReward;
        } else if (isVoter(proposalId, claimer)) {
            uint256 votes = getVotes(claimer, block.number);
            rewardAmount = (voterRewards * votes) / proposal.yesVotes;
        }

        return rewardAmount;
    }

    // !! Below functions are not used in this example form Goveror

    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
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
    ) internal override(Governor, GovernorTimelockControl) {
        require(
            proposals[proposalId].creator == owner,
            "Unauthorized executor"
        );
        proposals[proposalId].executed = true;
    }

    function _executor()
        internal
        view
        override(Governor, GovernorTimelockControl)
        returns (address)
    {
        return owner;
    }

    function state(
        uint256 proposalId
    )
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(Governor, GovernorTimelockControl) returns (bool) {
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
