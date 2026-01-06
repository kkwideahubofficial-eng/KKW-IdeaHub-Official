import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import axios from "../lib/axios";
import { Plus, Trash2, Edit2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Room {
  _id: string;
  name: string;
  capacity: number;
  features: string[];
  isActive: boolean;
  timeSlots: {
    startTime: string;
    endTime: string;
    label: string;
    _id?: string;
  }[];
}

const ManageRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
  
  // Slot Management Dialog
  const [isManageSlotsOpen, setIsManageSlotsOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Form states
  const [roomForm, setRoomForm] = useState({ name: "", capacity: 1, features: "" });
  const [slotForm, setSlotForm] = useState({ startTime: "09:00", endTime: "10:00" });

  useEffect(() => {
    fetchData();
  }, []);

  // Helper Component for Time Selection
  const TimePicker = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
    // Derive state directly from props (Controlled Component)
    const [hours, minutes] = value ? value.split(':') : ["09", "00"];
    const h = parseInt(hours);
    
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = (h % 12 || 12).toString();
    const min = minutes;

    const updateTime = (newH: string, newM: string, newP: string) => {
        let h24 = parseInt(newH);
        if (newP === 'PM' && h24 < 12) h24 += 12;
        if (newP === 'AM' && h24 === 12) h24 = 0;
        
        const hStr = h24.toString().padStart(2, '0');
        const mStr = newM.toString().padStart(2, '0');
        onChange(`${hStr}:${mStr}`);
    };

    return (
        <div className="flex items-center gap-1">
            <select 
                className="h-9 w-16 rounded-md border border-input bg-background px-2 text-sm"
                value={hour12}
                onChange={(e) => updateTime(e.target.value, min, period)}
            >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                    <option key={h} value={h}>{h}</option>
                ))}
            </select>
            <span className="text-muted-foreground">:</span>
            <select 
                className="h-9 w-16 rounded-md border border-input bg-background px-2 text-sm"
                value={min}
                onChange={(e) => updateTime(hour12, e.target.value, period)}
            >
                {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map(m => (
                    <option key={m} value={m}>{m}</option>
                ))}
            </select>
            <select 
                className="h-9 w-18 rounded-md border border-input bg-background px-2 text-sm"
                value={period}
                onChange={(e) => updateTime(hour12, min, e.target.value)}
            >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
            </select>
        </div>
    );
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const roomsRes = await axios.get("/rooms");
      setRooms(roomsRes.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
      toast.error("Failed to load rooms");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/rooms", {
        ...roomForm,
        features: roomForm.features.split(",").map((f) => f.trim()).filter(Boolean),
        timeSlots: [] // Initialize with empty slots
      });
      toast.success("Room created successfully");
      setIsRoomDialogOpen(false);
      setRoomForm({ name: "", capacity: 1, features: "" });
      fetchData();
    } catch (error) {
      toast.error("Failed to create room");
    }
  };

  const handleDeleteRoom = async (id: string) => {
    if (!confirm("Are you sure you want to PERMANENTLY delete this room? This cannot be undone.")) return;
    try {
      await axios.delete(`/rooms/${id}`);
      toast.success("Room deleted permanently");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete room");
    }
  };

  const handleAddSlotToRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;

    // Validate
    if (!slotForm.startTime || !slotForm.endTime) {
       toast.error("Please select valid start and end times");
       return;
    }

    if (slotForm.startTime >= slotForm.endTime) {
       toast.error("Start time must be before end time");
       return;
    }

    const updatedSlots = [
      ...(selectedRoom.timeSlots || []), 
      { 
        startTime: slotForm.startTime, 
        endTime: slotForm.endTime,
        label: `${slotForm.startTime} - ${slotForm.endTime}` 
      }
    ];

    try {
      // sanitize payload
      const payload = {
        name: selectedRoom.name,
        capacity: selectedRoom.capacity,
        features: selectedRoom.features,
        isActive: selectedRoom.isActive,
        timeSlots: updatedSlots
      };
      
      await axios.put(`/rooms/${selectedRoom._id}`, payload);
      toast.success("Slot added successfully");
      // Reset to defaults, not empty, to prevent "startTime required" error
      // because TimePicker visually defaults to 09:00 if empty, misleading user.
      setSlotForm({ startTime: "09:00", endTime: "10:00" });
      
      // Refresh global state
      await fetchData();
      
      // CRITICAL FIX: Re-sync selectedRoom from the fresh 'rooms' list (which fetchData updates)
      // Since fetchData updates state async, we should actually rely on the response or a direct getter?
      // Better: we can just manually fetch this specific room to be 100% sure, or trust fetchData + find.
      // But fetchData is async and setRooms is async. 
      // Safest: Use the payload we just sent, or re-fetch singular room.
      
      // Let's use the local payload to update immediately for UI responsiveness, 
      // but ensure we don't desync.
      setSelectedRoom({ ...selectedRoom, timeSlots: updatedSlots });
    } catch (error: any) {
      console.error("Add Slot Error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to add slot");
    }
  };

  const handleRemoveSlotFromRoom = async (room: Room, slotIndex: number) => {
    if (!confirm("Remove this slot?")) return;
    
    const updatedSlots = room.timeSlots.filter((_, i) => i !== slotIndex);

    try {
      const payload = {
        name: room.name,
        capacity: room.capacity,
        features: room.features,
        isActive: room.isActive,
        timeSlots: updatedSlots
      };

      await axios.put(`/rooms/${room._id}`, payload);
      toast.success("Slot removed");
      await fetchData();
      if (selectedRoom && selectedRoom._id === room._id) {
         setSelectedRoom({ ...selectedRoom, timeSlots: updatedSlots });
      }
    } catch (error) {
      toast.error("Failed to remove slot");
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Rooms & Slots</h1>
          <p className="text-muted-foreground">Configure labs and booking time slots</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Rooms</h2>
            <Dialog open={isRoomDialogOpen} onOpenChange={setIsRoomDialogOpen}>
                <DialogTrigger asChild>
                    <Button><Plus className="mr-2 h-4 w-4" /> Add Room</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Room</DialogTitle>
                        <DialogDescription>Create a new innovation lab/room</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateRoom} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="roomName">Room Name</Label>
                            <Input 
                                id="roomName" 
                                value={roomForm.name}
                                onChange={e => setRoomForm({...roomForm, name: e.target.value})}
                                required 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="capacity">Capacity</Label>
                            <Input 
                                id="capacity" 
                                type="number"
                                min="1"
                                value={roomForm.capacity}
                                onChange={e => setRoomForm({...roomForm, capacity: parseInt(e.target.value)})}
                                required 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="features">Features (comma separated)</Label>
                            <Input 
                                id="features" 
                                placeholder="Projector, Whiteboard, PCs"
                                value={roomForm.features}
                                onChange={e => setRoomForm({...roomForm, features: e.target.value})}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit">Create Room</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map(room => (
                <Card key={room._id} className={!room.isActive ? "opacity-75 border-dashed" : ""}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                           <CardTitle className="text-lg font-medium flex items-center gap-2">
                             {room.name}
                             <span className={`text-xs px-2 py-0.5 rounded-full ${room.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                               {room.isActive ? 'ACTIVE' : 'DEACTIVE'}
                             </span>
                           </CardTitle>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteRoom(room._id)} className="text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground mb-2">Capacity: {room.capacity} students</div>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {room.features.map((f, i) => (
                                <span key={i} className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">
                                    {f}
                                </span>
                            ))}
                        </div>
                        
                        <div className="flex gap-2 mb-4">
                           {!room.isActive ? (
                               <Button 
                                 size="sm" 
                                 className="w-full bg-green-600 hover:bg-green-700 text-white"
                                 onClick={async () => {
                                      try {
                                        await axios.put(`/rooms/${room._id}`, { ...room, isActive: true });
                                        toast.success("Room Activated");
                                        fetchData();
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
                                        await axios.put(`/rooms/${room._id}`, { ...room, isActive: false });
                                        toast.success("Room Deactivated");
                                        fetchData();
                                      } catch { toast.error("Failed to deactivate"); }
                                 }}
                               >
                                 Set Deactive
                               </Button>
                           )}
                        </div>

                        <div className="mt-4 border-t pt-4">
                            <h4 className="text-sm font-semibold mb-2">Schedule ({room.timeSlots?.length || 0} slots)</h4>
                            <div className="space-y-1 mb-3">
                                {room.timeSlots?.slice(0, 3).map((slot, i) => (
                                    <div key={i} className="text-xs text-muted-foreground">
                                       {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                    </div>
                                ))}
                                {(room.timeSlots?.length || 0) > 3 && <div className="text-xs text-muted-foreground italic">...and more</div>}
                            </div>

                            <Dialog open={isManageSlotsOpen && selectedRoom?._id === room._id} onOpenChange={(open) => {
                                setIsManageSlotsOpen(open);
                                if (open) {
                                    // Always set from the latest 'room' object in the map iteration
                                    setSelectedRoom(room);
                                } else {
                                    setSelectedRoom(null);
                                }
                            }}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="w-full" onClick={() => setSelectedRoom(room)}>
                                        <Edit2 className="mr-2 h-3 w-3" /> Manage Schedule
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Manage Schedule: {selectedRoom?.name}</DialogTitle>
                                        <DialogDescription>Add or remove time slots for this room</DialogDescription>
                                    </DialogHeader>
                                    
                                    <div className="space-y-6 py-4">
                                        <div className="space-y-4">
                                        <div className="space-y-4">
                                            <h4 className="font-medium text-sm">Add New Slot</h4>
                                            
                                            <form onSubmit={handleAddSlotToRoom} className="space-y-4">
                                               <div className="grid grid-cols-2 gap-4">
                                                   <div className="space-y-2">
                                                      <Label className="text-xs">Start Time</Label>
                                                      <TimePicker 
                                                        value={slotForm.startTime} 
                                                        onChange={(t) => setSlotForm(prev => ({ ...prev, startTime: t }))} 
                                                      />
                                                   </div>
                                                   <div className="space-y-2">
                                                      <Label className="text-xs">End Time</Label>
                                                      <TimePicker 
                                                        value={slotForm.endTime} 
                                                        onChange={(t) => setSlotForm(prev => ({ ...prev, endTime: t }))} 
                                                      />
                                                   </div>
                                               </div>
                                               <Button type="submit" size="sm" className="w-full"><Plus className="h-4 w-4 mr-2" /> Add Slot</Button>
                                            </form>
                                        </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="font-medium text-sm">Existing Slots</h4>
                                            {selectedRoom?.timeSlots?.length === 0 ? (
                                                <p className="text-sm text-muted-foreground italic">No slots defined</p>
                                            ) : (
                                                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                                    {selectedRoom?.timeSlots?.map((slot, idx) => (
                                                        <div key={idx} className="flex items-center justify-between p-2 rounded-md border bg-muted/50">
                                                            <span className="text-sm">{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
                                                            <Button 
                                                              variant="ghost" 
                                                              size="sm" 
                                                              className="h-6 w-6 p-0 text-destructive"
                                                              onClick={() => handleRemoveSlotFromRoom(selectedRoom, idx)}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardContent>
                </Card>
            ))}
            {rooms.length === 0 && <p className="text-muted-foreground col-span-full text-center py-8">No rooms configured.</p>}
        </div>
      </div>
    </div>
  );
};

export default ManageRooms;
