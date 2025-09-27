// Enhanced wallet configuration with multiple wallet support
// This module avoids static imports of optional wallet libraries so Vite
// doesn't fail import-analysis when those packages are not installed.

export const projectId = '47da30d2f5ed7d2c5a1b8a3f8c6e4d9f'

// Supported wallet configurations
export const supportedWallets = [
  {
    id: 'metamask',
    name: 'MetaMask',
    description: 'Most popular browser extension wallet',
    icon: '🦊',
    features: ['Browser Extension', 'Mobile App', 'Hardware Wallet Support'],
    recommended: true,
    walletConnectId: 'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96'
  },
  {
    id: 'trust',
    name: 'Trust Wallet',
    description: 'Secure mobile-first wallet',
    icon: '🛡️',
    features: ['Mobile App', 'DApp Browser', 'Staking'],
    recommended: false,
    walletConnectId: '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0'
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    description: 'Self-custody wallet by Coinbase',
    icon: '🔵',
    features: ['User Friendly', 'Recovery Phrase', 'DeFi Integration'],
    recommended: false,
    walletConnectId: 'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa'
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    description: 'Connect any wallet via QR code',
    icon: '🔗',
    features: ['Universal', 'QR Code', 'Mobile Support'],
    recommended: false,
    walletConnectId: null
  },
  {
    id: 'safe',
    name: 'Safe Wallet',
    description: 'Multi-signature security',
    icon: '🔐',
    features: ['Multi-Sig', 'Enterprise', 'Team Management'],
    recommended: false,
    walletConnectId: '225affb176778569276e484e1b92637ad061b01e13a048b35a9d280c3b58970f'
  },
  {
    id: 'phantom',
    name: 'Phantom',
    description: 'Popular Solana wallet with EVM support',
    icon: '👻',
    features: ['Multi-Chain', 'NFT Support', 'Swap Features'],
    recommended: false,
    walletConnectId: 'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393'
  }
]

export async function loadWalletConfig() {
  try {
    if (!__HAS_WAGMI__ || !__HAS_WEB3MODAL__) {
      console.warn('Optional wallet packages not available')
      return null
    }
    
    // Use guarded dynamic imports with proper error handling
    const { defaultWagmiConfig } = await import('@web3modal/wagmi/react/config')
    const { cookieStorage, createStorage } = await import('wagmi')
    const chainsMod = await import('wagmi/chains')
    
    const { 
      mainnet, 
      arbitrum, 
      optimism, 
      polygon, 
      base, 
      bsc, 
      avalanche,
      sepolia,
      polygonMumbai 
    } = chainsMod

    const metadata = {
      name: 'ZenoPay - Omnichain Payroll',
      description: 'Cross-chain payroll made simple with multiple wallet support',
      url: window.location.origin,
      icons: [`${window.location.origin}/favicon.ico`]
    }

    // Enhanced chain support for multiple networks
    const chains = [
      mainnet, 
      arbitrum, 
      optimism, 
      polygon, 
      base, 
      bsc, 
      avalanche,
      sepolia, // Testnet for development
      polygonMumbai // Testnet for Polygon
    ] as const

    const cfg = defaultWagmiConfig({
      chains,
      projectId,
      metadata,
      ssr: false, // Set to false for client-side only
      storage: createStorage({ 
        storage: cookieStorage 
      }),
      enableWalletConnect: true,
      enableInjected: true,
      enableEIP6963: true, // Enable EIP-6963 for better wallet detection
      enableCoinbase: true,
    })

    return cfg
  } catch (err) {
    // Optional dependencies not installed — caller should handle a null result.
    // eslint-disable-next-line no-console
    console.warn('Optional wagmi/web3modal configuration not available:', err)
    return null
  }
}