import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function formatAddress(addr: string) {
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}

// Zenopay SDK helpers (ethers v5)
// Network configurations
export const SUPPORTED_NETWORKS = {
  localhost: {
    chainId: 31337,
    name: 'Localhost',
    rpcUrl: 'http://127.0.0.1:8545',
    explorer: undefined as string | undefined,
    contracts: {
      payrollVault: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
      crossChainPayout: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
      auditTrail: '0x5FbDB2315678afecb367f032d93F642f64180aa3'
    }
  },
  zetaTestnet: {
    chainId: 7001,
    name: 'ZetaChain Athens Testnet',
    rpcUrl: 'https://zetachain-athens.blockpi.network/rpc/v1/public',
    explorer: 'https://athens.explorer.zetachain.com',
    contracts: {
      // Update these after deploying to ZetaChain testnet
      payrollVault: '0x0000000000000000000000000000000000000000',
      crossChainPayout: '0x0000000000000000000000000000000000000000',
      auditTrail: '0x0000000000000000000000000000000000000000'
    }
  },
  mainnet: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://eth-mainnet.alchemyapi.io/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC',
    explorer: 'https://etherscan.io',
    contracts: {
      // Update these after deploying to mainnet
      payrollVault: '0x0000000000000000000000000000000000000000',
      crossChainPayout: '0x0000000000000000000000000000000000000000',
      auditTrail: '0x0000000000000000000000000000000000000000'
    }
  }
} as const;

// Default to localhost for development
export const CURRENT_NETWORK = 'localhost';

export const ZENOPAY_CONTRACTS = SUPPORTED_NETWORKS[CURRENT_NETWORK].contracts;

export function getNetworkConfig(chainId: number) {
  return Object.values(SUPPORTED_NETWORKS).find(n => n.chainId === chainId);
}

export function isNetworkSupported(chainId: number): boolean {
  return Object.values(SUPPORTED_NETWORKS).some(n => n.chainId === chainId);
}
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Build a transaction URL for common chains. Returns null if unknown.
export function getExplorerTxUrl(chainName: string, txHash: string | undefined | null) {
  if (!txHash) return null;
  const hash = txHash.trim();
  const map: Record<string, string> = {
    ethereum: `https://etherscan.io/tx/${hash}`,
    mainnet: `https://etherscan.io/tx/${hash}`,
    goerli: `https://goerli.etherscan.io/tx/${hash}`,
    polygon: `https://polygonscan.com/tx/${hash}`,
    mumbai: `https://mumbai.polygonscan.com/tx/${hash}`,
    arbitrum: `https://arbiscan.io/tx/${hash}`,
    optimism: `https://optimistic.etherscan.io/tx/${hash}`,
    bnb: `https://bscscan.com/tx/${hash}`,
    bnbchain: `https://bscscan.com/tx/${hash}`,
    bitcoin: `https://www.blockchain.com/btc/tx/${hash}`,
  };

  const key = chainName ? chainName.toLowerCase() : '';
  return map[key] ?? null;
}

export function openExplorerTx(chainName: string, txHash: string | undefined | null) {
  const url = getExplorerTxUrl(chainName, txHash);
  if (!url) return false;
  if (typeof window !== 'undefined') window.open(url, '_blank', 'noopener');
  return true;
}
