import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ReactNode } from "react";
import Navigation from "./components/layout/Navigation";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import BookSlots from "./pages/BookSlots";
import CoordinatorDashboard from "./pages/CoordinatorDashboard";
import Achievements from "./pages/Achievements";
import AchievementDetail from "./pages/AchievementDetail";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import LabInfo from "./pages/LabInfo";
import Ecommerce from "./pages/Ecommerce";
import NotFound from "./pages/NotFound";
import MyBookings from "./pages/MyBookings";
import ManageEvents from "./pages/ManageEvents";
import ManageAchievements from "./pages/ManageAchievements";
import ManageRooms from "./pages/ManageRooms";
import Records from "./pages/Records";

const queryClient = new QueryClient();

function getCurrentUser() {
  try {
    const raw = localStorage.getItem('idea_hub_user');
    const token = localStorage.getItem('idea_hub_token');
    if (!raw || !token) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function RequireAuth({ children }: { children: ReactNode }) {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireCoordinator({ children }: { children: ReactNode }) {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'coordinator') return <Navigate to="/" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Navigation />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/book-slots"
                element={
                  <RequireAuth>
                    <BookSlots />
                  </RequireAuth>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <RequireAuth>
                    <MyBookings />
                  </RequireAuth>
                }
              />
              <Route
                path="/manage-events"
                element={
                  <RequireCoordinator>
                    <ManageEvents />
                  </RequireCoordinator>
                }
              />
              <Route
                path="/manage-achievements"
                element={
                  <RequireCoordinator>
                    <ManageAchievements />
                  </RequireCoordinator>
                }
              />
              <Route
                path="/manage-rooms"
                element={
                  <RequireCoordinator>
                    <ManageRooms />
                  </RequireCoordinator>
                }
              />
              <Route
                path="/coordinator-dashboard"
                element={
                  <RequireCoordinator>
                    <CoordinatorDashboard />
                  </RequireCoordinator>
                }
              />
              <Route
                path="/records"
                element={
                  <RequireCoordinator>
                    <Records />
                  </RequireCoordinator>
                }
              />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/achievements/:id" element={<AchievementDetail />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/lab-info" element={<LabInfo />} />
              <Route path="/ecommerce" element={<Ecommerce />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
