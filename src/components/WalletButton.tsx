import { Button } from "@/components/ui/button"
import { Wallet, LogOut } from "lucide-react"
import { useWallet } from "@/hooks/useWallet"
import { Badge } from "@/components/ui/badge"

interface WalletButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function WalletButton({ variant = "outline", size = "sm", className }: WalletButtonProps) {
  const { isConnected, isConnecting, connectWallet, disconnectWallet, formatAddress } = useWallet()

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          {formatAddress}
        </Badge>
        <Button 
          variant="ghost" 
          size={size}
          onClick={disconnectWallet}
          className={className}
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
      onClick={connectWallet}
      disabled={isConnecting}
      className={className}
    >
      <Wallet className="w-4 h-4 mr-2" />
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  )
}