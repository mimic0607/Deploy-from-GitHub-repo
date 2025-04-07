import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import PasswordChecker from "@/pages/PasswordChecker";
import PasswordGenerator from "@/pages/PasswordGenerator";
import PasswordVault from "@/pages/PasswordVault";
import CryptoTools from "@/pages/CryptoTools";
import PasswordSharing from "@/pages/PasswordSharing";
import Settings from "@/pages/Settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard}/>
      <Route path="/password-checker" component={PasswordChecker}/>
      <Route path="/password-generator" component={PasswordGenerator}/>
      <Route path="/vault" component={PasswordVault}/>
      <Route path="/crypto-tools" component={CryptoTools}/>
      <Route path="/password-sharing" component={PasswordSharing}/>
      <Route path="/settings" component={Settings}/>
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
