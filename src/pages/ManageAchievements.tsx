import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';

interface Achievement {
  _id: string;
  title: string;
  description: string;
  date: string;
  achievedBy: string;
}

// AchievementForm component for the dialog
interface AchievementFormProps {
  achievement: Achievement | null;
  onSubmit: (formData: Omit<Achievement, '_id'>) => void;
}

const AchievementForm: React.FC<AchievementFormProps> = ({ achievement, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    achievedBy: '',
  });

  useEffect(() => {
    if (achievement) {
      setFormData({
        title: achievement.title,
        description: achievement.description,
        date: new Date(achievement.date).toISOString().split('T')[0],
        achievedBy: achievement.achievedBy,
      });
    } else {
      setFormData({ title: '', description: '', date: '', achievedBy: '' });
    }
  }, [achievement]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" value={formData.description} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="date">Date</Label>
        <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="achievedBy">Achieved By</Label>
        <Input id="achievedBy" name="achievedBy" value={formData.achievedBy} onChange={handleChange} required />
      </div>
      <DialogFooter>
        <Button type="submit">{achievement ? 'Update' : 'Create'}</Button>
      </DialogFooter>
    </form>
  );
};

const ManageAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);

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
    setIsDialogOpen(true);
  };

  const handleFormSubmit = async (formData: Omit<Achievement, '_id'>) => {
    try {
      if (currentAchievement) {
        const response = await api.put(`/achievements/${currentAchievement._id}`, formData);
        setAchievements(achievements.map(a => a._id === currentAchievement._id ? response.data : a));
        toast.success('Achievement updated successfully.');
      } else {
        const response = await api.post('/achievements', formData);
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
        <h1 className="text-3xl font-bold">Manage Achievements</h1>
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Achievement
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentAchievement ? 'Edit Achievement' : 'Add New Achievement'}</DialogTitle>
          </DialogHeader>
          <AchievementForm achievement={currentAchievement} onSubmit={handleFormSubmit} />
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        {achievements.map(achievement => (
          <Card key={achievement._id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{achievement.title}</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => openDialog(achievement)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(achievement._id)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p><strong>Date:</strong> {new Date(achievement.date).toLocaleDateString()}</p>
              <p><strong>Achieved By:</strong> {achievement.achievedBy}</p>
              <p className="mt-2">{achievement.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ManageAchievements;
