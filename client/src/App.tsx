/**
 * SecureVault — App Root
 * Routes:
 *   /            → LandingPage (public marketing + pricing)
 *   /vault       → VaultDashboard (protected by PaywallGate)
 *   /import      → ImportPage (restore vault from backup)
 *   /payment-success → PaymentSuccess
 */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import { VaultProvider, useVault } from "./contexts/VaultContext";
import LockScreen from "./pages/LockScreen";
import VaultDashboard from "./pages/VaultDashboard";
import ImportPage from "./pages/ImportPage";
import LandingPage from "./pages/LandingPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaywallGate from "./components/PaywallGate";
import OrdersPage from "./pages/OrdersPage";
import CheckoutPage from "./pages/CheckoutPage";
import AdminDashboard from "./pages/AdminDashboard";
import AccountPage from "./pages/AccountPage";
import TermsPage from "./pages/TermsPage";
import ErrorBoundary from "./components/ErrorBoundary";
import { Route, Switch } from "wouter";

function VaultApp() {
  const { appState } = useVault();
  if (appState === "setup") return <LockScreen mode="setup" />;
  if (appState === "locked") return <LockScreen mode="locked" />;
  return <VaultDashboard />;
}

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={LandingPage} />
      <Route path="/import" component={ImportPage} />
      <Route path="/payment-success" component={PaymentSuccess} />

      {/* Orders / purchase history */}
      <Route path="/orders" component={OrdersPage} />

      {/* Secure checkout page */}
      <Route path="/checkout" component={CheckoutPage} />

      {/* My Account */}
      <Route path="/account" component={AccountPage} />

      {/* Terms of Service */}
      <Route path="/terms" component={TermsPage} />

      {/* Admin dashboard — owner only */}
      <Route path="/admin" component={AdminDashboard} />

      {/* Protected vault route — requires login + payment */}
      <Route path="/vault">
        <PaywallGate>
          <VaultProvider>
            <VaultApp />
          </VaultProvider>
        </PaywallGate>
      </Route>

      {/* Fallback */}
      <Route component={LandingPage} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster position="top-right" theme="dark" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
