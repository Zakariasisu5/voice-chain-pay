const fs = require('fs');
const path = require('path');
const hre = require('hardhat');

async function main() {
  const [deployer, contributor1, contributor2] = await hre.ethers.getSigners();
  console.log('Deploying with', deployer.address, 'network', hre.network.name);

  const Audit = await hre.ethers.getContractFactory('AuditTrail');
  const audit = await Audit.deploy(deployer.address);
  await audit.deployed();

  const Cross = await hre.ethers.getContractFactory('CrossChainPayout');
  const cross = await Cross.deploy(deployer.address, hre.ethers.constants.AddressZero);
  await cross.deployed();

  const Multi = await hre.ethers.getContractFactory('MultiSigWallet');
  // For demo, owners are deployer and contributor1; threshold 1 to simplify execution in demo
  const multi = await Multi.deploy([deployer.address, contributor1.address], 1);
  await multi.deployed();

  const Vault = await hre.ethers.getContractFactory('PayrollVault');
  const vault = await Vault.deploy(deployer.address, cross.address);
  await vault.deployed();

  // Set multisig and threshold: any requests >= 1 ether require multisig
  await vault.connect(deployer).setMultisig(multi.address, hre.ethers.utils.parseEther('1')); // threshold set as wei amount

  // Register sample contributors
  await vault.connect(deployer).registerContributor(contributor1.address, 1);
  await vault.connect(deployer).registerContributor(contributor2.address, 2);

  // Fund the vault with 5 ETH
  await deployer.sendTransaction({ to: vault.address, value: hre.ethers.utils.parseEther('5') });

  console.log('Deployed:', {
    audit: audit.address,
    cross: cross.address,
    multi: multi.address,
    vault: vault.address
  });

  // Write addresses to frontend utils
  const frontendUtilsPath = path.resolve(__dirname, '..', '..', 'src', 'lib', 'utils.ts');
  let utils = fs.readFileSync(frontendUtilsPath, 'utf8');
  utils = utils.replace(/payrollVault: '0x[0-9a-fA-F]{40}'/, `payrollVault: '${vault.address}'`);
  utils = utils.replace(/crossChainPayout: '0x[0-9a-fA-F]{40}'/, `crossChainPayout: '${cross.address}'`);
  utils = utils.replace(/auditTrail: '0x[0-9a-fA-F]{40}'/, `auditTrail: '${audit.address}'`);
  fs.writeFileSync(frontendUtilsPath, utils, 'utf8');
  console.log('Updated frontend utils with contract addresses.');

  console.log('Seeding complete.');
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
