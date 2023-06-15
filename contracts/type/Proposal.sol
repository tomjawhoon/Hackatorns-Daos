// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

struct Proposal {
    address creator;
    string description;
    uint256 yesVotes;
    uint256 noVotes;
    bool executed; //  !! ข้อเสนอที่สร้างยังไม่ได้ดำเนินการ  
    bool canceled; // !! ข้อเสนอที่สร้างยังไม่ได้ยกเลิก
    address[] voters; // !! ผู้เข้ามาโหวตเนอะ
    uint256[] votes; // !!
    uint256 rewardAmount;
    address winningEntry; // !! ยังไม่มีผู้ชนะ หรือ ผู้ชนะยังไม่ได้รับรางวัล
    uint256 startBlock;
    uint256 endBlock;
}
