// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.9;

// import "@openzeppelin/contracts/governance/Governor.sol";
// import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
// import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
// import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
// import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
// import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";
// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// contract MyGovernor is
//     Governor,
//     GovernorSettings,
//     GovernorCountingSimple,
//     GovernorVotes,
//     GovernorVotesQuorumFraction,
//     GovernorTimelockControl
// {
//     // Events
//     event WorkSubmitted(
//         bytes cid,
//         uint256 proposalId,
//         address owner,
//         string workDescription,
//         string nameOwner
//     );

//     event ProposalCreated(
//         uint256 proposalId,
//         address creator,
//         string description,
//         uint256 rewardAmount
//     );
//     event Voted(uint256 proposalId, address voter);
//     event RewardsDistributed(
//         uint256 proposalId,
//         uint256 totalRewards,
//         uint256 winnerReward,
//         uint256 voterRewards
//     );

//     mapping(uint256 => Proposal) private proposals;
//     uint256 private proposalCounter;
//     address private owner;
//     ERC20 private _rewardToken; // Declare the ERC20 token contract variable

//     struct Proposal {
//         address creator;
//         string description;
//         uint256 yesVotes;
//         uint256 noVotes;
//         bool executed;
//         bool canceled;
//         address[] voters;
//         uint256[] votes;
//         uint256 rewardAmount;
//         address winningEntry;
//         uint256 startBlock;
//         uint256 endBlock;
//     }

//     constructor(
//         address rewardToken, // Pass the ERC20 token contract address during deployment
//         TimelockController _timelock
//     )
//         Governor("MyGovernor")
//         GovernorSettings(7200 /* 1 day */, 7200 /* 1 day */, 0)
//         GovernorVotes(IVotes(rewardToken)) // Pass the reward token address to the GovernorVotes constructor
//         GovernorVotesQuorumFraction(4)
//         GovernorTimelockControl(_timelock)
//     {
//         owner = msg.sender; // Set the contract deployer as the owner
//         _rewardToken = ERC20(rewardToken); // Initialize the ERC20 token contract
//     }

//     // Create a new project proposal
//     // !! Campagine start and end blocks are not used in this example
//     function createCampaign(
//         string memory description,
//         uint256 rewardAmount, // 1000 APE COIN
//         uint256 startBlock,
//         uint256 endBlock
//     ) external {
//         proposalCounter++;
//         proposals[proposalCounter] = Proposal(
//             msg.sender,
//             description,
//             0,
//             0,
//             false,
//             false,
//             new address[](0),
//             new uint256[](0),
//             rewardAmount,
//             address(0),
//             startBlock,
//             endBlock
//         );
//         emit ProposalCreated(
//             proposalCounter,
//             msg.sender,
//             description,
//             rewardAmount
//         );
//     }

//     // Submit an entry for a project proposal
//     // !! Campagine start and end blocks are not used in this example
//     // !! Proposal have CID ?

//     function submitWork(
//         bytes memory cid,
//         uint256 proposalId,
//         string memory workDescription,
//         string memory nameOwner
//     ) external {
//         require(
//             block.number >= proposals[proposalId].startBlock,
//             "Campaign has not started yet"
//         );
//         require(
//             block.number <= proposals[proposalId].endBlock,
//             "Campaign has ended"
//         );

//         proposals[proposalId].winningEntry = msg.sender;

//         emit WorkSubmitted(
//             cid,
//             proposalId,
//             msg.sender,
//             workDescription,
//             nameOwner
//         );
//     }

//     function vote(uint256 proposalId) external {
//         require(
//             state(proposalId) == ProposalState.Active,
//             "Proposal is not active"
//         );
//         require(
//             block.number >= proposals[proposalId].startBlock,
//             "Campaign has not started yet"
//         );
//         require(
//             block.number <= proposals[proposalId].endBlock,
//             "Campaign has ended"
//         );

//         uint256 votes = getVotes(msg.sender, block.number);
//         require(votes > 0, "You do not have any voting power");

//         proposals[proposalId].yesVotes += votes;

//         proposals[proposalId].voters.push(msg.sender);
//         proposals[proposalId].votes.push(votes);

//         emit Voted(proposalId, msg.sender);
//     }

//     function getCampaignStartTime(
//         uint256 proposalId
//     ) public view returns (uint256) {
//         require(proposalId <= proposalCounter, "Invalid proposalId");

//         return proposals[proposalId].startBlock;
//     }

//     function getCampaignEndTime(
//         uint256 proposalId
//     ) public view returns (uint256) {
//         require(proposalId <= proposalCounter, "Invalid proposalId");

//         return proposals[proposalId].endBlock;
//     }

//     function proposalThreshold()
//         public
//         pure
//         override(Governor, GovernorSettings)
//         returns (uint256)
//     {
//         return 1; // Only one proposal is required to start voting
//     }

//     function _execute(
//         uint256 proposalId,
//         address[] memory targets,
//         uint256[] memory values,
//         bytes[] memory calldatas,
//         bytes32 descriptionHash
//     ) internal override(Governor, GovernorTimelockControl) {
//         require(
//             proposals[proposalId].creator == owner,
//             "Unauthorized executor"
//         );
//         require(
//             proposals[proposalId].winningEntry != address(0),
//             "Winning entry not selected"
//         );

//         // Execute the proposal logic here

//         // Loop through the targets and make the corresponding function calls
//         for (uint256 i = 0; i < targets.length; i++) {
//             (bool success, ) = targets[i].call{value: values[i]}(calldatas[i]);
//             require(success, "Execution of target call failed");
//         }

//         // Set the proposal as executed
//         proposals[proposalId].executed = true;

//         // Distribute rewards after executing the proposal
//         distributeRewards(proposalId);
//     }

//     function _cancel(
//         address[] memory targets,
//         uint256[] memory values,
//         bytes[] memory calldatas,
//         bytes32 descriptionHash
//     ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
//         require(
//             proposals[proposalCounter].creator == owner,
//             "Unauthorized canceller"
//         );

//         // Additional cancellation logic here

//         proposals[proposalCounter].canceled = true;

//         return proposalCounter;
//     }

//     // Override the executor function
//     function _executor()
//         internal
//         view
//         override(Governor, GovernorTimelockControl)
//         returns (address)
//     {
//         return owner;
//     }

//     // Custom implementation of the state function
//     function state(
//         uint256 proposalId
//     )
//         public
//         view
//         override(Governor, GovernorTimelockControl)
//         returns (ProposalState)
//     {
//         Proposal storage proposal = proposals[proposalId];
//         if (proposal.executed) {
//             return ProposalState.Executed;
//         } else if (proposal.canceled) {
//             return ProposalState.Canceled;
//         } else if (block.number < proposal.startBlock) {
//             return ProposalState.Pending;
//         } else if (block.number <= proposal.endBlock) {
//             return ProposalState.Active;
//         } else {
//             return ProposalState.Expired;
//         }
//     }

//     // Distribute rewards to the winning entry and voters
//     function distributeRewards(uint256 proposalId) internal {
//         Proposal storage proposal = proposals[proposalId];

//         // Calculate the total reward for the proposal
//         uint256 totalRewards = proposal.rewardAmount;

//         // Calculate the reward for the winning entry
//         uint256 winnerReward = (totalRewards * 70) / 100;
//         _rewardToken.transfer(proposal.winningEntry, winnerReward);

//         // Calculate the reward for the voters
//         uint256 voterRewards = (totalRewards * 30) / 100;

//         for (uint256 i = 0; i < proposal.voters.length; i++) {
//             address voter = proposal.voters[i];
//             uint256 votes = proposal.votes[i];
//             uint256 reward = (voterRewards * votes) / proposal.yesVotes;
//             _rewardToken.transfer(voter, reward);
//         }

//         emit RewardsDistributed(
//             proposalId,
//             totalRewards,
//             winnerReward,
//             voterRewards
//         );
//     }

//     function supportsInterface(
//         bytes4 interfaceId
//     ) public view override(Governor, GovernorTimelockControl) returns (bool) {
//         return super.supportsInterface(interfaceId);
//     }
// }
