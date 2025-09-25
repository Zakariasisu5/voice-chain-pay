Zenopay Smart Contracts
======================

This folder contains Solidity contracts and Hardhat scripts for the Zenopay payroll vault and cross-chain payout demo.

Contracts:
- PayrollVault.sol: stores contributors, handles payment requests, and forwards approved requests to CrossChainPayout.
- CrossChainPayout.sol: placeholder for ZetaChain omnichain messaging integration. Emits events to simulate cross-chain delivery.
- AuditTrail.sol: emits audit events including voice approvals.

Quick start:
1. cd smart-contracts
2. npm install
3. npx hardhat node (in a separate terminal)
4. npm run deploy

Notes:
- ZetaChain integration must be done by replacing the placeholder IZetaMessageEndpoint calls with the real SDK contracts and funding mechanisms.
- Update `hardhat.config.js` networks with ZetaChain RPCs as needed.

Deploy to ZetaChain testnet (example):

1. Create a `.env` file in `smart-contracts/` with:

ZETA_RPC=https://your-zeta-rpc
DEPLOYER_KEY=0xYOUR_PRIVATE_KEY

2. Run:

npx hardhat run scripts/deploy_and_seed.js --network zetaTestnet

This will deploy the contracts, seed sample contributors, fund the vault (with the deployer account) and automatically update `src/lib/utils.ts` in the frontend with the deployed addresses.

Important: For production use the multisig implementation here is a simple demo. Use a production-grade multisig (Gnosis Safe) for secure multisig governance.
