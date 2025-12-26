import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/lib/axios";

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        setEvent(res.data);
      } catch (e) {
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link to="/events">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>
      </Link>

      <div className="space-y-6">
        {loading ? (
          <div>Loading...</div>
        ) : !event ? (
          <div>Event not found.</div>
        ) : (
        <>
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-4">{event.title}</h1>
          <p className="text-lg text-muted-foreground">{event.description}</p>
        </div>

        {/* Event Details Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Date</div>
                  <div className="font-medium">{new Date(event.date).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Time</div>
                  <div className="font-medium">{new Date(event.date).toLocaleTimeString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Location</div>
                  <div className="font-medium">{event.organizer}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Full Description */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-semibold mb-4">About This Event</h2>
            <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">{event.description}</div>
          </CardContent>
        </Card>
        </>
        )}
      </div>
    </div>
  );
};

export default EventDetail;
