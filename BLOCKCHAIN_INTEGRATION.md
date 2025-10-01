# Blockchain Integration Guide

This document explains how to use ZenoPay with real blockchain networks.

## Prerequisites

1. **MetaMask or compatible Web3 wallet** installed in your browser
2. **Test ETH** for gas fees (can be obtained from faucets for testnets)
3. **Smart contracts deployed** to your target network

## Current Configuration

The app is currently configured to use:
- **Network**: Localhost (Hardhat)
- **Chain ID**: 31337
- **RPC URL**: http://127.0.0.1:8545

### Deployed Contract Addresses (Localhost)
- **PayrollVault**: `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9`
- **CrossChainPayout**: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`
- **AuditTrail**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`

## Running with Local Blockchain

1. **Start Hardhat Node**:
   ```bash
   cd smart-contracts
   npx hardhat node
   ```

2. **Deploy Contracts** (in another terminal):
   ```bash
   cd smart-contracts
   npm run deploy
   ```

3. **Connect MetaMask to Localhost**:
   - Network Name: Localhost 8545
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency Symbol: ETH

4. **Import Test Account** from Hardhat:
   - Use one of the private keys shown when you started the Hardhat node
   - This will give you test ETH for transactions

## Deploying to ZetaChain Testnet

1. **Configure Environment**:
   ```bash
   cd smart-contracts
   # Edit .env file with your private key and RPC URL
   ZETA_RPC=https://zetachain-athens.blockpi.network/rpc/v1/public
   DEPLOYER_KEY=your_private_key_here
   ```

2. **Deploy to ZetaChain**:
   ```bash
   npx hardhat run scripts/deploy_and_seed.js --network zetaTestnet
   ```

3. **Update Frontend Configuration**:
   Edit `src/lib/utils.ts` and change:
   ```typescript
   export const CURRENT_NETWORK = 'zetaTestnet';
   ```

4. **Update Contract Addresses**:
   After deployment, update the contract addresses in `src/lib/utils.ts` under the `zetaTestnet` configuration.

## Switching Networks

The app includes an automatic network switcher that:
- Detects the current network
- Shows a warning if you're on the wrong network
- Provides a button to switch to the correct network
- Automatically adds the network to MetaMask if needed

## Using the Application

### For Contributors

1. **Connect Wallet**: Click "Connect Wallet" button
2. **Switch Network**: If prompted, switch to the correct network
3. **Request Payout**:
   - Enter amount and select token
   - Choose target chain
   - Enter wallet address
   - Submit request
   - Confirm transaction in MetaMask

### For Admins

1. **Connect Wallet**: Connect your admin wallet
2. **Approve Payments**:
   - View pending payment requests
   - Use voice commands or manual approval
   - Confirm transactions in MetaMask
3. **Multi-Sig Operations**:
   - Configure multi-sig threshold
   - Manage owners
   - Execute high-value transactions with multi-sig

## Voice Commands

The voice assistant supports:
- "Approve payment request [number]"
- "Reject payment [number]"
- "Check balance"
- "List pending requests"

## Transaction Monitoring

All blockchain transactions include:
- Real-time status updates
- Transaction hash display
- Block explorer links
- Gas fee estimation
- Error handling with user-friendly messages

## Security Best Practices

1. **Never share private keys** - Use hardware wallets for production
2. **Test thoroughly** on testnets before mainnet deployment
3. **Verify contract addresses** before interacting
4. **Check gas prices** before submitting transactions
5. **Use multi-sig** for high-value transactions

## Troubleshooting

### "No Web3 provider found"
- Install MetaMask or another Web3 wallet

### "Please connect your wallet first"
- Click the "Connect Wallet" button and approve in MetaMask

### "Please switch to [Network Name]"
- Click the "Switch Network" button that appears
- Or manually switch network in MetaMask

### "Transaction Failed"
- Check you have enough ETH for gas fees
- Verify contract addresses are correct
- Ensure you're on the right network

### Contract Functions Not Working
- Verify contracts are deployed to the current network
- Check contract addresses in `src/lib/utils.ts`
- Ensure your wallet has the required permissions

## Gas Optimization

The smart contracts are optimized for gas efficiency:
- Batch operations where possible
- Efficient data structures
- Minimal storage operations
- Event-based logging

## Mainnet Deployment

⚠️ **Warning**: Deploying to mainnet involves real money. Proceed with caution.

1. Get mainnet ETH for deployment and gas
2. Update contract addresses after deployment
3. Thoroughly test all functionality
4. Consider a security audit
5. Set up monitoring and alerts

## Support

For issues or questions:
1. Check the console for detailed error messages
2. Verify network and contract configuration
3. Ensure wallet is properly connected
4. Review transaction history in block explorer
