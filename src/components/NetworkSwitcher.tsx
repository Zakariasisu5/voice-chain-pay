import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SUPPORTED_NETWORKS, CURRENT_NETWORK, isNetworkSupported } from '@/lib/utils';
import { switchToSupportedNetwork } from '@/lib/zenopay';
import { ethers } from 'ethers';

export default function NetworkSwitcher() {
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const { toast } = useToast();

  const expectedNetwork = SUPPORTED_NETWORKS[CURRENT_NETWORK];

  useEffect(() => {
    const checkNetwork = async () => {
      if ((window as any).ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider((window as any).ethereum);
          const network = await provider.getNetwork();
          setCurrentChainId(network.chainId);
          setIsCorrectNetwork(network.chainId === expectedNetwork.chainId);
        } catch (error) {
          console.error('Error checking network:', error);
        }
      }
    };

    checkNetwork();

    // Listen for network changes
    if ((window as any).ethereum) {
      const handleChainChanged = () => {
        checkNetwork();
        window.location.reload(); // Recommended by MetaMask
      };
      (window as any).ethereum.on('chainChanged', handleChainChanged);
      return () => {
        (window as any).ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [expectedNetwork.chainId]);

  const handleSwitchNetwork = async () => {
    setIsSwitching(true);
    try {
      await switchToSupportedNetwork();
      toast({
        title: 'Network Switched',
        description: `Successfully switched to ${expectedNetwork.name}`,
      });
    } catch (error: any) {
      toast({
        title: 'Network Switch Failed',
        description: error.message || 'Failed to switch network',
        variant: 'destructive',
      });
    } finally {
      setIsSwitching(false);
    }
  };

  if (currentChainId === null) {
    return null;
  }

  if (isCorrectNetwork) {
    return (
      <Badge variant="outline" className="flex items-center gap-2">
        <CheckCircle className="w-3 h-3 text-green-500" />
        {expectedNetwork.name}
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="destructive" className="flex items-center gap-2">
        <AlertCircle className="w-3 h-3" />
        Wrong Network
      </Badge>
      <Button
        size="sm"
        variant="outline"
        onClick={handleSwitchNetwork}
        disabled={isSwitching}
      >
        {isSwitching ? 'Switching...' : `Switch to ${expectedNetwork.name}`}
      </Button>
    </div>
  );
}
