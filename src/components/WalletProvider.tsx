import React, { ReactNode, useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { projectId, loadWalletConfig } from '@/lib/wallet-config'

// Setup queryClient
const queryClient = new QueryClient()

export function WalletProvider({ children }: { children: ReactNode }) {
  const [WagmiProviderComp, setWagmiProviderComp] = useState<any | null>(null)
  const [wagmiConfig, setWagmiConfig] = useState<any | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        // Load wagmi configuration first
        const cfg = await loadWalletConfig()
        if (cfg && mounted) {
          setWagmiConfig(cfg)
          
          // Initialize Web3Modal with enhanced configuration
          try {
            if (!__HAS_WEB3MODAL__) {
              console.warn('Web3Modal not available')
              return
            }
            
            const web3modal = await import('@web3modal/wagmi')
            const createWeb3Modal = web3modal.createWeb3Modal || web3modal.default?.createWeb3Modal
            
            if (mounted && typeof createWeb3Modal === 'function') {
              createWeb3Modal({ 
                wagmiConfig: cfg, 
                projectId,
                enableAnalytics: true,
                enableOnramp: true,
                themeMode: 'dark',
                themeVariables: {
                  '--w3m-color-mix': 'hsl(217, 91%, 11%)',
                  '--w3m-color-mix-strength': 40,
                  '--w3m-accent': 'hsl(39, 100%, 57%)',
                  '--w3m-border-radius-master': '8px'
                },
                featuredWalletIds: [
                  'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
                  '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
                  'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase
                  '225affb176778569276e484e1b92637ad061b01e13a048b35a9d280c3b58970f', // Safe
                  '38f5d18bd8522c244bdd70cb4a68e0e718865155811c043f052fb9f1c51de662'  // Bitget
                ]
              })
              console.log('Web3Modal initialized successfully')
            }
          } catch (e) {
            console.warn('Web3Modal initialization failed:', e)
          }
        }
      } catch (err) {
        console.warn('Wallet configuration loading failed:', err)
      }

      try {
        // Load Wagmi Provider component
        if (!__HAS_WAGMI__) {
          console.warn('Wagmi not available')
          if (mounted) setIsInitialized(true)
          return
        }
        
        const wagmiMod = await import('wagmi')
        const Candidate = wagmiMod.WagmiProvider || wagmiMod.WagmiConfig || null
        if (mounted && Candidate) {
          setWagmiProviderComp(() => Candidate)
          setIsInitialized(true)
          console.log('Wagmi Provider loaded successfully')
        }
      } catch (err) {
        console.warn('Wagmi provider loading failed:', err)
        if (mounted) {
          setWagmiProviderComp(null)
          setIsInitialized(true)
        }
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  if (WagmiProviderComp && wagmiConfig) {
    const Comp = WagmiProviderComp
    return (
      <Comp config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </Comp>
    )
  }

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}