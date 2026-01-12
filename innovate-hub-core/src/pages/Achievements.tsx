import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Calendar, PlusCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ReadMore } from "@/components/ReadMore";

interface AchievementItem {
  _id: string;
  title: string;
  description: string;
  date: string;
  achievedBy: string;
  imageUrl?: string;
}

function getCurrentUser() {
  try {
    const raw = localStorage.getItem("idea_hub_user");
    const token = localStorage.getItem("idea_hub_token");
    if (!raw || !token) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const Achievements = () => {
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", date: "", achievedBy: "", imageUrl: "" });
  const user = useMemo(getCurrentUser, []);
  const isCoordinator = user?.role === 'coordinator';

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const res = await api.get('/achievements');
        setAchievements(res.data);
      } catch {
        toast.error('Failed to load achievements');
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('date', new Date(form.date).toISOString());
      formData.append('achievedBy', form.achievedBy);
      if (form.imageUrl) formData.append('imageUrl', form.imageUrl);
      
      const fileInput = document.getElementById('achievement-image') as HTMLInputElement | null;
      if (fileInput?.files && fileInput.files[0]) {
        formData.append('image', fileInput.files[0]);
      }

      if (editingId) {
        // Update
        const res = await api.put(`/achievements/${editingId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setAchievements(achievements.map(a => a._id === editingId ? res.data : a));
        toast.success('Achievement updated');
      } else {
        // Create
        const res = await api.post('/achievements', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setAchievements([res.data, ...achievements]);
        toast.success('Achievement created');
      }
      
      setOpen(false);
      setForm({ title: "", description: "", date: "", achievedBy: "", imageUrl: "" });
      setEditingId(null);
    } catch {
      toast.error(editingId ? 'Failed to update achievement' : 'Failed to create achievement');
    }
  };

  const startEdit = (achievement: AchievementItem) => {
    setEditingId(achievement._id);
    setForm({
      title: achievement.title,
      description: achievement.description,
      date: new Date(achievement.date).toISOString().split('T')[0],
      achievedBy: achievement.achievedBy,
      imageUrl: achievement.imageUrl || ""
    });
    setOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Achievements</h1>
          <p className="text-muted-foreground">Celebrating innovation and success stories</p>
        </div>
        {isCoordinator ? (
          <Dialog open={open} onOpenChange={(val) => { if(!val) { setEditingId(null); setForm({ title: "", description: "", date: "", achievedBy: "", imageUrl: "" }); } setOpen(val); }}>
            <DialogTrigger asChild>
              <button className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">
                <PlusCircle className="w-4 h-4 mr-2" /> Add Achievement
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Achievement" : "Add Achievement"}</DialogTitle>
                <DialogDescription>Provide details and optionally an image.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="achievedBy">Achieved By</Label>
                  <Input id="achievedBy" value={form.achievedBy} onChange={(e) => setForm({ ...form, achievedBy: e.target.value })} required />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="achievement-image">Upload Image (optional)</Label>
                    <Input id="achievement-image" type="file" accept="image/*" />
                  </div>
                  <div>
                    <Label htmlFor="imageUrl">Or Image URL</Label>
                    <Input id="imageUrl" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
                  </div>
                </div>
                <DialogFooter>
                  <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">
                    {editingId ? "Update" : "Create"}
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        ) : null}
      </div>

      {/* Stats */}
      {/* Subtle Premium Stats Dashboard */}
      <div className="relative mb-10">
        {/* Subtle Ambient Light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[120%] bg-primary/5 blur-[90px] rounded-full pointer-events-none -z-10 opacity-60" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
             { icon: Trophy, value: achievements.length, label: "Total Projects", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-500/10" },
             { icon: Users, value: "24", label: "Active Teams", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
             { icon: Calendar, value: "2025", label: "Current Year", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10" }
          ].map((stat, i) => (
            <div 
              key={i} 
              className="group relative overflow-hidden rounded-[20px] border border-white/50 dark:border-white/10 bg-gradient-to-br from-white/90 via-white/60 to-white/30 dark:from-white/10 dark:via-white/5 dark:to-transparent backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 hover:border-white/80"
            >
               {/* Inner Highlight for 3D Edge Feel */}
               <div className="absolute inset-0 rounded-[20px] ring-1 ring-inset ring-white/60 dark:ring-white/5 pointer-events-none" />
               
               <div className="p-6 flex items-center gap-5 relative z-10">
                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                    <stat.icon className={`w-7 h-7 ${stat.color} drop-shadow-sm`} />
                 </div>
                 <div>
                    <p className="text-3xl font-extrabold text-foreground drop-shadow-sm tracking-tight">{stat.value}</p>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                 </div>
                 {/* Decorative background number */}
                 <span className="absolute -right-2 -bottom-4 text-8xl font-black text-foreground/5 pointer-events-none select-none">
                    {i + 1}
                 </span>
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements Grid */}
      {loading ? (
        <div>Loading...</div>
      ) : achievements.length === 0 ? (
        <p className="text-muted-foreground">No achievements yet. {isCoordinator ? 'Create the first one.' : 'Check back later.'}</p>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {achievements.map((achievement) => (
          <div 
            key={achievement._id} 
            className="group relative flex flex-col h-full bg-white dark:bg-zinc-900 rounded-[24px] border border-black/10 dark:border-white/10 ring-1 ring-inset ring-white/70 dark:ring-white/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden"
            onClick={() => {}} // Placeholder for future click action
          >
             {/* Media Container - Inset & Controlled */}
             <div className="p-3 pb-0">
               <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-muted/30 shadow-inner">
                 {achievement.imageUrl ? (
                    <img 
                      src={achievement.imageUrl} 
                      alt={achievement.title} 
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                      <Trophy className="w-16 h-16" />
                    </div>
                 )}
                 {/* Overlay Gradient (Optional for text readability if over image, but here separate) */}
               </div>
             </div>

             {/* Content Body */}
             <div className="flex flex-col flex-1 p-5 space-y-3">
                {/* Title */}
                <h3 className="text-xl font-bold leading-tight text-foreground/90 group-hover:text-primary transition-colors line-clamp-2">
                  {achievement.title}
                </h3>
  
                {/* Description */}
                <div className="flex-1 text-sm text-muted-foreground/80 leading-relaxed">
                  <ReadMore text={achievement.description} limit={20} />
                </div>

                {/* Metadata Footer */}
                <div className="pt-4 mt-auto flex items-center justify-between border-t border-black/5 dark:border-white/5">
                   <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                         <Calendar className="w-3.5 h-3.5 opacity-70" />
                         {new Date(achievement.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                   </div>
                   
                   {/* Quiet CTA or Author */}
                   <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground/60">by {achievement.achievedBy}</span>
                   </div>
                </div>

                {/* Coordinator Actions (Absolute/Overlay or Integrated) */}
                {isCoordinator && (
                   <div className="flex justify-end gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); startEdit(achievement); }}
                        className="p-2 h-8 w-8 inline-flex items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        title="Edit"
                      >
                         <span className="sr-only">Edit</span>
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                      </button>
                      <button 
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!confirm('Delete?')) return;
                          try { await api.delete(`/achievements/${achievement._id}`); setAchievements(achievements.filter(a => a._id !== achievement._id)); toast.success('Deleted'); } catch { toast.error('Error'); } 
                        }}
                        className="p-2 h-8 w-8 inline-flex items-center justify-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-white"
                        title="Delete"
                      >
                         <span className="sr-only">Delete</span>
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                      </button>
                   </div>
                )}
             </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};

export default Achievements;
