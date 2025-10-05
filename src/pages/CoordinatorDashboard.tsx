import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Check, X, Clock, Users } from "lucide-react";
import { toast } from "sonner";

interface BookingRequest {
  id: number;
  teamName: string;
  projectTitle: string;
  date: string;
  timeSlot: string;
  status: "pending" | "approved" | "rejected";
  description: string;
}

const CoordinatorDashboard = () => {
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([
    {
      id: 1,
      teamName: "Innovation Squad",
      projectTitle: "AI-Powered Healthcare Solution",
      date: "2025-10-15",
      timeSlot: "09:00 AM - 11:00 AM",
      status: "pending",
      description: "Developing an AI model for early disease detection",
    },
    {
      id: 2,
      teamName: "Tech Pioneers",
      projectTitle: "IoT Smart Campus System",
      date: "2025-10-16",
      timeSlot: "02:00 PM - 04:00 PM",
      status: "pending",
      description: "Building an interconnected IoT system for campus management",
    },
    {
      id: 3,
      teamName: "Data Wizards",
      projectTitle: "Machine Learning Model Training",
      date: "2025-10-14",
      timeSlot: "11:00 AM - 01:00 PM",
      status: "approved",
      description: "Training deep learning models for image classification",
    },
  ]);

  const handleApprove = (id: number) => {
    setBookingRequests(prev =>
      prev.map(req => req.id === id ? { ...req, status: "approved" } : req)
    );
    toast.success("Booking approved! QR code sent to team.");
  };

  const handleReject = (id: number) => {
    setBookingRequests(prev =>
      prev.map(req => req.id === id ? { ...req, status: "rejected" } : req)
    );
    toast.error("Booking rejected.");
  };

  const stats = [
    { label: "Pending Requests", value: bookingRequests.filter(r => r.status === "pending").length, icon: Clock },
    { label: "Approved Today", value: bookingRequests.filter(r => r.status === "approved").length, icon: Check },
    { label: "Active Teams", value: "24", icon: Users },
    { label: "This Week", value: "18", icon: Calendar },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Coordinator Dashboard</h1>
        <p className="text-muted-foreground">Manage lab bookings and requests</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
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
          <TabsTrigger value="pending">Pending Requests</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="all">All Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {bookingRequests.filter(r => r.status === "pending").map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{request.projectTitle}</CardTitle>
                    <CardDescription>by {request.teamName}</CardDescription>
                  </div>
                  <Badge variant="outline">Pending</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">{request.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{new Date(request.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{request.timeSlot}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={() => handleApprove(request.id)} size="sm">
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button onClick={() => handleReject(request.id)} variant="destructive" size="sm">
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {bookingRequests.filter(r => r.status === "approved").map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{request.projectTitle}</CardTitle>
                    <CardDescription>by {request.teamName}</CardDescription>
                  </div>
                  <Badge className="bg-success">Approved</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">{request.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{new Date(request.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{request.timeSlot}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {bookingRequests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{request.projectTitle}</CardTitle>
                    <CardDescription>by {request.teamName}</CardDescription>
                  </div>
                  <Badge variant={request.status === "approved" ? "default" : "outline"}>
                    {request.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">{request.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{new Date(request.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{request.timeSlot}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoordinatorDashboard;
