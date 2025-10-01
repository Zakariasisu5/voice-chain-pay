import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Shield, Users, CheckCircle, Clock, AlertTriangle, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getMultiSigInfo, getMultiSigOwners, executeMultiSigPayment, checkRequiresMultiSig } from '@/lib/zenopay';
import { useEthersWallet } from '@/hooks/useEthersWallet';

interface PendingTransaction {
  id: string;
  type: 'payment' | 'config';
  description: string;
  amount?: string;
  token?: string;
  recipient?: string;
  requiredSignatures: number;
  currentSignatures: number;
  signers: string[];
  createdAt: string;
  expiresAt: string;
}

const mockPendingTransactions: PendingTransaction[] = [
  {
    id: 'TX-001',
    type: 'payment',
    description: 'Payment to Alice Johnson - Security Audit',
    amount: '0.1',
    token: 'BTC',
    recipient: 'Alice Johnson',
    requiredSignatures: 2,
    currentSignatures: 1,
    signers: ['0x1234...5678'],
    createdAt: '2024-01-22T14:30:00Z',
    expiresAt: '2024-01-25T14:30:00Z'
  },
  {
    id: 'TX-002',
    type: 'config',
    description: 'Update signature threshold to 3',
    requiredSignatures: 3,
    currentSignatures: 2,
    signers: ['0x1234...5678', '0xabcd...efgh'],
    createdAt: '2024-01-21T10:15:00Z',
    expiresAt: '2024-01-24T10:15:00Z'
  }
];

export default function MultiSigPanel() {
  const [multisigInfo, setMultisigInfo] = useState({ multisigAddress: '', threshold: '0' });
  const [owners, setOwners] = useState<{ owners: string[]; threshold: string }>({ owners: [], threshold: '0' });
  const [isLoading, setIsLoading] = useState(true);
  const [processingTx, setProcessingTx] = useState('');
  const { address, isConnected } = useEthersWallet();
  const { toast } = useToast();

  useEffect(() => {
    loadMultiSigData();
  }, []);

  const loadMultiSigData = async () => {
    setIsLoading(true);
    try {
      const [info, ownersInfo] = await Promise.all([
        getMultiSigInfo(),
        getMultiSigOwners()
      ]);
      setMultisigInfo(info);
      
      // Handle the case where getMultiSigOwners might return an empty array or the expected object
      if (Array.isArray(ownersInfo)) {
        setOwners({ owners: ownersInfo, threshold: '0' });
      } else {
        setOwners(ownersInfo);
      }
    } catch (error) {
      console.error('Error loading multisig data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load multi-sig wallet data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSign = async (txId: string) => {
    setProcessingTx(txId);
    try {
      // Simulate signing process
      toast({
        title: 'Signing Transaction',
        description: `Signing transaction ${txId}...`
      });

      // In a real implementation, this would interact with the multisig contract
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Transaction Signed',
        description: `Successfully signed transaction ${txId}`
      });
    } catch (error: any) {
      toast({
        title: 'Signing Failed',
        description: error.message || 'Failed to sign transaction',
        variant: 'destructive'
      });
    } finally {
      setProcessingTx('');
    }
  };

  const handleExecute = async (txId: string) => {
    setProcessingTx(txId);
    try {
      // For demo purposes, we'll use the request ID from the transaction
      const requestId = parseInt(txId.replace(/\D/g, '')) || 1;
      
      toast({
        title: 'Executing Transaction',
        description: `Executing multi-sig transaction ${txId}...`
      });

      const tx = await executeMultiSigPayment(requestId);
      
      toast({
        title: 'Transaction Executed',
        description: `Transaction ${txId} executed successfully. Hash: ${tx.hash}`
      });
    } catch (error: any) {
      toast({
        title: 'Execution Failed',
        description: error.message || 'Failed to execute transaction',
        variant: 'destructive'
      });
    } finally {
      setProcessingTx('');
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: 'Copied',
      description: 'Address copied to clipboard'
    });
  };

  const getProgressColor = (current: number, required: number) => {
    const percentage = (current / required) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getStatusBadge = (tx: PendingTransaction) => {
    if (tx.currentSignatures >= tx.requiredSignatures) {
      return <Badge className="bg-green-500 text-white">Ready to Execute</Badge>;
    }
    const remaining = tx.requiredSignatures - tx.currentSignatures;
    return <Badge variant="outline">{remaining} more signature{remaining > 1 ? 's' : ''} needed</Badge>;
  };

  const isOwner = address && owners.owners.includes(address);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Multi-Signature Wallet</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Multi-sig Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-lg md:text-xl">
            <Shield className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <span>Multi-Signature Wallet</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {multisigInfo.multisigAddress ? (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Wallet Address</label>
                  <div className="flex items-center space-x-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded truncate flex-1">
                      {multisigInfo.multisigAddress.slice(0, 10)}...{multisigInfo.multisigAddress.slice(-8)}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyAddress(multisigInfo.multisigAddress)}
                      className="flex-shrink-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">High Value Threshold</label>
                  <div className="text-base md:text-lg font-bold">
                    {parseFloat(multisigInfo.threshold) / 1e18} ETH
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Owners ({owners.owners.length}) - Threshold: {owners.threshold}
                </label>
                <div className="space-y-1">
                  {owners.owners.map((owner, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-muted/50 rounded">
                      <Users className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <code className="text-xs flex-1 truncate">
                        {owner.slice(0, 10)}...{owner.slice(-8)}
                      </code>
                      {owner === address && (
                        <Badge variant="outline" className="text-xs flex-shrink-0">You</Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyAddress(owner)}
                        className="flex-shrink-0 h-8 w-8 p-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {!isOwner && address && (
                <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-yellow-700">
                    You are not an owner of this multi-sig wallet
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No multi-signature wallet configured</p>
              <p className="text-sm">Contact admin to set up multi-sig protection</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Transactions */}
      {multisigInfo.multisigAddress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg md:text-xl">
              <Clock className="w-5 h-5 text-orange-500 flex-shrink-0" />
              <span>Pending Multi-Sig Transactions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mockPendingTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No pending transactions</p>
              </div>
            ) : (
              <div className="space-y-4">
                {mockPendingTransactions.map((tx) => (
                  <div key={tx.id} className="border rounded-lg p-3 md:p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="font-medium text-sm md:text-base">{tx.description}</div>
                        {tx.amount && (
                          <div className="text-xs md:text-sm text-muted-foreground truncate">
                            {tx.amount} {tx.token} → {tx.recipient}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          ID: {tx.id} • {new Date(tx.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {getStatusBadge(tx)}
                      </div>
                    </div>

                    {/* Signature Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs md:text-sm">
                        <span>Signatures: {tx.currentSignatures}/{tx.requiredSignatures}</span>
                        <span>{Math.round((tx.currentSignatures / tx.requiredSignatures) * 100)}%</span>
                      </div>
                      <Progress
                        value={(tx.currentSignatures / tx.requiredSignatures) * 100}
                        className="h-2"
                      />
                    </div>

                    {/* Signers */}
                    <div className="space-y-1">
                      <div className="text-xs md:text-sm font-medium">Signed by:</div>
                      <div className="space-y-1">
                        {tx.signers.map((signer, index) => (
                          <div key={index} className="flex items-center space-x-2 text-xs">
                            <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                            <code className="truncate">{signer.slice(0, 15)}...{signer.slice(-8)}</code>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    {isOwner && (
                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        {tx.currentSignatures < tx.requiredSignatures && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSign(tx.id)}
                            disabled={processingTx === tx.id}
                            className="text-xs md:text-sm"
                          >
                            Sign Transaction
                          </Button>
                        )}
                        {tx.currentSignatures >= tx.requiredSignatures && (
                          <Button
                            size="sm"
                            onClick={() => handleExecute(tx.id)}
                            disabled={processingTx === tx.id}
                            className="bg-green-500 hover:bg-green-600 text-white text-xs md:text-sm"
                          >
                            Execute Transaction
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}