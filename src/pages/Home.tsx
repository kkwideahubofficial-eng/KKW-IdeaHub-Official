import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Trophy, Lightbulb, Users } from "lucide-react";

const Home = () => {
  const features = [
    {
      icon: Calendar,
      title: "Book Lab Slots",
      description: "Reserve innovation lab facilities for your projects with our easy booking system.",
      link: "/book-slots",
    },
    {
      icon: Trophy,
      title: "View Achievements",
      description: "Explore successful projects and innovations from our community.",
      link: "/achievements",
    },
    {
      icon: Lightbulb,
      title: "Upcoming Events",
      description: "Stay updated with workshops, seminars, and innovation challenges.",
      link: "/events",
    },
    {
      icon: Users,
      title: "Collaborate & Innovate",
      description: "Connect with fellow innovators and bring your ideas to life.",
      link: "/lab-info",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/10 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Welcome to <span className="text-primary">IDEA Hub</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Empowering Innovation Through Collaboration
            </p>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Your gateway to state-of-the-art innovation facilities, collaborative workspaces, and a thriving community of innovators.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/book-slots">
                <Button size="lg" className="w-full sm:w-auto">
                  Book a Slot
                </Button>
              </Link>
              <Link to="/lab-info">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              What We Offer
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive resources and support for your innovation journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Link key={index} to={feature.link}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:border-primary cursor-pointer">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Active Projects</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">1000+</div>
              <div className="text-muted-foreground">Members</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <div className="text-muted-foreground">Events Hosted</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">Lab Access</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/20">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Ready to Start Your Innovation Journey?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join our community of innovators and bring your ideas to life with access to cutting-edge facilities and expert guidance.
              </p>
              <Link to="/signup">
                <Button size="lg">Get Started Today</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Home;
