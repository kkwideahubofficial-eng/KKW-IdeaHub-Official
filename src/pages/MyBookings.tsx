import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface BookingHistoryEntry {
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  by?: string;
  at: string;
}

interface Booking {
  _id: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  history?: BookingHistoryEntry[];
}

interface MachineryRequest {
  _id: string;
  machineryId: {
    _id: string;
    name: string;
    imageUrl?: string;
  };
  usageDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

const MyBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [machineryRequests, setMachineryRequests] = useState<MachineryRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, machineryRes] = await Promise.all([
          api.get("/bookings/my-history"),
          api.get("/machinery/requests") // Student gets their own requests
        ]);
        
        setBookings(bookingsRes.data.bookings || []);
        setMachineryRequests(machineryRes.data || []);
      } catch (error) {
        toast.error("Failed to fetch some history data.");
        console.error("Error fetching historyData:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  const getNormalizedDate = (item: any): Date => {
    if ('slotDate' in item) return new Date(item.slotDate);
    if ('usageDate' in item) return new Date(item.usageDate);
    return new Date();
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d < today;
  };

  const filterData = <T extends { status: string }>(data: T[], status: string) => {
      if (status === 'all') return data;
      
      return data.filter(item => {
          const matchesStatus = item.status === status;
          if (!matchesStatus) return false;

          // For Approved and Pending, render only upcoming (or today's) items
          if (status === 'approved' || status === 'pending') {
              return !isPast(getNormalizedDate(item));
          }
          
          return true;
      });
  };

  const StatusTabs = ({ type }: { type: 'room' | 'machinery' }) => (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="pending">Pending</TabsTrigger>
        <TabsTrigger value="approved">Approved</TabsTrigger>
        <TabsTrigger value="rejected">Rejected</TabsTrigger>
      </TabsList>

      {(['all', 'pending', 'approved', 'rejected'] as const).map((key) => (
        <TabsContent key={key} value={key}>
            <div className="space-y-4">
                {type === 'room' ? (
                     filterData(bookings, key).length === 0 ? <p className="text-muted-foreground p-4">No {key === 'all' ? '' : key} bookings found.</p> :
                     filterData(bookings, key).map((booking) => (
                        <Card key={booking._id} className="overflow-hidden border-none shadow-sm ring-1 ring-border/50">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <Badge variant={getStatusVariant(booking.status)} className="capitalize px-3 py-1 rounded-full text-[10px] sm:text-xs">
                                        {booking.status}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Loader2 className="w-3 h-3" /> {format(new Date(booking.slotDate), 'dd/MM/yyyy')}
                                    </span>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-xl font-bold tracking-tight text-foreground">Room Booking</h3>
                                    <p className="text-sm text-muted-foreground">Coordinator Review</p>
                                </div>

                                <div className="bg-muted/30 rounded-lg p-4 grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Date</p>
                                        <p className="text-sm font-medium">{format(new Date(booking.slotDate), 'dd/MM/yyyy')}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Time</p>
                                        <p className="text-sm font-medium">{booking.startTime} - {booking.endTime}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Purpose</p>
                                    <p className="text-sm text-foreground italic">"{booking.purpose}"</p>
                                </div>

                                {booking.status === 'rejected' && booking.reason && (
                                    <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-100">
                                        <strong>Rejection Reason:</strong> {booking.reason}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                     ))
                ) : (
                    filterData(machineryRequests, key).length === 0 ? <p className="text-muted-foreground p-4">No {key === 'all' ? '' : key} requests found.</p> :
                    filterData(machineryRequests, key).map((req) => (
                        <Card key={req._id} className="overflow-hidden border-none shadow-sm ring-1 ring-border/50">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <Badge variant={getStatusVariant(req.status)} className="capitalize px-3 py-1 rounded-full text-[10px] sm:text-xs">
                                        {req.status}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Loader2 className="w-3 h-3" /> {format(new Date(req.usageDate), 'dd/MM/yyyy')}
                                    </span>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-xl font-bold tracking-tight text-foreground">{req.machineryId?.name || 'Unknown Machine'}</h3>
                                    <p className="text-sm text-muted-foreground">Machinery Request</p>
                                </div>

                                <div className="bg-muted/30 rounded-lg p-4 grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Date</p>
                                        <p className="text-sm font-medium">{format(new Date(req.usageDate), 'dd/MM/yyyy')}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Time</p>
                                        <p className="text-sm font-medium">{req.startTime} - {req.endTime}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Purpose</p>
                                    <p className="text-sm text-foreground italic">"{req.purpose}"</p>
                                </div>

                                {req.status === 'rejected' && req.rejectionReason && (
                                    <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-100">
                                        <strong>Rejection Reason:</strong> {req.rejectionReason}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </TabsContent>
        ))}
    </Tabs>
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">My Bookings & Requests</h1>
      
      <Tabs defaultValue="machinery" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="machinery">Machinery Requests</TabsTrigger>
            <TabsTrigger value="rooms">Room Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="rooms" className="mt-4">
           <StatusTabs type="room" />
        </TabsContent>

        <TabsContent value="machinery" className="mt-4">
           <StatusTabs type="machinery" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyBookings;
