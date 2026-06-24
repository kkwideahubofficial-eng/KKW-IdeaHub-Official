import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { PlusCircle, Trash2, Edit } from "lucide-react";
import { ReadMore } from "@/components/ReadMore";
import { getNextAvailableDate } from "@/lib/dateUtils";

interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

interface Machinery {
  _id: string;
  name: string;
  description: string;
  imageUrl?: string;
  capacity: number;
  timeSlots: TimeSlot[];
  isAvailable: boolean;
}

const ManageMachinery = () => {
  const [machines, setMachines] = useState<Machinery[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState<"url" | "file">("file");
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    capacity: 1,
    imageUrl: "",
    timeSlots: [{ day: "Monday", startTime: "10:00", endTime: "12:00" }] // Stored as 24h HH:mm
  });

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      const res = await api.get("/machinery");
      setMachines(res.data);
    } catch {
      toast.error("Failed to load machinery");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);

    setUploading(true);
    try {
      const res = await api.post('/machinery/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData({ ...formData, imageUrl: res.data.url });
      toast.success("Image uploaded successfully");
    } catch (err) {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/machinery/${editingId}`, formData);
        toast.success("Machinery updated");
      } else {
        await api.post("/machinery", formData);
        toast.success("Machinery added");
      }
      setOpen(false);
      resetForm();
      fetchMachines();
    } catch {
      toast.error("Failed to save machinery");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to PERMANENTLY delete this machinery?")) return;
    try {
      await api.delete(`/machinery/${id}`);
      toast.success("Machinery deleted");
      fetchMachines();
    } catch {
      toast.error("Failed to delete machinery");
    }
  };

  const startEdit = (machine: Machinery) => {
    setEditingId(machine._id);
    setFormData({
      name: machine.name,
      description: machine.description,
      capacity: machine.capacity,
      imageUrl: machine.imageUrl || "",
      timeSlots: machine.timeSlots.length > 0 ? machine.timeSlots : [{ day: "Monday", startTime: "09:00", endTime: "17:00" }]
    });
    setUploadType("url"); // Default to URL if exists, or user can switch
    setOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      capacity: 1,
      imageUrl: "",
      timeSlots: [{ day: "Monday", startTime: "10:00", endTime: "12:00" }]
    });
    setUploadType("file");
  };

  const handleSlotChange = (index: number, field: keyof TimeSlot, value: string) => {
    const newSlots = [...formData.timeSlots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setFormData({ ...formData, timeSlots: newSlots });
  };

  const addSlot = () => {
    setFormData({
      ...formData,
      timeSlots: [...formData.timeSlots, { day: "Monday", startTime: "10:00", endTime: "12:00" }]
    });
  };

  const removeSlot = (index: number) => {
    const newSlots = formData.timeSlots.filter((_, i) => i !== index);
    setFormData({ ...formData, timeSlots: newSlots });
  };


  // Time Picker Helper Component (Inline)

  // Time Picker Helper Component (Inline)
  const TimePicker = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
    // Value is "10:00" (24h). Convert to 12h for display
    const [h, m] = value.split(':').map(Number);
    
    // Determine AM/PM
    const period = h >= 12 ? 'PM' : 'AM';
    // Convert h to 12-hour format (0 -> 12, 13 -> 1, 12 -> 12)
    const displayH = h % 12 || 12;

    const handleHChange = (newH: number) => {
      // Reconstruct 24h. If PM, add 12 (except 12PM). If AM, 12 is 0.
      let finalH = newH;
      if (period === 'PM' && newH !== 12) finalH = newH + 12;
      if (period === 'AM' && newH === 12) finalH = 0;
      if (period === 'PM' && newH === 12) finalH = 12;
      onChange(`${finalH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    };

    const handleMChange = (newM: number) => {
      onChange(`${h.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`);
    };

    const handlePeriodChange = (newPeriod: string) => {
       let finalH = h;
       if (newPeriod === 'PM' && h < 12) finalH = h + 12;
       if (newPeriod === 'AM' && h >= 12) finalH = h - 12;
       onChange(`${finalH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    };

    return (
      <div className="flex bg-muted rounded-md border p-1 items-center gap-1">
        <select 
          className="bg-transparent text-sm p-1 focus:outline-none"
          value={displayH}
          onChange={(e) => handleHChange(parseInt(e.target.value))}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>
        <span>:</span>
        <select 
          className="bg-transparent text-sm p-1 focus:outline-none"
          value={m}
          onChange={(e) => handleMChange(parseInt(e.target.value))}
        >
          {['00', '15', '30', '45'].map(min => (
             <option key={min} value={parseInt(min)}>{min}</option>
          ))}
        </select>
        <select 
          className="bg-transparent text-sm font-semibold p-1 focus:outline-none text-primary"
          value={period}
          onChange={(e) => handlePeriodChange(e.target.value)}
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    );
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Machinery</h1>
        <Dialog open={open} onOpenChange={(val) => { if(!val) resetForm(); setOpen(val); }}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Machine</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Machine" : "Add New Machine"}</DialogTitle>
              <DialogDescription>
                {editingId ? "Modify the details of the existing machine." : "Fill in the details to add a new machine to the inventory."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Machine Name</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="capacity">Capacity (Students)</Label>
                  <Input id="capacity" type="number" min="1" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})} required />
                </div>
                
                {/* Image Upload / URL Selection */}
                <div className="space-y-2">
                  <Label>Machine Image</Label>
                  <div className="flex items-center gap-4 mb-2">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input 
                        type="radio" 
                        name="uploadType" 
                        checked={uploadType === "file"} 
                        onChange={() => setUploadType("file")} 
                      /> Update File
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input 
                        type="radio" 
                        name="uploadType" 
                        checked={uploadType === "url"} 
                        onChange={() => setUploadType("url")} 
                      /> Image URL
                    </label>
                  </div>
                  
                  {uploadType === "file" ? (
                    <div className="flex gap-2">
                      <Input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload} 
                        disabled={uploading}
                      />
                      {uploading && <span className="text-xs text-muted-foreground self-center">Uploading...</span>}
                    </div>
                  ) : (
                    <Input 
                      placeholder="https://example.com/image.jpg" 
                      value={formData.imageUrl} 
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} 
                    />
                  )}
                  {formData.imageUrl && (
                      <div className="text-xs text-green-600 truncate max-w-[200px]">
                        current: {formData.imageUrl}
                      </div>
                  )}
                </div>
              </div>

              <div>
                <Label>Available Time Slots (Weekly)</Label>
                <div className="space-y-2 mt-2">
                  {formData.timeSlots.map((slot, index) => (
                    <div key={index} className="flex flex-wrap gap-2 items-center p-2 bg-muted/20 rounded-md border">
                      <select 
                        className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring"
                        value={slot.day}
                        onChange={(e) => handleSlotChange(index, 'day', e.target.value)}
                      >
                         {(() => {
                           const getLocalDateString = (d: Date) => {
                             const year = d.getFullYear();
                             const month = String(d.getMonth() + 1).padStart(2, '0');
                             const day = String(d.getDate()).padStart(2, '0');
                             return `${year}-${month}-${day}`;
                           };
                           const start = getLocalDateString(new Date());
                           const end = getLocalDateString(new Date(new Date().setDate(new Date().getDate() + 6)));
                           
                           const dates = [];
                           const current = new Date(start);
                           const endDateObj = new Date(end);

                           while (current <= endDateObj) {
                             const dayName = current.toLocaleDateString('en-US', { weekday: 'long' });
                             const dayNum = current.getDate();
                             const monthStr = current.toLocaleDateString('en-US', { month: 'short' });
                             dates.push({
                               dayName,
                               displayText: `${dayName} (${dayNum} ${monthStr})`
                             });
                             current.setDate(current.getDate() + 1);
                           }
                           
                           return dates.map(opt => (
                             <option key={opt.dayName} value={opt.dayName}>
                               {opt.displayText}
                             </option>
                           ));
                         })()}
                      </select>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">From:</span>
                        <TimePicker value={slot.startTime} onChange={(v) => handleSlotChange(index, 'startTime', v)} />
                      </div>
                      
                      <div className="flex items-center gap-2">
                         <span className="text-sm font-medium">To:</span>
                         <TimePicker value={slot.endTime} onChange={(v) => handleSlotChange(index, 'endTime', v)} />
                      </div>

                      <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:text-red-700 ml-auto" onClick={() => removeSlot(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addSlot} className="mt-2 text-primary border-primary hover:bg-primary/10">
                    <PlusCircle className="h-4 w-4 mr-2" /> Add Time Slot
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={uploading}>
                {editingId ? "Update Machine" : "Create Machine"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {machines.map((machine) => (
          <Card key={machine._id} className={`flex flex-col overflow-hidden hover:shadow-lg transition-shadow ${!machine.isAvailable ? 'opacity-75 border-dashed' : ''}`}>
            {machine.imageUrl && (
              <div className="h-48 w-full overflow-hidden">
                 <img src={machine.imageUrl} alt={machine.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
            )}
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                  <span>{machine.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${machine.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {machine.isAvailable ? 'ACTIVE' : 'DEACTIVE'}
                  </span>
              </CardTitle>
              <CardDescription>
                <ReadMore text={machine.description} limit={30} />
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="text-sm text-muted-foreground mb-4 space-y-1">
                <p><strong>Capacity:</strong> {machine.capacity} students</p>
                <div className="flex flex-wrap gap-1">
                   {machine.timeSlots.map((s, i) => (
                      <span key={i} className="text-xs bg-secondary px-2 py-0.5 rounded-full">
                        {s.day.slice(0,3)} ({getNextAvailableDate(s.day)})
                      </span>
                   ))}
                </div>
              </div>

              {/* Status Controls */}
              <div className="flex gap-2 mb-4">
                  {!machine.isAvailable ? (
                      <Button 
                        size="sm" 
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        onClick={async () => {
                              try {
                                await api.put(`/machinery/${machine._id}`, { ...machine, isAvailable: true });
                                toast.success("Machinery Activated");
                                fetchMachines();
                              } catch { toast.error("Failed to activate"); }
                        }}
                      >
                        Set Active
                      </Button>
                  ) : (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="w-full text-red-600 border-red-200 hover:bg-red-50"
                        onClick={async () => {
                              try {
                                await api.put(`/machinery/${machine._id}`, { ...machine, isAvailable: false });
                                toast.success("Machinery Deactivated");
                                fetchMachines();
                              } catch { toast.error("Failed to deactivate"); }
                        }}
                      >
                        Set Deactive
                      </Button>
                  )}
              </div>

              <div className="flex gap-2 mt-auto">
                <Button variant="outline" className="flex-1" onClick={() => startEdit(machine)}>
                  <Edit className="w-4 h-4 mr-2" /> Edit
                </Button>
                <Button variant="destructive" size="icon" onClick={() => handleDelete(machine._id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {machines.length === 0 && <p className="text-muted-foreground col-span-full text-center py-8">No machinery added yet.</p>}
      </div>
    </div>
  );
};

export default ManageMachinery;
