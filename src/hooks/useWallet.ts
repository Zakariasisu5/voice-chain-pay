// Enhanced wallet hook that uses wagmi hooks properly
import { useCallback, useMemo } from 'react'

// Conditional hook imports - only use if available
let wagmiHooks: any = null
let web3modalHooks: any = null

if (__HAS_WAGMI__ && __HAS_WEB3MODAL__) {
  try {
    // @ts-ignore
    wagmiHooks = require('wagmi')
    // @ts-ignore  
    web3modalHooks = require('@web3modal/wagmi/react')
  } catch (e) {
    console.warn('Failed to load optional wallet dependencies')
  }
}

export function useWallet() {
  // If wagmi is available, use the hooks directly
  if (wagmiHooks && web3modalHooks) {
    const { useAccount, useDisconnect } = wagmiHooks
    const { useWeb3Modal } = web3modalHooks
    
    const account = useAccount()
    const { disconnect } = useDisconnect()
    const { open } = useWeb3Modal()
    
    const connectWallet = useCallback(async () => {
      try {
        await open()
      } catch (error) {
        console.error('Failed to open wallet modal:', error)
        throw error
      }
    }, [open])

    const disconnectWallet = useCallback(async () => {
      try {
        await disconnect()
      } catch (error) {
        console.error('Failed to disconnect wallet:', error)
        throw error
      }
    }, [disconnect])

    const formatAddress = useMemo(() => {
      if (!account.address) return ''
      return `${account.address.slice(0, 6)}...${account.address.slice(-4)}`
    }, [account.address])

    const getChainName = useCallback((chainId?: number) => {
      if (!chainId) return 'Unknown'
      const chainNames: Record<number, string> = {
        1: 'Ethereum',
        137: 'Polygon', 
        42161: 'Arbitrum',
        10: 'Optimism',
        8453: 'Base',
        56: 'BSC',
        43114: 'Avalanche',
        11155111: 'Sepolia',
        80001: 'Mumbai'
      }
      return chainNames[chainId] || `Chain ${chainId}`
    }, [])

    return {
      address: account.address || null,
      isConnected: Boolean(account.isConnected && !account.isConnecting),
      isConnecting: Boolean(account.isConnecting),
      isDisconnected: Boolean(account.isDisconnected),
      chainId: account.chainId || null,
      chainName: getChainName(account.chainId),
      connector: account.connector?.name || null,
      connectWallet,
      disconnectWallet,
      formatAddress,
      hooksLoaded: true
    }
  }

  // Fallback when wagmi is not available
  return {
    address: null,
    isConnected: false,
    isConnecting: false, 
    isDisconnected: true,
    chainId: null,
    chainName: 'Unknown',
    connector: null,
    connectWallet: async () => {
      console.warn('Wallet functionality not available - wagmi not installed')
    },
    disconnectWallet: async () => {
      console.warn('Wallet functionality not available - wagmi not installed')
    },
    formatAddress: '',
    hooksLoaded: false
  }
}