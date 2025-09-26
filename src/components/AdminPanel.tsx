import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  Shield, 
  Clock, 
  Check, 
  X, 
  AlertTriangle, 
  Mic, 
  MicOff, 
  Search,
  Filter,
  Download,
  Eye,
  Copy,
  ExternalLink,
  TrendingUp,
  Users,
  DollarSign,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { openExplorerTx } from '@/lib/utils';
import { parseApprovalCommand } from '@/lib/voice';
import { approvePayment, logVoiceApproval } from '@/lib/zenopay';
import { useRevealOnScroll } from "@/components/ui/use-in-view";

interface PendingRequest {
  id: string;
  contributor: string;
  amount: string;
  token: string;
  chain: string;
  wallet: string;
  description: string;
  requestedAt: string;
  priority: 'low' | 'medium' | 'high';
  estimatedValue: string;
}

interface AuditLog {
  id: string;
  action: string;
  admin: string;
  amount: string;
  token: string;
  contributor: string;
  timestamp: string;
  voiceTranscript?: string;
  txHash?: string;
  chain?: string;
}

interface TreasuryBalance {
  chain: string;
  token: string;
  balance: string;
  usdValue: string;
  lockedAmount: string;
}

const mockPendingRequests: PendingRequest[] = [
  {
    id: "REQ-003",
    contributor: "Alice Johnson",
    amount: "0.1",
    token: "BTC",
    chain: "Bitcoin",
    wallet: "bc1q...7x8m",
    description: "Security audit and testing",
    requestedAt: "2024-01-22T14:30:00Z",
    priority: "high",
    estimatedValue: "$4,350"
  },
  {
    id: "REQ-004",
    contributor: "Bob Smith",
    amount: "2000",
    token: "USDC",
    chain: "Polygon",
    wallet: "0x891f...2e3d",
    description: "Backend API development",
    requestedAt: "2024-01-22T09:15:00Z",
    priority: "medium",
    estimatedValue: "$2,000"
  },
  {
    id: "REQ-005",
    contributor: "Carol White",
    amount: "1.5",
    token: "ETH",
    chain: "Arbitrum",
    wallet: "0x456b...9f8e",
    description: "Smart contract optimization",
    requestedAt: "2024-01-21T16:45:00Z",
    priority: "low",
    estimatedValue: "$3,521"
  }
];

const mockAuditLogs: AuditLog[] = [
  {
    id: "LOG-001",
    action: "approved",
    admin: "Admin1",
    amount: "1000",
    token: "USDC",
    contributor: "Maria Rodriguez",
    timestamp: "2024-01-22T10:30:00Z",
    voiceTranscript: "Approve one thousand USDC payment to Maria for frontend work",
    txHash: "0xabc123...def456"
  },
  {
    id: "LOG-002", 
    action: "rejected",
    admin: "Admin2",
    amount: "5",
    token: "ETH",
    contributor: "David Kim",
    timestamp: "2024-01-21T15:20:00Z",
    voiceTranscript: "Reject ETH payment - insufficient documentation provided"
  }
];

const mockTreasuryBalances: TreasuryBalance[] = [
  { chain: "Ethereum", token: "ETH", balance: "125.5", usdValue: "293,185.50", lockedAmount: "5.2" },
  { chain: "Bitcoin", token: "BTC", balance: "15.8", usdValue: "687,300.00", lockedAmount: "1.1" },
  { chain: "Polygon", token: "USDC", balance: "500,000", usdValue: "500,000.00", lockedAmount: "12,000" },
  { chain: "Arbitrum", token: "ARB", balance: "25,000", usdValue: "43,750.00", lockedAmount: "2,000" }
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function AdminPanel() {
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  useRevealOnScroll();

  const handleApprove = (requestId: string, voiceCommand?: string) => {
    setIsProcessing(true);
    toast({
      title: "Processing Approval",
      description: `Approving request ${requestId}...`,
    });
    (async () => {
      try {
        const tx = await approvePayment(Number(requestId.replace(/[^0-9]/g, '')));
        toast({ title: 'Payment Approved', description: `Tx: ${tx.hash}` });
        if (voiceCommand) {
          await logVoiceApproval(Number(requestId.replace(/[^0-9]/g, '')), voiceCommand);
        }
      } catch (err: any) {
        toast({ title: 'Error', description: err?.message || String(err), variant: 'destructive' });
      } finally {
        setIsProcessing(false);
      }
    })();
  };

  const handleReject = (requestId: string, reason?: string) => {
    setIsProcessing(true);
    toast({
      title: "Processing Rejection",
      description: `Rejecting request ${requestId}...`,
    });
    
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Payment Rejected", 
        description: `Request ${requestId} has been rejected.`,
        variant: "destructive"
      });
    }, 1000);
  };

  const toggleVoiceRecording = () => {
    setVoiceRecording(!voiceRecording);
    if (!voiceRecording) {
      toast({
        title: "Voice Recording Started",
        description: "Listening for approval commands...",
      });
      // Simulate voice recognition after 3 seconds
      setTimeout(() => {
        setVoiceRecording(false);
        const transcript = "Approve 0.1 BTC to Alice Johnson";
        toast({ title: "Voice Command Detected", description: `Processing: '${transcript}'` });
        const parsed = parseApprovalCommand(transcript);
        if (parsed) {
          // Map recipient name to request id in demo
          const recipientKey = parsed.recipient.toLowerCase();
          let requestId = 'REQ-003';
          if (recipientKey.includes('bob')) requestId = 'REQ-004';
          if (recipientKey.includes('carol')) requestId = 'REQ-005';
          // Auto-approve with transcript
          setTimeout(() => {
            handleApprove(requestId, transcript);
          }, 1000);
        } else {
          toast({ title: 'Could not parse voice command', variant: 'destructive' });
        }
      }, 3000);
    } else {
      toast({
        title: "Voice Recording Stopped",
        description: "Processing voice command...",
      });
    }
  };

  const totalTreasuryValue = mockTreasuryBalances.reduce((sum, balance) => 
    sum + parseFloat(balance.usdValue.replace(/,/g, '')), 0
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="zeno-card p-4 rounded-lg reveal">
          <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">Manage treasury, approve payouts, and monitor activity</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant={voiceRecording ? "destructive" : "outline"}
              onClick={toggleVoiceRecording}
              className={voiceRecording ? "animate-pulse" : ""}
            >
              {voiceRecording ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
              {voiceRecording ? "Stop Recording" : "Voice Commands"}
            </Button>
            <Button className="zeno-cta">
              <Shield className="w-4 h-4 mr-2" />
              Multi-Sig Wallet
            </Button>
          </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="shadow-card reveal">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Treasury</p>
                  <p className="text-2xl font-bold">${totalTreasuryValue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card reveal">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                  <p className="text-2xl font-bold">{mockPendingRequests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card reveal">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Contributors</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card reveal">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Volume</p>
                  <p className="text-2xl font-bold">$127K</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pending Requests</TabsTrigger>
            <TabsTrigger value="treasury">Treasury Overview</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          {/* Pending Requests Tab */}
          <TabsContent value="pending" className="space-y-6">
            <Card className="shadow-card reveal">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Pending Payout Requests</CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                      <Input
                        placeholder="Search requests..."
                        className="pl-10 w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-32">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contributor</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Chain</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockPendingRequests.map((request) => (
                      <TableRow key={request.id} className="reveal">
                        <TableCell className="font-medium">{request.contributor}</TableCell>
                        <TableCell>
                          <div>
                            <span className="font-semibold">{request.amount} {request.token}</span>
                            <div className="text-sm text-muted-foreground">{request.estimatedValue}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{request.chain}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(request.priority)}>{request.priority}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{request.description}</TableCell>
                        <TableCell>{new Date(request.requestedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button 
                              size="sm" 
                              className="bg-green-500 hover:bg-green-600 text-white"
                              onClick={() => handleApprove(request.id)}
                              disabled={isProcessing}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleReject(request.id)}
                              disabled={isProcessing}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Treasury Overview Tab */}
          <TabsContent value="treasury" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Treasury Balances</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {mockTreasuryBalances.map((balance, index) => (
                    <div key={index} className="p-6 border rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{balance.chain}</h3>
                        <Badge variant="outline">{balance.token}</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Available</span>
                          <span className="font-medium">
                            {(parseFloat(balance.balance) - parseFloat(balance.lockedAmount)).toFixed(2)} {balance.token}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Locked</span>
                          <span className="font-medium">{balance.lockedAmount} {balance.token}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total</span>
                          <span className="font-semibold">{balance.balance} {balance.token}</span>
                        </div>
                        <div className="text-lg font-bold text-primary">
                          ${balance.usdValue}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Log Tab */}
          <TabsContent value="audit" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Audit Trail</CardTitle>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAuditLogs.map((log) => (
                    <div key={log.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge className={log.action === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {log.action}
                          </Badge>
                          <span className="font-medium">{log.amount} {log.token}</span>
                          <span className="text-muted-foreground">to {log.contributor}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-muted-foreground">Admin:</span>
                        <span>{log.admin}</span>
                        {log.txHash && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <button className="text-primary hover:underline text-sm flex items-center space-x-2" onClick={() => {
                              const opened = openExplorerTx(log.chain ?? 'Ethereum', log.txHash);
                              if (!opened) toast({ title: 'Explorer unavailable', description: 'No explorer configured for this chain' });
                            }}>
                              <span>{log.txHash}</span>
                              <ExternalLink className="w-4 h-4" />
                            </button>
                            <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard?.writeText(log.txHash || ''); toast({ title: 'Copied', description: 'Tx hash copied' }); }}>
                              <Copy className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>

                      {log.voiceTranscript && (
                        <div className="bg-muted/50 p-3 rounded-md">
                          <div className="flex items-center space-x-2 mb-2">
                            <Mic className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">Voice Transcript</span>
                          </div>
                          <p className="text-sm italic">"{log.voiceTranscript}"</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}