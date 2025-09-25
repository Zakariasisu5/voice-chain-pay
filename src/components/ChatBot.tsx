import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Bot, 
  User, 
  Wallet, 
  CreditCard,
  HelpCircle,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  quickActions?: string[];
}

const initialMessages: Message[] = [
  {
    id: '1',
    type: 'bot',
    content: "👋 Hi! I'm your Omnichain Payroll assistant. I can help you with wallet connections, payout requests, and voice commands. What can I help you with today?",
    timestamp: new Date(),
    quickActions: ['Connect Wallet', 'Request Payout', 'Check Balance', 'Voice Commands']
  }
];

const quickResponses = {
  'Connect Wallet': "I'll help you connect your wallet. Please click the 'Connect Wallet' button in the top right corner and select your preferred wallet provider (MetaMask, WalletConnect, etc.).",
  'Request Payout': "To request a payout: 1) Go to your Contributor Dashboard, 2) Fill out the payout form with amount, token, and chain, 3) Add your wallet address, 4) Submit for admin approval.",
  'Check Balance': "You can view your balances across all chains in the Contributor Dashboard. Your total portfolio value and individual chain balances are displayed at the top.",
  'Voice Commands': "Voice commands are available for admins! Try saying: 'Approve 0.5 ETH to Alice on Ethereum' or 'Reject payment request REQ-003'. Make sure to enable microphone permissions first."
};

const voiceIntents = [
  "Approve [amount] [token] to [contributor] on [chain]",
  "Reject payment request [request-id]", 
  "Show treasury balance for [chain]",
  "List pending requests",
  "Export audit log"
];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (content: string, type: 'user' | 'bot', quickActions?: string[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      quickActions
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    addMessage(userMessage, 'user');
    setInputValue('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      let botResponse = "I understand you're asking about: '" + userMessage + "'. ";
      let actions: string[] = [];

      // Simple intent matching
      if (userMessage.toLowerCase().includes('wallet')) {
        botResponse = quickResponses['Connect Wallet'];
        actions = ['Connect Wallet'];
      } else if (userMessage.toLowerCase().includes('payout') || userMessage.toLowerCase().includes('payment')) {
        botResponse = quickResponses['Request Payout'];
        actions = ['Request Payout', 'Check Status'];
      } else if (userMessage.toLowerCase().includes('balance')) {
        botResponse = quickResponses['Check Balance'];
        actions = ['Check Balance'];
      } else if (userMessage.toLowerCase().includes('voice')) {
        botResponse = quickResponses['Voice Commands'] + "\n\nSupported voice commands:\n" + voiceIntents.map(intent => `• "${intent}"`).join('\n');
        actions = ['Try Voice Command'];
      } else if (userMessage.toLowerCase().includes('approve') && userMessage.toLowerCase().includes('eth')) {
        botResponse = "I've processed your voice command to approve an ETH payment. The request has been forwarded to the smart contract for execution. You should see the transaction confirmation shortly.";
        actions = ['View Transaction', 'Check Audit Log'];
      } else {
        botResponse += "Here are some things I can help you with:";
        actions = ['Connect Wallet', 'Request Payout', 'Voice Commands', 'Treasury Info'];
      }

      setIsTyping(false);
      addMessage(botResponse, 'bot', actions);
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickAction = (action: string) => {
    if (quickResponses[action as keyof typeof quickResponses]) {
      addMessage(action, 'user');
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addMessage(quickResponses[action as keyof typeof quickResponses], 'bot');
      }, 800);
    } else {
      // Handle other actions
      addMessage(action, 'user');
      setIsTyping(true);
      
      setTimeout(() => {
        let response = "";
        switch (action) {
          case 'Check Status':
            response = "Your recent payout requests: REQ-003 (Pending), REQ-002 (Approved), REQ-001 (Completed). Would you like details on any specific request?";
            break;
          case 'Try Voice Command':
            response = "Great! Click the microphone button and try saying something like 'Show me pending requests' or 'Approve payment to Alice'. Make sure your microphone is enabled.";
            break;
          case 'View Transaction':
            response = "Transaction submitted! Hash: 0xabc123...def789. You can view it on the blockchain explorer. Estimated confirmation time: 2-3 minutes.";
            break;
          case 'Check Audit Log':
            response = "Recent admin actions: Payment approved for Alice (0.5 ETH), Request rejected for Bob (insufficient docs), Treasury transfer to Polygon (10,000 USDC).";
            break;
          case 'Treasury Info':
            response = "Current treasury status: $1.5M total value across 4 chains. Largest holdings: 125.5 ETH ($293K), 15.8 BTC ($687K), 500K USDC. All balances updated in real-time.";
            break;
          default:
            response = "I'm still learning about that feature. Is there something specific about Omnichain Payroll I can help you with?";
        }
        setIsTyping(false);
        addMessage(response, 'bot');
      }, 1000);
    }
  };

  const startVoiceRecording = () => {
    setIsListening(true);
    toast({
      title: "Voice Recording Started 🎤",
      description: "Listening for your command..."
    });

    // Simulate voice recognition
    setTimeout(() => {
      setIsListening(false);
      const voiceCommand = "Approve 0.5 ETH to Alice on Ethereum";
      addMessage(`🎤 "${voiceCommand}"`, 'user');
      
      setTimeout(() => {
        addMessage(
          "Voice command processed! I've interpreted your request to approve 0.5 ETH payment to Alice on Ethereum. This action requires admin privileges. Would you like me to execute this approval?",
          'bot',
          ['Execute Approval', 'Cancel', 'Modify Request']
        );
      }, 1000);
    }, 3000);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full gradient-primary text-white shadow-glow z-50 hover:shadow-xl transition-all duration-200"
        size="lg"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col border-primary/20">
      <CardHeader className="pb-3 gradient-primary text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5" />
            <CardTitle className="text-lg font-bold">Payroll Assistant</CardTitle>
          </div>
          <Button
            variant="ghost" 
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2 text-sm opacity-90 font-semibold">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span>Online • Voice-enabled</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 px-4 py-2 max-h-[400px]">
          <div className="space-y-4 pr-2">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`flex items-center space-x-2 mb-1 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.type === 'bot' ? (
                      <Bot className="w-4 h-4 text-primary" />
                    ) : (
                      <User className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-xs text-muted-foreground font-semibold">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className={`p-3 rounded-lg whitespace-pre-line font-semibold shadow-sm ${
                    message.type === 'user' 
                      ? 'bg-primary text-primary-foreground ml-6 shadow-glow' 
                      : 'bg-muted mr-6 border border-border/50'
                  }`}>
                    {message.content}
                  </div>
                  {message.quickActions && (
                    <div className="flex flex-wrap gap-2 mt-2 mr-6">
                      {message.quickActions.map((action, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-xs font-semibold border-primary/30 hover:border-primary transition-all duration-200 hover:shadow-sm"
                          onClick={() => handleQuickAction(action)}
                        >
                          {action}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4 text-primary" />
                  <div className="bg-muted p-3 rounded-lg border border-border/50">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border/50 bg-card/50">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about wallets, payouts, or use voice..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="pr-12 font-semibold border-border/50 focus:border-primary/50 bg-background/50"
              />
              <Button
                variant="ghost"
                size="sm"
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${
                  isListening 
                    ? 'text-red-500 animate-pulse bg-red-500/10' 
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                }`}
                onClick={startVoiceRecording}
                disabled={isListening}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
            </div>
            <Button 
              onClick={handleSendMessage} 
              size="sm" 
              className="gradient-primary text-white shadow-glow hover:shadow-xl transition-shadow duration-200"
              disabled={!inputValue.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-center mt-3 space-x-4 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1 px-2 py-1 rounded-md bg-primary/5 border border-primary/10">
              <Wallet className="w-3 h-3 text-primary" />
              <span className="font-semibold">Wallet</span>
            </div>
            <div className="flex items-center space-x-1 px-2 py-1 rounded-md bg-accent/5 border border-accent/10">
              <CreditCard className="w-3 h-3 text-accent" />
              <span className="font-semibold">Payouts</span>
            </div>
            <div className="flex items-center space-x-1 px-2 py-1 rounded-md bg-green-500/5 border border-green-500/10">
              <Mic className="w-3 h-3 text-green-500" />
              <span className="font-semibold">Voice</span>
            </div>
            <div className="flex items-center space-x-1 px-2 py-1 rounded-md bg-blue-500/5 border border-blue-500/10">
              <HelpCircle className="w-3 h-3 text-blue-500" />
              <span className="font-semibold">Help</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}