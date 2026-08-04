import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Trophy, Award, ZoomIn } from "lucide-react";
import api from "@/lib/axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
  const [fitMode, setFitMode] = useState<"contain" | "cover">("contain");

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const res = await api.get("/achievements");
        if (res.data && res.data.length > 0) {
          const sorted: AchievementItem[] = [...res.data].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );

          setFeatured(sorted[0]);

          const remaining = sorted.slice(1, 4);
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
    <section className="py-12 bg-white border-b border-slate-200/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-8 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Student Achievements
          </h2>
          <div className="w-12 h-1 bg-primary mx-auto rounded-full" />
          <p className="text-slate-500 text-xs sm:text-sm">
            Celebrating the breakthroughs, patents, and hackathon victories from the AICTE IDEA Lab community.
          </p>
        </div>

        {/* 1. Featured Achievement Banner */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden mb-10 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
            
            {/* Left/Top Column: Photo */}
            <div 
              onClick={() => setPreviewImage({ 
                url: featured.imageUrl || "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=800", 
                title: featured.title 
              })}
              className="md:col-span-5 relative aspect-video md:aspect-auto min-h-[220px] bg-slate-950 cursor-pointer group overflow-hidden"
              title="Click to view full image"
            >
              <img 
                src={featured.imageUrl || "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=800"} 
                alt={featured.title} 
                className="absolute inset-0 w-full h-full object-cover object-top opacity-90 transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold shadow-md z-10">
                <Trophy className="w-3 h-3" />
                Featured Innovation
              </div>
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[10px] font-bold shadow-lg z-10">
                <ZoomIn className="w-3.5 h-3.5" />
                View Full Size
              </div>
            </div>

            {/* Right Column: Content */}
            <div className="md:col-span-7 p-6 flex flex-col justify-center space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {featured.achievementType || featured.competitionLevel || "National Competition Level"}
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">
                {featured.title}
              </h3>
              
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-primary text-[10px] font-bold border border-blue-100">
                  {featured.competitionLevel || "Winner"}
                </span>
                {featured.prizeAmount && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-100">
                    <Award className="w-2.5 h-2.5" />
                    ₹{featured.prizeAmount.toLocaleString()} Cash Prize
                  </span>
                )}
              </div>

              <p className="text-slate-500 text-xs leading-relaxed pt-1 line-clamp-2">
                {featured.description}
              </p>

              <div className="pt-2">
                <Link 
                  to={`/achievements/${featured._id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  View Story
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* 2. Success Stories Sub-section */}
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="border-b border-slate-200/80 pb-2">
            <h3 className="text-lg font-bold text-slate-900">
              Student Success Stories
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Recent national competition winners and product prototyping benchmarks.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {stories.map((story) => (
              <div 
                key={story._id}
                className="flex flex-col h-full bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-primary/20 transition-all duration-300 group"
              >
                {/* Photo */}
                <div 
                  onClick={() => setPreviewImage({ 
                    url: story.imageUrl || "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&q=80&w=400", 
                    title: story.title 
                  })}
                  className="relative aspect-[16/9] overflow-hidden bg-slate-100 border-b cursor-pointer group/img"
                  title="Click to view full image"
                >
                  <img 
                    src={story.imageUrl || "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&q=80&w=400"} 
                    alt={story.title}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover/img:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-black/75 backdrop-blur-sm text-white text-[9px] font-bold">
                    <ZoomIn className="w-3 h-3" />
                    Full Size
                  </div>
                </div>
                
                {/* Details */}
                <div className="p-4 flex flex-col flex-grow justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] font-extrabold text-primary uppercase tracking-wider truncate max-w-[100px]">
                        {story.achievedBy}
                      </span>
                      <span className="text-[8px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded truncate max-w-[120px]">
                        {story.achievementType || "Award Winner"}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-primary transition-colors line-clamp-1">
                      {story.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
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

      {/* Lightbox Dialog Modal for Original/Full-Size Image View */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl p-4 bg-slate-950 text-white border-slate-800 rounded-2xl overflow-hidden">
          <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-800">
            <DialogTitle className="text-sm font-semibold truncate pr-4 text-slate-200">
              {previewImage?.title}
            </DialogTitle>
            <div className="flex items-center gap-2 mr-6">
              <button
                type="button"
                onClick={() => setFitMode(fitMode === "contain" ? "cover" : "contain")}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                {fitMode === "contain" ? "Mode: Original / Uncropped Fit" : "Mode: Fill Container"}
              </button>
            </div>
          </DialogHeader>
          <div className="relative w-full h-[65vh] flex items-center justify-center bg-black/60 rounded-xl overflow-hidden mt-3 p-2">
            {previewImage && (
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className={`max-h-full max-w-full ${fitMode === "contain" ? "object-contain" : "object-cover object-top w-full h-full"} rounded-lg transition-all duration-300`}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default AchievementsSection;
