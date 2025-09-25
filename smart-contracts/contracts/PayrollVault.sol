// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ICrossChainPayout {
    function sendPayout(bytes calldata payload, uint256 destChainId) external payable;
}

contract PayrollVault is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant CONTRIBUTOR_ROLE = keccak256("CONTRIBUTOR_ROLE");

    struct Contributor {
        uint256 id;
        address wallet;
        uint256 preferredChainId; // chain id where they prefer to receive funds
        bool exists;
    }

    mapping(address => Contributor) public contributors;
    uint256 public nextContributorId;

    // Payment request
    struct PaymentRequest {
        uint256 id;
        address requester;
        uint256 amount; // in wei
        uint256 targetChainId;
        address targetWallet;
        bool approved;
        bool executed;
        uint256 timestamp;
    }

    mapping(uint256 => PaymentRequest) public requests;
    uint256 public nextRequestId;

    ICrossChainPayout public crossChainPayout;
    address public treasuryToken; // zero address implies native
    address public multisig; // optional multisig wallet for high-value payouts
    uint256 public highValueThreshold; // requests >= this amount require multisig execution

    event ContributorRegistered(address indexed contributor, uint256 id, uint256 preferredChainId, address wallet);
    event PaymentRequested(uint256 indexed requestId, address indexed requester, uint256 amount, uint256 targetChainId, address targetWallet);

    constructor(address admin, address _crossChainPayout) {
        _setupRole(DEFAULT_ADMIN_ROLE, admin);
        _setupRole(ADMIN_ROLE, admin);
        crossChainPayout = ICrossChainPayout(_crossChainPayout);
    }

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Not admin");
        _;
    }

    function registerContributor(address wallet, uint256 preferredChainId) external onlyAdmin {
        require(!contributors[wallet].exists, "Already registered");
        contributors[wallet] = Contributor({id: ++nextContributorId, wallet: wallet, preferredChainId: preferredChainId, exists: true});
        _setupRole(CONTRIBUTOR_ROLE, wallet);
        emit ContributorRegistered(wallet, nextContributorId, preferredChainId, wallet);
    }

    function requestPayment(uint256 amount, uint256 targetChainId, address targetWallet) external onlyRole(CONTRIBUTOR_ROLE) returns (uint256) {
        uint256 id = ++nextRequestId;
        requests[id] = PaymentRequest({id: id, requester: msg.sender, amount: amount, targetChainId: targetChainId, targetWallet: targetWallet, approved: false, executed: false, timestamp: block.timestamp});
        emit PaymentRequested(id, msg.sender, amount, targetChainId, targetWallet);
        return id;
    }

    // Admin can fund the vault by sending native Ether or ERC20 approvals
    receive() external payable {}

    function setCrossChainPayout(address _crossChainPayout) external onlyAdmin {
        crossChainPayout = ICrossChainPayout(_crossChainPayout);
    }

    function setTreasuryToken(address token) external onlyAdmin {
        treasuryToken = token;
    }

    function setMultisig(address _multisig, uint256 _threshold) external onlyAdmin {
        multisig = _multisig;
        highValueThreshold = _threshold;
    }

    // For high value, admin will approve via AuditTrail then call executePayout on CrossChainPayout
    function getRequest(uint256 id) external view returns (PaymentRequest memory) {
        return requests[id];
    }

    // Admin moves funds to CrossChainPayout to execute
    // If amount >= highValueThreshold and multisig is set, the multisig should call executeFromMultisig
    function forwardRequestToPayout(uint256 requestId) external onlyAdmin payable {
        PaymentRequest storage r = requests[requestId];
        require(r.id == requestId, "Invalid request");
        require(!r.executed, "Already executed");
        // If high value and multisig is configured, do not allow direct admin execution
        if (multisig != address(0) && r.amount >= highValueThreshold) {
            revert("High-value request requires multisig execution");
        }
        // Prepare payload for cross-chain
        bytes memory payload = abi.encode(r.targetWallet, r.amount, requestId);
        // If native token, forward msg.value
        crossChainPayout.sendPayout{value: msg.value}(payload, r.targetChainId);
        r.executed = true;
    }

    // Called by multisig after it has approved the payout; multisig executes the crossChainPayout
    function executeFromMultisig(uint256 requestId) external payable {
        require(msg.sender == multisig, "Only multisig can call");
        PaymentRequest storage r = requests[requestId];
        require(r.id == requestId, "Invalid request");
        require(!r.executed, "Already executed");
        bytes memory payload = abi.encode(r.targetWallet, r.amount, requestId);
        crossChainPayout.sendPayout{value: msg.value}(payload, r.targetChainId);
        r.executed = true;
    }
}
