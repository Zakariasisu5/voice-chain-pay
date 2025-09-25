const hre = require('hardhat');

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying contracts with', deployer.address);

  const AuditTrail = await hre.ethers.getContractFactory('AuditTrail');
  const audit = await AuditTrail.deploy(deployer.address);
  await audit.deployed();
  console.log('AuditTrail deployed to', audit.address);

  const CrossChainPayout = await hre.ethers.getContractFactory('CrossChainPayout');
  const cross = await CrossChainPayout.deploy(deployer.address, hre.ethers.constants.AddressZero);
  await cross.deployed();
  console.log('CrossChainPayout deployed to', cross.address);

  const PayrollVault = await hre.ethers.getContractFactory('PayrollVault');
  const vault = await PayrollVault.deploy(deployer.address, cross.address);
  await vault.deployed();
  console.log('PayrollVault deployed to', vault.address);

  console.log('Contracts deployed. Next: fund the vault and register sample contributors.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
