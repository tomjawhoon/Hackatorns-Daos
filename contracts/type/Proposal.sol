// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

struct Proposal {
    address creator;
    string description;
    uint256 yesVotes;
    uint256 noVotes;
    bool executed;
    bool canceled;
    address[] voters;
    uint256[] votes;
    uint256 rewardAmount;
    address winningEntry;
    uint256 startBlock;
    uint256 endBlock;
}
