import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import '@/lib/i18n';
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import MobileNavigation from "./components/MobileNavigation";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import TrackScan from "./pages/TrackScan";
import Shipments from "./pages/Shipments";
import SearchOrders from "./pages/SearchOrders";
import Statistics from "./pages/Statistics";
import NewStatistics from "./pages/NewStatistics";
import Branches from "./pages/Branches";
import Employees from "./pages/Employees";
import Orders from "./pages/Orders";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="pb-16 md:pb-0">
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/scan" element={
                <ProtectedRoute>
                  <TrackScan />
                </ProtectedRoute>
              } />
              <Route path="/shipments" element={
                <ProtectedRoute>
                  <Shipments />
                </ProtectedRoute>
              } />
              <Route path="/search" element={
                <ProtectedRoute>
                  <SearchOrders />
                </ProtectedRoute>
              } />
              <Route path="/statistics" element={
                <ProtectedRoute>
                  <NewStatistics />
                </ProtectedRoute>
              } />
              <Route path="/branches" element={
                <ProtectedRoute>
                  <Branches />
                </ProtectedRoute>
              } />
              <Route path="/employees" element={
                <ProtectedRoute>
                  <Employees />
                </ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <MobileNavigation />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
