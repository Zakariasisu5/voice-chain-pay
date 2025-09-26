import { useCallback, useMemo } from 'react'

// Enhanced wallet hook that properly uses wagmi hooks
export function useWallet() {
  // Check if optional wallet libraries are available
  if (!__HAS_WAGMI__ || !__HAS_WEB3MODAL__) {
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

  try {
    // Dynamic imports with proper error handling
    const wagmi = require('wagmi')
    const web3modal = require('@web3modal/wagmi/react')
    
    const { useAccount, useDisconnect } = wagmi
    const { useWeb3Modal } = web3modal
    
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
  } catch (error) {
    console.warn('Error using wagmi hooks:', error)
    // Fallback when there are issues with the hooks
    return {
      address: null,
      isConnected: false,
      isConnecting: false, 
      isDisconnected: true,
      chainId: null,
      chainName: 'Unknown',
      connector: null,
      connectWallet: async () => {
        console.warn('Wallet functionality not available due to error')
      },
      disconnectWallet: async () => {
        console.warn('Wallet functionality not available due to error')
      },
      formatAddress: '',
      hooksLoaded: false
    }
  }
}