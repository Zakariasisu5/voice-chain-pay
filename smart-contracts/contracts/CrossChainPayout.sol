// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Context.sol";

/**
 * This contract is a placeholder for ZetaChain omnichain messaging integration.
 * The real ZetaChain SDK/messaging contract interface must be used in production.
 */
interface IZetaMessageEndpoint {
    function sendMessage(uint256 destChainId, address to, bytes calldata payload) external payable;
}

contract CrossChainPayout is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    address public zetaEndpoint;

    event PayoutSent(uint256 indexed requestId, address indexed target, uint256 amount, uint256 destChainId);

    constructor(address admin, address _zetaEndpoint) {
        _setupRole(DEFAULT_ADMIN_ROLE, admin);
        _setupRole(ADMIN_ROLE, admin);
        zetaEndpoint = _zetaEndpoint;
    }

    function setZetaEndpoint(address ep) external onlyRole(ADMIN_ROLE) {
        zetaEndpoint = ep;
    }

    // Entry called by PayrollVault to forward payout
    function sendPayout(bytes calldata payload, uint256 destChainId) external payable {
        // payload encoding: (address target, uint256 amount, uint256 requestId)
        (address target, uint256 amount, uint256 requestId) = abi.decode(payload, (address, uint256, uint256));
        // In a real integration we'd call zetaEndpoint.sendMessage with value and destChainId
        // For demo, emit event to simulate cross-chain message
        emit PayoutSent(requestId, target, amount, destChainId);

        // TODO: integrate with IZetaMessageEndpoint(zetaEndpoint).sendMessage{value: msg.value}(destChainId, target, payload);
    }
}
