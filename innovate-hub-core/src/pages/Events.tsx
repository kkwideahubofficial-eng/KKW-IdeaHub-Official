import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusCircle, Calendar, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReadMore } from "@/components/ReadMore";

interface EventItem {
  _id: string;
  title: string;
  description: string;
  date: string;
  organizer: string;
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

const Events = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", date: "", organizer: "", imageUrl: "" });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const user = useMemo(getCurrentUser, []);
  const isCoordinator = user?.role === "coordinator";

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get("/events");
        setEvents(res.data);
      } catch (e) {
        toast.error("Failed to load events");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('date', new Date(form.date).toISOString());
      formData.append('organizer', form.organizer);
      if (form.imageUrl) {
        // Support URL fallback if pasted
        formData.append('imageUrl', form.imageUrl);
      }
      const fileInput = document.getElementById('event-image') as HTMLInputElement | null;
      if (fileInput?.files && fileInput.files[0]) {
        formData.append('image', fileInput.files[0]);
      }
      const res = await api.post("/events", formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setEvents([res.data, ...events]);
      setOpen(false);
      setForm({ title: "", description: "", date: "", organizer: "", imageUrl: "" });
      toast.success("Event created");
    } catch (err) {
      toast.error("Failed to create event");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-10 pt-4">
        <div className="flex items-end justify-between border-b border-border/40 pb-6 mb-8">
          <div>
             <h1 className="text-4xl font-extrabold tracking-tight text-foreground/90">Events</h1>
             <p className="text-lg text-muted-foreground/80 mt-2 font-light">Stay updated with lab happenings & upcoming workshops</p>
          </div>
        
          {isCoordinator && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="shadow-lg hover:shadow-primary/20 transition-all">
                  <PlusCircle className="w-4 h-4 mr-2" /> Add Event
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Event</DialogTitle>
                  <DialogDescription>Fill details to create a new event.</DialogDescription>
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
                    <Label htmlFor="organizer">Organizer</Label>
                    <Input id="organizer" value={form.organizer} onChange={(e) => setForm({ ...form, organizer: e.target.value })} required />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="event-image">Upload Image (optional)</Label>
                      <Input id="event-image" type="file" accept="image/*" />
                    </div>
                    <div>
                      <Label htmlFor="imageUrl">Or Image URL</Label>
                      <Input id="imageUrl" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Create</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-muted">
             <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
             <p className="text-muted-foreground text-lg">No upcoming events scheduled.</p>
             {isCoordinator && <p className="text-sm text-primary mt-2 cursor-pointer" onClick={() => setOpen(true)}>Create the first one</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {events.map((event) => (
              <div 
                key={event._id} 
                className="group relative flex flex-col bg-card/50 hover:bg-card border border-black/10 dark:border-white/10 ring-1 ring-inset ring-white/70 dark:ring-white/5 shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] rounded-[24px] overflow-hidden transition-all duration-300 hover:-translate-y-1"
              >
                {/* Inset Media Container */}
                <div className="p-4 pb-0">
                  <div className="relative aspect-video w-full overflow-hidden rounded-[20px] bg-muted shadow-inner">
                    {event.imageUrl ? (
                      <img 
                        src={event.imageUrl} 
                        alt={event.title} 
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 cursor-pointer" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImage(event.imageUrl || null);
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary/30 text-muted-foreground/20">
                         <Calendar className="w-16 h-16" />
                      </div>
                    )}
                    
                    {/* Floating Date Badge */}
                    <div className="absolute top-4 left-4">
                       <span className="px-3 py-1.5 bg-background/95 backdrop-blur-md rounded-full shadow-sm text-xs font-bold uppercase tracking-wider text-foreground border border-black/5">
                          {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                       </span>
                    </div>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-4">
                     <div>
                        <h3 className="text-2xl font-bold text-foreground leading-tight mb-1 group-hover:text-primary transition-colors">
                           {event.title}
                        </h3>
                        <div className="flex items-center text-sm text-muted-foreground font-medium">
                           <Users className="w-4 h-4 mr-1.5 opacity-70" />
                           {event.organizer}
                        </div>
                     </div>
                  </div>

                  <div className="flex-1 text-muted-foreground leading-relaxed text-sm mb-6 line-clamp-3">
                     <ReadMore text={event.description} limit={30} />
                  </div>

                  <div className="flex items-center gap-3 mt-auto pt-4 border-t border-border/40">
                    <Link to={`/events/${event._id}`} className="flex-1">
                      <Button variant="outline" className="w-full rounded-xl border-primary/20 hover:bg-primary/5 hover:text-primary hover:border-primary/50 transition-all font-semibold h-11">
                        View Details
                      </Button>
                    </Link>
                    
                    {isCoordinator && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive h-11 w-11"
                        onClick={async () => {
                           if (!confirm('Delete this event?')) return;
                           try { await api.delete(`/events/${event._id}`); setEvents(events.filter((e) => e._id !== event._id)); toast.success('Deleted'); } catch { toast.error('Error'); }
                        }}
                      >
                         <span className="sr-only">Delete</span>
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl w-full h-full flex items-center justify-center p-4">
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-50 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
            <img 
              src={selectedImage} 
              alt="Full Preview" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
