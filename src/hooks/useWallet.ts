// This hook provides a safe wrapper around optional wallet libraries.
// It attempts to dynamically load wagmi and web3modal hooks at runtime.
// If the optional libraries are absent, it falls back to no-op behavior so
// the app won't crash during development.
import { useCallback, useEffect, useState } from 'react'

export function useWallet() {
  const [hooksLoaded, setHooksLoaded] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnected, setIsDisconnected] = useState(true)

  const [openModal, setOpenModal] = useState<(() => void) | null>(null)
  const [disconnectFn, setDisconnectFn] = useState<(() => void) | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        if (!__HAS_WAGMI__ || !__HAS_WEB3MODAL__) throw new Error('optional wallet libs not present')

  // Guarded dynamic imports — bundlers can drop these branches when packages are not present
  // @ts-ignore
  const wagmi = await import('wagmi')
  // @ts-ignore
  const web3modal = await import('@web3modal/wagmi/react')

        if (!mounted) return

        const { useAccount, useDisconnect } = wagmi
        const { useWeb3Modal } = web3modal

        const account = useAccount()
        const disc = useDisconnect()
        const modal = useWeb3Modal()

        setAddress(account.address ?? null)
        setIsConnected(Boolean(account.isConnected))
        setIsConnecting(Boolean(account.isConnecting))
        setIsDisconnected(Boolean(account.isDisconnected))

        setOpenModal(() => () => modal.open())
        setDisconnectFn(() => () => disc.disconnect())

        setHooksLoaded(true)
      } catch (err) {
        // optional libs not available — keep no-op behavior
        // eslint-disable-next-line no-console
        console.warn('Optional wallet hooks not available:', err)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  const connectWallet = useCallback(() => {
    if (openModal) openModal()
  }, [openModal])

  const disconnectWallet = useCallback(() => {
    if (disconnectFn) disconnectFn()
    setAddress(null)
    setIsConnected(false)
    setIsDisconnected(true)
  }, [disconnectFn])

  const formatAddress = (addr?: string | null) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return {
    address,
    isConnected,
    isConnecting,
    isDisconnected,
    connectWallet,
    disconnectWallet,
    formatAddress: address ? formatAddress(address) : ''
  }
}