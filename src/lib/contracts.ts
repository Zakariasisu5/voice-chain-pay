import { ethers } from 'ethers'
import payrollVaultArtifact from '../../smart-contracts/artifacts/contracts/PayrollVault.sol/PayrollVault.json'
import crossChainPayoutArtifact from '../../smart-contracts/artifacts/contracts/CrossChainPayout.sol/CrossChainPayout.json'
import auditTrailArtifact from '../../smart-contracts/artifacts/contracts/AuditTrail.sol/AuditTrail.json'

export const payrollVaultAbi = payrollVaultArtifact.abi as any
export const crossChainPayoutAbi = crossChainPayoutArtifact.abi as any
export const auditTrailAbi = auditTrailArtifact.abi as any

export function getContract(address: string, abi: any, signerOrProvider?: ethers.Signer | ethers.providers.Provider) {
  return new ethers.Contract(address, abi, signerOrProvider ?? ethers.getDefaultProvider())
}

export default {
  payrollVaultAbi,
  crossChainPayoutAbi,
  auditTrailAbi,
  getContract
}
