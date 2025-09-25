const { ethers } = require('ethers');

function main() {
  // Generate a random mnemonic and wallet
  const wallet = ethers.Wallet.createRandom();

  console.log('== New testnet wallet ==');
  console.log('Address:', wallet.address);
  console.log('Mnemonic:', wallet.mnemonic.phrase);
  console.log('Private Key:', wallet.privateKey);
  console.log('\nIMPORTANT: store the private key securely and do NOT commit it to source control.');
  console.log('To use this key for deployment, set DEPLOYER_KEY in smart-contracts/.env or export it in your terminal:');
  console.log('\nExample (PowerShell):');
  console.log("$env:DEPLOYER_KEY = '" + wallet.privateKey + "'");
}

main();
