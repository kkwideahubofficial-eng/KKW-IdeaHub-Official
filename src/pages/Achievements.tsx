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

  const handleCreate = async (e: React.FormEvent) => {
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
      const res = await api.post('/achievements', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setAchievements([res.data, ...achievements]);
      setOpen(false);
      setForm({ title: "", description: "", date: "", achievedBy: "", imageUrl: "" });
      toast.success('Achievement created');
    } catch {
      toast.error('Failed to create achievement');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Achievements</h1>
          <p className="text-muted-foreground">Celebrating innovation and success stories</p>
        </div>
        {isCoordinator ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">
                <PlusCircle className="w-4 h-4 mr-2" /> Add Achievement
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Achievement</DialogTitle>
                <DialogDescription>Provide details and optionally an image.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
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
                  <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">Create</button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        ) : null}
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
      {loading ? (
        <div>Loading...</div>
      ) : achievements.length === 0 ? (
        <p className="text-muted-foreground">No achievements yet. {isCoordinator ? 'Create the first one.' : 'Check back later.'}</p>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => (
          <Card key={achievement._id} className="hover:shadow-lg transition-all duration-300 cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <Badge variant="outline">{new Date(achievement.date).toLocaleDateString()}</Badge>
              </div>
              <CardTitle className="line-clamp-2">{achievement.title}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {achievement.achievedBy}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {achievement.imageUrl ? (
                <img src={achievement.imageUrl} alt={achievement.title} className="w-full max-h-56 object-cover rounded mb-3" />
              ) : null}
              <p className="text-sm text-muted-foreground line-clamp-4">{achievement.description}</p>
              {isCoordinator && (
                <div className="mt-3 flex justify-end">
                  <button
                    className="px-3 py-1.5 text-sm rounded bg-destructive text-destructive-foreground"
                    onClick={async () => {
                      if (!confirm('Delete this achievement?')) return;
                      try {
                        await api.delete(`/achievements/${achievement._id}`);
                        setAchievements(achievements.filter((a) => a._id !== achievement._id));
                        toast.success('Achievement deleted');
                      } catch {
                        toast.error('Failed to delete');
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      )}
    </div>
  );
};

export default Achievements;
