// Enhanced wallet configuration with multiple wallet support
// This module avoids static imports of optional wallet libraries so Vite
// doesn't fail import-analysis when those packages are not installed.

export const projectId = '47da30d2f5ed7d2c5a1b8a3f8c6e4d9f'

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
      name: 'Omnichain Payroll',
      description: 'Cross-chain payroll made simple with multiple wallet support',
      url: 'https://omnichain-payroll.com',
      icons: ['https://avatars.githubusercontent.com/u/37784886']
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
      ssr: true,
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