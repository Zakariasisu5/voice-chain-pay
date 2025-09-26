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
