import { ethers } from 'ethers';
import { ZENOPAY_CONTRACTS, SUPPORTED_NETWORKS, CURRENT_NETWORK, isNetworkSupported } from './utils';
import { payrollVaultAbi, crossChainPayoutAbi, auditTrailAbi, getContract } from './contracts';

export function getProvider() {
  if ((window as any).ethereum) {
    return new ethers.providers.Web3Provider((window as any).ethereum);
  }
  // Fallback to configured RPC
  return new ethers.providers.JsonRpcProvider(SUPPORTED_NETWORKS[CURRENT_NETWORK].rpcUrl);
}

export async function ensureWalletConnected() {
  const provider = getProvider();
  if (provider instanceof ethers.providers.Web3Provider) {
    try {
      const network = await provider.getNetwork();
      const expectedChainId = SUPPORTED_NETWORKS[CURRENT_NETWORK].chainId;
      
      if (network.chainId !== expectedChainId) {
        throw new Error(
          `Please switch to ${SUPPORTED_NETWORKS[CURRENT_NETWORK].name} (Chain ID: ${expectedChainId}). Currently on Chain ID: ${network.chainId}`
        );
      }
      
      const signer = provider.getSigner();
      await signer.getAddress(); // This will throw if not connected
      return { provider, signer };
    } catch (error: any) {
      if (error.code === 'UNSUPPORTED_OPERATION') {
        throw new Error('Please connect your wallet first');
      }
      throw error;
    }
  }
  throw new Error('No Web3 provider found. Please install MetaMask or another Web3 wallet.');
}

export async function switchToSupportedNetwork() {
  if (!(window as any).ethereum) {
    throw new Error('No Web3 provider found');
  }
  
  const targetNetwork = SUPPORTED_NETWORKS[CURRENT_NETWORK];
  const chainIdHex = `0x${targetNetwork.chainId.toString(16)}`;
  
  try {
    await (window as any).ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    });
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await (window as any).ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: chainIdHex,
            chainName: targetNetwork.name,
            rpcUrls: [targetNetwork.rpcUrl],
            blockExplorerUrls: targetNetwork.explorer ? [targetNetwork.explorer] : undefined,
          }],
        });
      } catch (addError) {
        throw new Error('Failed to add network to wallet');
      }
    } else {
      throw switchError;
    }
  }
}

export async function requestPayment(amountWei: string, targetChainId: number, targetWallet: string) {
  const { signer } = await ensureWalletConnected();
  const vault = getContract(ZENOPAY_CONTRACTS.payrollVault, payrollVaultAbi, signer);
  const tx = await vault.requestPayment(amountWei, targetChainId, targetWallet);
  await tx.wait(); // Wait for confirmation
  return tx;
}

export async function approvePayment(requestId: number) {
  const { signer } = await ensureWalletConnected();
  const vault = getContract(ZENOPAY_CONTRACTS.payrollVault, payrollVaultAbi, signer);
  const tx = await vault.forwardRequestToPayout(requestId, { value: 0 });
  await tx.wait();
  return tx;
}

export async function executePayout(payload: string, destChainId: number, value = '0') {
  const { signer } = await ensureWalletConnected();
  const cross = getContract(ZENOPAY_CONTRACTS.crossChainPayout, crossChainPayoutAbi, signer);
  const tx = await cross.sendPayout(ethers.utils.arrayify(payload), destChainId, { value });
  await tx.wait();
  return tx;
}

export async function logVoiceApproval(requestId: number, transcript: string) {
  const { signer } = await ensureWalletConnected();
  const audit = getContract(ZENOPAY_CONTRACTS.auditTrail, auditTrailAbi, signer);
  const tx = await audit.logVoiceApproval(requestId, await signer.getAddress(), transcript);
  await tx.wait();
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
  const { signer, provider } = await ensureWalletConnected();
  
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
    await tx.wait();
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
