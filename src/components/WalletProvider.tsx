import React, { ReactNode, useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { projectId, loadWalletConfig } from '@/lib/wallet-config'

// Setup queryClient
const queryClient = new QueryClient()

export function WalletProvider({ children }: { children: ReactNode }) {
  const [WagmiProviderComp, setWagmiProviderComp] = useState<any | null>(null)
  const [wagmiConfig, setWagmiConfig] = useState<any | null>(null)

  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        // Try to initialize web3modal (optional). If package missing, this will be caught.
        // @ts-ignore
        // If we can load the wagmi config, attempt to initialize the modal
        const cfg = await loadWalletConfig()
        if (cfg) {
          if (mounted) setWagmiConfig(cfg)
          try {
            if (!__HAS_WEB3MODAL__) throw new Error('no web3modal')
            // Use runtime import via new Function to avoid Vite import-analysis
            // @ts-ignore
            const web3modal = await (new Function('return import("@web3modal/wagmi")'))()
            const createWeb3Modal = (web3modal as any).createWeb3Modal || (web3modal as any).default?.createWeb3Modal
            if (mounted && typeof createWeb3Modal === 'function') {
              createWeb3Modal({ wagmiConfig: cfg, projectId, enableAnalytics: true, enableOnramp: true })
            }
          } catch (e) {
            // optional, ignore
          }
        }
      } catch (err) {
        // optional package not installed - ignore
        // eslint-disable-next-line no-console
        console.warn('Optional @web3modal/wagmi not available:', err)
      }

      try {
        // Dynamically import wagmi provider if present
  // Use runtime import to avoid Vite import-analysis
  if (!__HAS_WAGMI__) throw new Error('no wagmi')
  // @ts-ignore
  const wagmiMod = await (new Function('return import("wagmi")'))()
        const Candidate = (wagmiMod as any).WagmiProvider || (wagmiMod as any).WagmiConfig || null
        if (mounted && Candidate) setWagmiProviderComp(() => Candidate)
      } catch (err) {
        // wagmi not present - we'll render without it
        if (mounted) setWagmiProviderComp(null)
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