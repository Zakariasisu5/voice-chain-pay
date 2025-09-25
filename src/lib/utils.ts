import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function formatAddress(addr: string) {
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}

// Zenopay SDK helpers (ethers v5)
export const ZENOPAY_CONTRACTS = {
  // Fill with deployed addresses after running smart-contracts deploy script
  payrollVault: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
  crossChainPayout: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  auditTrail: '0x5FbDB2315678afecb367f032d93F642f64180aa3'
};
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
