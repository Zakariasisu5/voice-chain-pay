import { Button } from "@/components/ui/button"
import { Rocket } from "lucide-react"
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
  const { isConnected, connectWallet } = useWallet()
  const { toast } = useToast()

  const handleLaunch = () => {
    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to launch the app",
        variant: "destructive"
      })
      connectWallet()
      return
    }

    if (onLaunch) {
      onLaunch()
    } else {
      toast({
        title: "Welcome to Omnichain Payroll! 🚀",
        description: "You're now connected and ready to manage cross-chain payments",
      })
    }
  }

  return (
    <Button 
      variant={variant} 
      size={size}
      onClick={handleLaunch}
      className={className}
    >
      {children || (
        <>
          <Rocket className="w-4 h-4 mr-2" />
          Launch App
        </>
      )}
    </Button>
  )
}