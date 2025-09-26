// This module avoids static imports of optional wallet libraries so Vite
// doesn't fail import-analysis when those packages are not installed.
// It exposes `projectId` and an async `loadWalletConfig()` that will
// try to dynamically import and construct the real wagmi config when
// available. Otherwise it returns null.

export const projectId = 'demo-project-id-12345'

export async function loadWalletConfig() {
  try {
    if (!__HAS_WAGMI__ || !__HAS_WEB3MODAL__) {
      throw new Error('Optional packages not installed')
    }
    // Use guarded dynamic imports. The build flags (__HAS_WAGMI__/__HAS_WEB3MODAL__)
    // allow bundlers to tree-shake these branches when packages are absent.
    // @ts-ignore
    const { defaultWagmiConfig } = await import('@web3modal/wagmi/react/config')
    // @ts-ignore
    const { cookieStorage, createStorage } = await import('wagmi')
    // @ts-ignore
    const chainsMod = await import('wagmi/chains')
    const { mainnet, arbitrum, optimism, polygon, base, bsc, avalanche } = chainsMod

    const metadata = {
      name: 'Omnichain Payroll',
      description: 'Cross-chain payroll made simple',
      url: 'https://omnichain-payroll.com',
      icons: ['https://avatars.githubusercontent.com/u/37784886']
    }

    const chains = [mainnet, arbitrum, optimism, polygon, base, bsc, avalanche] as const

    const cfg = defaultWagmiConfig({
      chains,
      projectId,
      metadata,
      ssr: true,
      storage: createStorage({ storage: cookieStorage })
    })

    return cfg
  } catch (err) {
    // Optional dependencies not installed — caller should handle a null result.
    // eslint-disable-next-line no-console
    console.warn('Optional wagmi/web3modal configuration not available:', err)
    return null
  }
}