import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Calendar } from "lucide-react";

interface Achievement {
  id: number;
  title: string;
  teamName: string;
  description: string;
  date: string;
  category: string;
  imageUrl?: string;
}

const Achievements = () => {
  const achievements: Achievement[] = [
    {
      id: 1,
      title: "AI-Powered Healthcare Diagnostic System",
      teamName: "Innovation Squad",
      description: "Developed an AI model that can detect early signs of diseases with 95% accuracy. The system has been implemented in local clinics and has helped diagnose over 1000 patients.",
      date: "2025-09-15",
      category: "Healthcare",
    },
    {
      id: 2,
      title: "Smart Campus IoT Infrastructure",
      teamName: "Tech Pioneers",
      description: "Created a comprehensive IoT system connecting 200+ sensors across campus for energy management, security, and environmental monitoring, reducing energy costs by 30%.",
      date: "2025-08-22",
      category: "IoT",
    },
    {
      id: 3,
      title: "Sustainable Water Purification System",
      teamName: "EcoInnovators",
      description: "Designed an affordable, solar-powered water purification system for rural communities. Currently deployed in 15 villages, providing clean water to over 5000 people.",
      date: "2025-07-10",
      category: "Sustainability",
    },
    {
      id: 4,
      title: "Educational AR Platform for STEM Learning",
      teamName: "Learning Lab",
      description: "Built an augmented reality application that makes complex scientific concepts interactive and engaging. Adopted by 50+ schools nationwide.",
      date: "2025-06-05",
      category: "Education",
    },
    {
      id: 5,
      title: "Blockchain-Based Supply Chain Tracker",
      teamName: "Data Wizards",
      description: "Implemented a transparent supply chain management system using blockchain technology, helping local businesses reduce fraud and improve efficiency.",
      date: "2025-05-18",
      category: "Blockchain",
    },
    {
      id: 6,
      title: "Accessibility Tools for Visual Impairment",
      teamName: "AccessAll",
      description: "Created a suite of mobile applications and hardware devices to assist visually impaired individuals in navigation, reading, and daily tasks.",
      date: "2025-04-12",
      category: "Accessibility",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Achievements Gallery</h1>
        <p className="text-muted-foreground">
          Celebrating innovation and success stories from our community
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{achievements.length}</p>
                <p className="text-sm text-muted-foreground">Total Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">24</p>
                <p className="text-sm text-muted-foreground">Active Teams</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">2025</p>
                <p className="text-sm text-muted-foreground">Current Year</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => (
          <Card key={achievement.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <Badge variant="outline">{achievement.category}</Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(achievement.date).toLocaleDateString()}
                </span>
              </div>
              <CardTitle className="line-clamp-2">{achievement.title}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {achievement.teamName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-4">
                {achievement.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Achievements;
