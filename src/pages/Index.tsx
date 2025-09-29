import { useState } from "react";
import LandingPage from "@/components/LandingPage";
import ContributorDashboard from "@/components/ContributorDashboard";
import EnhancedAdminPanel from "@/components/EnhancedAdminPanel";
import ChatBot from "@/components/ChatBot";
import Navigation from "@/components/Navigation";

const Index = () => {
  const [currentView, setCurrentView] = useState('landing');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'contributor':
        return <ContributorDashboard />;
      case 'admin':
        return <EnhancedAdminPanel />;
      case 'landing':
      default:
        return <LandingPage onViewChange={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      {renderCurrentView()}
      <ChatBot />
    </div>
  );
};

export default Index;
