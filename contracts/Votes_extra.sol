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
//     // event ProposalExecuted(uint256 proposalId);
//     // event ProposalCanceled(uint256 proposalId);

//     mapping(uint256 => Proposal) private proposals;
//     uint256 private proposalCounter;
//     address private owner;
//     ERC20 private rewardToken; // The reward token contract address

//     struct Proposal {
//         address creator;
//         string description;
//         uint256 yesVotes;
//         uint256 noVotes;
//         bool executed;
//         bool canceled;
//     }

//     constructor(
//         IVotes _token,
//         TimelockController _timelock,
//         address _rewardTokenAddress // Address of the reward token contract
//     )
//         Governor("MyGovernor")
//         GovernorSettings(7200 /* 1 day */, 7200 /* 1 day */, 0)
//         GovernorVotes(_token)
//         GovernorVotesQuorumFraction(4)
//         GovernorTimelockControl(_timelock)
//     {
//         owner = msg.sender; // Set the contract deployer as the owner
//         rewardToken = ERC20(_rewardTokenAddress);
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
//             false
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

//         emit Voted(proposalId, msg.sender, support);
//     }

//     // Send reward tokens to a recipient
//     function sendTokens(address recipient, uint256 amount) external {
//         require(msg.sender == owner, "Only the owner can send reward tokens");
//         require(amount > 0, "Amount must be greater than zero");

//         rewardToken.transfer(recipient, amount);
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

//     //Why is this function needed?

//     // Override supportsInterface function
//     function supportsInterface(
//         bytes4 interfaceId
//     ) public view override(Governor, GovernorTimelockControl) returns (bool) {
//         return super.supportsInterface(interfaceId);
//     }

//     // Custom implementation of the state function
//     function state(uint256 proposalId)
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
// }
