import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/hooks/useWallet"
import { useToast } from "@/hooks/use-toast"
import { Wallet, Smartphone, Shield, Globe, Zap, Check, Link, Download, ExternalLink, AlertCircle } from "lucide-react"
import { supportedWallets } from "@/lib/wallet-config"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
    color: 'hsl(39, 100%, 57%)',
    downloadUrl: 'https://metamask.io/download/',
    available: () => typeof window !== 'undefined' && window.ethereum?.isMetaMask
  },
  {
    id: 'trust',
    name: 'Trust Wallet',
    description: 'Secure mobile-first wallet',
    icon: Smartphone,
    features: ['Mobile App', 'DApp Browser', 'Staking'],
    recommended: false,
    color: 'hsl(214, 100%, 59%)',
    downloadUrl: 'https://trustwallet.com/download',
    available: () => typeof window !== 'undefined' && window.ethereum?.isTrust
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    description: 'Self-custody wallet by Coinbase',
    icon: Globe,
    features: ['User Friendly', 'Recovery Phrase', 'DeFi Integration'],
    recommended: false,
    color: 'hsl(214, 100%, 50%)',
    downloadUrl: 'https://wallet.coinbase.com/',
    available: () => typeof window !== 'undefined' && window.ethereum?.isCoinbaseWallet
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    description: 'Connect any wallet via QR code',
    icon: Link,
    features: ['Universal', 'QR Code', 'Mobile Support'],
    recommended: false,
    color: 'hsl(214, 73%, 53%)',
    downloadUrl: null,
    available: () => true // Always available as fallback
  },
  {
    id: 'safe',
    name: 'Safe Wallet',
    description: 'Multi-signature security',
    icon: Shield,
    features: ['Multi-Sig', 'Enterprise', 'Team Management'],
    recommended: false,
    color: 'hsl(142, 71%, 45%)',
    downloadUrl: 'https://safe.global/wallet',
    available: () => typeof window !== 'undefined' && window.ethereum?.isSafe
  },
  {
    id: 'phantom',
    name: 'Phantom',
    description: 'Popular wallet with multi-chain support',
    icon: Zap,
    features: ['Multi-Chain', 'NFT Support', 'Swap Features'],
    recommended: false,
    color: 'hsl(271, 91%, 65%)',
    downloadUrl: 'https://phantom.app/',
    available: () => typeof window !== 'undefined' && window.ethereum?.isPhantom
  }
]

export function WalletSelection({ isOpen, onClose }: WalletSelectionProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)
  const [walletAvailability, setWalletAvailability] = useState<Record<string, boolean>>({})
  const { connectWallet, hooksLoaded } = useWallet()
  const { toast } = useToast()

  useEffect(() => {
    // Check wallet availability
    const checkAvailability = () => {
      const availability: Record<string, boolean> = {}
      wallets.forEach(wallet => {
        availability[wallet.id] = wallet.available()
      })
      setWalletAvailability(availability)
    }

    checkAvailability()
    // Recheck when window regains focus (user might have installed a wallet)
    const handleFocus = () => checkAvailability()
    window.addEventListener('focus', handleFocus)
    
    return () => window.removeEventListener('focus', handleFocus)
  }, [isOpen])

  const handleConnect = async (walletId: string) => {
    const wallet = wallets.find(w => w.id === walletId)
    if (!wallet) return

    // Check if wallet is available
    if (!walletAvailability[walletId] && wallet.downloadUrl) {
      // Offer to download the wallet
      toast({
        title: "Wallet Not Found",
        description: `${wallet.name} is not installed. Redirecting to download page...`,
        variant: "destructive"
      })
      window.open(wallet.downloadUrl, '_blank')
      return
    }

    setIsConnecting(true)
    setSelectedWallet(walletId)
    
    try {
      if (!hooksLoaded) {
        throw new Error('Wallet system not available')
      }
      
      await connectWallet()
      
      toast({
        title: "Wallet Connected!",
        description: `Successfully connected to ${wallet.name}`,
      })
      
      onClose()
    } catch (error: any) {
      console.error('Wallet connection failed:', error)
      
      let errorMessage = "Failed to connect to wallet. Please try again."
      
      // Handle specific error cases
      if (error.code === 4001) {
        errorMessage = "Connection rejected by user."
      } else if (error.code === -32002) {
        errorMessage = "Connection request already pending. Please check your wallet."
      } else if (error.message?.includes('User rejected')) {
        errorMessage = "Connection was cancelled."
      }
      
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsConnecting(false)
      setSelectedWallet(null)
    }
  }

  const handleDownload = (downloadUrl: string, walletName: string) => {
    window.open(downloadUrl, '_blank')
    toast({
      title: "Download Started",
      description: `Opening ${walletName} download page...`,
    })
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
            const isAvailable = walletAvailability[wallet.id]
            
            return (
              <Card 
                key={wallet.id} 
                className={`transition-all hover:shadow-md ${
                  isSelected ? 'ring-2 ring-primary' : ''
                } ${isLoading ? 'opacity-50' : ''} ${
                  !isAvailable ? 'opacity-75' : 'cursor-pointer'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full ${
                        isAvailable ? 'bg-primary/10' : 'bg-muted/50'
                      } flex items-center justify-center relative`}>
                        <Icon className={`w-6 h-6 ${
                          isAvailable ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                        {!isAvailable && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{wallet.name}</h3>
                          {wallet.recommended && (
                            <Badge variant="secondary" className="text-xs">Recommended</Badge>
                          )}
                          {!isAvailable && (
                            <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                              Not Installed
                            </Badge>
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
                      ) : isAvailable ? (
                        <Button 
                          size="sm" 
                          disabled={isConnecting}
                          onClick={() => handleConnect(wallet.id)}
                        >
                          {isSelected ? <Check className="w-4 h-4" /> : 'Connect'}
                        </Button>
                      ) : wallet.downloadUrl ? (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDownload(wallet.downloadUrl!, wallet.name)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Install
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          disabled
                          variant="secondary"
                        >
                          Unavailable
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
        
        <Alert className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>New to Web3?</strong> We recommend starting with MetaMask - it's the most popular and user-friendly option.
            Don't have any wallet? Click "Install" to download one for free.
          </AlertDescription>
        </Alert>
        
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-4">
          <Shield className="w-4 h-4" />
          <span>Your wallet data is encrypted and secure</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}