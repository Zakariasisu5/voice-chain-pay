import { ethers } from 'ethers';
import { ZENOPAY_CONTRACTS } from './utils';

// Minimal ABIs for interaction (only used functions/events)
export const payrollVaultAbi = [
  'function requestPayment(uint256 amount, uint256 targetChainId, address targetWallet) returns (uint256)',
  'function getRequest(uint256 id) view returns (tuple(uint256 id,address requester,uint256 amount,uint256 targetChainId,address targetWallet,bool approved,bool executed,uint256 timestamp))',
  'event PaymentRequested(uint256 indexed requestId, address indexed requester, uint256 amount, uint256 targetChainId, address targetWallet)'
];

export const auditTrailAbi = [
  'function logVoiceApproval(uint256 requestId, address approver, string transcript)',
  'event VoiceApproved(uint256 indexed requestId, address indexed approver, string transcript, uint256 timestamp)'
];

export const crossChainPayoutAbi = [
  'function sendPayout(bytes payload, uint256 destChainId) payable',
  'event PayoutSent(uint256 indexed requestId, address indexed target, uint256 amount, uint256 destChainId)'
];

export function getProvider() {
  if ((window as any).ethereum) {
    return new ethers.providers.Web3Provider((window as any).ethereum);
  }
  return ethers.getDefaultProvider();
}

export async function requestPayment(amountWei: string, targetChainId: number, targetWallet: string) {
  const provider = getProvider();
  const signer = (provider as ethers.providers.Web3Provider).getSigner();
  const vault = new ethers.Contract(ZENOPAY_CONTRACTS.payrollVault, payrollVaultAbi, signer);
  const tx = await vault.requestPayment(amountWei, targetChainId, targetWallet);
  return tx;
}

export async function approvePayment(requestId: number) {
  // In our simplified flow, admin will call forwardRequestToPayout on the vault after approval
  const provider = getProvider();
  const signer = (provider as ethers.providers.Web3Provider).getSigner();
  const vault = new ethers.Contract(ZENOPAY_CONTRACTS.payrollVault, payrollVaultAbi, signer);
  const tx = await vault.forwardRequestToPayout(requestId, { value: 0 });
  return tx;
}

export async function executePayout(payload: string, destChainId: number, value = '0') {
  const provider = getProvider();
  const signer = (provider as ethers.providers.Web3Provider).getSigner();
  const cross = new ethers.Contract(ZENOPAY_CONTRACTS.crossChainPayout, crossChainPayoutAbi, signer);
  const tx = await cross.sendPayout(ethers.utils.arrayify(payload), destChainId, { value });
  return tx;
}

export async function logVoiceApproval(requestId: number, transcript: string) {
  const provider = getProvider();
  const signer = (provider as ethers.providers.Web3Provider).getSigner();
  const audit = new ethers.Contract(ZENOPAY_CONTRACTS.auditTrail, auditTrailAbi, signer);
  const tx = await audit.logVoiceApproval(requestId, await signer.getAddress(), transcript);
  return tx;
}

export function listenToEvents(onPaymentRequested: (data: any) => void, onPayoutSent: (data: any) => void, onVoiceApproved: (data: any) => void) {
  const provider = getProvider();
  const vault = new ethers.Contract(ZENOPAY_CONTRACTS.payrollVault, payrollVaultAbi, provider);
  const cross = new ethers.Contract(ZENOPAY_CONTRACTS.crossChainPayout, crossChainPayoutAbi, provider);
  const audit = new ethers.Contract(ZENOPAY_CONTRACTS.auditTrail, auditTrailAbi, provider);

  vault.on('PaymentRequested', (...args) => {
    const event = args[args.length - 1];
    onPaymentRequested({ args, event });
  });

  cross.on('PayoutSent', (...args) => {
    const event = args[args.length - 1];
    onPayoutSent({ args, event });
  });

  audit.on('VoiceApproved', (...args) => {
    const event = args[args.length - 1];
    onVoiceApproved({ args, event });
  });

  return () => {
    vault.removeAllListeners('PaymentRequested');
    cross.removeAllListeners('PayoutSent');
    audit.removeAllListeners('VoiceApproved');
  };
}
