import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, VolumeX, Settings, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { parseVoiceCommand, getVoiceCommandHelp, VoiceCommand } from '@/lib/voice';
import { approvePayment, logVoiceApproval, checkRequiresMultiSig, executeMultiSigPayment } from '@/lib/zenopay';

interface VoiceAssistantProps {
  onCommand?: (command: VoiceCommand) => void;
  onApproval?: (requestId: string, transcript: string) => void;
  onRejection?: (requestId: string, reason?: string) => void;
}

export default function VoiceAssistant({ onCommand, onApproval, onRejection }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState<VoiceCommand | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
        toast({
          title: '🎤 Voice Assistant Active',
          description: 'Listening for commands...'
        });
      };
      
      recognition.onresult = (event: any) => {
        const result = event.results[event.results.length - 1];
        const transcript = result.transcript.trim();
        const confidence = result.confidence || 0;
        
        setTranscript(transcript);
        setConfidence(confidence);
        
        if (result.isFinal) {
          handleVoiceCommand(transcript, confidence);
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: 'Voice Recognition Error',
          description: `Error: ${event.error}`,
          variant: 'destructive'
        });
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognition);
    }
  }, []);

  const startListening = () => {
    if (!recognition) {
      // Fallback to simulated voice recognition
      simulateVoiceCommand();
      return;
    }
    
    try {
      recognition.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      simulateVoiceCommand();
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
  };

  const simulateVoiceCommand = () => {
    setIsListening(true);
    toast({
      title: '🎤 Simulated Voice Input',
      description: 'Processing voice command...'
    });

    const sampleCommands = [
      'Approve payment REQ-003',
      'Request 100 USDC to Alice',
      'Check my balance',
      'Show pending requests',
      'Reject payment REQ-004 because insufficient documentation'
    ];

    const randomCommand = sampleCommands[Math.floor(Math.random() * sampleCommands.length)];
    
    setTimeout(() => {
      setTranscript(randomCommand);
      setConfidence(0.95);
      handleVoiceCommand(randomCommand, 0.95);
      setIsListening(false);
    }, 2000);
  };

  const handleVoiceCommand = async (transcript: string, confidence: number) => {
    setIsProcessing(true);
    
    try {
      const command = parseVoiceCommand(transcript);
      setLastCommand(command);

      if (!command) {
        toast({
          title: 'Command Not Recognized',
          description: `Could not understand: "${transcript}". Try "Help" for available commands.`,
          variant: 'destructive'
        });
        return;
      }

      if (confidence < 0.7) {
        toast({
          title: 'Low Confidence',
          description: `Command recognized but confidence is low (${Math.round(confidence * 100)}%). Please try again.`,
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: `Command: ${command.action.toUpperCase()}`,
        description: `Processing: "${transcript}" (${Math.round(confidence * 100)}% confidence)`
      });

      // Execute command based on type
      switch (command.action) {
        case 'approve':
          await handleApproval(command, transcript);
          break;
        case 'reject':
          await handleRejection(command, transcript);
          break;
        case 'request':
          handlePaymentRequest(command);
          break;
        case 'check':
          handleBalanceCheck();
          break;
        case 'list':
          handleListRequests();
          break;
        case 'help':
          setShowHelp(true);
          break;
        default:
          toast({
            title: 'Unknown Command',
            description: `Action "${command.action}" not implemented yet.`
          });
      }

      // Notify parent component
      onCommand?.(command);
      
    } catch (error) {
      console.error('Error processing voice command:', error);
      toast({
        title: 'Command Processing Error',
        description: 'Failed to process voice command',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproval = async (command: VoiceCommand, transcript: string) => {
    try {
      const requestId = command.requestId || '3'; // Default for demo
      const numericId = parseInt(requestId.replace(/\D/g, '')) || 3;

      // Check if multisig is required
      const requiresMultiSig = command.amount ? await checkRequiresMultiSig(command.amount) : false;
      
      if (requiresMultiSig) {
        toast({
          title: 'Multi-sig Required',
          description: 'This payment requires multi-signature approval.'
        });
        await executeMultiSigPayment(numericId);
      } else {
        await approvePayment(numericId);
      }

      await logVoiceApproval(numericId, transcript);
      
      toast({
        title: 'Payment Approved',
        description: `Request ${requestId} approved via voice command`
      });

      onApproval?.(requestId, transcript);
      
    } catch (error: any) {
      toast({
        title: 'Approval Failed',
        description: error.message || 'Failed to approve payment',
        variant: 'destructive'
      });
    }
  };

  const handleRejection = async (command: VoiceCommand, transcript: string) => {
    const requestId = command.requestId || 'current';
    const reason = command.reason || 'Voice command rejection';
    
    toast({
      title: 'Payment Rejected',
      description: `Request ${requestId} rejected: ${reason}`
    });

    onRejection?.(requestId, reason);
  };

  const handlePaymentRequest = (command: VoiceCommand) => {
    toast({
      title: 'Payment Request',
      description: `Request: ${command.amount} ${command.token} to ${command.recipient || 'recipient'}`
    });
  };

  const handleBalanceCheck = () => {
    toast({
      title: 'Balance Check',
      description: 'Opening balance overview...'
    });
  };

  const handleListRequests = () => {
    toast({
      title: 'Pending Requests',
      description: 'Showing pending payment requests...'
    });
  };

  const isVoiceSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="pb-3 px-4 md:px-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base md:text-lg">Voice Assistant</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHelp(!showHelp)}
              className="h-8 w-8 p-0"
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
            {!isVoiceSupported && (
              <Badge variant="outline" className="text-xs">
                Simulated
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 px-4 md:px-6">
        {/* Voice Control */}
        <div className="text-center space-y-3">
          <Button
            variant={isListening ? "destructive" : "default"}
            size="lg"
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
            className={`w-full text-sm md:text-base ${isListening ? 'animate-pulse' : ''}`}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Start Voice Command
              </>
            )}
          </Button>

          {isListening && (
            <div className="text-xs md:text-sm text-muted-foreground animate-pulse">
              🎤 Listening... Speak clearly
            </div>
          )}

          {isProcessing && (
            <div className="text-xs md:text-sm text-muted-foreground animate-pulse">
              ⚙️ Processing command...
            </div>
          )}
        </div>

        {/* Transcript Display */}
        {transcript && (
          <div className="p-3 bg-muted rounded-lg space-y-2">
            <div className="text-xs md:text-sm font-medium">Last Command:</div>
            <div className="text-xs md:text-sm break-words">{transcript}</div>
            {confidence > 0 && (
              <div className="text-xs text-muted-foreground">
                Confidence: {Math.round(confidence * 100)}%
              </div>
            )}
          </div>
        )}

        {/* Last Command Result */}
        {lastCommand && (
          <div className="p-3 bg-primary/5 rounded-lg space-y-2">
            <div className="text-xs md:text-sm font-medium">Recognized Command:</div>
            <Badge variant="outline" className="capitalize text-xs">
              {lastCommand.action}
            </Badge>
            {lastCommand.amount && (
              <div className="text-xs md:text-sm break-words">
                Amount: {lastCommand.amount} {lastCommand.token}
              </div>
            )}
            {lastCommand.recipient && (
              <div className="text-xs md:text-sm break-words">To: {lastCommand.recipient}</div>
            )}
            {lastCommand.chain && (
              <div className="text-xs md:text-sm">Chain: {lastCommand.chain}</div>
            )}
          </div>
        )}

        {/* Help Section */}
        {showHelp && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-xs md:text-sm overflow-x-auto">
            <pre className="whitespace-pre-wrap text-xs">
              {getVoiceCommandHelp()}
            </pre>
          </div>
        )}

        {/* Status */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            {isVoiceSupported ? (
              <Volume2 className="w-3 h-3 text-green-500" />
            ) : (
              <VolumeX className="w-3 h-3 text-orange-500" />
            )}
            <span className="text-xs">
              {isVoiceSupported ? 'Voice Recognition Active' : 'Simulation Mode'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}