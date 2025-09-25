import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { cookieStorage, createStorage } from 'wagmi'
import { mainnet, arbitrum, optimism, polygon, base, bsc, avalanche } from 'wagmi/chains'

// Get projectId from https://cloud.reown.com
export const projectId = 'demo-project-id-12345'

// For production, replace with your actual project ID from https://cloud.reown.com
// if (!projectId) throw new Error('Project ID is not defined')

const metadata = {
  name: 'Omnichain Payroll',
  description: 'Cross-chain payroll made simple',
  url: 'https://omnichain-payroll.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// Create wagmiConfig
const chains = [mainnet, arbitrum, optimism, polygon, base, bsc, avalanche] as const
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage
  }),
})