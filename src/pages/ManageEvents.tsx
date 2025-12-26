import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';

// EventForm component for the dialog
interface EventFormProps {
  event: Event | null;
  onSubmit: (formData: Omit<Event, '_id'>) => void;
}

const EventForm: React.FC<EventFormProps> = ({ event, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    organizer: '',
    imageUrl: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description,
        date: new Date(event.date).toISOString().split('T')[0],
        organizer: event.organizer,
        imageUrl: event.imageUrl || '',
      });
      setImageFile(null);
    } else {
      setFormData({ title: '', description: '', date: '', organizer: '', imageUrl: '' });
      setImageFile(null);
    }
  }, [event]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, imageUrl: event.target?.result as string }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'events_upload');
    
    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsUploading(true);
      let finalImageUrl = formData.imageUrl;
      
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }
      
      const { imageUrl, ...formDataWithoutImage } = formData;
      await onSubmit({ ...formDataWithoutImage, imageUrl: finalImageUrl });
    } catch (error) {
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
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
        <Label htmlFor="organizer">Organizer</Label>
        <Input id="organizer" name="organizer" value={formData.organizer} onChange={handleChange} required />
      </div>
      <div>
        <Label>Event Image</Label>
        <Input 
          type="file" 
          accept="image/*" 
          onChange={handleImageChange}
          className="cursor-pointer"
        />
        {formData.imageUrl && (
          <div className="mt-2">
            <img 
              src={formData.imageUrl} 
              alt="Event preview" 
              className="max-h-40 rounded-md"
            />
          </div>
        )}
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isUploading}>
          {isUploading ? 'Uploading...' : (event ? 'Update' : 'Create')}
        </Button>
      </DialogFooter>
    </form>
  );
};

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  organizer: string;
  imageUrl?: string;
}

const ManageEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);

  const openDialog = (event: Event | null = null) => {
    setCurrentEvent(event);
    setIsDialogOpen(true);
  };

  const handleFormSubmit = async (formData: Omit<Event, '_id'>) => {
    try {
      if (currentEvent) {
        // Update existing event
        const response = await api.put(`/events/${currentEvent._id}`, formData);
        setEvents(events.map(e => e._id === currentEvent._id ? response.data : e));
        toast.success('Event updated successfully.');
      } else {
        // Create new event
        const response = await api.post('/events', formData);
        setEvents([response.data, ...events]);
        toast.success('Event created successfully.');
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Failed to save event.');
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events');
        setEvents(response.data);
      } catch (error) {
        toast.error('Failed to fetch events.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      await api.delete(`/events/${id}`);
      setEvents(events.filter(event => event._id !== id));
      toast.success('Event deleted successfully.');
    } catch (error) {
      toast.error('Failed to delete event.');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Events</h1>
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Event
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
          </DialogHeader>
          <EventForm event={currentEvent} onSubmit={handleFormSubmit} />
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        {events.map(event => (
          <Card key={event._id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{event.title}</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => openDialog(event)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(event._id)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
              <p><strong>Organizer:</strong> {event.organizer}</p>
              <p className="mt-2">{event.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ManageEvents;
