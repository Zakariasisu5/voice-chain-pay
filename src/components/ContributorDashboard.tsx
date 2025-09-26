import { useState, useEffect } from "react";
import { useRevealOnScroll } from "@/components/ui/use-in-view";
import { ethers } from 'ethers';
import { connectWallet, getBalance, shortenAddress, isMetaMaskAvailable } from '@/lib/wallet';
import { openExplorerTx } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Wallet, Clock, Check, X, AlertCircle, Send, Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { requestPayment, listenToEvents } from '@/lib/zenopay';

interface PayoutRequest {
  id: string;
  amount: string;
  token: string;
  chain: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestedAt: string;
  wallet: string;
  description: string;
  txHash?: string;
}

interface WalletBalance {
  chain: string;
  token: string;
  balance: string;
  usdValue: string;
}

const mockRequests: PayoutRequest[] = [
  {
    id: "REQ-001",
    amount: "0.5",
    token: "ETH",
    chain: "Ethereum",
    status: "completed",
    txHash: '0x5e1d3b6c9f3a1b2c4d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c',
    requestedAt: "2024-01-15",
    wallet: "0x742d...8c4a",
    description: "Smart contract development - Q1 milestone"
  },
  {
    id: "REQ-002", 
    amount: "1000",
    token: "USDC",
    chain: "Polygon",
    status: "approved",
    requestedAt: "2024-01-20",
    wallet: "0x742d...8c4a",
    description: "Frontend development work"
  },
  {
    id: "REQ-003",
    amount: "0.1",
    token: "BTC",
    chain: "Bitcoin",
    status: "pending",
    requestedAt: "2024-01-22",
    wallet: "bc1q...7x8m",
    description: "Security audit and testing"
  }
];

const mockBalances: WalletBalance[] = [
  { chain: "Ethereum", token: "ETH", balance: "2.5", usdValue: "5,847.50" },
  { chain: "Polygon", token: "USDC", balance: "15,000", usdValue: "15,000.00" },
  { chain: "Bitcoin", token: "BTC", balance: "0.25", usdValue: "10,875.00" },
  { chain: "Arbitrum", token: "ARB", balance: "500", usdValue: "875.00" }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'approved': return 'bg-blue-100 text-blue-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return <Check className="w-4 h-4" />;
    case 'approved': return <Clock className="w-4 h-4" />;
    case 'pending': return <AlertCircle className="w-4 h-4" />;
    case 'rejected': return <X className="w-4 h-4" />;
    default: return <AlertCircle className="w-4 h-4" />;
  }
};

export default function ContributorDashboard() {
  const [payoutForm, setPayoutForm] = useState({
    amount: '',
    token: '',
    chain: '',
    wallet: '',
    description: ''
  });
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletBalance, setWalletBalance] = useState<string | undefined>(undefined);
  const [walletChainId, setWalletChainId] = useState<number | undefined>(undefined);
  const [connector, setConnector] = useState<'injected' | 'walletconnect'>('injected');
  const { toast } = useToast();
  useRevealOnScroll();
  const handleConnectWallet = async () => {
    if (connector === 'injected' && !isMetaMaskAvailable()) {
      toast({ title: 'No Injected Wallet Found', description: 'Install MetaMask or choose WalletConnect.', variant: 'destructive' });
      return;
    }
    try {
      const w = await connectWallet(connector);
      setWalletAddress(w.address);
      setWalletBalance(w.balance);
      setWalletChainId(w.chainId);
      setIsWalletConnected(true);
      toast({ title: 'Wallet Connected', description: `${shortenAddress(w.address)} • ${w.balance} ETH` });
    } catch (err: any) {
      toast({ title: 'Connection Error', description: err?.message || String(err), variant: 'destructive' });
    }
  };

  const handleDisconnect = () => {
    setIsWalletConnected(false);
    setWalletAddress('');
    setWalletBalance(undefined);
    setWalletChainId(undefined);
    toast({ title: 'Wallet Disconnected' });
  };

  const handleSubmitRequest = () => {
    if (!payoutForm.amount || !payoutForm.token || !payoutForm.chain || !payoutForm.wallet) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Validate wallet address format
    const isValidEthAddress = /^0x[a-fA-F0-9]{40}$/.test(payoutForm.wallet);
    const isValidBtcAddress = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(payoutForm.wallet);
    
    if (payoutForm.chain === 'Ethereum' && !isValidEthAddress) {
      toast({
        title: "Invalid Wallet Address",
        description: "Please enter a valid Ethereum address (0x...)",
        variant: "destructive"
      });
      return;
    }

    if (payoutForm.chain === 'Bitcoin' && !isValidBtcAddress) {
      toast({
        title: "Invalid Wallet Address",
        description: "Please enter a valid Bitcoin address",
        variant: "destructive"
      });
      return;
    }

    // Call on-chain requestPayment (amount should be converted to wei for ETH-like tokens)
    (async () => {
      try {
        const amountWei = ethers.utils.parseUnits(payoutForm.amount || '0', 18).toString();
        const tx = await requestPayment(amountWei, 1, payoutForm.wallet); // targetChainId=1 as placeholder
        toast({ title: 'Payout Request Submitted', description: `Tx sent: ${tx.hash}` });
        setPayoutForm({ amount: '', token: '', chain: '', wallet: '', description: '' });
      } catch (err: any) {
        toast({ title: 'Error', description: err?.message || String(err), variant: 'destructive' });
      }
    })();
  };

  // Listen to on-chain events to update UI in real-time
  useEffect(() => {
    const off = listenToEvents((data) => {
      // PaymentRequested event
      console.log('PaymentRequested', data);
    }, (data) => {
      console.log('PayoutSent', data);
    }, (data) => {
      console.log('VoiceApproved', data);
    });
    return () => off();
  }, []);

  // Wallet event listeners (accounts/chain changes)
  useEffect(() => {
    const provider: any = (typeof window !== 'undefined') ? (window as any).ethereum : null;
    if (!provider) return;

    const handleAccounts = async (accounts: string[]) => {
      if (!accounts || accounts.length === 0) {
        handleDisconnect();
        return;
      }
      const address = accounts[0];
      setWalletAddress(address);
      try { setWalletBalance(await getBalance(address)); } catch (e) { /* ignore */ }
      setIsWalletConnected(true);
    };

    const handleChain = async (chainHex: string) => {
      try {
        const chainId = parseInt(chainHex, 16);
        setWalletChainId(chainId);
      } catch (e) {
        setWalletChainId(undefined);
      }
    };

    provider.on && provider.on('accountsChanged', handleAccounts);
    provider.on && provider.on('chainChanged', handleChain);

    return () => {
      provider.removeListener && provider.removeListener('accountsChanged', handleAccounts);
      provider.removeListener && provider.removeListener('chainChanged', handleChain);
    };
  }, []);

  const totalUsdValue = mockBalances.reduce((sum, balance) => sum + parseFloat(balance.usdValue.replace(/,/g, '')), 0);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Contributor Dashboard</h1>
            <p className="text-muted-foreground">Manage your payouts and track earnings across chains</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-muted/40 p-2 rounded-md">
              <button
                className={`text-sm px-3 py-1 rounded ${connector === 'injected' ? 'bg-primary text-white' : ''} ${!isMetaMaskAvailable() ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => isMetaMaskAvailable() && setConnector('injected')}
                disabled={!isMetaMaskAvailable()}
              >Injected</button>
              <button className={`text-sm px-3 py-1 rounded ${connector === 'walletconnect' ? 'bg-primary text-white' : ''}`} onClick={() => setConnector('walletconnect')}>WalletConnect</button>
            </div>
            {!isWalletConnected ? (
              <Button className="zeno-cta" onClick={handleConnectWallet}>
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="px-3 py-2 bg-muted rounded-md text-sm flex items-center space-x-2">
                  <span className="font-medium">{shortenAddress(walletAddress)}</span>
                  <span className="text-xs text-muted-foreground">{walletBalance ? `${parseFloat(walletBalance).toFixed(4)} ETH` : ''}</span>
                  <Badge variant="outline">{walletChainId ?? '—'}</Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard?.writeText(walletAddress); toast({ title: 'Copied', description: 'Address copied to clipboard' }); }}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={handleDisconnect}>Disconnect</Button>
              </div>
            )}
          </div>
        </div>

        {/* Balance Overview */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="md:col-span-1 shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Portfolio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                ${totalUsdValue.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Across all chains</p>
            </CardContent>
          </Card>

          <Card className="md:col-span-3 shadow-card">
            <CardHeader>
              <CardTitle>Chain Balances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {mockBalances.map((balance, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{balance.chain}</span>
                      <Badge variant="outline">{balance.token}</Badge>
                    </div>
                    <div className="text-lg font-semibold">{balance.balance} {balance.token}</div>
                    <div className="text-sm text-muted-foreground">${balance.usdValue}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Request Payout Form */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Send className="w-5 h-5 mr-2 text-primary" />
                Request Payout
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={payoutForm.amount}
                    onChange={(e) => setPayoutForm({...payoutForm, amount: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="token">Token</Label>
                  <Select value={payoutForm.token} onValueChange={(value) => setPayoutForm({...payoutForm, token: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select token" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ETH">ETH</SelectItem>
                      <SelectItem value="BTC">BTC</SelectItem>
                      <SelectItem value="USDC">USDC</SelectItem>
                      <SelectItem value="USDT">USDT</SelectItem>
                      <SelectItem value="ARB">ARB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="chain">Target Chain</Label>
                <Select value={payoutForm.chain} onValueChange={(value) => setPayoutForm({...payoutForm, chain: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select chain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ethereum">Ethereum</SelectItem>
                    <SelectItem value="Bitcoin">Bitcoin</SelectItem>
                    <SelectItem value="Polygon">Polygon</SelectItem>
                    <SelectItem value="Arbitrum">Arbitrum</SelectItem>
                    <SelectItem value="Optimism">Optimism</SelectItem>
                    <SelectItem value="BNB Chain">BNB Chain</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wallet">Wallet Address</Label>
                <Input
                  id="wallet"
                  placeholder="0x... or bc1q..."
                  value={payoutForm.wallet}
                  onChange={(e) => setPayoutForm({...payoutForm, wallet: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="What is this payment for?"
                  value={payoutForm.description}
                  onChange={(e) => setPayoutForm({...payoutForm, description: e.target.value})}
                />
              </div>

              <Button onClick={handleSubmitRequest} className="w-full zeno-cta reveal">
                Submit Request
              </Button>
            </CardContent>
          </Card>

          {/* Payout History */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRequests.map((request, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          {getStatusIcon(request.status)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{request.amount} {request.token}</span>
                            <Badge variant="outline">{request.chain}</Badge>
                            <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{request.description}</p>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                            <span>{request.requestedAt}</span>
                            <span>{request.id}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {/* Copy tx hash (if available) */}
                        <Button variant="ghost" size="sm" onClick={() => {
                          const hash = (request as any).txHash;
                          if (hash) { navigator.clipboard?.writeText(hash); toast({ title: 'Copied', description: 'Tx hash copied to clipboard' }); }
                        }}>
                          <Copy className="w-4 h-4" />
                        </Button>
                        {/* Open tx on explorer */}
                        <Button variant="ghost" size="sm" onClick={() => {
                          const opened = openExplorerTx(request.chain, (request as any).txHash);
                          if (!opened) toast({ title: 'Explorer unavailable', description: 'No explorer configured for this chain' });
                        }}>
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {index < mockRequests.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}