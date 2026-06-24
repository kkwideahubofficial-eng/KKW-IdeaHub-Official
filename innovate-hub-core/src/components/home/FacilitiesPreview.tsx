import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const previewLabs = [
  {
    title: "3D Printing & Scanning",
    desc: "Additive manufacturing and 3D digitizing for physical prototype models.",
    image: "https://images.unsplash.com/photo-1615840287214-7fe58a8f3685?auto=format&fit=crop&q=80&w=600",
    path: "/aicte-idea-lab"
  },
  {
    title: "CNC Router & Milling",
    desc: "Precision subtractive modeling for custom wood, acrylic, and light metal components.",
    image: "https://images.unsplash.com/photo-1612690669207-fed642192c40?auto=format&fit=crop&q=80&w=600",
    path: "/aicte-idea-lab"
  },
  {
    title: "Laser Cutting & Engraving",
    desc: "High-power lasers for exact cutting and fine marking on diverse sheets.",
    image: "https://images.unsplash.com/photo-1534224039826-c7a0dea0e66a?auto=format&fit=crop&q=80&w=600",
    path: "/aicte-idea-lab"
  },
  {
    title: "Robotics & Automation",
    desc: "Robotic chassis fabrication, actuators assembly, and motor drive testing.",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=600",
    path: "/aicte-idea-lab"
  },
  {
    title: "PCB Prototyping Lab",
    desc: "In-house circuit board design, dry etching, assembly, and soldering stations.",
    image: "https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?auto=format&fit=crop&q=80&w=600",
    path: "/aicte-idea-lab"
  },
  {
    title: "IoT & Smart Systems",
    desc: "Sensor modules, embedded processors, microcontrollers, and wireless transceivers.",
    image: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=600",
    path: "/aicte-idea-lab"
  }
];

const FacilitiesPreview = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Explore IDEA Lab
          </h2>
          <div className="w-12 h-1 bg-primary mx-auto rounded-full" />
          <p className="text-slate-500 text-base sm:text-lg">
            Discover the cutting-edge workspaces and advanced machinery available for student research and prototyping.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {previewLabs.map((lab, index) => (
            <Link 
              key={index}
              to={lab.path}
              className="group flex flex-col h-full bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 outline-none"
            >
              {/* Photo wrapper */}
              <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                <img 
                  src={lab.image}
                  alt={lab.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-slate-950/10 group-hover:bg-slate-950/0 transition-colors duration-300" />
              </div>

              {/* Text content */}
              <div className="p-4 sm:p-6 flex flex-col flex-grow justify-between">
                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">
                    {lab.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-3">
                    {lab.desc}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-200/60 flex items-center text-xs font-semibold text-primary group-hover:underline gap-1">
                  View Available Machines
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};

export default FacilitiesPreview;
