import { Button } from "@/components/ui/button"
import { Rocket, Wallet, AlertTriangle } from "lucide-react"
import { useEthersWallet } from "@/hooks/useEthersWallet"
import { useToast } from "@/hooks/use-toast"
import { ReactNode } from "react"

interface LaunchAppButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  onLaunch?: () => void
  children?: ReactNode
}

export function LaunchAppButton({ 
  variant = "default", 
  size = "sm", 
  className = "gradient-primary text-white",
  onLaunch,
  children 
}: LaunchAppButtonProps) {
  const { isConnected, isConnecting, connectWallet, isWalletAvailable, chainName } = useEthersWallet()
  const { toast } = useToast()

  const handleLaunch = async () => {
    if (!isWalletAvailable) {
      toast({
        title: "No Wallet Detected",
        description: "Please install MetaMask or another Web3 wallet to access full features.",
        variant: "destructive"
      })
      if (onLaunch) {
        onLaunch() // Allow launching even without wallet
      }
      return
    }

    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to launch the app and access cross-chain features",
        variant: "destructive"
      })
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
      return
    }

    if (onLaunch) {
      onLaunch()
    } else {
      toast({
        title: "Welcome to ZenoPay DAO! 🚀",
        description: `Connected to ${chainName}. You're ready to manage cross-chain payments!`,
      })
    }
  }

  const getButtonContent = () => {
    if (!isWalletAvailable) {
      return (
        <>
          <AlertTriangle className="w-4 h-4 mr-2" />
          Install Wallet
        </>
      )
    }

    if (isConnecting) {
      return (
        <>
          <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Connecting...
        </>
      )
    }

    if (!isConnected) {
      return (
        <>
          <Wallet className="w-4 h-4 mr-2" />
          Connect & Launch
        </>
      )
    }

    return children || (
      <>
        <Rocket className="w-4 h-4 mr-2" />
        Launch App
      </>
    )
  }

  return (
    <Button 
      variant={variant} 
      size={size}
      onClick={handleLaunch}
      disabled={isConnecting}
      className={`${className} transition-all duration-200 hover:scale-105`}
    >
      {getButtonContent()}
    </Button>
  )
}