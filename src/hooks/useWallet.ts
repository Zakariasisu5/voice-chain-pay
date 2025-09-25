import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'

export function useWallet() {
  const { address, isConnected, isConnecting, isDisconnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { open } = useWeb3Modal()

  const connectWallet = () => {
    open()
  }

  const disconnectWallet = () => {
    disconnect()
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
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