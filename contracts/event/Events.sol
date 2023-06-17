// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Events {
    event WorkSubmitted(
        bytes cid,
        uint256 proposalCounter,
        address owner,
        string workDescription
    );

    event EventProposalCreated(
        uint256 proposalId,
        address creator,
        string description,
        uint256 rewardAmount
    );

    event VoteRecorded(
        uint256 indexed proposalId,
        address indexed voter,
        uint256 indexed campaignId,
        uint256 votes
    );

    event Voted(uint256 proposalId, address voter);

    event RewardsDistributed(
        uint256 proposalId,
        uint256 totalRewards,
        uint256 winnerReward,
        uint256 voterRewards
    );
}
