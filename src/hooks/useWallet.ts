// Enhanced wallet hook with better multi-wallet support
// This hook provides a safe wrapper around optional wallet libraries.
// It attempts to dynamically load wagmi and web3modal hooks at runtime.
import { useCallback, useEffect, useState } from 'react'

export function useWallet() {
  const [hooksLoaded, setHooksLoaded] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnected, setIsDisconnected] = useState(true)
  const [chainId, setChainId] = useState<number | null>(null)
  const [connector, setConnector] = useState<string | null>(null)

  const [openModal, setOpenModal] = useState<(() => void) | null>(null)
  const [disconnectFn, setDisconnectFn] = useState<(() => void) | null>(null)

  useEffect(() => {
    let mounted = true
    let accountWatcher: any = null
    
    ;(async () => {
      try {
        if (!__HAS_WAGMI__ || !__HAS_WEB3MODAL__) throw new Error('optional wallet libs not present')

        // Guarded dynamic imports
        // @ts-ignore
        const wagmi = await import('wagmi')
        // @ts-ignore
        const web3modal = await import('@web3modal/wagmi/react')

        if (!mounted) return

        const { useAccount, useDisconnect, useWatchAccount } = wagmi
        const { useWeb3Modal } = web3modal

        // Get current account state
        const account = useAccount()
        const disconnect = useDisconnect()
        const modal = useWeb3Modal()

        if (mounted) {
          setAddress(account.address ?? null)
          setIsConnected(Boolean(account.isConnected))
          setIsConnecting(Boolean(account.isConnecting))
          setIsDisconnected(Boolean(account.isDisconnected))
          setChainId(account.chainId ?? null)
          setConnector(account.connector?.name ?? null)

          setOpenModal(() => () => modal.open())
          setDisconnectFn(() => () => disconnect.disconnect())
          setHooksLoaded(true)
        }

        // Watch for account changes
        if (useWatchAccount) {
          accountWatcher = useWatchAccount({
            onChange(account) {
              if (mounted) {
                setAddress(account.address ?? null)
                setIsConnected(Boolean(account.isConnected))
                setIsConnecting(Boolean(account.isConnecting))
                setIsDisconnected(Boolean(account.isDisconnected))
                setChainId(account.chainId ?? null)
                setConnector(account.connector?.name ?? null)
              }
            }
          })
        }
      } catch (err) {
        // optional libs not available — keep no-op behavior
        // eslint-disable-next-line no-console
        console.warn('Optional wallet hooks not available:', err)
        if (mounted) setHooksLoaded(false)
      }
    })()

    return () => {
      mounted = false
      if (accountWatcher && typeof accountWatcher === 'function') {
        accountWatcher()
      }
    }
  }, [])

  const connectWallet = useCallback(async () => {
    try {
      setIsConnecting(true)
      if (openModal) {
        await openModal()
      }
    } catch (error) {
      console.error('Failed to open wallet modal:', error)
    } finally {
      setIsConnecting(false)
    }
  }, [openModal])

  const disconnectWallet = useCallback(async () => {
    try {
      if (disconnectFn) {
        await disconnectFn()
      }
      setAddress(null)
      setIsConnected(false)
      setIsDisconnected(true)
      setChainId(null)
      setConnector(null)
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
    }
  }, [disconnectFn])

  const formatAddress = (addr?: string | null) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const getChainName = (chainId?: number | null) => {
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
  }

  return {
    address,
    isConnected: isConnected && !isConnecting,
    isConnecting,
    isDisconnected,
    chainId,
    chainName: getChainName(chainId),
    connector,
    connectWallet,
    disconnectWallet,
    formatAddress: address ? formatAddress(address) : '',
    hooksLoaded
  }
}