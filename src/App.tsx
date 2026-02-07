import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Archives from "./pages/Archives";
import { FamilyView } from "./pages/FamilyView";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import PersonsManager from "./pages/admin/PersonsManager";
import ArchivesManager from "./pages/admin/ArchivesManager";
import UsersManager from "./pages/admin/UsersManager";
import HistoryManager from "./pages/admin/HistoryManager";
import NotificationsPage from "./pages/admin/Notifications";
import ChangeRequests from "./pages/admin/ChangeRequests";
import { ProtectedRoute } from "./components/Admin/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/archives" element={<Archives />} />
          <Route path="/help" element={<Help />} />
          <Route path="/family/:personName" element={<FamilyView />} />
          <Route path="/constellation/:personName" element={<FamilyView />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/persons"
            element={
              <ProtectedRoute>
                <PersonsManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/archives"
            element={
              <ProtectedRoute>
                <ArchivesManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <UsersManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/history"
            element={
              <ProtectedRoute>
                <HistoryManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/change-requests"
            element={
              <ProtectedRoute>
                <ChangeRequests />
              </ProtectedRoute>
            }
          />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;