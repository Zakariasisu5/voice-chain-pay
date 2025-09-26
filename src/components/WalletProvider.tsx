import { ReactNode, useEffect } from 'react'
// @ts-ignore: optional peer dependency may not be installed in all environments
import React, { ReactNode, useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { config, projectId } from '@/lib/wallet-config'

// Setup queryClient
const queryClient = new QueryClient()

export function WalletProvider({ children }: { children: ReactNode }) {
  // Dynamically import web3modal to avoid Vite failing to resolve optional subpath at build time.
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        // @ts-ignore: optional package may not be installed in all environments
        const mod = await import('@web3modal/wagmi')
        const createWeb3Modal = (mod as any).createWeb3Modal || (mod as any).default?.createWeb3Modal
        if (mounted && typeof createWeb3Modal === 'function') {
          createWeb3Modal({
            wagmiConfig: config,
            projectId,
            enableAnalytics: true,
            enableOnramp: true
          })
        }
        const [WagmiAvailable, setWagmiAvailable] = useState(false)
        // Try to import wagmi as well; if available, we'll render the provider wrapper
        try {
          const wagmiMod = await import('wagmi')
          if (mounted && wagmiMod) setWagmiAvailable(true)
        } catch (e) {
          // wagmi not available - fallback to rendering children without provider
          if (mounted) setWagmiAvailable(false)
        }
      } catch (err) {
        // If the package is not installed or cannot be resolved, fallback silently.
        // This keeps the dev server running while optional wallet modal integration is missing.
        // eslint-disable-next-line no-console
        console.warn('Optional @web3modal/wagmi not available:', err)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <>
      {WagmiAvailable ? (
        // Dynamically render provider when wagmi is present
        // Use a dynamic require-like approach to avoid top-level static imports
        React.createElement((require('wagmi') as any).WagmiProvider || (require('wagmi') as any).WagmiConfig || React.Fragment, { config },
          React.createElement(QueryClientProvider, { client: queryClient }, children)
        )
      ) : (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )}
    </>
  )
}