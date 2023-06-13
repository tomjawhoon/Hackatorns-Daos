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
//     event ProposalCreated(
//         uint256 proposalId,
//         address creator,
//         string description
//     );
//     event Voted(uint256 proposalId, address voter, bool support);
//     event RewardsDistributed(
//         uint256 proposalId,
//         uint256 totalRewards,
//         uint256 ownerReward,
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
//     function createProject(string memory description) external {
//         proposalCounter++;
//         proposals[proposalCounter] = Proposal(
//             msg.sender,
//             description,
//             0,
//             0,
//             false,
//             false,
//             new address[](0),
//             new uint256[](0)
//         );
//         emit ProposalCreated(proposalCounter, msg.sender, description);
//     }

//     // Vote on a project proposal
//     function vote(uint256 proposalId, bool support) external {
//         require(
//             state(proposalId) == ProposalState.Active,
//             "Proposal is not active"
//         );

//         uint256 votes = getVotes(msg.sender, block.number);
//         require(votes > 0, "You do not have any voting power");

//         if (support) {
//             proposals[proposalId].yesVotes += votes;
//         } else {
//             proposals[proposalId].noVotes += votes;
//         }

//         proposals[proposalId].voters.push(msg.sender);
//         proposals[proposalId].votes.push(votes);

//         emit Voted(proposalId, msg.sender, support);
//     }

//     // Override the proposal threshold
//     function proposalThreshold()
//         public
//         pure
//         override(Governor, GovernorSettings)
//         returns (uint256)
//     {
//         return 1; // Only the owner can create a proposal
//     }

//     // Override the execution of a proposal
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

//         // Execute the proposal logic here

//         proposals[proposalId].executed = true;
//         // emit ProposalExecuted(proposalId);

//         distributeRewards(proposalId); // Distribute rewards after executing the proposal
//     }

//     // Override the cancellation of a proposal
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
//         // emit ProposalCanceled(proposalCounter);

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
//         if (proposals[proposalId].executed) {
//             return ProposalState.Executed;
//         } else if (proposals[proposalId].canceled) {
//             return ProposalState.Canceled;
//         } else {
//             return super.state(proposalId);
//         }
//     }

//     // Distribute rewards to the owner and voters
//     function distributeRewards(uint256 proposalId) internal {
//         Proposal storage proposal = proposals[proposalId];

//         // Calculate the total reward for the proposal
//         uint256 totalRewards = _rewardToken.balanceOf(address(this));

//         // Calculate the owner's reward (50% of the total rewards)
//         uint256 ownerReward = totalRewards / 2;

//         // Calculate the voters' reward (proportionate to their votes)
//         uint256 voterRewards = totalRewards - ownerReward;

//         // Transfer the rewards to the owner and voters
//         _rewardToken.transfer(proposal.creator, ownerReward);

//         // Iterate through the voters and distribute their rewards
//         uint256 totalVotes = proposal.yesVotes + proposal.noVotes;
//         for (uint256 i = 0; i < proposal.voters.length; i++) {
//             address voter = proposal.voters[i];
//             uint256 votes = proposal.votes[i];
//             uint256 voterReward = (votes * voterRewards) / totalVotes;
//             _rewardToken.transfer(voter, voterReward);
//         }

//         emit RewardsDistributed(
//             proposalId,
//             totalRewards,
//             ownerReward,
//             voterRewards
//         );
//     }

//     function supportsInterface(
//         bytes4 interfaceId
//     ) public view override(Governor, GovernorTimelockControl) returns (bool) {
//         return super.supportsInterface(interfaceId);
//     }
// }
