import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import PasswordChecker from "@/pages/PasswordChecker";
import PasswordGenerator from "@/pages/PasswordGenerator";
import PasswordVault from "@/pages/PasswordVault";
import CryptoTools from "@/pages/CryptoTools";
import PasswordSharing from "@/pages/PasswordSharing";
import Settings from "@/pages/Settings";
import DecentralizedFeatures from "@/pages/DecentralizedFeatures";
import AuthPage from "@/pages/auth-page";
import { useEffect } from "react";
import { handleRedirectResult } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { WebSocketProvider } from "@/lib/websocket";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard}/>
      <ProtectedRoute path="/password-checker" component={PasswordChecker}/>
      <ProtectedRoute path="/password-generator" component={PasswordGenerator}/>
      <ProtectedRoute path="/vault" component={PasswordVault}/>
      <ProtectedRoute path="/crypto-tools" component={CryptoTools}/>
      <ProtectedRoute path="/password-sharing" component={PasswordSharing}/>
      <ProtectedRoute path="/decentralized" component={DecentralizedFeatures}/>
      <ProtectedRoute path="/settings" component={Settings}/>
      <Route path="/auth" component={AuthPage}/>
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { toast } = useToast();
  
  // Handle Firebase redirect results when the app loads
  useEffect(() => {
    // Process Firebase redirect result
    async function processRedirect() {
      try {
        const user = await handleRedirectResult();
        if (user) {
          toast({
            title: "Authentication successful",
            description: `Welcome, ${user.displayName || user.email}!`,
          });
        }
      } catch (error) {
        console.error("Error processing redirect:", error);
        toast({
          title: "Authentication failed",
          description: "Could not authenticate with Google. Please try again.",
          variant: "destructive",
        });
      }
    }
    
    processRedirect();
  }, [toast]);
  
  return <Router />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WebSocketProvider>
          <AppContent />
          <Toaster />
        </WebSocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
