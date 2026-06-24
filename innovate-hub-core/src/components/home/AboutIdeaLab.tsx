import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const AboutIdeaLab = () => {
  const points = [
    { title: "Machine Booking", desc: "Digital slot scheduling for high-precision tooling equipment." },
    { title: "Material Inventory", desc: "Live consumable stock tracking for prototyping supplies." },
    { title: "Event Management", desc: "Schedule and registration portal for bootcamps and workshops." },
    { title: "Achievement Tracking", desc: "Showcase area celebrating successful student creations and research." }
  ];

  return (
    <section className="py-20 bg-slate-50 border-y border-slate-200/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Image with Dark Overlay */}
          <div className="lg:col-span-6 relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-slate-900 aspect-[16/10] group">
            <img 
              src="/images/idea-lab.jpg"
              alt="Students collaborating inside the AICTE IDEA Lab"
              className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="lazy"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-slate-950/10 to-transparent pointer-events-none" />
            
            {/* Small glassmorphic stats badge in image */}
            <div className="absolute bottom-6 left-6 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-300">Co-funded by</span>
              <p className="text-sm font-extrabold leading-tight">AICTE & KKWIEER</p>
            </div>
          </div>

          {/* Right Column: Text Information */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-bold text-primary uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                AICTE Flagship Initiative
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                AICTE IDEA Lab
              </h2>
              <p className="text-lg font-bold text-slate-900">
                Innovation starts with access to the right tools.
              </p>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                The IDEA (Idea Development, Evaluation and Application) Lab at KKWIEER provides students, researchers, and entrepreneurs a collaborative space to design and fabricate physical prototypes, moving from concept to physical creation under one roof.
              </p>
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {points.map((pt, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{pt.title}</h4>
                    <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">{pt.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA button */}
            <div className="pt-4 flex flex-wrap gap-4">
              <Link to="/aicte-idea-lab">
                <Button className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-6 py-3 shadow-md transition-all">
                  Explore Facilities
                </Button>
              </Link>
              <Link to="/book-slots">
                <Button variant="outline" className="border-slate-200 hover:bg-slate-100 rounded-xl px-6 py-3 text-slate-700 font-semibold transition-colors">
                  Reserve Workspace
                </Button>
              </Link>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutIdeaLab;
