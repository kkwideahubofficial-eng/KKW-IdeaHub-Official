import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import axios from "../lib/axios";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Users, Clock, AlertCircle } from "lucide-react";

interface Slot {
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  label?: string;    // Display label
  _id?: string;
}

interface Room {
  _id: string;
  name: string;
  capacity: number;
  features: string[];
  bookings: {
    startTime: string;
    endTime: string;
    teamSize: number;
  }[];
  timeSlots: Slot[];
}

const BookSlots = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Data from API
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Booking Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  // Form Data
  const [formData, setFormData] = useState({
    teamName: "",
    projectTitle: "",
    description: "",
    teamSize: 1,
  });

  // Removed global slots fetching
  // useEffect(() => { ... }, []);

  useEffect(() => {
    if (date) {
      fetchAvailability();
    }
  }, [date]);

  useEffect(() => {
    if (date) {
      fetchAvailability();
    }
  }, [date]);

  const fetchAvailability = async () => {
    if (!date) return;
    setIsLoading(true);
    try {
      const formattedDate = date.toISOString().split('T')[0];
      const res = await axios.get(`/bookings/availability?date=${formattedDate}`);
      setRooms(res.data);
    } catch (error) {
      console.error("Failed to fetch availability", error);
      toast.error("Failed to load room availability");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateRemainingCapacity = (room: Room, slot: Slot) => {
    // Should be stricter: sum of team sizes for bookings intersecting this slot
    // We assume defined slots don't overlap with each other for simplicity in display,
    // but bookings might traverse slots if logic changes.
    // Making it simple: check exact matches or contained bookings.
    // Actually, backend returns bookings with start/end time.
    
    // Check overlap
    const occupied = room.bookings.reduce((sum, booking) => {
      // Check if booking overlaps with slot
      if (booking.startTime < slot.endTime && booking.endTime > slot.startTime) {
        return sum + booking.teamSize;
      }
      return sum;
    }, 0);

    return room.capacity - occupied;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const handleSlotClick = (room: Room, slot: Slot) => {
    const remaining = calculateRemainingCapacity(room, slot);
    if (remaining <= 0) {
      toast.error("This slot is fully booked.");
      return;
    }
    
    setSelectedRoom(room);
    setSelectedSlot(slot);
    setFormData(prev => ({ ...prev, teamSize: 1 })); // Reset team size to 1
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !selectedRoom || !selectedSlot) return;

    if (formData.teamSize > calculateRemainingCapacity(selectedRoom, selectedSlot)) {
       toast.error(`Capacity Issue: Only ${calculateRemainingCapacity(selectedRoom, selectedSlot)} seats remaining.`);
       return;
    }

    try {
       const formattedDate = date.toISOString().split('T')[0];
       await axios.post('/bookings', {
         ...formData,
         slotDate: formattedDate,
         startTime: selectedSlot.startTime,
         endTime: selectedSlot.endTime,
         roomId: selectedRoom._id,
         purpose: formData.projectTitle
       });

       toast.success("Booking request submitted successfully!");
       setIsModalOpen(false);
       navigate('/my-bookings'); // Or refresh
    } catch (error: any) {
       toast.error(error.response?.data?.message || "Failed to book slot");
    }
  };

  // If no slots defined, show warning - removed as slots are per room
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Book a Lab Slot</h1>
        <p className="text-muted-foreground">Check real-time availability and book your innovation space.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Sidebar: Calendar & Guidelines */}
        <div className="lg:col-span-4 space-y-6">
           <Card>
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                  disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))}
                />
              </CardContent>
           </Card>

           <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-3">Guidelines</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Team Size must not exceed remaining capacity.</li>
                <li>• Bookings require Coordinator approval.</li>
                <li>• Cancellations: 24h notice.</li>
              </ul>
            </CardContent>
           </Card>
        </div>

        {/* Main Content: Rooms & Slots */}
        <div className="lg:col-span-8">
           {!date ? (
             <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Please select a date to view availability.</p>
             </div>
           ) : (
             <div className="space-y-6">
                <h2 className="text-xl font-semibold">Available Rooms for {date.toLocaleDateString()}</h2>
                
                {isLoading && <p>Loading availability...</p>}

                {!isLoading && rooms.length === 0 && (
                   <div className="p-8 text-center bg-muted rounded-lg">
                      <AlertCircle className="mx-auto h-8 w-8 mb-2 text-muted-foreground" />
                      <p>No active rooms found.</p>
                   </div>
                )}

                {rooms.map(room => (
                  <Card key={room._id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                         <div>
                            <CardTitle>{room.name}</CardTitle>
                            <CardDescription>Capacity: {room.capacity} students</CardDescription>
                         </div>
                         <div className="flex gap-2">
                            {room.features.map((f, i) => (
                               <span key={i} className="text-xs px-2 py-1 bg-secondary rounded-full">{f}</span>
                            ))}
                         </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                       <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {room.timeSlots?.map(slot => {
                             const remaining = calculateRemainingCapacity(room, slot);
                             const isFull = remaining <= 0;
                             
                             return (
                               <button
                                 key={slot._id || slot.startTime}
                                 onClick={() => handleSlotClick(room, slot)}
                                 disabled={isFull}
                                 className={`
                                   p-3 rounded-md text-sm text-left border transition-all
                                   ${isFull 
                                     ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                                     : 'hover:border-primary hover:shadow-sm bg-card'
                                   }
                                 `}
                               >
                                  <div className="font-medium mb-1">{slot.label || `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`}</div>
                                  <div className="flex items-center gap-1 text-xs">
                                     <Users className="h-3 w-3" />
                                     <span>{isFull ? 'Full' : `${remaining} seats left`}</span>
                                  </div>
                               </button>
                             );
                          })}
                       </div>
                       {(room.timeSlots?.length || 0) === 0 && <p className="text-sm text-muted-foreground italic">No time slots are currently configured for this room.</p>}
                    </CardContent>
                  </Card>
                ))}
             </div>
           )}
        </div>
      </div>

      {/* Booking Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
         <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
               <DialogTitle>Complete Booking</DialogTitle>
               <DialogDescription>
                  {selectedRoom?.name} • {selectedSlot?.label || `${selectedSlot && formatTime(selectedSlot.startTime)} - ${selectedSlot && formatTime(selectedSlot.endTime)}`}
               </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <Label htmlFor="teamName">Team Name *</Label>
                      <Input 
                        id="teamName" 
                        value={formData.teamName} 
                        onChange={e => setFormData({...formData, teamName: e.target.value})}
                        required
                        placeholder="e.g. Innovators"
                      />
                   </div>
                   <div className="space-y-2">
                      <Label htmlFor="teamSize">Team Size *</Label>
                      <Input 
                        id="teamSize" 
                        type="number"
                        min="1"
                        max={selectedRoom && selectedSlot ? calculateRemainingCapacity(selectedRoom, selectedSlot) : 100}
                        value={formData.teamSize} 
                        onChange={e => setFormData({...formData, teamSize: parseInt(e.target.value)})}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                         Max: {selectedRoom && selectedSlot ? calculateRemainingCapacity(selectedRoom, selectedSlot) : '-'}
                      </p>
                   </div>
                </div>

                <div className="space-y-2">
                   <Label htmlFor="projectTitle">Project Title *</Label>
                   <Input 
                      id="projectTitle"
                      value={formData.projectTitle}
                      onChange={e => setFormData({...formData, projectTitle: e.target.value})}
                      required
                   />
                </div>

                <div className="space-y-2">
                   <Label htmlFor="description">Project Description</Label>
                   <Textarea 
                      id="description"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      placeholder="Briefly describe your activity..."
                   />
                </div>

                <DialogFooter>
                   <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                   <Button type="submit">Confirm Booking</Button>
                </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookSlots;
