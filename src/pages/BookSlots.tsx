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

  // Multi-selection state
  const [currentSelection, setCurrentSelection] = useState<{
    roomId: string;
    intervals: { start: string, end: string }[];
  }>({ roomId: '', intervals: [] });

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const generateHourIntervals = (start: string, end: string) => {
    const intervals = [];
    let [currH, currM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    
    // Simple loop adding 1 hour until we reach or exceed end
    while (currH < endH || (currH === endH && currM < endM)) {
      const nextH = currH + 1;
      
      const startStr = `${currH.toString().padStart(2, '0')}:${currM.toString().padStart(2, '0')}`;
      const endStr = `${nextH.toString().padStart(2, '0')}:${currM.toString().padStart(2, '0')}`;
      
      if (nextH > endH || (nextH === endH && currM > endM)) {
           break; 
      }
      
      intervals.push({ start: startStr, end: endStr });
      currH = nextH;
    }
    return intervals;
  };

  const getSingleIntervalCapacity = (room: Room, start: string, end: string) => {
     const occupied = room.bookings.reduce((sum, booking) => {
       // Check strictly overlapping
       if (booking.startTime < end && booking.endTime > start) {
         return sum + booking.teamSize;
       }
       return sum;
     }, 0);
     return room.capacity - occupied; 
  };

  const getRemainingCapacity = (room: Room, start: string, end: string) => {
      // Split into 1-hour intervals to check bottleneck
      const intervals = generateHourIntervals(start, end);
      if (intervals.length === 0) return getSingleIntervalCapacity(room, start, end); // Fallback

      // The capacity of the range is the MINIMUM capacity of any sub-interval
      const capacities = intervals.map(i => getSingleIntervalCapacity(room, i.start, i.end));
      return Math.min(...capacities);
  };

  const handleIntervalClick = (room: Room, start: string, end: string) => {
    if (currentSelection.roomId && currentSelection.roomId !== room._id) {
        // Reset if switching rooms
        setCurrentSelection({ roomId: room._id, intervals: [{ start, end }] });
        return;
    }

    const isSelected = currentSelection.intervals.some(i => i.start === start);
    
    if (isSelected) {
        // Deselect
        const newIntervals = currentSelection.intervals.filter(i => i.start !== start);
        setCurrentSelection({ roomId: room._id, intervals: newIntervals });
    } else {
        // Add to selection
        const newIntervals = [...currentSelection.intervals, { start, end }];
        // Sort by time
        newIntervals.sort((a, b) => a.start.localeCompare(b.start));
        
        // Validate consecutiveness
        let isConsecutive = true;
        for (let i = 0; i < newIntervals.length - 1; i++) {
            if (newIntervals[i].end !== newIntervals[i+1].start) {
                isConsecutive = false;
                break;
            }
        }

        if (!isConsecutive) {
            toast.error("Please select consecutive time slots.");
            // Ideally we might just reset to the new selection or ignore. 
            // User experience: if they click a non-consecutive one, maybe start a new range?
            // Let's simplest: Replace selection if non-consecutive
            setCurrentSelection({ roomId: room._id, intervals: [{ start, end }] });
        } else {
            setCurrentSelection({ roomId: room._id, intervals: newIntervals });
        }
    }
  };

  const handleBookSelection = () => {
     if (!currentSelection.intervals.length) return;
     const room = rooms.find(r => r._id === currentSelection.roomId);
     if (!room) return;

     const start = currentSelection.intervals[0].start;
     const end = currentSelection.intervals[currentSelection.intervals.length - 1].end;
     
     // Check capacity for the whole range logic? 
     // The loop logic below re-checks, but we need to ensure "Student A books... Student B sees blocked" logic.
     // If we use simple capacity, it works.
     
     setSelectedRoom(room);
     // Mock a "slot" object for the modal to use
     setSelectedSlot({ startTime: start, endTime: end, label: `${formatTime(start)} - ${formatTime(end)}` });
     setFormData(prev => ({ ...prev, teamSize: 1 }));
     setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !selectedRoom || !selectedSlot) return;

    // Validate capacity one last time
    const remaining = getRemainingCapacity(selectedRoom, selectedSlot.startTime, selectedSlot.endTime);
    if (formData.teamSize > remaining) {
       toast.error(`Capacity Issue: Only ${remaining} seats remaining.`);
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
       navigate('/my-bookings'); 
    } catch (error: any) {
       toast.error(error.response?.data?.message || "Failed to book slot");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Book a Lab Slot</h1>
        <p className="text-muted-foreground">Select one or more consecutive 1-hour slots.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
           <Card>
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => { setDate(d); setCurrentSelection({ roomId: '', intervals: [] }); }}
                  className="rounded-md border"
                  disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))}
                />
              </CardContent>
           </Card>

           {currentSelection.intervals.length > 0 && (
             <Card>
                <CardHeader>
                    <CardTitle>Selected Slots</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-primary/10 rounded-lg">
                        <p className="font-semibold text-primary">
                            {formatTime(currentSelection.intervals[0].start)} - {formatTime(currentSelection.intervals[currentSelection.intervals.length - 1].end)}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            {currentSelection.intervals.length} hour{currentSelection.intervals.length > 1 ? 's' : ''} selected
                        </p>
                    </div>
                    <Button className="w-full" onClick={handleBookSelection}>Proceed to Book</Button>
                </CardContent>
             </Card>
           )}
        </div>

        {/* Main Content */}
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
                       <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                          {room.timeSlots?.flatMap(slot => generateHourIntervals(slot.startTime, slot.endTime)).map((interval, idx) => {
                             const remaining = getRemainingCapacity(room, interval.start, interval.end);
                             const isFull = remaining <= 0;
                             const isSelected = currentSelection.roomId === room._id && currentSelection.intervals.some(i => i.start === interval.start);
                             
                             return (
                               <button
                                 key={`${room._id}-${interval.start}`}
                                 onClick={(e) => { e.preventDefault(); handleIntervalClick(room, interval.start, interval.end); }}
                                 disabled={isFull}
                                 className={`
                                   p-2 rounded-md text-xs text-center border transition-all flex flex-col items-center justify-center gap-1 h-20
                                   ${isFull 
                                     ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50' 
                                     : isSelected
                                        ? 'bg-primary text-primary-foreground border-primary ring-2 ring-primary ring-offset-2'
                                        : 'hover:border-primary hover:shadow-sm bg-card'
                                   }
                                 `}
                               >
                                  <div className="font-semibold">{formatTime(interval.start)}</div>
                                  <div className="text-[10px] opacity-80">
                                     {isFull ? 'Full' : `${remaining} left`}
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
         <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
               <DialogTitle>Complete Booking</DialogTitle>
               <DialogDescription>
                  {selectedRoom?.name} • {selectedSlot?.label}
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
                      />
                   </div>
                   <div className="space-y-2">
                      <Label htmlFor="teamSize">Team Size *</Label>
                      <Input 
                        id="teamSize" 
                        type="number"
                        min="1"
                        max={selectedRoom && selectedSlot ? getRemainingCapacity(selectedRoom, selectedSlot.startTime, selectedSlot.endTime) : 100}
                        value={formData.teamSize} 
                        onChange={e => setFormData({...formData, teamSize: parseInt(e.target.value)})}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                         Max: {selectedRoom && selectedSlot ? getRemainingCapacity(selectedRoom, selectedSlot.startTime, selectedSlot.endTime) : '-'}
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
