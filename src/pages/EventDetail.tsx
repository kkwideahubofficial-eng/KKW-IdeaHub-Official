import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, ArrowLeft, ExternalLink } from "lucide-react";

const EventDetail = () => {
  const { id } = useParams();

  // Mock event data - in real app, fetch based on id
  const event = {
    id: 1,
    title: "AI & Machine Learning Workshop",
    description: "Hands-on workshop covering fundamentals of AI, machine learning algorithms, and practical applications in real-world scenarios.",
    fullDescription: `Join us for an intensive, hands-on workshop designed to introduce you to the exciting world of Artificial Intelligence and Machine Learning. This full-day event will cover everything from basic concepts to practical implementation.

What you'll learn:
• Introduction to AI and ML fundamentals
• Understanding neural networks and deep learning
• Practical implementation using Python and TensorFlow
• Real-world case studies and applications
• Hands-on projects and exercises

Who should attend:
This workshop is perfect for students, professionals, and anyone interested in entering the field of AI/ML. Basic programming knowledge is recommended but not required.

What to bring:
• Laptop with Python installed
• Enthusiasm to learn
• Questions and project ideas`,
    date: "2025-10-20",
    time: "10:00 AM - 04:00 PM",
    location: "IDEA Lab - Main Hall",
    category: "Workshop",
    capacity: 50,
    registered: 32,
    registrationLink: "#",
    speakers: [
      { name: "Dr. Sarah Johnson", role: "AI Research Lead" },
      { name: "Prof. Michael Chen", role: "Machine Learning Expert" },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link to="/events">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>
      </Link>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <Badge className="mb-3">{event.category}</Badge>
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
                  <div className="font-medium">{event.time}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Location</div>
                  <div className="font-medium">{event.location}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Capacity</div>
                  <div className="font-medium">
                    {event.registered}/{event.capacity} registered • {event.capacity - event.registered} spots left
                  </div>
                </div>
              </div>
            </div>
            <Button className="w-full" size="lg">
              <ExternalLink className="w-4 h-4 mr-2" />
              Register for Event
            </Button>
          </CardContent>
        </Card>

        {/* Full Description */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-semibold mb-4">About This Event</h2>
            <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
              {event.fullDescription}
            </div>
          </CardContent>
        </Card>

        {/* Speakers */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-semibold mb-4">Speakers</h2>
            <div className="space-y-3">
              {event.speakers.map((speaker, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                    {speaker.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-medium">{speaker.name}</div>
                    <div className="text-sm text-muted-foreground">{speaker.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventDetail;
