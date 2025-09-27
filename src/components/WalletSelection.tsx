import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/hooks/useWallet"
import { useToast } from "@/hooks/use-toast"
import { Wallet, Smartphone, Shield, Globe, Zap, Check, Link } from "lucide-react"
import { supportedWallets } from "@/lib/wallet-config"

interface WalletSelectionProps {
  isOpen: boolean
  onClose: () => void
}

const wallets = [
  {
    id: 'metamask',
    name: 'MetaMask',
    description: 'Most popular browser extension wallet',
    icon: Wallet,
    features: ['Browser Extension', 'Mobile App', 'Hardware Support'],
    recommended: true,
    color: 'hsl(39, 100%, 57%)'
  },
  {
    id: 'trust',
    name: 'Trust Wallet',
    description: 'Secure mobile-first wallet',
    icon: Smartphone,
    features: ['Mobile App', 'DApp Browser', 'Staking'],
    recommended: false,
    color: 'hsl(214, 100%, 59%)'
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    description: 'Self-custody wallet by Coinbase',
    icon: Globe,
    features: ['User Friendly', 'Recovery Phrase', 'DeFi Integration'],
    recommended: false,
    color: 'hsl(214, 100%, 50%)'
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    description: 'Connect any wallet via QR code',
    icon: Link,
    features: ['Universal', 'QR Code', 'Mobile Support'],
    recommended: false,
    color: 'hsl(214, 73%, 53%)'
  },
  {
    id: 'safe',
    name: 'Safe Wallet',
    description: 'Multi-signature security',
    icon: Shield,
    features: ['Multi-Sig', 'Enterprise', 'Team Management'],
    recommended: false,
    color: 'hsl(142, 71%, 45%)'
  },
  {
    id: 'phantom',
    name: 'Phantom',
    description: 'Popular wallet with multi-chain support',
    icon: Zap,
    features: ['Multi-Chain', 'NFT Support', 'Swap Features'],
    recommended: false,
    color: 'hsl(271, 91%, 65%)'
  }
]

export function WalletSelection({ isOpen, onClose }: WalletSelectionProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)
  const { connectWallet, hooksLoaded } = useWallet()
  const { toast } = useToast()

  const handleConnect = async (walletId: string) => {
    setIsConnecting(true)
    setSelectedWallet(walletId)
    
    try {
      if (!hooksLoaded) {
        throw new Error('Wallet system not available')
      }
      
      await connectWallet()
      
      toast({
        title: "Wallet Connected!",
        description: `Successfully connected to ${wallets.find(w => w.id === walletId)?.name}`,
      })
      
      onClose()
    } catch (error) {
      console.error('Wallet connection failed:', error)
      toast({
        title: "Connection Failed",
        description: "Failed to connect to wallet. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsConnecting(false)
      setSelectedWallet(null)
    }
  }

  if (!hooksLoaded) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Wallet Not Available
            </DialogTitle>
            <DialogDescription>
              Wallet functionality is not available. Please ensure you have the required dependencies installed.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={onClose} variant="outline" className="w-full">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Connect Your Wallet
          </DialogTitle>
          <DialogDescription>
            Choose a wallet to connect to ZenoPay and access cross-chain features
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4">
          {wallets.map((wallet) => {
            const Icon = wallet.icon
            const isSelected = selectedWallet === wallet.id
            const isLoading = isConnecting && isSelected
            
            return (
              <Card 
                key={wallet.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'ring-2 ring-primary' : ''
                } ${isLoading ? 'opacity-50' : ''}`}
                onClick={() => !isConnecting && handleConnect(wallet.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{wallet.name}</h3>
                          {wallet.recommended && (
                            <Badge variant="secondary" className="text-xs">Recommended</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{wallet.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {wallet.features.map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Button size="sm" disabled={isConnecting}>
                          {isSelected ? <Check className="w-4 h-4" /> : 'Connect'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
        
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-4">
          <Shield className="w-4 h-4" />
          <span>Your wallet data is encrypted and secure</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}