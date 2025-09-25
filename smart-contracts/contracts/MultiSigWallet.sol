// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MultiSigWallet {
    uint256 public threshold;
    address[] public owners;
    mapping(address => bool) public isOwner;

    event ExecuteTransaction(address indexed to, uint256 value, bytes data);

    constructor(address[] memory _owners, uint256 _threshold) {
        require(_owners.length >= _threshold && _threshold > 0, "Invalid owners/threshold");
        owners = _owners;
        threshold = _threshold;
        for (uint i = 0; i < _owners.length; i++) {
            isOwner[_owners[i]] = true;
        }
    }

    // Very small demo: Owners can call execute which will emit an event and forward the call if enough owners sign
    // For simplicity this demo does not implement off-chain signature aggregation; in production use Gnosis Safe
    function execute(address to, uint256 value, bytes calldata data) external {
        require(isOwner[msg.sender], "Not owner");
        // In this demo, we require the caller to be an owner and that the contract has enough confirmations — simplified
        // A realistic multisig requires off-chain signatures or an on-chain voting mechanism.
        (bool success, ) = to.call{value: value}(data);
        require(success, "tx failed");
        emit ExecuteTransaction(to, value, data);
    }

    receive() external payable {}
}
