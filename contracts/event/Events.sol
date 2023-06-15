// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Events {
    event WorkSubmitted(
        bytes cid,
        uint256 proposalCounter,
        address owner,
        string workDescription
    );

    event ProposalCreated(
        uint256 proposalId,
        address creator,
        string description,
        uint256 rewardAmount
    );

    event Voted(uint256 proposalId, address voter);

    event RewardsDistributed(
        uint256 proposalId,
        uint256 totalRewards,
        uint256 winnerReward,
        uint256 voterRewards
    );
}
