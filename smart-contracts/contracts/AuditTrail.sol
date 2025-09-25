// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract AuditTrail is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    event PaymentRequested(uint256 indexed requestId, address indexed requester, uint256 amount, uint256 targetChainId, address targetWallet, uint256 timestamp);
    event PayoutExecuted(uint256 indexed requestId, address indexed executor, uint256 amount, uint256 targetChainId, address targetWallet, uint256 timestamp);
    event VoiceApproved(uint256 indexed requestId, address indexed approver, string transcript, uint256 timestamp);

    constructor(address admin) {
        _setupRole(DEFAULT_ADMIN_ROLE, admin);
        _setupRole(ADMIN_ROLE, admin);
    }

    function logPaymentRequested(uint256 requestId, address requester, uint256 amount, uint256 targetChainId, address targetWallet) external {
        emit PaymentRequested(requestId, requester, amount, targetChainId, targetWallet, block.timestamp);
    }

    function logPayoutExecuted(uint256 requestId, address executor, uint256 amount, uint256 targetChainId, address targetWallet) external {
        emit PayoutExecuted(requestId, executor, amount, targetChainId, targetWallet, block.timestamp);
    }

    function logVoiceApproval(uint256 requestId, address approver, string calldata transcript) external {
        emit VoiceApproved(requestId, approver, transcript, block.timestamp);
    }
}
