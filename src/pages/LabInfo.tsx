import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Target, Eye, Cpu, Printer, Microscope, Zap, Wifi } from "lucide-react";

const LabInfo = () => {
  const facilities = [
    {
      icon: Cpu,
      name: "High-Performance Computing",
      description: "State-of-the-art servers and workstations for AI/ML research",
    },
    {
      icon: Printer,
      name: "3D Printing & Fabrication",
      description: "Multiple 3D printers and CNC machines for rapid prototyping",
    },
    {
      icon: Microscope,
      name: "Electronics Lab",
      description: "Complete electronics workbench with testing equipment",
    },
    {
      icon: Zap,
      name: "IoT Development Suite",
      description: "Arduino, Raspberry Pi, and sensor kits for IoT projects",
    },
    {
      icon: Wifi,
      name: "High-Speed Connectivity",
      description: "Gigabit internet and dedicated network infrastructure",
    },
    {
      icon: Lightbulb,
      name: "Collaboration Spaces",
      description: "Meeting rooms and brainstorming areas for team work",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">About IDEA Hub</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          A state-of-the-art innovation laboratory dedicated to fostering creativity, 
          collaboration, and cutting-edge research
        </p>
      </div>

      {/* Vision & Mission */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-primary-foreground" />
              </div>
              <CardTitle>Our Vision</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              To be a leading innovation hub that empowers students, researchers, and entrepreneurs 
              to transform groundbreaking ideas into impactful solutions that address real-world challenges 
              and drive technological advancement.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/5 to-accent/5">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-secondary-foreground" />
              </div>
              <CardTitle>Our Mission</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              To provide world-class facilities, mentorship, and resources that enable innovators 
              to experiment, prototype, and launch their ideas. We foster a collaborative ecosystem 
              where creativity meets technology to solve tomorrow's problems today.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Facilities Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-foreground mb-6 text-center">Our Facilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((facility, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                    <facility.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{facility.name}</h3>
                    <p className="text-sm text-muted-foreground">{facility.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* About Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">About the Lab</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            IDEA Hub is a premier innovation laboratory established to bridge the gap between 
            theoretical knowledge and practical application. Our 5,000 square foot facility houses 
            cutting-edge equipment and technology that enables students, faculty, and external 
            collaborators to bring their innovative concepts to life.
          </p>
          <p>
            Since our inception, we have supported over 500 projects across diverse domains including 
            artificial intelligence, robotics, IoT, sustainable technology, healthcare innovation, 
            and social entrepreneurship. Our lab operates on the principle that innovation flourishes 
            in an environment that combines excellent infrastructure with collaborative spirit.
          </p>
          <p>
            We offer not just physical resources but also mentorship from industry experts, 
            workshops on emerging technologies, networking opportunities with potential investors, 
            and a supportive community of like-minded innovators. Whether you're a student with 
            your first idea or an experienced researcher, IDEA Hub provides the platform to 
            experiment, fail, learn, and succeed.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-6 pt-6 border-t">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">24/7</div>
              <div className="text-sm">Access Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">500+</div>
              <div className="text-sm">Projects Supported</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">50+</div>
              <div className="text-sm">Expert Mentors</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LabInfo;
