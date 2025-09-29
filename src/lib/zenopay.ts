import { ethers } from 'ethers';
import { ZENOPAY_CONTRACTS } from './utils';
import { payrollVaultAbi, crossChainPayoutAbi, auditTrailAbi, getContract } from './contracts';

export function getProvider() {
  if ((window as any).ethereum) {
    return new ethers.providers.Web3Provider((window as any).ethereum);
  }
  return ethers.getDefaultProvider();
}

export async function requestPayment(amountWei: string, targetChainId: number, targetWallet: string) {
  const provider = getProvider();
  const signer = (provider as ethers.providers.Web3Provider).getSigner();
  const vault = getContract(ZENOPAY_CONTRACTS.payrollVault, payrollVaultAbi, signer);
  const tx = await vault.requestPayment(amountWei, targetChainId, targetWallet);
  return tx;
}

export async function approvePayment(requestId: number) {
  const provider = getProvider();
  const signer = (provider as ethers.providers.Web3Provider).getSigner();
  const vault = getContract(ZENOPAY_CONTRACTS.payrollVault, payrollVaultAbi, signer);
  const tx = await vault.forwardRequestToPayout(requestId, { value: 0 });
  return tx;
}

export async function executePayout(payload: string, destChainId: number, value = '0') {
  const provider = getProvider();
  const signer = (provider as ethers.providers.Web3Provider).getSigner();
  const cross = getContract(ZENOPAY_CONTRACTS.crossChainPayout, crossChainPayoutAbi, signer);
  const tx = await cross.sendPayout(ethers.utils.arrayify(payload), destChainId, { value });
  return tx;
}

export async function logVoiceApproval(requestId: number, transcript: string) {
  const provider = getProvider();
  const signer = (provider as ethers.providers.Web3Provider).getSigner();
  const audit = getContract(ZENOPAY_CONTRACTS.auditTrail, auditTrailAbi, signer);
  const tx = await audit.logVoiceApproval(requestId, await signer.getAddress(), transcript);
  return tx;
}

// Multi-sig wallet functions
export async function getMultiSigInfo() {
  const provider = getProvider();
  const vault = getContract(ZENOPAY_CONTRACTS.payrollVault, payrollVaultAbi, provider);
  
  try {
    const multisigAddress = await vault.multisig();
    const threshold = await vault.highValueThreshold();
    return { multisigAddress, threshold: threshold.toString() };
  } catch (error) {
    console.error('Error getting multisig info:', error);
    return { multisigAddress: '', threshold: '0' };
  }
}

export async function checkRequiresMultiSig(amount: string) {
  const provider = getProvider();
  const vault = getContract(ZENOPAY_CONTRACTS.payrollVault, payrollVaultAbi, provider);
  
  try {
    const threshold = await vault.highValueThreshold();
    const amountWei = ethers.utils.parseEther(amount);
    return amountWei.gte(threshold);
  } catch (error) {
    console.error('Error checking multisig requirement:', error);
    return false;
  }
}

export async function executeMultiSigPayment(requestId: number) {
  const provider = getProvider();
  const signer = (provider as ethers.providers.Web3Provider).getSigner();
  
  try {
    // Get multisig address
    const vault = getContract(ZENOPAY_CONTRACTS.payrollVault, payrollVaultAbi, provider);
    const multisigAddress = await vault.multisig();
    
    if (!multisigAddress || multisigAddress === ethers.constants.AddressZero) {
      throw new Error('No multisig wallet configured');
    }

    // For demo purposes, we'll execute directly from the current signer
    // In production, this would require proper multisig signature aggregation
    const vaultWithSigner = getContract(ZENOPAY_CONTRACTS.payrollVault, payrollVaultAbi, signer);
    const tx = await vaultWithSigner.executeFromMultisig(requestId);
    return tx;
  } catch (error) {
    console.error('Error executing multisig payment:', error);
    throw error;
  }
}

export async function getMultiSigOwners() {
  const provider = getProvider();
  
  try {
    const vault = getContract(ZENOPAY_CONTRACTS.payrollVault, payrollVaultAbi, provider);
    const multisigAddress = await vault.multisig();
    
    if (!multisigAddress || multisigAddress === ethers.constants.AddressZero) {
      return [];
    }

    // Get multisig contract (simplified for demo)
    const multisigAbi = [
      'function owners(uint256) view returns (address)',
      'function threshold() view returns (uint256)',
      'function isOwner(address) view returns (bool)'
    ];
    
    const multisig = getContract(multisigAddress, multisigAbi, provider);
    const threshold = await multisig.threshold();
    
    // Get first few owners (in production, you'd query all)
    const owners = [];
    for (let i = 0; i < 5; i++) {
      try {
        const owner = await multisig.owners(i);
        if (owner !== ethers.constants.AddressZero) {
          owners.push(owner);
        }
      } catch {
        break;
      }
    }
    
    return { owners, threshold: threshold.toString() };
  } catch (error) {
    console.error('Error getting multisig owners:', error);
    return { owners: [], threshold: '0' };
  }
}

export function listenToEvents(onPaymentRequested: (data: any) => void, onPayoutSent: (data: any) => void, onVoiceApproved: (data: any) => void) {
  const provider = getProvider();
  const vault = getContract(ZENOPAY_CONTRACTS.payrollVault, payrollVaultAbi, provider);
  const cross = getContract(ZENOPAY_CONTRACTS.crossChainPayout, crossChainPayoutAbi, provider);
  const audit = getContract(ZENOPAY_CONTRACTS.auditTrail, auditTrailAbi, provider);

  vault.on('PaymentRequested', (...args: any[]) => {
    const event = args[args.length - 1];
    onPaymentRequested({ args, event });
  });

  cross.on('PayoutSent', (...args: any[]) => {
    const event = args[args.length - 1];
    onPayoutSent({ args, event });
  });

  audit.on('VoiceApproved', (...args: any[]) => {
    const event = args[args.length - 1];
    onVoiceApproved({ args, event });
  });

  return () => {
    vault.removeAllListeners('PaymentRequested');
    cross.removeAllListeners('PayoutSent');
    audit.removeAllListeners('VoiceApproved');
  };
}
