import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, ExternalLink } from "lucide-react";

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  capacity: number;
  registered: number;
  registrationLink: string;
}

const Events = () => {
  const events: Event[] = [
    {
      id: 1,
      title: "AI & Machine Learning Workshop",
      description: "Hands-on workshop covering fundamentals of AI, machine learning algorithms, and practical applications in real-world scenarios.",
      date: "2025-10-20",
      time: "10:00 AM - 04:00 PM",
      location: "IDEA Lab - Main Hall",
      category: "Workshop",
      capacity: 50,
      registered: 32,
      registrationLink: "#",
    },
    {
      id: 2,
      title: "Innovation Hackathon 2025",
      description: "48-hour hackathon focused on developing solutions for sustainable development goals. Teams will compete for prizes worth $10,000.",
      date: "2025-11-05",
      time: "09:00 AM (2 days)",
      location: "IDEA Lab - All Facilities",
      category: "Hackathon",
      capacity: 100,
      registered: 78,
      registrationLink: "#",
    },
    {
      id: 3,
      title: "Startup Pitch Competition",
      description: "Present your innovative startup ideas to industry experts and potential investors. Top 3 pitches win funding opportunities.",
      date: "2025-10-28",
      time: "02:00 PM - 06:00 PM",
      location: "IDEA Lab - Conference Room",
      category: "Competition",
      capacity: 30,
      registered: 18,
      registrationLink: "#",
    },
    {
      id: 4,
      title: "IoT and Smart Systems Seminar",
      description: "Expert talk on the future of Internet of Things, smart cities, and connected devices. Featuring guest speakers from industry leaders.",
      date: "2025-11-12",
      time: "03:00 PM - 05:00 PM",
      location: "IDEA Lab - Auditorium",
      category: "Seminar",
      capacity: 80,
      registered: 45,
      registrationLink: "#",
    },
    {
      id: 5,
      title: "3D Printing & Prototyping Masterclass",
      description: "Learn advanced 3D printing techniques, prototyping best practices, and bring your product ideas to life.",
      date: "2025-11-18",
      time: "11:00 AM - 03:00 PM",
      location: "IDEA Lab - Fabrication Zone",
      category: "Workshop",
      capacity: 25,
      registered: 19,
      registrationLink: "#",
    },
    {
      id: 6,
      title: "Blockchain Technology Symposium",
      description: "Comprehensive overview of blockchain technology, cryptocurrency, smart contracts, and decentralized applications.",
      date: "2025-12-02",
      time: "01:00 PM - 05:00 PM",
      location: "IDEA Lab - Main Hall",
      category: "Symposium",
      capacity: 60,
      registered: 28,
      registrationLink: "#",
    },
  ];

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Workshop: "bg-blue-100 text-blue-800",
      Hackathon: "bg-purple-100 text-purple-800",
      Competition: "bg-green-100 text-green-800",
      Seminar: "bg-orange-100 text-orange-800",
      Symposium: "bg-pink-100 text-pink-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Upcoming Events</h1>
        <p className="text-muted-foreground">
          Join workshops, hackathons, and seminars to enhance your innovation journey
        </p>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {events.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <Badge className={getCategoryColor(event.category)}>{event.category}</Badge>
                <span className="text-xs text-muted-foreground">
                  {event.registered}/{event.capacity} registered
                </span>
              </div>
              <CardTitle className="line-clamp-2">{event.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {event.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>{new Date(event.date).toLocaleDateString()} • {event.time}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4 text-primary" />
                  <span>{event.capacity - event.registered} spots remaining</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Link to={`/events/${event.id}`} className="flex-1">
                  <Button variant="outline" className="w-full">View Details</Button>
                </Link>
                <Button className="flex-1">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Register
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Events;
