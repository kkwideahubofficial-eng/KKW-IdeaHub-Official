import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Upload } from "lucide-react";
import { formatTime12Hour } from "@/lib/dateUtils";

interface Machinery {
  _id: string;
  name: string;
  capacity: number;
  timeSlots: { day: string; startTime: string; endTime: string }[];
}

const MachineryRequestForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [machine, setMachine] = useState<Machinery | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    purpose: "",
    usageDate: "",
    selectedSlotIndex: "", // Which available slot range are they targetting?
    startTime: "", // Custom start time within that slot
    duration: "1", // Hours
    consentAgreed: false,
    groupPhotoUrl: "",
    numberOfStudents: 1,
    selectedSlots: [] as string[]
  });

  const [teamMembers, setTeamMembers] = useState([{ name: "", branch: "", year: "", mobile: "", email: "" }]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [slotStats, setSlotStats] = useState<Record<string, { totalApplied: number, requestsCount: number, approvedCount: number }>>({});

  useEffect(() => {
    const fetchAvailability = async () => {
        if (!id || !formData.usageDate) return;
        try {
            // Note: Adjust date format to YYYY-MM-DD if needed by backend, though <input type="date"> gives that format.
            const res = await api.get(`/machinery/${id}/availability?date=${formData.usageDate}`);
            setSlotStats(res.data);
        } catch (error) {
            console.error("Failed to fetch availability", error);
        }
    };
    fetchAvailability();
  }, [id, formData.usageDate]);

  useEffect(() => {
    const fetchMachine = async () => {
      try {
        const res = await api.get(`/machinery/${id}`);
        setMachine(res.data);
      } catch {
        toast.error("Failed to load machine details");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchMachine();
  }, [id]);

  // Update team members rows when count changes
  useEffect(() => {
    // Flexible limit up to 20 students
    const count = Math.max(1, Math.min(20, formData.numberOfStudents || 1));
    if (count !== teamMembers.length) {
       const newMembers = [...teamMembers];
       if (count > newMembers.length) {
         // Add blank rows
         for(let i=newMembers.length; i<count; i++) {
             newMembers.push({ name: "", branch: "", year: "", mobile: "", email: "" });
         }
       } else {
         // Trim rows
         newMembers.length = count;
       }
       setTeamMembers(newMembers);
    }
  }, [formData.numberOfStudents]);

  // Helper functions
  const handleMemberChange = (index: number, field: string, value: string) => {
    const newMembers = [...teamMembers];
    // @ts-ignore
    newMembers[index][field] = value;
    setTeamMembers(newMembers);
  };

  const calculateEndTime = (start: string, durationStr: string) => {
    if (!start || !durationStr) return "";
    const [h, m] = start.split(':').map(Number);
    const duration = parseInt(durationStr);
    let endH = h + duration;
    return `${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consentAgreed) return toast.error("You must agree to the responsibility consent");
    if ((formData.selectedSlots || []).length === 0) return toast.error("Please select at least one time slot");
    if (!imageFile) return toast.error("Please upload a group photo/selfie");

    try {
        setUploading(true);
        // Upload image
        const uploadData = new FormData();
        uploadData.append('image', imageFile);
        
        const uploadRes = await api.post('/machinery/upload', uploadData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        const photoUrl = uploadRes.data.url;

        // Calculate end time based on selected slots
        let endTime = "";
        const selectedCount = (formData.selectedSlots || []).length;
        if (formData.startTime && selectedCount > 0) {
            const [h, m] = formData.startTime.split(':').map(Number);
            const totalMins = h * 60 + m + (selectedCount * 15);
            const endH = Math.floor(totalMins / 60);
            const endM = totalMins % 60;
            endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
        } else {
             // Fallback for safety if old path used (though UI hides it)
             endTime = calculateEndTime(formData.startTime, formData.duration);
        }
        
        const payload = {
            machineryId: id,
            teamMembers,
            usageDate: formData.usageDate,
            startTime: formData.startTime,
            endTime: endTime,
            purpose: formData.purpose,
            consentAgreed: formData.consentAgreed,
            groupPhotoUrl: photoUrl
        };

        await api.post('/machinery/requests', payload);
        toast.success("Request submitted successfully!");
        navigate('/machinery');
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to submit request");
    } finally {
        setUploading(false);
    }
  };

  if (loading || !machine) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Request Permission: {machine.name}</CardTitle>
          <CardDescription>Fill in the details to request custom time slots.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Header / Image Upload */}
            <div className="space-y-4 border p-4 rounded-md bg-muted/10">
                <h3 className="font-semibold flex items-center"><Upload className="w-4 h-4 mr-2"/> Group Photo / Selfie</h3>
                <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => e.target.files && setImageFile(e.target.files[0])}
                    required 
                />
                <p className="text-xs text-muted-foreground">Upload a selfie or group photo of all {formData.numberOfStudents} students.</p>
            </div>

            {/* Date Selection */}
            <div>
               <Label>Date of Usage</Label>
               <Input type="date" value={formData.usageDate} onChange={(e) => setFormData({...formData, usageDate: e.target.value})} required min={new Date().toISOString().split('T')[0]} />
            </div>

            {/* Visual Slot Selection - 15 Min Intervals */}
            {machine.timeSlots.length > 0 && formData.usageDate && (
                <div className="space-y-4 border rounded-md p-4 bg-card">
                    <Label className="text-base font-semibold">Select Time Slots (15 mins each)</Label>
                    
                    {(() => {
                        const dateObj = new Date(formData.usageDate);
                        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                        const dayName = days[dateObj.getDay()];
                        // Change: Filter for ALL slots matching the day, not just the first one
                        const relevantSlots = machine.timeSlots.filter(s => s.day === dayName);

                        if (relevantSlots.length === 0) {
                            return <p className="text-sm text-muted-foreground p-4 bg-muted/20 rounded-md text-center">No slots available for {dayName}.</p>;
                        }

                        // Generate 15-minute intervals for ALL matching slots
                        let intervals: string[] = [];
                        
                        relevantSlots.forEach(slot => {
                            const [startH, startM] = slot.startTime.split(':').map(Number);
                            const [endH, endM] = slot.endTime.split(':').map(Number);
                            
                            let currentTotalMins = startH * 60 + startM;
                            const endTotalMins = endH * 60 + endM;

                            while(currentTotalMins < endTotalMins) {
                                // Check if this time has passed if date is today
                                const now = new Date();
                                const isToday = new Date(formData.usageDate).toDateString() === now.toDateString();
                                
                                if (!isToday || currentTotalMins > (now.getHours() * 60 + now.getMinutes())) {
                                    const h = Math.floor(currentTotalMins / 60);
                                    const m = currentTotalMins % 60;
                                    const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                                    // Avoid duplicates if slots overlap (though they shouldn't usually)
                                    if (!intervals.includes(timeStr)) {
                                        intervals.push(timeStr); 
                                    }
                                }
                                currentTotalMins += 15;
                            }
                        });

                        // Sort intervals chronologically
                        intervals.sort((a, b) => a.localeCompare(b));

                        // Helper to handle slot clicks
                        const handleSlotClick = (time: string) => {
                             let newSelection = [...(formData.selectedSlots || [])];
                             if (newSelection.includes(time)) {
                                 // Deselect
                                 newSelection = newSelection.filter(t => t !== time);
                                 // After deselect, we might end up with gaps... (logic retained from previous step)
                             } else {
                                 // Select
                                 newSelection.push(time);
                             }
                             
                             // Sort selection to check gaps
                             newSelection.sort();

                             // Check consecutiveness
                             let isConsecutive = true;
                             if (newSelection.length > 1) {
                                 for(let i=0; i<newSelection.length-1; i++) {
                                     const [h1, m1] = newSelection[i].split(':').map(Number);
                                     const [h2, m2] = newSelection[i+1].split(':').map(Number);
                                     const t1 = h1*60 + m1;
                                     const t2 = h2*60 + m2;
                                     
                                     if (t2 - t1 !== 15) {
                                         isConsecutive = false;
                                         break;
                                     }
                                 }
                             }

                             if (!isConsecutive) {
                                  if (!formData.selectedSlots.includes(time)) {
                                      toast.error("Please select consecutive slots. Selection reset.");
                                      newSelection = [time];
                                  } else {
                                      toast.error("Gaps are not allowed. Please re-select.");
                                      newSelection = [];
                                  }
                             }
                             
                             setFormData({
                                 ...formData, 
                                 selectedSlots: newSelection,
                                 startTime: newSelection.length > 0 ? newSelection[0] : "",
                                 duration: newSelection.length > 0 ? (newSelection.length * 0.25).toString() : "0"
                             });
                        };

                        const isSelected = (time: string) => (formData.selectedSlots || []).includes(time);

                        return (
                            <div className="space-y-4">
                                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                                    {intervals.map((time) => {
                                        // Get stats for this slot
                                        const stat = slotStats[time] || { totalApplied: 0, requestsCount: 0, approvedCount: 0 };
                                        const remaining = machine.capacity - stat.approvedCount; // Capacity based on approved only? Or pending?
                                        // Usually for booking, we care about approved. Pending might be rejected.
                                        // Let's show both.
                                        
                                        return (
                                            <HoverCard key={time}>
                                                <HoverCardTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant={isSelected(time) ? "default" : "outline"}
                                                        className={`h-9 text-xs py-1 px-2 ${isSelected(time) ? 'ring-2 ring-offset-1' : ''} ${remaining <= 0 ? 'bg-red-50 text-red-400 hover:bg-red-50 cursor-not-allowed border-red-200' : ''}`}
                                                        disabled={remaining <= 0}
                                                        onClick={() => handleSlotClick(time)}
                                                    >
                                                        {formatTime12Hour(time)}
                                                    </Button>
                                                </HoverCardTrigger>
                                                <HoverCardContent className="w-64 text-xs p-3">
                                                    <div className="space-y-2">
                                                        <h4 className="font-semibold text-sm border-b pb-1">Slot Details ({formatTime12Hour(time)})</h4>
                                                        <div className="grid grid-cols-2 gap-y-1">
                                                            <span className="text-muted-foreground">Total Capacity:</span>
                                                            <span className="text-right font-medium">{machine.capacity}</span>
                                                            
                                                            <span className="text-muted-foreground">Students Applied:</span>
                                                            <span className="text-right font-medium text-amber-600">{stat.totalApplied}</span>
                                                            
                                                            <span className="text-muted-foreground">Requests Sent:</span>
                                                            <span className="text-right font-medium">{stat.requestsCount}</span>
                                                            
                                                            <span className="text-muted-foreground">Approved Slots:</span>
                                                            <span className="text-right font-medium text-green-600">{stat.approvedCount}</span>
                                                            
                                                            <span className="font-semibold border-t pt-1 mt-1">Available:</span>
                                                            <span className={`text-right font-bold border-t pt-1 mt-1 ${remaining < 3 ? 'text-red-500' : 'text-blue-600'}`}>
                                                                {remaining}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </HoverCardContent>
                                            </HoverCard>
                                        );
                                    })}
                                </div>
                                
                                {formData.startTime && (formData.selectedSlots || []).length > 0 && (
                                    <div className="flex items-center gap-6 p-4 bg-secondary/10 rounded-md border text-sm">
                                        <div>
                                            <span className="text-muted-foreground block text-xs uppercase tracking-wider">Start Time</span>
                                            <span className="font-semibold text-lg">{formatTime12Hour(formData.startTime)}</span>
                                        </div>
                                        <div>
                                             <span className="text-muted-foreground block text-xs uppercase tracking-wider">Duration</span>
                                             <span className="font-semibold text-lg">
                                                {(formData.selectedSlots || []).length * 15} mins
                                             </span>
                                        </div>
                                        <div>
                                             <span className="text-muted-foreground block text-xs uppercase tracking-wider">End Time (Approx)</span>
                                             <span className="font-semibold text-lg text-primary">
                                                {(() => {
                                                    // Calculate end time based on selection count
                                                    const [h, m] = formData.startTime.split(':').map(Number);
                                                    const totalMins = h * 60 + m + ((formData.selectedSlots || []).length * 15);
                                                    const endH = Math.floor(totalMins / 60);
                                                    const endM = totalMins % 60;
                                                    return formatTime12Hour(`${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`);
                                                })()}
                                             </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>
            )}

            <div>
                <Label>Purpose of Usage</Label>
                <Textarea 
                    placeholder="Describe why you need this machine..." 
                    value={formData.purpose} 
                    onChange={(e) => setFormData({...formData, purpose: e.target.value})} 
                    required 
                    minLength={20}
                />
            </div>

            {/* Student Details */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <Label className="block">Student Details</Label>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">No. of Students:</span>
                        <Input 
                            type="number" 
                            min="1" 
                            max="20" 
                            className="w-20 h-8"
                            value={formData.numberOfStudents || ""}
                            onChange={(e) => {
                                const val = e.target.value;
                                setFormData({...formData, numberOfStudents: val === "" ? 0 : parseInt(val)});
                            }}
                        />
                    </div>
                </div>
                
                <div className="space-y-2">
                    {teamMembers.map((member, i) => (
                        <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center bg-secondary/20 p-2 rounded">
                            <div className="md:col-span-1 flex items-center justify-center">
                                <span className="text-xs font-bold text-center bg-secondary rounded-full w-6 h-6 flex items-center justify-center">{i+1}</span>
                            </div>
                            <div className="md:col-span-3">
                                <Input placeholder="Name" value={member.name} onChange={(e) => handleMemberChange(i, 'name', e.target.value)} required className="h-8 text-sm" />
                            </div>
                            <div className="md:col-span-3">
                                 <Input type="email" placeholder="Email" value={member.email || ""} onChange={(e) => handleMemberChange(i, 'email', e.target.value)} required className="h-8 text-sm" />
                            </div>
                            <div className="md:col-span-2">
                                 <Input type="tel" placeholder="Mobile" value={member.mobile || ""} onChange={(e) => handleMemberChange(i, 'mobile', e.target.value)} required className="h-8 text-sm" />
                            </div>
                            <div className="md:col-span-2">
                                 <Select value={member.branch} onValueChange={(val) => handleMemberChange(i, 'branch', val)}>
                                     <SelectTrigger className="h-8 text-sm bg-background">
                                         <SelectValue placeholder="Branch" />
                                     </SelectTrigger>
                                     <SelectContent>
                                         <SelectItem value="Computer Engineering">Computer Engineering</SelectItem>
                                         <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                                         <SelectItem value="CSD">CSD</SelectItem>
                                         <SelectItem value="AIDS">AIDS</SelectItem>
                                         <SelectItem value="Robotics">Robotics</SelectItem>
                                         <SelectItem value="Chemical Engineering">Chemical Engineering</SelectItem>
                                         <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                                         <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                                         <SelectItem value="ENTC">ENTC</SelectItem>
                                     </SelectContent>
                                 </Select>
                            </div>
                            <div className="md:col-span-1">
                                 <Select value={member.year} onValueChange={(val) => handleMemberChange(i, 'year', val)}>
                                     <SelectTrigger className="h-8 text-sm bg-background">
                                         <SelectValue placeholder="Year" />
                                     </SelectTrigger>
                                     <SelectContent>
                                         <SelectItem value="1st Year">1st Year</SelectItem>
                                         <SelectItem value="2nd Year">2nd Year</SelectItem>
                                         <SelectItem value="3rd Year">3rd Year</SelectItem>
                                         <SelectItem value="4th Year">4th Year</SelectItem>
                                     </SelectContent>
                                 </Select>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Consent */}
            <div className="flex items-center space-x-2 border p-4 rounded-md border-primary/20 bg-primary/5">
                <Checkbox 
                    id="consent" 
                    checked={formData.consentAgreed} 
                    onCheckedChange={(c) => setFormData({...formData, consentAgreed: c as boolean})} 
                />
                <Label htmlFor="consent" className="text-sm font-medium leading-none cursor-pointer">
                    I agree that if any damage happens to this machinery, the student/team will be fully responsible.
                </Label>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={uploading}>
                {uploading ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MachineryRequestForm;
