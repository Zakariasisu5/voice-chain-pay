# ZenoPay DAO

A modern, AI-powered cross-chain payroll system built for DAOs and remote teams. ZenoPay enables seamless payments across multiple blockchain networks with intelligent voice-controlled admin approvals powered by Zeno AI.

## Features

### 🚀 Core Features
- **Multi-Chain Payments**: Support for ETH, BTC, USDC, and other tokens across Ethereum, Bitcoin, Polygon, Arbitrum, and more
- **AI-Powered Voice Commands**: Approve high-value payments using intelligent voice recognition with complete audit trails
- **DAO-Native Design**: Built specifically for decentralized organizations with multi-sig support
- **Real-time Dashboard**: Track balances, pending requests, and transaction history across all chains
- **Smart Contract Integration**: Gas-optimized transactions with ZetaChain omnichain messaging

### 🎯 User Interfaces
- **Landing Page**: Modern, animated homepage with feature showcase and testimonials
- **Contributor Dashboard**: Request payouts, track earnings, and manage wallet connections
- **Admin Panel**: Approve/reject requests, monitor treasury, and manage voice commands
- **Zeno AI Assistant**: Intelligent chatbot with context-aware responses, voice commands, and smart suggestions

### 🔧 Technical Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: Radix UI + Tailwind CSS + shadcn/ui
- **State Management**: React Query for server state
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React
- **Notifications**: Sonner + React Hot Toast

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd zenopay
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:8080`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components (shadcn/ui)
│   ├── LandingPage.tsx # Homepage with features and testimonials
│   ├── AdminPanel.tsx  # Admin interface for managing payouts
│   ├── ContributorDashboard.tsx # Contributor interface
│   ├── Navigation.tsx  # Main navigation component
│   └── ChatBot.tsx     # AI assistant chatbot
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── assets/             # Static assets
```

## Key Features Explained

### Zeno AI Assistant
The intelligent chatbot provides context-aware assistance with:
- **Smart Responses**: AI-powered understanding of user intent
- **Voice Commands**: Natural language processing for payment approvals
- **Suggestions**: Proactive help with relevant questions and actions
- **Multi-modal Interface**: Text and voice interaction capabilities

### Multi-Chain Support
The system supports payments across multiple blockchain networks:
- **Ethereum**: ETH, ERC-20 tokens
- **Bitcoin**: BTC payments
- **Polygon**: USDC, MATIC
- **Arbitrum**: ARB tokens
- **Optimism**: OP tokens

### Wallet Integration
- Connect multiple wallet types (MetaMask, WalletConnect, etc.)
- Address validation for different chain formats
- Real-time balance tracking across chains

## Design System

The application uses a custom design system with:
- **Dark Theme**: Default dark mode with navy backgrounds
- **Primary Colors**: Orange gradient (#FF6B35 to #FFD700)
- **Typography**: Inter font family
- **Animations**: Floating bubbles, sliding carousels, smooth transitions
- **Shadows**: Glow effects and card shadows

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Open an issue on GitHub
- Use the built-in chatbot for assistance
- Check the documentation in the `/docs` folder

---

Built with ❤️ and powered by Zeno AI for the decentralized future of work.
