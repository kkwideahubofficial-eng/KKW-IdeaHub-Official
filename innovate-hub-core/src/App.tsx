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
import ManageHero from "./pages/coordinator/ManageHero";
import Records from "./pages/Records";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import ManageOrders from "./pages/coordinator/ManageOrders";
import MyOrders from "./pages/MyOrders";
import TrackingPage from "./pages/TrackingPage";

import ManageMachinery from "./pages/head/ManageMachinery";
import MachineryRequests from "./pages/head/MachineryRequests";
import HeadDashboard from "./pages/head/HeadDashboard";
import EcommerceStats from "./pages/head/EcommerceStats";
import RecordStats from "./pages/head/RecordStats";
import MachineryList from "./pages/machinery/MachineryList";
import MachineryRequestForm from "./pages/machinery/MachineryRequestForm";



import Profile from "./pages/Profile";

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
  if (!['coordinator', 'head', 'admin'].includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function RequireHead({ children }: { children: ReactNode }) {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'head' && user.role !== 'admin') return <Navigate to="/" replace />;
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
              <Route path="/register" element={<Signup />} />
              <Route
                path="/profile"
                element={
                  <RequireAuth>
                    <Profile />
                  </RequireAuth>
                }
              />
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
                path="/my-orders"
                element={
                  <RequireAuth>
                    <MyOrders />
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
              <Route
                path="/manage-orders"
                element={
                  <RequireCoordinator>
                    <ManageOrders />
                  </RequireCoordinator>
                }
              />
              <Route
                path="/manage-hero"
                element={
                  <RequireCoordinator>
                    <ManageHero />
                  </RequireCoordinator>
                }
              />
              {/* Head Routes */}
              <Route
                path="/head-dashboard"
                element={
                  <RequireHead>
                    <HeadDashboard />
                  </RequireHead>
                }
              />
              <Route
                path="/manage-machinery"
                element={
                  <RequireCoordinator>
                    <ManageMachinery />
                  </RequireCoordinator>
                }
              />
              <Route
                path="/head/requests"
                element={
                  <RequireHead>
                    <MachineryRequests />
                  </RequireHead>
                }
              />
                <Route
                path="/head/ecommerce-stats"
                element={
                  <RequireHead>
                    <EcommerceStats />
                  </RequireHead>
                }
              />
              <Route
                path="/head/records"
                element={
                  <RequireHead>
                    <RecordStats />
                  </RequireHead>
                }
              />
              
              {/* Student Machinery Routes */}
              <Route
                path="/machinery"
                element={
                  <RequireAuth>
                    <MachineryList />
                  </RequireAuth>
                }
              />
              <Route
                path="/machinery/request/:id"
                element={
                  <RequireAuth>
                    <MachineryRequestForm />
                  </RequireAuth>
                }
              />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/achievements/:id" element={<AchievementDetail />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/lab-info" element={<LabInfo />} />
              <Route path="/ecommerce" element={<Ecommerce />} />
              <Route
                path="/checkout"
                element={
                  <RequireAuth>
                    <Checkout />
                  </RequireAuth>
                }
              />
               <Route
                path="/order-confirmation/:id"
                element={
                  <RequireAuth>
                    <OrderSuccess />
                  </RequireAuth>
                }
              />
              <Route
                path="/track-order/:id"
                element={
                  <RequireAuth>
                    <TrackingPage />
                  </RequireAuth>
                }
              />
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
