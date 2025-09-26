import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WalletButton } from "@/components/WalletButton";
import { LaunchAppButton } from "@/components/LaunchAppButton";
import { 
  Coins, 
  LayoutDashboard, 
  Shield, 
  Users, 
  Menu, 
  X,
  Bell
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export default function Navigation({ currentView, onViewChange }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  const handleConnectWallet = () => {
    toast({
      title: "Wallet Connection",
      description: "Connecting to your wallet... (Demo mode)",
    });
    // In a real app, this would trigger wallet connection
  };

  const handleLaunchApp = () => {
    toast({
      title: "Launching App",
      description: "Redirecting to the main dashboard...",
    });
    onViewChange('contributor');
  };

  const handleNotifications = () => {
    toast({
      title: "Notifications",
      description: "You have 3 new notifications",
    });
  };

  const navItems = [
    { id: 'landing', label: 'Home', icon: Coins },
    { id: 'contributor', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin', label: 'Admin Panel', icon: Shield }
  ];

  return (
    <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold">ZenoPay</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    currentView === item.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={handleNotifications}>
              <Bell className="w-4 h-4" />
            </Button>
            <WalletButton />
            <LaunchAppButton onLaunch={() => onViewChange('contributor')} />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-2">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onViewChange(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      currentView === item.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 space-y-2">
              <WalletButton variant="outline" className="w-full" />
              <LaunchAppButton
                className="w-full gradient-primary text-white"
                onLaunch={() => {
                  onViewChange('contributor');
                  setIsMobileMenuOpen(false);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}