const { ethers } = require('ethers');
require('dotenv').config();

async function main() {
  const { ZETA_RPC } = process.env;
  if (!ZETA_RPC) {
    console.error('ZETA_RPC not set in .env');
    process.exit(1);
  }
  const provider = new ethers.providers.JsonRpcProvider(ZETA_RPC);
  const address = process.argv[2];
  if (!address) {
    console.error('Usage: node check_balance.js <address>');
    process.exit(1);
  }
  const balance = await provider.getBalance(address);
  console.log('Address:', address);
  console.log('Balance (wei):', balance.toString());
  console.log('Balance (ETH):', ethers.utils.formatEther(balance));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
