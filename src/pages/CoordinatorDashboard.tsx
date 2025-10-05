import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Check, X, Clock, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "../lib/axios";

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  teamName: string;
}

interface BookingRequest {
  _id: string;
  team: TeamMember;
  slotDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: "pending" | "approved" | "rejected";
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

interface DashboardStats {
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
}

const CoordinatorDashboard = () => {
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [stats, setStats] = useState<{
    totalPending: number;
    totalApproved: number;
    totalRejected: number;
    activeTeams: number;
    thisWeek: number;
  }>({ 
    totalPending: 0, 
    totalApproved: 0, 
    totalRejected: 0,
    activeTeams: 0,
    thisWeek: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch dashboard stats
        const statsRes = await axios.get('/bookings/dashboard-stats')
          .catch(() => ({
            data: { 
              stats: { 
                totalPending: 0, 
                totalApproved: 0, 
                totalRejected: 0 
              } 
            }
          }));

        // Fetch pending bookings
        const pendingRes = await axios.get('/bookings/pending')
          .catch(() => ({ 
            data: { 
              bookings: [] 
            } 
          }));

        // Update stats
        setStats({
          totalPending: statsRes.data.stats?.totalPending || 0,
          totalApproved: statsRes.data.stats?.totalApproved || 0,
          totalRejected: statsRes.data.stats?.totalRejected || 0,
          activeTeams: 0,
          thisWeek: 0
        });

        // Update pending bookings
        const pendingBookings: BookingRequest[] = Array.isArray(pendingRes.data.bookings) 
          ? pendingRes.data.bookings 
          : [];
          
        setBookingRequests(pendingBookings);
      } catch (error) {
        console.error('Error in fetchDashboardData:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
        setInitialLoad(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleApprove = async (id: string) => {
    if (!id) return;
    
    try {
      setIsProcessing(true);
      await axios.patch(`/bookings/${id}/decision`, { 
        decision: 'approved',
        reason: 'Approved by coordinator'
      });
      
      // Update local state
      setBookingRequests(prev => prev.filter(req => req._id !== id));
      setStats(prev => ({
        ...prev,
        totalPending: Math.max(0, prev.totalPending - 1),
        totalApproved: prev.totalApproved + 1
      }));
      
      toast.success("Booking approved! QR code sent to team.");
    } catch (error) {
      console.error('Error approving booking:', error);
      toast.error('Failed to approve booking');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (id: string) => {
    if (!id) return;
    
    try {
      setIsProcessing(true);
      await axios.patch(`/bookings/${id}/decision`, { 
        decision: 'rejected',
        reason: 'Rejected by coordinator'
      });
      
      // Update local state
      setBookingRequests(prev => prev.filter(req => req._id !== id));
      setStats(prev => ({
        ...prev,
        totalPending: Math.max(0, prev.totalPending - 1),
        totalRejected: prev.totalRejected + 1
      }));
      
      toast.error("Booking rejected.");
    } catch (error) {
      console.error('Error rejecting booking:', error);
      toast.error('Failed to reject booking');
    } finally {
      setIsProcessing(false);
    }
  };

  // Stats cards configuration
  const statsCards = [
    { 
      label: "Pending Requests", 
      value: stats.totalPending, 
      icon: Clock 
    },
    { 
      label: "Approved", 
      value: stats.totalApproved, 
      icon: Check 
    },
    { 
      label: "Rejected", 
      value: stats.totalRejected, 
      icon: X 
    },
    { 
      label: "Active Teams", 
      value: stats.activeTeams, 
      icon: Users 
    },
  ];

  if (isLoading && initialLoad) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Coordinator Dashboard</h1>
        <p className="text-muted-foreground">Manage lab bookings and requests</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                </div>
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Booking Requests */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="all">All Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Booking Requests</CardTitle>
              <CardDescription>Review and manage pending lab booking requests</CardDescription>
            </CardHeader>
            <CardContent>
              {bookingRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No pending requests</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    There are no pending booking requests at the moment.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookingRequests.map((request) => (
                    <div
                      key={request._id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{request.team.teamName || 'No Team Name'}</h4>
                          <Badge variant="outline" className="text-xs">
                            {request.team.name || 'Team Member'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(request.slotDate).toLocaleDateString()} • {request.startTime} - {request.endTime}
                        </p>
                        <p className="text-sm">{request.purpose}</p>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto"
                          onClick={() => handleReject(request._id)}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <X className="mr-2 h-4 w-4" />
                          )}
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="w-full sm:w-auto"
                          onClick={() => handleApprove(request._id)}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="mr-2 h-4 w-4" />
                          )}
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Approved Bookings</CardTitle>
              <CardDescription>View all approved lab bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Approved bookings will appear here</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  This section will show all approved booking requests.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Bookings</CardTitle>
              <CardDescription>View all booking requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">All bookings will appear here</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  This section will show all booking requests, including pending, approved, and rejected.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoordinatorDashboard;
