import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, Shield, Zap, Users, ChevronRight, Star, Play } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const FloatingBubble = ({ delay = 0, size = "w-8 h-8" }: { delay?: number; size?: string }) => (
  <div 
    className={`${size} rounded-full gradient-primary opacity-20 absolute animate-float shadow-glow`}
    style={{ animationDelay: `${delay}s` }}
  />
);

const testimonials = [
  {
    name: "Alex Chen",
    role: "DAO Treasurer",
    organization: "DeFi Protocol",
    content: "Reduced our cross-chain payment processing time by 90%. The voice approval feature is a game-changer for our weekly contributor payouts.",
    rating: 5,
    avatar: "AC"
  },
  {
    name: "Maria Rodriguez", 
    role: "Operations Lead",
    organization: "Web3 Startup",
    content: "Finally, a solution that handles multi-chain payments seamlessly. Our contributors love the instant notifications and transparent audit trail.",
    rating: 5,
    avatar: "MR"
  },
  {
    name: "David Kim",
    role: "Finance Director", 
    organization: "Crypto Fund",
    content: "The admin panel makes managing 50+ contributors across 6 chains effortless. Voice approvals save us hours every week.",
    rating: 5,
    avatar: "DK"
  }
];

const companies = [
  "Uniswap", "Aave", "Compound", "Maker", "Chainlink", "Polygon", "Arbitrum", "Optimism"
];

const features = [
  {
    icon: Coins,
    title: "Multi-Chain Payments",
    description: "Pay contributors in ETH, BTC, stablecoins across any supported chain from a single treasury."
  },
  {
    icon: Shield,
    title: "Voice-Enabled Security",
    description: "Approve high-value payments with voice commands. Complete audit trail with optional voice transcripts."
  },
  {
    icon: Zap,
    title: "Instant Settlement",
    description: "ZetaChain omnichain messaging ensures fast, secure cross-chain settlement in seconds."
  },
  {
    icon: Users,
    title: "DAO-Native Design",
    description: "Built for DAOs and remote teams with multi-sig support, role-based access, and contributor reputation."
  }
];

export default function LandingPage() {
  const [selectedDemo, setSelectedDemo] = useState("contributor");

  return (
    <div className="min-h-screen">
      {/* Animated Background Bubbles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <FloatingBubble delay={0} size="w-12 h-12" />
        <FloatingBubble delay={2} size="w-6 h-6" />
        <FloatingBubble delay={4} size="w-8 h-8" />
        <FloatingBubble delay={1} size="w-10 h-10" />
        <FloatingBubble delay={3} size="w-4 h-4" />
        <div className="absolute top-1/4 left-1/4 w-12 h-12 rounded-full gradient-primary opacity-10 animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-3/4 right-1/4 w-8 h-8 rounded-full gradient-primary opacity-15 animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 left-3/4 w-6 h-6 rounded-full gradient-primary opacity-20 animate-float" style={{ animationDelay: '5s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-4 border-b border-border/50 backdrop-blur-sm bg-background/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold">Omnichain Payroll</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#demo" className="text-muted-foreground hover:text-foreground transition-colors">Demo</a>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
            <Button variant="outline">Connect Wallet</Button>
            <Button className="gradient-primary text-white">
              Launch App <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge className="bg-accent text-accent-foreground">
                🚀 Now live on ZetaChain Mainnet
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Cross-Chain Payroll 
                <span className="text-primary"> Made Simple</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Enable DAOs and remote teams to pay contributors across multiple chains 
                from a single treasury with voice-enabled admin approvals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="gradient-primary text-white shadow-glow">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
                <Button size="lg" variant="outline">
                  Connect Wallet
                </Button>
              </div>
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Audited Smart Contracts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>Gas Optimized</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Cross-chain payments visualization" 
                className="w-full h-auto rounded-2xl shadow-card"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-20 gradient-subtle">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Built for the Future of Work</h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to manage cross-chain payroll for your DAO or remote team
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-card hover:shadow-glow transition-shadow duration-300">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mx-auto">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section id="testimonials" className="relative z-10 px-6 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto mb-16 text-center">
          <h2 className="text-4xl font-bold mb-4">Trusted by Leading DAOs</h2>
          <p className="text-xl text-muted-foreground">
            See what our users are saying about their payroll transformation
          </p>
        </div>
        
        <div className="relative">
          <div className="flex animate-slide-right space-x-8">
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <Card key={index} className="flex-shrink-0 w-96 shadow-card">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-foreground leading-relaxed">"{testimonial.content}"</p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role} • {testimonial.organization}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Companies Marquee */}
      <section className="relative z-10 py-16 border-t border-border/50">
        <div className="mb-8 text-center">
          <p className="text-muted-foreground">Trusted by teams at</p>
        </div>
        <div className="overflow-hidden">
          <div className="flex animate-slide-left space-x-12 items-center">
            {[...companies, ...companies].map((company, index) => (
              <div key={index} className="flex-shrink-0">
                <span className="text-2xl font-semibold text-muted-foreground">{company}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20 gradient-primary text-white">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold">Ready to Transform Your Payroll?</h2>
          <p className="text-xl opacity-90">
            Join hundreds of DAOs already using Omnichain Payroll for seamless cross-chain payments
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-border/50">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 Omnichain Payroll DAO. Built on ZetaChain.</p>
        </div>
      </footer>
    </div>
  );
}