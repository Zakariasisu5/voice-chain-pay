import { Button } from "@/components/ui/button"
import { Rocket, Wallet, AlertCircle } from "lucide-react"
import { useWallet } from "@/hooks/useWallet"
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
  const { isConnected, isConnecting, connectWallet, hooksLoaded, chainName } = useWallet()
  const { toast } = useToast()

  const handleLaunch = async () => {
    if (!hooksLoaded) {
      toast({
        title: "Wallet System Unavailable",
        description: "Wallet connectivity is not available. Some features may be limited.",
        variant: "default"
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
      } catch (error) {
        console.error('Failed to connect wallet:', error)
      }
      return
    }

    if (onLaunch) {
      onLaunch()
    } else {
      toast({
        title: "Welcome to Omnichain Payroll! 🚀",
        description: `Connected to ${chainName}. You're ready to manage cross-chain payments!`,
      })
    }
  }

  const getButtonContent = () => {
    if (!hooksLoaded) {
      return (
        <>
          <AlertCircle className="w-4 h-4 mr-2" />
          Launch App
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
      disabled={isConnecting || !hooksLoaded}
      className={`${className} transition-all duration-200 hover:scale-105`}
    >
      {getButtonContent()}
    </Button>
  )
}