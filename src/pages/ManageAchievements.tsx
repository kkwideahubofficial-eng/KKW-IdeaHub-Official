import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PlusCircle, Edit, Trash2, Users, Calendar } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { ReadMore } from '@/components/ReadMore';

interface Achievement {
  _id: string;
  title: string;
  description: string;
  date: string;
  achievedBy: string;
  imageUrl?: string;
}

const ManageAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [form, setForm] = useState({ title: '', description: '', date: '', achievedBy: '', imageUrl: '' });

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const response = await api.get('/achievements');
        setAchievements(response.data);
      } catch (error) {
        toast.error('Failed to fetch achievements.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAchievements();
  }, []);

  const openDialog = (achievement: Achievement | null = null) => {
    setCurrentAchievement(achievement);
    if (achievement) {
      setForm({
        title: achievement.title,
        description: achievement.description,
        date: new Date(achievement.date).toISOString().split('T')[0],
        achievedBy: achievement.achievedBy,
        imageUrl: achievement.imageUrl || ''
      });
    } else {
      setForm({ title: '', description: '', date: '', achievedBy: '', imageUrl: '' });
    }
    setIsDialogOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('date', form.date);
      formData.append('achievedBy', form.achievedBy);
      if (form.imageUrl) formData.append('imageUrl', form.imageUrl);
      
      const fileInput = document.getElementById('achievement-image') as HTMLInputElement | null;
      if (fileInput?.files && fileInput.files[0]) {
        formData.append('image', fileInput.files[0]);
      }

      if (currentAchievement) {
        const response = await api.put(`/achievements/${currentAchievement._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setAchievements(achievements.map(a => a._id === currentAchievement._id ? response.data : a));
        toast.success('Achievement updated successfully.');
      } else {
        const response = await api.post('/achievements', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setAchievements([response.data, ...achievements]);
        toast.success('Achievement created successfully.');
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Failed to save achievement.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this achievement?')) return;
    try {
      await api.delete(`/achievements/${id}`);
      setAchievements(achievements.filter(a => a._id !== id));
      toast.success('Achievement deleted successfully.');
    } catch (error) {
      toast.error('Failed to delete achievement.');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-3xl font-bold">Manage Achievements</h1>
           <p className="text-muted-foreground">Add, edit, or remove student achievements</p>
        </div>
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Achievement
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{currentAchievement ? 'Edit Achievement' : 'Add New Achievement'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} required />
              </div>
              <div>
                 <Label htmlFor="achievedBy">Achieved By</Label>
                 <Input id="achievedBy" value={form.achievedBy} onChange={(e) => setForm({...form, achievedBy: e.target.value})} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="achievement-image">Upload Image (optional)</Label>
                <Input id="achievement-image" type="file" accept="image/*" />
              </div>
              <div>
                <Label htmlFor="imageUrl">Or Image URL</Label>
                <Input id="imageUrl" value={form.imageUrl} onChange={(e) => setForm({...form, imageUrl: e.target.value})} placeholder="https://..." />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">{currentAchievement ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.length === 0 ? (
           <p className="text-muted-foreground col-span-full text-center py-10">No achievements recorded yet.</p>
        ) : achievements.map(achievement => (
          <Card key={achievement._id} className="flex flex-col overflow-hidden hover:shadow-md transition-shadow">
             {achievement.imageUrl && (
              <div className="h-48 w-full overflow-hidden bg-muted">
                 <img src={achievement.imageUrl} alt={achievement.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
            )}
            <CardHeader>
              <div className="flex justify-between items-start">
                  <div className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                      <Calendar className="w-3 h-3" /> {new Date(achievement.date).toLocaleDateString()}
                  </div>
              </div>
              <CardTitle className="line-clamp-1" title={achievement.title}>{achievement.title}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                 <Users className="w-3 h-3" /> {achievement.achievedBy}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              
              <ReadMore text={achievement.description} limit={30} className="mb-4 flex-1" />

              <div className="flex gap-2 mt-auto">
                <Button variant="outline" className="flex-1" size="sm" onClick={() => openDialog(achievement)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button variant="destructive" size="icon" className="shrink-0" onClick={() => handleDelete(achievement._id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ManageAchievements;
