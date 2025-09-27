import { Button } from "@/components/ui/button"
import { Wallet, LogOut, ChevronDown, AlertTriangle } from "lucide-react"
import { useEthersWallet } from "@/hooks/useEthersWallet"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface WalletButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function WalletButton({ variant = "outline", size = "sm", className }: WalletButtonProps) {
  const { 
    isConnected, 
    isConnecting, 
    connectWallet, 
    disconnectWallet, 
    formatAddress,
    chainName,
    isWalletAvailable
  } = useEthersWallet()
  const { toast } = useToast()

  const handleConnect = async () => {
    if (!isWalletAvailable) {
      toast({
        title: "No Wallet Detected",
        description: "Please install MetaMask or another Web3 wallet to continue.",
        variant: "destructive"
      })
      return
    }
    
    try {
      await connectWallet()
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been connected successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleDisconnect = () => {
    disconnectWallet()
    toast({
      title: "Wallet Disconnected", 
      description: "Your wallet has been disconnected successfully.",
    })
  }

  // Show wallet not available state
  if (!isWalletAvailable) {
    return (
      <Button 
        variant="outline" 
        size={size}
        onClick={handleConnect}
        className={`${className} border-orange-500/30 text-orange-600 hover:bg-orange-500/10`}
      >
        <AlertTriangle className="w-4 h-4 mr-2" />
        No Wallet
      </Button>
    )
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="bg-green-500/10 text-green-700 border-green-500/20 px-3 py-1">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          <div className="flex flex-col items-start">
            <span className="text-xs font-medium">{formatAddress}</span>
            <span className="text-xs opacity-70">{chainName}</span>
          </div>
        </Badge>
        <Button 
          variant="ghost" 
          size={size}
          onClick={handleDisconnect}
          className={`${className} hover:bg-destructive/10 hover:text-destructive`}
          title="Disconnect Wallet"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <Button 
      variant={variant} 
      size={size}
      onClick={handleConnect}
      disabled={isConnecting}
      className={`${className} group`}
    >
      <Wallet className="w-4 h-4 mr-2 group-hover:animate-bounce" />
      {isConnecting ? (
        <>
          <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          Connect Wallet
          <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
        </>
      )}
    </Button>
  )
}