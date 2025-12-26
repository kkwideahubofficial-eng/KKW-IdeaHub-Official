import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const MyBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get("/bookings/my-history");
        setBookings(response.data.bookings);
      } catch (error) {
        toast.error("Failed to fetch your bookings.");
        console.error("Error fetching bookings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const getStatusVariant = (status: Booking['status']) => {
    switch (status) {
      case 'approved':
        return 'default'; // Using 'default' for approved status
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return <div className="container mx-auto py-8">Loading your bookings...</div>;
  }

  const filtered = (status: Booking['status'] | 'all') =>
    status === 'all' ? bookings : bookings.filter((b) => b.status === status);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
      {bookings.length === 0 ? (
        <p>You have no bookings yet.</p>
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          {(['all','pending','approved','rejected'] as const).map((key) => (
            <TabsContent key={key} value={key}>
              <div className="space-y-4 mt-4">
                {filtered(key as any).map((booking) => (
                  <Card key={booking._id}>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg">
                        {new Date(booking.slotDate).toLocaleDateString()} • {booking.startTime} - {booking.endTime}
                      </CardTitle>
                      <Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-2"><strong>Purpose:</strong> {booking.purpose}</p>
                      {booking.reason ? (
                        <p className="mb-2 text-sm text-muted-foreground"><strong>Note:</strong> {booking.reason}</p>
                      ) : null}
                      {booking.history && booking.history.length > 0 ? (
                        <div className="mt-4">
                          <p className="font-semibold mb-2">Status history</p>
                          <div className="space-y-1 text-sm">
                            {booking.history.map((h, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <Badge variant={getStatusVariant(h.status)}>{h.status}</Badge>
                                <span>{new Date(h.at).toLocaleString()}</span>
                                {h.reason ? <span className="text-muted-foreground">• {h.reason}</span> : null}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default MyBookings;
