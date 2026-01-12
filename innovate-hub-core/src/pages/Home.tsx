import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Microscope, Calendar, Trophy, Users, Star, Lightbulb } from "lucide-react";
import HeroSlider from "@/components/HeroSlider";
import AboutPlatform from "@/components/home/AboutPlatform";
import ResourceShowcase from "@/components/home/ResourceShowcase";
import StatsSection from "@/components/home/StatsSection";
import AchievementShowcase from "@/components/home/AchievementShowcase";

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-32 sm:py-40 overflow-hidden min-h-[600px] flex items-center">
        {/* Dynamic Background Slider */}
        <HeroSlider />
        
        {/* Content Overlay */}
        <div className="absolute bottom-10 left-4 sm:left-8 z-10 max-w-md">
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/book-slots">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white border-none shadow-lg w-full sm:w-auto">
                  Book a Slot <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
        </div>
      </section>

      {/* Key Platform Services Section */}
      <section className="py-20 bg-background/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight mb-3">
              Key Platform Services
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base">
              Core facilities and administrative tools for the innovation community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Calendar,
                title: "Lab Reservation System",
                description: "Securely book equipment and workspaces.",
                link: "/book-slots",
                cta: "Access Portal"
              },
              {
                icon: Trophy,
                title: "Innovation Showcase",
                description: "Browse successful projects and research.",
                link: "/achievements",
                cta: "View Archive"
              },
              {
                icon: Lightbulb,
                title: "Academic Calendar",
                description: "Schedule of workshops and seminars.",
                link: "/events",
                cta: "Check Schedule"
              },
              {
                icon: Users,
                title: "Community Access",
                description: "Connect with faculty and peer researchers.",
                link: "/lab-info",
                cta: "Member Login"
              },
            ].map((feature, index) => (
              <Link key={index} to={feature.link} className="block h-full group outline-none">
                <Card className="h-full bg-card border border-border/60 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-primary/50 hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] rounded-xl">
                  <CardContent className="p-8 flex flex-col h-full">
                    <div className="w-12 h-12 rounded-lg bg-primary/5 flex items-center justify-center mb-6 transition-colors group-hover:bg-primary/10">
                      <feature.icon className="w-6 h-6 text-primary/80 group-hover:text-primary transition-colors duration-300" />
                    </div>

                    <h3 className="text-lg font-semibold text-foreground tracking-tight mb-3 group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </h3>

                    <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-grow">
                      {feature.description}
                    </p>

                    <div className="flex items-center text-primary text-sm font-medium mt-auto group-hover:underline underline-offset-4">
                      {feature.cta}
                      <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <AboutPlatform />

      {/* Stats Section */}
      <StatsSection />

      {/* Achievement Showcase Section */}
      <AchievementShowcase />

      {/* Resource Showcase Section */}
      <ResourceShowcase />

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
