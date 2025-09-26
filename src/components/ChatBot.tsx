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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
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
          <span>Online • AI-Powered • Voice-enabled</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 p-4 zeno-scroll" ref={scrollAreaRef}>
          <div className="space-y-4">
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
                    {sanitize(message.content)}
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
                placeholder="Ask Zeno about wallets, payouts, or use voice..."
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
            import { useState, useRef, useEffect } from "react";
            import { Button } from "@/components/ui/button";
            import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
            import { Input } from "@/components/ui/input";
            import { Badge } from "@/components/ui/badge";
            import { ScrollArea } from "@/components/ui/scroll-area";
            import { MessageCircle, X, Send, Mic, MicOff, Bot, User, Wallet, CreditCard, HelpCircle, Sparkles } from "lucide-react";
            import { useToast } from "@/hooks/use-toast";

            interface Message {
              id: string;
              type: 'user' | 'bot';
              content: string;
              timestamp: Date;
              quickActions?: string[];
              suggestions?: string[];
            }

            const initialMessages: Message[] = [
              {
                id: '1',
                type: 'bot',
                content: "👋 Hi! I'm Zeno, your AI-powered ZenoPay assistant! I can help you with:\n\n🔗 Wallet Management - Connect and manage multi-chain wallets\n💰 Payout Requests - Submit and track payment requests\n🎤 Voice Commands - Control payments with natural speech\n📊 Analytics - Get insights on your treasury and transactions\n\nWhat would you like to explore today?",
                timestamp: new Date(),
                quickActions: ['Connect Wallet', 'Request Payout', 'Check Balance', 'Voice Commands'],
                suggestions: ['How do I connect my wallet?', 'Show me my recent transactions', 'What voice commands are available?', 'Help me request a payout']
              }
            ];

            const quickResponses: Record<string, string> = {
              'Connect Wallet': "🔗 Wallet Connection Guide:\n\n1. Click 'Connect Wallet' in the top navigation\n2. Choose your preferred wallet (MetaMask, WalletConnect, Coinbase Wallet)\n3. Approve the connection in your wallet\n\n✅ Security: Your private keys never leave your device.",
              'Request Payout': "💰 Payout Request Process:\n\nFill out the payout form with amount, token, destination, and description. Submit for approval and track status in the dashboard.",
              'Check Balance': "📊 Balance Overview: Your balances appear in the Contributor Dashboard. Balances update in near-real-time.",
              'Voice Commands': "🎤 Voice Commands: Try 'Request payout of 100 USDC' or 'Show pending requests'. Enable microphone permissions to use voice features."
            };

            export default function ChatBot() {
              const [isOpen, setIsOpen] = useState(false);
              const [messages, setMessages] = useState<Message[]>(initialMessages);
              const [inputValue, setInputValue] = useState('');
              const [isListening, setIsListening] = useState(false);
              const [isTyping, setIsTyping] = useState(false);
              const scrollAreaRef = useRef<HTMLDivElement>(null);
              const messagesEndRef = useRef<HTMLDivElement>(null);
              const { toast } = useToast();

              useEffect(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
              }, [messages]);

              const sanitize = (text?: string) => {
                if (!text) return '';
                let t = text.replace(/^\s*[#>]+\s*/gm, '');
                t = t.replace(/[\*_]{1,2}/g, '');
                t = t.replace(/^\s*[•\-\*+]\s*/gm, '');
                t = t.replace(/\n{2,}/g, '\n');
                return t.trim();
              };

              const addMessage = (content: string, type: 'user' | 'bot', quickActions?: string[], suggestions?: string[]) => {
                const m: Message = { id: Date.now().toString(), type, content, timestamp: new Date(), quickActions, suggestions };
                setMessages((s) => [...s, m]);
              };

              const handleSendMessage = () => {
                if (!inputValue.trim()) return;
                const userMessage = inputValue.trim();
                addMessage(userMessage, 'user');
                setInputValue('');
                setIsTyping(true);

                setTimeout(() => {
                  setIsTyping(false);
                  const m = userMessage.toLowerCase();
                  if (m.includes('wallet') || m.includes('connect')) addMessage(quickResponses['Connect Wallet'], 'bot');
                  else if (m.includes('payout') || m.includes('payment')) addMessage(quickResponses['Request Payout'], 'bot');
                  else if (m.includes('balance')) addMessage(quickResponses['Check Balance'], 'bot');
                  else if (m.includes('voice')) addMessage(quickResponses['Voice Commands'], 'bot');
                  else addMessage(`I can help with: Connect Wallet, Request Payout, Check Balance, or Voice Commands. You asked: "${userMessage}"`, 'bot');
                }, 800 + Math.random() * 800);
              };

              const startVoiceRecording = () => {
                setIsListening(true);
                toast({ title: '🎤 Voice Recording Started', description: 'Listening for your command...' });
                setTimeout(() => {
                  setIsListening(false);
                  const samples = ['Approve 0.5 ETH to Alice on Ethereum', 'Request payout of 1000 USDC to Polygon', 'Show pending requests'];
                  const picked = samples[Math.floor(Math.random() * samples.length)];
                  addMessage(`🎤 Voice Command: "${picked}"`, 'user');
                  setTimeout(() => addMessage('Simulated result: processed voice command.', 'bot'), 900);
                }, 2000);
              };

              if (!isOpen) {
                return (
                  <Button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 w-14 h-14 rounded-full gradient-primary text-white shadow-glow z-50 hover:shadow-xl transition-all duration-200" size="lg">
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
                      <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20"><X className="w-4 h-4" /></Button>
                    </div>
                    <div className="flex items-center space-x-2 text-sm opacity-90 font-semibold"><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /><span>Online • AI-Powered • Voice-enabled</span></div>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                    <ScrollArea className="flex-1 p-4 zeno-scroll" ref={scrollAreaRef}>
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                              <div className={`flex items-center space-x-2 mb-1 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {message.type === 'bot' ? <Bot className="w-4 h-4 text-primary" /> : <User className="w-4 h-4 text-muted-foreground" />}
                                <span className="text-xs text-muted-foreground font-semibold">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>

                              <div className={`p-3 rounded-lg whitespace-pre-line font-semibold shadow-sm ${message.type === 'user' ? 'bg-primary text-primary-foreground ml-6 shadow-glow' : 'bg-muted mr-6 border border-border/50'}`}>
                                {sanitize(message.content)}
                              </div>

                              {message.quickActions && (
                                <div className="flex flex-wrap gap-2 mt-2 mr-6">
                                  {message.quickActions.map((action, i) => (
                                    <Badge key={i} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-xs font-semibold border-primary/30 hover:border-primary transition-all duration-200 hover:shadow-sm" onClick={() => { addMessage(action, 'user'); setTimeout(() => addMessage(quickResponses[action] ?? '...', 'bot'), 600); }}>
                                      {action}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {message.suggestions && (
                                <div className="mt-3 mr-8">
                                  <p className="text-xs text-muted-foreground mb-2">💡 Suggested questions:</p>
                                  <div className="space-y-1">
                                    {message.suggestions.map((s, i) => (
                                      <button key={i} className="block w-full text-left text-xs text-primary hover:text-primary-foreground hover:bg-primary/10 p-2 rounded transition-colors" onClick={() => { setInputValue(s); handleSendMessage(); }}>
                                        {s}
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
                          <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Ask Zeno about wallets, payouts, or use voice..." onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} className="pr-12 font-semibold border-border/50 focus:border-primary/50 bg-background/50" />
                          <Button variant="ghost" size="sm" className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${isListening ? 'text-red-500 animate-pulse bg-red-500/10' : 'text-muted-foreground hover:text-primary hover:bg-primary/10'}`} onClick={startVoiceRecording} disabled={isListening}>
                            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                          </Button>
                        </div>
                        <Button onClick={handleSendMessage} size="sm" className="gradient-primary text-white shadow-glow hover:shadow-xl transition-shadow duration-200" disabled={!inputValue.trim()}>
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
                  </div>
