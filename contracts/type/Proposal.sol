// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

struct Proposal {
    uint256 proposalId;
    address creator;
    string description;
    uint256 yesVotes;
    uint256 noVotes;
    bool executed;
    bool canceled; 
    address[] voters; 
    uint256[] votes; 
}

struct Campaign {
    address creator;
    uint256 campaignId;
    uint256[] proposalId;
    uint256 startBlock;
    uint256 endBlock;
    uint256 rewardAmount;
    string databaseId;
}


