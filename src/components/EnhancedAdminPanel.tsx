import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Settings, Mic } from "lucide-react";
import { useRevealOnScroll } from "@/components/ui/use-in-view";
import { useEthersWallet } from "@/hooks/useEthersWallet";
import NetworkSwitcher from "./NetworkSwitcher";
import AdminPanel from "./AdminPanel";
import VoiceAssistant from "./VoiceAssistant";
import MultiSigPanel from "./MultiSigPanel";
import { VoiceCommand } from "@/lib/voice";

export default function EnhancedAdminPanel() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
  const { isConnected } = useEthersWallet();
  useRevealOnScroll();

  const handleVoiceCommand = (command: VoiceCommand) => {
    console.log('Voice command received:', command);
    // Handle voice commands from the assistant
    switch (command.action) {
      case 'approve':
      case 'reject':
        setActiveTab("dashboard");
        break;
      case 'check':
        setActiveTab("dashboard");
        break;
      case 'list':
        setActiveTab("dashboard");
        break;
    }
  };

  const handleApproval = (requestId: string, transcript: string) => {
    console.log(`Approval: ${requestId} - ${transcript}`);
  };

  const handleRejection = (requestId: string, reason?: string) => {
    console.log(`Rejection: ${requestId} - ${reason}`);
  };

  return (
    <div className="min-h-screen bg-background p-3 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Enhanced Header */}
        <div className="zeno-card p-4 rounded-lg reveal">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">ZenoPay Admin Console</h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Advanced treasury management with voice commands and multi-signature security
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {isConnected && <NetworkSwitcher />}
              <Button
                size="sm"
                variant={showVoiceAssistant ? "default" : "outline"}
                onClick={() => setShowVoiceAssistant(!showVoiceAssistant)}
                className="flex-shrink-0"
              >
                <Mic className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Voice Assistant</span>
              </Button>
              <Button 
                size="sm"
                variant="outline"
                onClick={() => setActiveTab("multisig")}
                className="flex-shrink-0"
              >
                <Shield className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Multi-Sig</span>
              </Button>
              <Button size="sm" variant="outline" className="flex-shrink-0">
                <Settings className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Settings</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 h-auto">
                <TabsTrigger value="dashboard" className="text-xs md:text-sm px-2 md:px-4">
                  <span className="hidden sm:inline">Payment Dashboard</span>
                  <span className="sm:hidden">Payments</span>
                </TabsTrigger>
                <TabsTrigger value="multisig" className="text-xs md:text-sm px-2 md:px-4">
                  <span className="hidden sm:inline">Multi-Sig Management</span>
                  <span className="sm:hidden">Multi-Sig</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="text-xs md:text-sm px-2 md:px-4">
                  <span className="hidden sm:inline">Analytics & Audit</span>
                  <span className="sm:hidden">Analytics</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="space-y-6">
                <AdminPanel />
              </TabsContent>

              <TabsContent value="multisig" className="space-y-6">
                <MultiSigPanel />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle>Analytics & Audit Trail</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                      <Settings className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Advanced Analytics Coming Soon</p>
                      <p>Comprehensive audit trails, transaction analytics, and compliance reporting</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Voice Assistant Sidebar */}
          {showVoiceAssistant && (
            <div className="lg:col-span-1 fixed lg:static bottom-0 left-0 right-0 lg:top-6 z-50 lg:z-0">
              <div className="lg:sticky lg:top-6 bg-background lg:bg-transparent border-t lg:border-none p-4 lg:p-0 max-h-[50vh] lg:max-h-none overflow-y-auto">
                <VoiceAssistant
                  onCommand={handleVoiceCommand}
                  onApproval={handleApproval}
                  onRejection={handleRejection}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}