import { Button } from "@/components/ui/button"
import { Wallet, LogOut, ChevronDown } from "lucide-react"
import { useWallet } from "@/hooks/useWallet"
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
    connector,
    hooksLoaded
  } = useWallet()
  const { toast } = useToast()

  const handleConnect = async () => {
    try {
      await connectWallet()
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to open wallet selection. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnectWallet()
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected successfully.",
      })
    } catch (error) {
      toast({
        title: "Disconnection Failed", 
        description: "Failed to disconnect wallet. Please try again.",
        variant: "destructive"
      })
    }
  }

  if (!hooksLoaded) {
    return (
      <Button 
        variant={variant} 
        size={size}
        disabled
        className={className}
      >
        <Wallet className="w-4 h-4 mr-2" />
        Loading...
      </Button>
    )
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          <div className="flex flex-col items-start">
            <span className="text-xs font-medium">{formatAddress}</span>
            <span className="text-xs opacity-70">{chainName} • {connector}</span>
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