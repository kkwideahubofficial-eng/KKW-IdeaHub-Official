import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Trophy, Star, Award } from "lucide-react";
import api from "@/lib/axios";

interface AchievementItem {
  _id: string;
  title: string;
  description: string;
  date: string;
  achievedBy: string;
  imageUrl?: string;
  achievementType?: string;
  competitionLevel?: string;
  prizeAmount?: number;
}

const fallbackFeatured: AchievementItem = {
  _id: "fb-feat",
  title: "Marine Technology Innovation",
  description: "A multidisciplinary student cohort designed a low-drag autonomous marine vessel prototype powered by solar energy, designed for remote water salinity mapping and automated trash collection along harbor shorelines.",
  date: "2025-06-15",
  achievedBy: "Marine Innovation Team",
  imageUrl: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=800",
  achievementType: "National Innovation Challenge 2025",
  competitionLevel: "Winner",
  prizeAmount: 50000
};

const fallbackStories: AchievementItem[] = [
  {
    _id: "fb-st1",
    title: "Millets Value Chain Platform",
    description: "Developed a distributed ledger system for tracking and promoting millet crop sourcing and regional trade distribution networks.",
    date: "2025-05-10",
    achievedBy: "Team Nakshatra",
    imageUrl: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&q=80&w=400",
    achievementType: "Winner - SIH 2025"
  },
  {
    _id: "fb-st2",
    title: "Drone-based Crop Diagnostics",
    description: "Created autonomous quadcopters equipped with multispectral sensors for micro-level weed detection and pesticide routing.",
    date: "2025-04-18",
    achievedBy: "AeroTech Division",
    imageUrl: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=400",
    achievementType: "Gold Medal - Smart India Hackathon"
  },
  {
    _id: "fb-st3",
    title: "Wearable ECG Monitor",
    description: "Built a ultra-low-power telemetry patch mapping cardiac activity with real-time analytics alerts sent directly to clinics.",
    date: "2025-03-22",
    achievedBy: "BioSense Group",
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=400",
    achievementType: "First Prize - Hackathon 2025"
  }
];

const AchievementsSection = () => {
  const [featured, setFeatured] = useState<AchievementItem>(fallbackFeatured);
  const [stories, setStories] = useState<AchievementItem[]>(fallbackStories);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const res = await api.get("/achievements");
        if (res.data && res.data.length > 0) {
          // Sort latest first
          const sorted: AchievementItem[] = [...res.data].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );

          // Featured is index 0
          setFeatured(sorted[0]);

          // Stories are index 1, 2, 3
          const remaining = sorted.slice(1, 4);
          
          // Fill gaps if fewer than 4 achievements exist in the database
          const finalStories = [...remaining];
          if (finalStories.length < 3) {
            const gapsNeeded = 3 - finalStories.length;
            for (let i = 0; i < gapsNeeded; i++) {
              finalStories.push(fallbackStories[i]);
            }
          }
          setStories(finalStories);
        }
      } catch (err) {
        console.warn("Unable to fetch live achievements, using default fallbacks.");
      }
    };
    fetchAchievements();
  }, []);

  return (
    <section className="py-20 bg-white border-b border-slate-200/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Student Achievements
          </h2>
          <div className="w-12 h-1 bg-primary mx-auto rounded-full" />
          <p className="text-slate-500 text-sm sm:text-base">
            Celebrating the breakthroughs, patents, and hackathon victories from the AICTE IDEA Lab community.
          </p>
        </div>

        {/* 1. Featured Achievement Banner */}
        <div className="bg-slate-50 rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden mb-16 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
            
            {/* Left/Top Column: Photo */}
            <div className="md:col-span-6 relative aspect-video md:aspect-auto min-h-[280px] bg-slate-950">
              <img 
                src={featured.imageUrl || "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=800"} 
                alt={featured.title} 
                className="absolute inset-0 w-full h-full object-cover opacity-90"
                loading="lazy"
              />
              <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold shadow-md">
                <Trophy className="w-3.5 h-3.5" />
                Featured Innovation
              </div>
            </div>

            {/* Right Column: Content */}
            <div className="md:col-span-6 p-8 flex flex-col justify-center space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {featured.achievementType || featured.competitionLevel || "National Competition Level"}
              </span>
              <h3 className="text-2xl font-black text-slate-900 leading-tight">
                {featured.title}
              </h3>
              
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-blue-50 text-primary text-xs font-bold border border-blue-100">
                  <Star className="w-3 h-3 fill-current" />
                  {featured.competitionLevel || "Winner"}
                </span>
                {featured.prizeAmount && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-amber-50 text-amber-800 text-xs font-bold border border-amber-100">
                    <Award className="w-3 h-3" />
                    ₹{featured.prizeAmount.toLocaleString()} Cash Prize
                  </span>
                )}
              </div>

              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed pt-2 line-clamp-4">
                {featured.description}
              </p>

              <div className="pt-4">
                <Link 
                  to={`/achievements/${featured._id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                >
                  View Story
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* 2. Success Stories Sub-section */}
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="border-b border-slate-200/80 pb-4">
            <h3 className="text-xl font-bold text-slate-900">
              Student Success Stories
            </h3>
            <p className="text-xs text-slate-400 mt-1">Recent national competition winners and product prototyping benchmarks.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stories.map((story) => (
              <div 
                key={story._id}
                className="flex flex-col h-full bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-primary/20 transition-all duration-300 group"
              >
                {/* Photo */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 border-b">
                  <img 
                    src={story.imageUrl || "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&q=80&w=400"} 
                    alt={story.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                
                {/* Details */}
                <div className="p-5 flex flex-col flex-grow justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider truncate max-w-[120px]">
                        {story.achievedBy}
                      </span>
                      <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded truncate max-w-[150px]">
                        {story.achievementType || "Award Winner"}
                      </span>
                    </div>
                    <h4 className="text-base font-extrabold text-slate-800 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {story.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
                      {story.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <Link 
                      to={`/achievements/${story._id}`}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-primary group-hover:underline"
                    >
                      Read Story
                      <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default AchievementsSection;
