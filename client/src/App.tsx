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
import AuthPage from "@/pages/auth-page";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard}/>
      <ProtectedRoute path="/password-checker" component={PasswordChecker}/>
      <ProtectedRoute path="/password-generator" component={PasswordGenerator}/>
      <ProtectedRoute path="/vault" component={PasswordVault}/>
      <ProtectedRoute path="/crypto-tools" component={CryptoTools}/>
      <ProtectedRoute path="/password-sharing" component={PasswordSharing}/>
      <ProtectedRoute path="/settings" component={Settings}/>
      <Route path="/auth" component={AuthPage}/>
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
