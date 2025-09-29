import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Settings, Mic } from "lucide-react";
import { useRevealOnScroll } from "@/components/ui/use-in-view";
import AdminPanel from "./AdminPanel";
import VoiceAssistant from "./VoiceAssistant";
import MultiSigPanel from "./MultiSigPanel";
import { VoiceCommand } from "@/lib/voice";

export default function EnhancedAdminPanel() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="zeno-card p-4 rounded-lg reveal">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">ZenoPay Admin Console</h1>
              <p className="text-muted-foreground">
                Advanced treasury management with voice commands and multi-signature security
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant={showVoiceAssistant ? "default" : "outline"}
                onClick={() => setShowVoiceAssistant(!showVoiceAssistant)}
              >
                <Mic className="w-4 h-4 mr-2" />
                Voice Assistant
              </Button>
              <Button 
                variant="outline"
                onClick={() => setActiveTab("multisig")}
              >
                <Shield className="w-4 h-4 mr-2" />
                Multi-Sig Wallet
              </Button>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="dashboard">Payment Dashboard</TabsTrigger>
                <TabsTrigger value="multisig">Multi-Sig Management</TabsTrigger>
                <TabsTrigger value="analytics">Analytics & Audit</TabsTrigger>
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
          <div className="lg:col-span-1">
            {showVoiceAssistant && (
              <div className="sticky top-6">
                <VoiceAssistant
                  onCommand={handleVoiceCommand}
                  onApproval={handleApproval}
                  onRejection={handleRejection}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}