import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Target, Eye, Cpu, Printer, Microscope, Zap, Wifi, Image as ImageIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const LabInfo = () => {
  const facilities = [
    {
      icon: Cpu,
      name: "High-Performance Computing",
      description: "State-of-the-art servers and workstations for AI/ML research",
    },
    {
      icon: Printer,
      name: "3D Printing & Fabrication",
      description: "Multiple 3D printers and CNC machines for rapid prototyping",
    },
    {
      icon: Microscope,
      name: "Electronics Lab",
      description: "Complete electronics workbench with testing equipment",
    },
    {
      icon: Zap,
      name: "IoT Development Suite",
      description: "Arduino, Raspberry Pi, and sensor kits for IoT projects",
    },
    {
      icon: Wifi,
      name: "High-Speed Connectivity",
      description: "Gigabit internet and dedicated network infrastructure",
    },
    {
      icon: Lightbulb,
      name: "Collaboration Spaces",
      description: "Meeting rooms and brainstorming areas for team work",
    },
  ];

  const [machines, setMachines] = useState<{ _id: string; name: string; summary?: string; details?: string; imageUrl?: string; }[]>([]);
  const [loadingMachines, setLoadingMachines] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);
  const [form, setForm] = useState({ name: '', summary: '', details: '', imageUrl: '' });
  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem('idea_hub_user');
      const token = localStorage.getItem('idea_hub_token');
      if (!raw || !token) return null;
      return JSON.parse(raw);
    } catch { return null; }
  }, []);
  const isCoordinator = user?.role === 'coordinator';

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const res = await api.get('/machines');
        setMachines(res.data);
      } catch { /* ignore */ }
      finally { setLoadingMachines(false); }
    };
    fetchMachines();
  }, []);

  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handlePreview = (src: string) => {
    setPreview(src);
    setOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">About IDEA Hub</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          A state-of-the-art innovation laboratory dedicated to fostering creativity, 
          collaboration, and cutting-edge research
        </p>
      </div>

      {/* Vision & Mission */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-primary-foreground" />
              </div>
              <CardTitle>Our Vision</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              To be a leading innovation hub that empowers students, researchers, and entrepreneurs 
              to transform groundbreaking ideas into impactful solutions that address real-world challenges 
              and drive technological advancement.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/5 to-accent/5">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-secondary-foreground" />
              </div>
              <CardTitle>Our Mission</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              To provide world-class facilities, mentorship, and resources that enable innovators 
              to experiment, prototype, and launch their ideas. We foster a collaborative ecosystem 
              where creativity meets technology to solve tomorrow's problems today.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Facilities Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-foreground mb-6 text-center">Our Facilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((facility, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                    <facility.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{facility.name}</h3>
                    <p className="text-sm text-muted-foreground">{facility.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Machines Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-foreground">Machines</h2>
          {isCoordinator && (
            <Button onClick={() => setOpenAdd(true)}>Add Machine</Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingMachines ? (<div>Loading...</div>) : machines.length === 0 ? (
            <p className="text-muted-foreground">No machines yet.{isCoordinator ? ' Add one.' : ''}</p>
          ) : machines.map((m) => (
            <Card key={m._id} className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle>{m.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {m.imageUrl ? (
                  <img
                    src={m.imageUrl}
                    alt={m.name}
                    className="w-full h-44 object-cover rounded mb-3 cursor-pointer"
                    onClick={() => handlePreview(m.imageUrl!)}
                  />
                ) : null}
                <p className="text-sm text-muted-foreground mb-2">{m.summary}</p>
                <p className="text-sm">{m.details}</p>
                {isCoordinator && (
                  <div className="mt-3 flex justify-end">
                    <Button variant="destructive" onClick={async () => {
                      if (!confirm('Delete this machine?')) return;
                      try {
                        await api.delete(`/machines/${m._id}`);
                        setMachines(machines.filter((x) => x._id !== m._id));
                        toast.success('Machine deleted');
                      } catch { toast.error('Failed to delete'); }
                    }}>Delete</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* About Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">About the Lab</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            IDEA Hub is a premier innovation laboratory established to bridge the gap between 
            theoretical knowledge and practical application. Our 5,000 square foot facility houses 
            cutting-edge equipment and technology that enables students, faculty, and external 
            collaborators to bring their innovative concepts to life.
          </p>
          <p>
            Since our inception, we have supported over 500 projects across diverse domains including 
            artificial intelligence, robotics, IoT, sustainable technology, healthcare innovation, 
            and social entrepreneurship. Our lab operates on the principle that innovation flourishes 
            in an environment that combines excellent infrastructure with collaborative spirit.
          </p>
          <p>
            We offer not just physical resources but also mentorship from industry experts, 
            workshops on emerging technologies, networking opportunities with potential investors, 
            and a supportive community of like-minded innovators. Whether you're a student with 
            your first idea or an experienced researcher, IDEA Hub provides the platform to 
            experiment, fail, learn, and succeed.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-6 pt-6 border-t">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">24/7</div>
              <div className="text-sm">Access Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">500+</div>
              <div className="text-sm">Projects Supported</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">50+</div>
              <div className="text-sm">Expert Mentors</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0">
          {preview ? <img src={preview} alt="Preview" className="w-full h-auto" /> : null}
        </DialogContent>
      </Dialog>

      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent>
          <form onSubmit={async (e) => {
            e.preventDefault();
            try {
              const fd = new FormData();
              fd.append('name', form.name);
              if (form.summary) fd.append('summary', form.summary);
              if (form.details) fd.append('details', form.details);
              if (form.imageUrl) fd.append('imageUrl', form.imageUrl);
              const fileInput = document.getElementById('machine-image') as HTMLInputElement | null;
              if (fileInput?.files && fileInput.files[0]) fd.append('image', fileInput.files[0]);
              const res = await api.post('/machines', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
              setMachines([res.data, ...machines]);
              setOpenAdd(false);
              setForm({ name: '', summary: '', details: '', imageUrl: '' });
              toast.success('Machine added');
            } catch { toast.error('Failed to add machine'); }
          }} className="space-y-4">
            <div>
              <Label htmlFor="mname">Name</Label>
              <Input id="mname" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="msummary">Summary</Label>
              <Input id="msummary" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="mdetails">Details</Label>
              <Textarea id="mdetails" value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="machine-image">Upload Image (optional)</Label>
                <Input id="machine-image" type="file" accept="image/*" />
              </div>
              <div>
                <Label htmlFor="mimageUrl">Or Image URL</Label>
                <Input id="mimageUrl" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
              </div>
            </div>
            <Button type="submit">Create</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LabInfo;
