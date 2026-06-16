import { useState } from "react";

interface GalleryItem {
  id: string;
  category: "Workshops" | "Hackathons" | "Project Expo" | "Machinery" | "Achievements";
  title: string;
  image: string;
}

const galleryItems: GalleryItem[] = [
  {
    id: "g1",
    category: "Machinery",
    title: "Dual Extruder 3D Printer",
    image: "https://images.unsplash.com/photo-1615840287214-7fe58a8f3685?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "g2",
    category: "Hackathons",
    title: "Team Nakshatra SIH 2025 prep",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "g3",
    category: "Workshops",
    title: "Hands-on Microcontrollers Bootcamp",
    image: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "g4",
    category: "Achievements",
    title: "SIH National Level Winner Trophy",
    image: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "g5",
    category: "Project Expo",
    title: "Drone Diagnostics Prototype Demonstration",
    image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "g6",
    category: "Machinery",
    title: "Precision CO2 Laser Cutter Bench",
    image: "https://images.unsplash.com/photo-1534224039826-c7a0dea0e66a?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "g7",
    category: "Workshops",
    title: "Faculty Mentorship Orientation Panel",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "g8",
    category: "Project Expo",
    title: "Robotics and Logic Analyzers Arena",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=600",
  },
];

const categories = ["All", "Workshops", "Hackathons", "Project Expo", "Machinery", "Achievements"];

const HomeGallery = () => {
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredItems = activeFilter === "All"
    ? galleryItems
    : galleryItems.filter(item => item.category === activeFilter);

  return (
    <section className="py-20 bg-slate-50 border-b border-slate-200/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Inside IDEA Lab
          </h2>
          <div className="w-12 h-1 bg-primary mx-auto rounded-full" />
          <p className="text-slate-500 text-sm sm:text-base">
            Glimpse into the collaborative culture, hands-on fabrication activities, and national award ceremonies.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeFilter === cat
                  ? "bg-primary text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Masonry / Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {filteredItems.map((item) => (
            <div 
              key={item.id}
              className="group relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-200/60 shadow-xs aspect-square"
            >
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-60 transition-all duration-500 ease-out"
                loading="lazy"
              />
              
              {/* Bottom text overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest">
                  {item.category}
                </span>
                <h3 className="text-sm font-bold text-white leading-tight mt-1">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HomeGallery;
