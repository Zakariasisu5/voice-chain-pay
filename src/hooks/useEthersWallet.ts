import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'

interface WalletState {
  address: string | null
  isConnected: boolean
  isConnecting: boolean
  provider: ethers.providers.Web3Provider | null
  chainId: number | null
  balance: string | null
}

declare global {
  interface Window {
    ethereum?: any
  }
}

export function useEthersWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    isConnected: false,
    isConnecting: false,
    provider: null,
    chainId: null,
    balance: null
  })

  // Check if wallet is available
  const isWalletAvailable = useCallback(() => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined'
  }, [])

  // Get chain name from chain ID
  const getChainName = useCallback((chainId: number) => {
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

  // Format address for display
  const formatAddress = useCallback((address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }, [])

  // Connect wallet
  const connectWallet = useCallback(async () => {
    if (!isWalletAvailable()) {
      throw new Error('No wallet detected. Please install MetaMask or another Web3 wallet.')
    }

    setWalletState(prev => ({ ...prev, isConnecting: true }))

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }

      // Create provider
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const address = await signer.getAddress()
      const network = await provider.getNetwork()
      const balance = await provider.getBalance(address)

      setWalletState({
        address,
        isConnected: true,
        isConnecting: false,
        provider,
        chainId: network.chainId,
        balance: ethers.utils.formatEther(balance)
      })

      return { address, chainId: network.chainId }
    } catch (error) {
      setWalletState(prev => ({ ...prev, isConnecting: false }))
      throw error
    }
  }, [isWalletAvailable])

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setWalletState({
      address: null,
      isConnected: false,
      isConnecting: false,
      provider: null,
      chainId: null,
      balance: null
    })
  }, [])

  // Listen for account changes
  useEffect(() => {
    if (!isWalletAvailable()) return

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet()
      } else if (accounts[0] !== walletState.address) {
        // Reconnect with new account
        connectWallet().catch(console.error)
      }
    }

    const handleChainChanged = (chainId: string) => {
      // Refresh the page when chain changes to reset state
      window.location.reload()
    }

    window.ethereum?.on('accountsChanged', handleAccountsChanged)
    window.ethereum?.on('chainChanged', handleChainChanged)

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum?.removeListener('chainChanged', handleChainChanged)
    }
  }, [isWalletAvailable, disconnectWallet, connectWallet, walletState.address])

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (!isWalletAvailable()) return

      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts'
        })

        if (accounts.length > 0) {
          await connectWallet()
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error)
      }
    }

    checkConnection()
  }, [isWalletAvailable, connectWallet])

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    isWalletAvailable: isWalletAvailable(),
    formatAddress: walletState.address ? formatAddress(walletState.address) : '',
    chainName: walletState.chainId ? getChainName(walletState.chainId) : 'Unknown'
  }
}