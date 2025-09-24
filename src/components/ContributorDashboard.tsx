import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Wallet, Clock, Check, X, AlertCircle, Send, Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PayoutRequest {
  id: string;
  amount: string;
  token: string;
  chain: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestedAt: string;
  wallet: string;
  description: string;
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
  const { toast } = useToast();

  const handleSubmitRequest = () => {
    if (!payoutForm.amount || !payoutForm.token || !payoutForm.chain || !payoutForm.wallet) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Payout Request Submitted",
      description: `Request for ${payoutForm.amount} ${payoutForm.token} on ${payoutForm.chain} has been submitted for approval.`
    });

    setPayoutForm({
      amount: '',
      token: '',
      chain: '',
      wallet: '',
      description: ''
    });
  };

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
          <Button className="gradient-primary text-white">
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </Button>
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

              <Button onClick={handleSubmitRequest} className="w-full gradient-primary text-white">
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
                        <Button variant="ghost" size="sm">
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
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