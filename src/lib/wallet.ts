import { ethers } from 'ethers';

export type ConnectedWallet = {
  address: string;
  chainId: number;
  balance?: string; // human readable
  connector: 'injected' | 'walletconnect' | 'unknown';
};

let activeProvider: any = null;

function getWindowProvider(): any | null {
  if (typeof window !== 'undefined' && (window as any).ethereum) return (window as any).ethereum;
  return null;
}

/**
 * Connect using the chosen connector.
 * - 'injected' uses window.ethereum
 * - 'walletconnect' dynamically imports @walletconnect/web3-provider and connects
 */
export async function connectWallet(connector: 'injected' | 'walletconnect' = 'injected'): Promise<ConnectedWallet> {
  if (connector === 'injected') {
    const providerRaw = getWindowProvider();
    if (!providerRaw) throw new Error('No injected Ethereum provider found. Install MetaMask or use a compatible wallet.');
    const provider = new ethers.providers.Web3Provider(providerRaw);
    activeProvider = provider;
    const accounts = await provider.send('eth_requestAccounts', []);
    if (!accounts || accounts.length === 0) throw new Error('No accounts returned from wallet');
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();
    const balanceBN = await provider.getBalance(address);
    const balance = ethers.utils.formatEther(balanceBN);
    return { address, chainId: network.chainId, balance, connector: 'injected' };
  }

  if (connector === 'walletconnect') {
    // Dynamically import WalletConnect provider to avoid forcing dependency
    try {
      // @ts-ignore - optional dependency
      const WC = (await import('@walletconnect/web3-provider')).default;
      const wcProvider = new WC({ infuraId: '' }); // empty infuraId by default; user should override in production
      await wcProvider.enable();
      const provider = new ethers.providers.Web3Provider(wcProvider as any);
      activeProvider = provider;
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const balanceBN = await provider.getBalance(address);
      const balance = ethers.utils.formatEther(balanceBN);
      return { address, chainId: network.chainId, balance, connector: 'walletconnect' };
    } catch (err: any) {
      throw new Error('WalletConnect provider not available. Install @walletconnect/web3-provider or use the injected connector.');
    }
  }

  throw new Error('Unsupported connector');
}

export async function disconnectWallet() {
  if (!activeProvider) return;
  try {
    // WalletConnect provider exposes close/ disconnect methods
    const raw = (activeProvider.provider || activeProvider._web3Provider || activeProvider);
    if (raw && typeof raw.disconnect === 'function') await raw.disconnect();
  } catch (e) {
    // ignore
  } finally {
    activeProvider = null;
  }
}

export async function getBalance(address: string): Promise<string> {
  if (!activeProvider) {
    const providerRaw = getWindowProvider();
    if (!providerRaw) throw new Error('No provider available');
    const provider = new ethers.providers.Web3Provider(providerRaw);
    const bal = await provider.getBalance(address);
    return ethers.utils.formatEther(bal);
  }
  const bal = await activeProvider.getBalance(address);
  return ethers.utils.formatEther(bal);
}

export function shortenAddress(address: string) {
  if (!address) return '';
  return `${address.slice(0,6)}...${address.slice(-4)}`;
}

export function isMetaMaskAvailable() {
  return !!getWindowProvider();
}

