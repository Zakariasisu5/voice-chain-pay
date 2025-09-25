import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Settings,
  Zap,
  Shield,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Brain,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  quickActions?: string[];
  isTyping?: boolean;
  suggestions?: string[];
  data?: any;
}

const initialMessages: Message[] = [
  {
    id: '1',
    type: 'bot',
    content: "👋 Hi! I'm Zeno, your AI-powered ZenoPay assistant! I can help you with:\n\n🔗 **Wallet Management** - Connect and manage multi-chain wallets\n💰 **Payout Requests** - Submit and track payment requests\n🎤 **Voice Commands** - Control payments with natural speech\n📊 **Analytics** - Get insights on your treasury and transactions\n\nWhat would you like to explore today?",
    timestamp: new Date(),
    quickActions: ['Connect Wallet', 'Request Payout', 'Check Balance', 'Voice Commands'],
    suggestions: ['How do I connect my wallet?', 'Show me my recent transactions', 'What voice commands are available?', 'Help me request a payout']
  }
];

const quickResponses = {
  'Connect Wallet': "🔗 **Wallet Connection Guide:**\n\n1. Click 'Connect Wallet' in the top navigation\n2. Choose your preferred wallet:\n   • MetaMask (Ethereum, Polygon, Arbitrum)\n   • WalletConnect (Multi-chain support)\n   • Coinbase Wallet\n   • Trust Wallet\n\n3. Approve the connection in your wallet\n4. Your addresses will be automatically detected across all supported chains\n\n✅ **Security:** All connections are encrypted and your private keys never leave your device.",
  'Request Payout': "💰 **Payout Request Process:**\n\n1. Navigate to your Contributor Dashboard\n2. Fill out the payout form:\n   • Amount and token type\n   • Target blockchain network\n   • Your wallet address\n   • Description of work\n\n3. Submit for admin approval\n4. Track status in real-time\n\n📋 **Supported Tokens:** ETH, BTC, USDC, USDT, ARB, OP\n🌐 **Supported Chains:** Ethereum, Bitcoin, Polygon, Arbitrum, Optimism",
  'Check Balance': "📊 **Balance Overview:**\n\nYour portfolio is displayed in the Contributor Dashboard:\n• **Total Value:** $32,592.50 across all chains\n• **Ethereum:** 2.5 ETH ($5,847.50)\n• **Polygon:** 15,000 USDC ($15,000.00)\n• **Bitcoin:** 0.25 BTC ($10,875.00)\n• **Arbitrum:** 500 ARB ($875.00)\n\n💡 **Pro Tip:** Balances update in real-time and include pending transactions.",
  'Voice Commands': "🎤 **Voice Command Features:**\n\n**For Contributors:**\n• 'Request payout of [amount] [token]'\n• 'Check my balance on [chain]'\n• 'Show recent transactions'\n\n**For Admins:**\n• 'Approve [amount] [token] to [contributor]'\n• 'Reject payment request [ID]'\n• 'Show treasury balance'\n• 'List pending requests'\n\n🔧 **Setup:** Enable microphone permissions and speak clearly. Commands are processed using advanced NLP."
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
  const [activeTab, setActiveTab] = useState('chat');
  const [userContext, setUserContext] = useState({
    isWalletConnected: false,
    userRole: 'contributor', // 'contributor' or 'admin'
    recentTransactions: [],
    walletAddresses: []
  });
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // sanitize text to remove markdown-like characters and excessive punctuation
  const sanitize = (text: string) => {
    if (!text) return text;
    // remove common markdown headings (#, >), bold/italic markers (*, **, __), and leading bullets
    let t = text.replace(/^[\s]*[#>]+\s*/gm, '');
    t = t.replace(/[\*_]{1,2}/g, '');
    // remove bullets at line starts (•, -, *)
    t = t.replace(/^[\s]*[•\-\*+]\s*/gm, '');
    // collapse multiple newlines into one
    t = t.replace(/\n{2,}/g, '\n');
    return t.trim();
  };

  const addMessage = (content: string, type: 'user' | 'bot', quickActions?: string[], suggestions?: string[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      quickActions,
      suggestions
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    addMessage(userMessage, 'user');
    setInputValue('');
    setIsTyping(true);

    // Enhanced AI response with context awareness
    setTimeout(() => {
      let botResponse = "";
      let actions: string[] = [];
      let suggestions: string[] = [];

      const message = userMessage.toLowerCase();

      // Enhanced intent matching with context
      if (message.includes('wallet') || message.includes('connect')) {
        botResponse = quickResponses['Connect Wallet'];
        actions = ['Connect Wallet', 'Check Balance'];
        suggestions = ['How secure is wallet connection?', 'What wallets are supported?'];
      } else if (message.includes('payout') || message.includes('payment') || message.includes('request')) {
        botResponse = quickResponses['Request Payout'];
        actions = ['Request Payout', 'Check Status', 'View History'];
        suggestions = ['What tokens can I request?', 'How long does approval take?'];
      } else if (message.includes('balance') || message.includes('portfolio')) {
        botResponse = quickResponses['Check Balance'];
        actions = ['Check Balance', 'View Transactions'];
        suggestions = ['How often are balances updated?', 'Show me my earnings history'];
      } else if (message.includes('voice') || message.includes('speak') || message.includes('command')) {
        botResponse = quickResponses['Voice Commands'];
        actions = ['Try Voice Command', 'Voice Settings'];
        suggestions = ['What languages are supported?', 'How accurate is voice recognition?'];
      } else if (message.includes('approve') && (message.includes('eth') || message.includes('btc') || message.includes('usdc'))) {
        botResponse = "🎤 **Voice Command Processed!**\n\nI've interpreted your approval command and forwarded it to the smart contract. The transaction is being processed on the blockchain.\n\n📋 **Details:**\n• Amount: Detected from voice\n• Token: Auto-detected\n• Recipient: Identified from context\n• Status: Processing...\n\n⏱️ **Estimated confirmation:** 2-3 minutes";
        actions = ['View Transaction', 'Check Audit Log', 'Monitor Status'];
        suggestions = ['How do I track this transaction?', 'What if the transaction fails?'];
      } else if (message.includes('help') || message.includes('support')) {
        botResponse = "🤖 **Zeno AI Assistant Help**\n\nI'm here to help you with ZenoPay! Here's what I can do:\n\n🔗 **Wallet Management**\n💰 **Payment Processing**\n🎤 **Voice Commands**\n📊 **Analytics & Insights**\n🔒 **Security & Compliance**\n\nWhat specific area would you like help with?";
        actions = ['Connect Wallet', 'Request Payout', 'Voice Commands', 'Security Info'];
        suggestions = ['How do I get started?', 'What are the fees?', 'Is my data secure?'];
      } else if (message.includes('transaction') || message.includes('history')) {
        botResponse = "📊 **Recent Transaction History**\n\n**Last 7 days:**\n• REQ-003: 0.1 BTC → Alice Johnson (Pending)\n• REQ-002: 1000 USDC → Bob Smith (Completed)\n• REQ-001: 0.5 ETH → Carol White (Completed)\n\n**Total Volume:** $15,847.50\n**Success Rate:** 95.2%\n\n💡 **Insight:** Your payments are processing 23% faster than average!";
        actions = ['View All Transactions', 'Export Report', 'Set Alerts'];
        suggestions = ['How do I track pending payments?', 'Can I get transaction notifications?'];
      } else {
        botResponse = `🤔 **I understand you're asking about:** "${userMessage}"\n\nLet me help you with that! Here are some related topics I can assist with:`;
        actions = ['Connect Wallet', 'Request Payout', 'Voice Commands', 'Get Help'];
        suggestions = ['How do I get started?', 'What features are available?', 'Is there a tutorial?'];
      }

      setIsTyping(false);
      addMessage(botResponse, 'bot', actions, suggestions);
    }, 800 + Math.random() * 1200);
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
      title: "🎤 Voice Recording Started",
      description: "Listening for your command... Speak clearly!"
    });

    // Enhanced voice recognition simulation
    setTimeout(() => {
      setIsListening(false);
      const voiceCommands = [
        "Approve 0.5 ETH to Alice Johnson on Ethereum",
        "Request payout of 1000 USDC to Polygon",
        "Check my balance on Bitcoin",
        "Show me pending requests",
        "Reject payment request REQ-003"
      ];
      const voiceCommand = voiceCommands[Math.floor(Math.random() * voiceCommands.length)];
      
      addMessage(`🎤 **Voice Command:** "${voiceCommand}"`, 'user');
      
      setTimeout(() => {
        let response = "";
        let actions: string[] = [];
        
        if (voiceCommand.includes('Approve')) {
          response = "✅ **Voice Command Processed!**\n\nI've successfully interpreted your approval command:\n• **Action:** Payment Approval\n• **Amount:** 0.5 ETH\n• **Recipient:** Alice Johnson\n• **Network:** Ethereum\n• **Status:** Processing on blockchain\n\n⏱️ **Estimated completion:** 2-3 minutes\n🔗 **Transaction hash:** 0xabc123...def789";
          actions = ['View Transaction', 'Check Audit Log', 'Monitor Status'];
        } else if (voiceCommand.includes('Request')) {
          response = "💰 **Payout Request Created!**\n\nBased on your voice command:\n• **Amount:** 1000 USDC\n• **Network:** Polygon\n• **Status:** Submitted for approval\n• **Request ID:** REQ-004\n\n📋 **Next steps:** Admin will review and approve within 24 hours";
          actions = ['Track Request', 'View History', 'Modify Request'];
        } else if (voiceCommand.includes('Check balance')) {
          response = "📊 **Balance Check Complete!**\n\n**Bitcoin Balance:**\n• **Available:** 0.25 BTC\n• **USD Value:** $10,875.00\n• **Last Updated:** Just now\n• **Pending:** 0.01 BTC\n\n💡 **Insight:** Your BTC holdings have increased 12% this month!";
          actions = ['View All Balances', 'Transaction History', 'Set Alerts'];
        } else if (voiceCommand.includes('pending')) {
          response = "📋 **Pending Requests Found!**\n\n**Current Pending:**\n• REQ-003: 0.1 BTC → Alice Johnson\n• REQ-004: 2000 USDC → Bob Smith\n• REQ-005: 1.5 ETH → Carol White\n\n**Total Pending Value:** $8,871.00\n⏰ **Average Processing Time:** 18 hours";
          actions = ['Review Requests', 'Approve All', 'Export Report'];
        } else if (voiceCommand.includes('Reject')) {
          response = "❌ **Payment Rejected!**\n\n**Request REQ-003 has been rejected:**\n• **Reason:** Insufficient documentation\n• **Amount:** 0.1 BTC\n• **Recipient:** Alice Johnson\n• **Status:** Rejected\n\n📧 **Notification sent to:** alice@example.com";
          actions = ['View Rejection Details', 'Contact Recipient', 'Audit Log'];
        }
        
        addMessage(response, 'bot', actions);
      }, 1500);
    }, 3000);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full zeno-cta shadow-glow z-50"
        size="lg"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col">
  <CardHeader className="pb-3 zeno-chat-header text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Bot className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </div>
            <CardTitle className="text-lg">Zeno AI Assistant</CardTitle>
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
        <div className="flex items-center space-x-2 text-sm opacity-90">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span>Online • AI-Powered • Voice-enabled</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
  <ScrollArea className="flex-1 p-4 zeno-scroll" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`flex items-center space-x-2 mb-1 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.type === 'bot' ? (
                      <Bot className="w-4 h-4 text-primary" />
                    ) : (
                      <User className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className={`p-3 rounded-lg whitespace-pre-line ${
                    message.type === 'user' 
                      ? 'bg-primary text-primary-foreground ml-8' 
                      : 'bg-muted mr-8'
                  }`}>
                    {sanitize(message.content)}
                  </div>
                  {message.quickActions && (
                    <div className="flex flex-wrap gap-2 mt-2 mr-8">
                      {message.quickActions.map((action, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-xs"
                          onClick={() => handleQuickAction(action)}
                        >
                          {action}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {message.suggestions && (
                    <div className="mt-3 mr-8">
                      <p className="text-xs text-muted-foreground mb-2">💡 Suggested questions:</p>
                      <div className="space-y-1">
                        {message.suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            className="block w-full text-left text-xs text-primary hover:text-primary-foreground hover:bg-primary/10 p-2 rounded transition-colors"
                            onClick={() => {
                              setInputValue(suggestion);
                              handleSendMessage();
                            }}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4 text-primary" />
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask Zeno about wallets, payouts, or use voice..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="pr-10"
                disabled={isListening}
              />
              <Button
                variant="ghost"
                size="sm"
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${isListening ? 'text-red-500 animate-pulse' : 'text-muted-foreground'}`}
                onClick={startVoiceRecording}
                disabled={isListening}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
            </div>
            <Button 
              onClick={handleSendMessage} 
              size="sm" 
              className="zeno-cta"
              disabled={!inputValue.trim() || isListening}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Wallet className="w-3 h-3" />
                <span>Wallet</span>
              </div>
              <div className="flex items-center space-x-1">
                <CreditCard className="w-3 h-3" />
                <span>Payouts</span>
              </div>
              <div className="flex items-center space-x-1">
                <Mic className="w-3 h-3" />
                <span>Voice</span>
              </div>
              <div className="flex items-center space-x-1">
                <Brain className="w-3 h-3" />
                <span>AI</span>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Sparkles className="w-3 h-3" />
              <span>Powered by Zeno AI</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}