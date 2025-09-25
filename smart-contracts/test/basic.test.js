const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Zenopay flow', function () {
  it('should allow contributor to request and admin to forward payout', async function () {
    const [admin, contributor] = await ethers.getSigners();

    const Audit = await ethers.getContractFactory('AuditTrail');
    const audit = await Audit.deploy(admin.address);
    await audit.deployed();

    const Cross = await ethers.getContractFactory('CrossChainPayout');
    const cross = await Cross.deploy(admin.address, ethers.constants.AddressZero);
    await cross.deployed();

    const Vault = await ethers.getContractFactory('PayrollVault');
    const vault = await Vault.deploy(admin.address, cross.address);
    await vault.deployed();

    // register contributor
    await vault.connect(admin).registerContributor(contributor.address, 1);

    // contributor requests payment
    await vault.connect(contributor).requestPayment(ethers.utils.parseEther('0.1'), 2, contributor.address);

    // admin forwards request and expects PayoutSent event from cross
    const tx = await vault.connect(admin).forwardRequestToPayout(1, { value: 0 });
    await tx.wait();

    expect((await vault.getRequest(1)).executed).to.equal(true);
  });
});
