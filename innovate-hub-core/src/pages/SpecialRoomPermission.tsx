import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Users,
  Briefcase,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Trash,
  Plus,
  Printer,
  Download,
  Info,
  Check
} from "lucide-react";

interface RoomDetails {
  name: string;
  capacity: number;
  equipment: string[];
  description: string;
  image: string;
  isActive?: boolean;
  deactivationReason?: string | null;
}

const BRANCHES = [
  "Computer Engineering",
  "Artificial Intelligence & Data Science (AIDS)",
  "Computer Science & Design (CSD)",
  "Electronics & Telecommunication Engineering (ENTC)",
  "Information Technology (IT)",
  "Robotics & Automation",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical Engineering",
  "Chemical Engineering"
];

const CATEGORIES = [
  "Project Discussion",
  "Prototype Development",
  "Team Meeting",
  "Workshop Preparation",
  "Presentation Practice",
  "Research Activity",
  "Innovation Activity",
  "Other"
];

const getEquipmentEmoji = (eq: string) => {
  const map: Record<string, string> = {
    'Projector': '📽',
    'Display Screen': '🖥',
    'Audio System': '🔊',
    'Marker Set': '✏',
    'Whiteboard': '📋',
    'Laptop Connection': '🔌',
    'Extension Board': '⚡',
    'Internet Access': '🌐',
    'Video Conferencing Setup': '📹',
    'Prototype Display Area': '📦'
  };
  return map[eq] || '🛠';
};

const parseTimeTo12Hour = (timeStr: string) => {
  if (!timeStr) return { hour: "", minute: "", period: "" };
  const parts = timeStr.split(":");
  if (parts.length < 2) return { hour: "", minute: "", period: "" };
  const [hStr, mStr] = parts;
  let hour = parseInt(hStr, 10);
  const minute = mStr || "00";
  let period = "AM";
  if (hour >= 12) {
    period = "PM";
    if (hour > 12) hour -= 12;
  }
  if (hour === 0) hour = 12;
  return {
    hour: String(hour).padStart(2, "0"),
    minute,
    period
  };
};

const formatTimeFrom12Hour = (hour: string, minute: string, period: string) => {
  let h = parseInt(hour, 10);
  if (period === "PM" && h < 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${minute}`;
};

const TimePicker12Hour = ({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (time: string) => void;
}) => {
  const { hour, minute, period } = parseTimeTo12Hour(value);

  const handleHourChange = (newHour: string) => {
    const m = minute || "00";
    const p = period || "AM";
    onChange(formatTimeFrom12Hour(newHour, m, p));
  };

  const handleMinuteChange = (newMinute: string) => {
    const h = hour || "12";
    const p = period || "AM";
    onChange(formatTimeFrom12Hour(h, newMinute, p));
  };

  const handlePeriodChange = (newPeriod: string) => {
    const h = hour || "12";
    const m = minute || "00";
    onChange(formatTimeFrom12Hour(h, m, newPeriod));
  };

  const hoursList = ["12", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11"];
  const minutesList = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-1.5 items-center mt-1">
        <Select value={hour || undefined} onValueChange={handleHourChange}>
          <SelectTrigger className="w-[75px] h-10 border border-slate-200 rounded-lg text-xs bg-background">
            <SelectValue placeholder="Hour" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {hoursList.map((h) => (
              <SelectItem key={h} value={h}>
                {h}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-muted-foreground font-semibold">:</span>
        <Select value={minute || undefined} onValueChange={handleMinuteChange}>
          <SelectTrigger className="w-[75px] h-10 border border-slate-200 rounded-lg text-xs bg-background">
            <SelectValue placeholder="Min" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {minutesList.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={period || undefined} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-[85px] h-10 border border-slate-200 rounded-lg text-xs bg-background">
            <SelectValue placeholder="AM/PM" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AM">AM</SelectItem>
            <SelectItem value="PM">PM</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

const SpecialRoomPermission = () => {
  const [activeTab, setActiveTab] = useState<"book" | "history">("book");
  const [selectedRoom, setSelectedRoom] = useState<RoomDetails | null>(null);
  const [viewDetailsRoom, setViewDetailsRoom] = useState<RoomDetails | null>(null);
  
  // Form State
  const [formStep, setFormStep] = useState<number>(1);
  const [formData, setFormData] = useState({
    purpose: "",
    category: "Project Discussion",
    applicantDetails: {
      applicantName: "",
      prn: "",
      rollNo: "",
      department: "",
      year: "",
      division: "",
      mobile: "",
      email: ""
    },
    teamDetails: {
      teamName: "",
      projectName: "",
      participantsCount: 1
    },
    schedule: {
      requestedDate: "",
      startTime: "",
      endTime: ""
    },
    facultyRecommendation: {
      facultyName: "",
      facultyDepartment: "",
      facultyMobile: "",
      facultyEmail: "",
      facultyDesignation: "Assistant Professor",
      facultyRemarks: ""
    },
    resourceRequirements: {
      requiredEquipment: [] as string[],
      otherEquipment: ""
    },
    specialRequirements: "",
    additionalNotes: "",
    guidelinesChecked: {
      cleanliness: false,
      noDamage: false,
      timings: false,
      returnEquipment: false,
      policies: false
    }
  });

  const [teamMembers, setTeamMembers] = useState<{ fullName: string; prn: string; department: string; year: string }[]>([]);
  const [availabilityCheck, setAvailabilityCheck] = useState<{ available: boolean; status: string; message: string; suggestions?: { startTime: string; endTime: string }[] } | null>(null);
  const [inventoryStatus, setInventoryStatus] = useState<{ equipment: string; total: number; reserved: number; remaining: number }[]>([]);
  
  // Dashboard / History state
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, upcoming: 0, todayBookings: 0, completed: 0 });
  const [selectedRequestDetails, setSelectedRequestDetails] = useState<any | null>(null);
  const [rooms, setRooms] = useState<RoomDetails[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  useEffect(() => {
    fetchSpecialRooms();
    fetchMyRequests();
    fetchStats();
    
    // Autofill user details if logged in
    const userRaw = localStorage.getItem("idea_hub_user");
    if (userRaw) {
      const u = JSON.parse(userRaw);
      setFormData(prev => ({
        ...prev,
        applicantDetails: {
          ...prev.applicantDetails,
          applicantName: u.name || "",
          email: u.email || "",
          mobile: u.mobile || "",
          department: u.branch || "",
          year: u.year || ""
        }
      }));
    }
  }, []);

  const fetchSpecialRooms = async () => {
    try {
      setLoadingRooms(true);
      const res = await api.get("/rooms?isSpecial=true");
      const mapped = res.data.map((r: any) => ({
        name: r.name,
        capacity: r.capacity,
        equipment: r.features || [],
        description: r.description || "",
        image: r.image || "",
        isActive: r.isActive,
        deactivationReason: r.deactivationReason
      }));
      setRooms(mapped);
    } catch (err) {
      console.error("Failed to load special rooms:", err);
      toast.error("Failed to load special rooms.");
    } finally {
      setLoadingRooms(false);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const res = await api.get("/room-permissions");
      setMyRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/room-permissions/student-stats");
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const checkAvailability = async () => {
    if (!selectedRoom || !formData.schedule.requestedDate || !formData.schedule.startTime || !formData.schedule.endTime) {
      return;
    }
    try {
      const res = await api.get(
        `/room-permissions/availability?requestedDate=${formData.schedule.requestedDate}&startTime=${formData.schedule.startTime}&endTime=${formData.schedule.endTime}&facilityRequired=${selectedRoom.name}`
      );
      setAvailabilityCheck(res.data);
      if (!res.data.available) {
        toast.warning(res.data.message);
      } else {
        toast.success(res.data.message);
      }

      // Also fetch resources inventory for that time
      const invRes = await api.get(
        `/room-permissions/inventory?date=${formData.schedule.requestedDate}&startTime=${formData.schedule.startTime}&endTime=${formData.schedule.endTime}`
      );
      setInventoryStatus(invRes.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to check availability");
    }
  };

  const addTeamMember = () => {
    setTeamMembers(prev => [...prev, { fullName: "", prn: "", department: formData.applicantDetails.department, year: "" }]);
  };

  const removeTeamMember = (index: number) => {
    setTeamMembers(prev => prev.filter((_, i) => i !== index));
  };

  const handleMemberChange = (index: number, field: string, value: string) => {
    const members = [...teamMembers];
    // @ts-ignore
    members[index][field] = value;
    setTeamMembers(members);
  };

  const handleEquipmentToggle = (item: string) => {
    const current = formData.resourceRequirements.requiredEquipment;
    if (current.includes(item)) {
      setFormData(prev => ({
        ...prev,
        resourceRequirements: {
          ...prev.resourceRequirements,
          requiredEquipment: current.filter(x => x !== item)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        resourceRequirements: {
          ...prev.resourceRequirements,
          requiredEquipment: [...current, item]
        }
      }));
    }
  };

  const calculateDuration = () => {
    const { startTime, endTime } = formData.schedule;
    if (!startTime || !endTime) return "0 hours";
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const duration = (eh * 60 + em - (sh * 60 + sm)) / 60;
    return duration > 0 ? `${duration.toFixed(1)} Hours` : "0 hours";
  };

  const validateStep = (step: number) => {
    if (step === 1) {
      if (!selectedRoom) return "Please select a facility.";
      if (!formData.schedule.requestedDate || !formData.schedule.startTime || !formData.schedule.endTime) {
        return "Please enter a schedule date and slot.";
      }
      if (availabilityCheck && !availabilityCheck.available) {
        return "Selected slot has conflict. Please select a different timing.";
      }
      if (!formData.teamDetails.participantsCount || formData.teamDetails.participantsCount < 1) {
        return "Number of participants must be at least 1.";
      }
      if (formData.teamDetails.participantsCount > selectedRoom.capacity) {
        return `Participant count exceeds room capacity of ${selectedRoom.capacity}.`;
      }
    }
    if (step === 2) {
      const ap = formData.applicantDetails;
      if (!ap.applicantName || !ap.prn || !ap.rollNo || !ap.department || !ap.year || !ap.division || !ap.mobile || !ap.email) {
        return "Please fill all applicant details.";
      }
      const td = formData.teamDetails;
      if (!td.teamName || !td.projectName) {
        return "Please enter team name and project name.";
      }
      for (const m of teamMembers) {
        if (!m.fullName || !m.prn || !m.year) {
          return "Please fill all details for each team member.";
        }
      }
    }
    if (step === 3) {
      const fc = formData.facultyRecommendation;
      if (!fc.facultyName || !fc.facultyDepartment || !fc.facultyMobile || !fc.facultyEmail) {
        return "Please fill recommendations faculty details.";
      }
    }
    return null;
  };

  const nextStep = () => {
    const err = validateStep(formStep);
    if (err) {
      toast.error(err);
      return;
    }
    setFormStep(prev => prev + 1);
  };

  const prevStep = () => {
    setFormStep(prev => prev - 1);
  };

  const handleFormSubmit = async (status: "Draft" | "Submitted") => {
    if (status === "Submitted") {
      const err = validateStep(3);
      if (err) return toast.error(err);
      
      const guides = formData.guidelinesChecked;
      if (!guides.cleanliness || !guides.noDamage || !guides.timings || !guides.returnEquipment || !guides.policies) {
        return toast.error("You must agree to all Room Rules & Guidelines before submission.");
      }
    }

    try {
      const payload = {
        facilityRequired: selectedRoom?.name,
        purpose: formData.purpose,
        category: formData.category,
        applicantDetails: formData.applicantDetails,
        teamDetails: {
          ...formData.teamDetails,
          teamMembers
        },
        schedule: formData.schedule,
        facultyRecommendation: formData.facultyRecommendation,
        resourceRequirements: formData.resourceRequirements,
        specialRequirements: formData.specialRequirements,
        additionalNotes: formData.additionalNotes,
        declaresAgreed: true,
        status
      };

      await api.post("/room-permissions/submit", payload);
      toast.success(status === "Submitted" ? "Request submitted successfully!" : "Draft request saved!");
      setActiveTab("history");
      setSelectedRoom(null);
      setFormStep(1);
      // Reset form
      setFormData(prev => ({
        ...prev,
        purpose: "",
        teamDetails: { teamName: "", projectName: "", participantsCount: 1 },
        schedule: { requestedDate: "", startTime: "", endTime: "" },
        facultyRecommendation: { facultyName: "", facultyDepartment: "", facultyMobile: "", facultyEmail: "", facultyDesignation: "Assistant Professor", facultyRemarks: "" },
        resourceRequirements: { requiredEquipment: [], otherEquipment: "" },
        specialRequirements: "",
        additionalNotes: "",
        guidelinesChecked: { cleanliness: false, noDamage: false, timings: false, returnEquipment: false, policies: false }
      }));
      setTeamMembers([]);
      setAvailabilityCheck(null);
      fetchMyRequests();
      fetchStats();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit request.");
    }
  };

  const cancelRequest = async (id: string) => {
    try {
      await api.put(`/room-permissions/${id}/cancel`);
      toast.success("Request cancelled successfully!");
      fetchMyRequests();
      fetchStats();
      if (selectedRequestDetails?._id === id) {
        setSelectedRequestDetails(null);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to cancel request.");
    }
  };

  const downloadPdf = (id: string) => {
    window.open(`${api.defaults.baseURL}/room-permissions/${id}/pdf`, "_blank");
  };

  const printForm = (req: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Room Permission Form - ${req.requestId}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #333; }
            h2 { text-align: center; color: #1a237e; border-bottom: 2px solid #1a237e; padding-bottom: 10px; }
            .section { margin-bottom: 20px; border: 1px solid #ddd; padding: 15px; border-radius: 4px; }
            .section-title { font-weight: bold; background: #e8eaf6; padding: 5px 10px; margin:-15px -15px 15px -15px; color:#1a237e; }
            .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 10px; }
            .label { font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #777; }
            .sig-row { display: flex; justify-content: space-between; margin-top: 50px; }
            .sig-col { text-align: center; width: 22%; border-top: 1px solid #aaa; padding-top: 5px; font-size: 13px; }
          </style>
        </head>
        <body>
          <h2>IDEA HUB SPECIAL ROOM PERMISSION</h2>
          <p style="text-align:right"><b>Request ID:</b> ${req.requestId} | <b>Date:</b> ${new Date(req.createdAt).toLocaleDateString()}</p>
          
          <div class="section">
            <div class="section-title">Facility details</div>
            <div class="grid">
              <div><span class="label">Required Room:</span> ${req.facilityRequired}</div>
              <div><span class="label">Date & Time:</span> ${req.schedule.requestedDate} (${req.schedule.startTime} - ${req.schedule.endTime})</div>
              <div><span class="label">Duration:</span> ${req.schedule.duration} Hours</div>
              <div><span class="label">Project Title:</span> ${req.teamDetails.projectName}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Applicant details</div>
            <div class="grid">
              <div><span class="label">Name:</span> ${req.applicantDetails.applicantName}</div>
              <div><span class="label">PRN / Roll Number:</span> ${req.applicantDetails.prn} / ${req.applicantDetails.rollNo}</div>
              <div><span class="label">Department / Year:</span> ${req.applicantDetails.department} - ${req.applicantDetails.year} (Div: ${req.applicantDetails.division})</div>
              <div><span class="label">Email / Mobile:</span> ${req.applicantDetails.email} / ${req.applicantDetails.mobile}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Faculty Recommendation</div>
            <div class="grid">
              <div><span class="label">Faculty Advisor:</span> ${req.facultyRecommendation.facultyName}</div>
              <div><span class="label">Designation / Department:</span> ${req.facultyRecommendation.facultyDesignation} (${req.facultyRecommendation.facultyDepartment})</div>
              <div><span class="label">Recommendation Status:</span> ${req.facultyRecommendation.verified ? "RECOMMENDED" : "PENDING"}</div>
              <div><span class="label">Faculty Remarks:</span> ${req.facultyRecommendation.facultyRemarks || "None"}</div>
            </div>
          </div>

          <div class="sig-row">
            <div class="sig-col">Student Sign</div>
            <div class="sig-col">Faculty Advisor</div>
            <div class="sig-col">Coordinator Sign</div>
            <div class="sig-col">IDEA Hub Head Sign</div>
          </div>

          <div class="footer">
            Generated from IDEA Hub Room Permission Module. Valid ONLY with QR/Official signatures.
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };



  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] py-8">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Room Permission Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Request permission for Conference Rooms, Discussion Rooms, and Ideation Rooms.
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex gap-2 bg-muted p-1 rounded-lg self-start">
          <Button
            variant={activeTab === "book" ? "default" : "ghost"}
            size="sm"
            onClick={() => { setActiveTab("book"); setFormStep(1); }}
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" /> Book Room
          </Button>

          <Button
            variant={activeTab === "history" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("history")}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" /> My Requests
          </Button>
        </div>
      </div>

      {/* -------------------- BOOK ROOM TAB -------------------- */}
      {activeTab === "book" && (
        <div className="w-full">
          {/* Room Selection Cards Column */}
          {loadingRooms ? (
            <div className="text-center py-12 text-muted-foreground">Loading special rooms details...</div>
          ) : !selectedRoom ? (
            <div className="space-y-8 w-full bg-white/50 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-slate-200/60 shadow-xs">
              <div className="border-b border-slate-200/80 pb-5">
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Select Facility Type</h2>
                <p className="text-sm text-slate-500 mt-1">Choose the space that best suits your activity</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {rooms.map(room => {
                  const isDeactivated = room.isActive === false;
                  return (
                    <Card 
                      key={room.name} 
                      className={`overflow-hidden bg-white border border-slate-200/80 shadow-xs hover:-translate-y-2 hover:shadow-xl transition-all duration-300 rounded-2xl flex flex-col min-h-[520px] ${isDeactivated ? 'opacity-80' : ''}`}
                    >
                      <div className="relative h-56 overflow-hidden bg-slate-900 group">
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent z-10" />
                        {room.image ? (
                          <img 
                            src={room.image} 
                            alt={room.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-200 flex items-center justify-center text-muted-foreground text-xs">No Image</div>
                        )}
                        <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-md text-slate-800 text-xs px-3 py-1.5 rounded-full font-bold shadow-sm border border-slate-100 flex items-center gap-1.5">
                          👥 {room.capacity} People
                        </div>
                      </div>
                      <CardHeader className="p-6 pb-2">
                        <CardTitle className="text-lg font-extrabold text-slate-900 flex items-center justify-between">
                          {room.name}
                          {isDeactivated && (
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-700">Unavailable</span>
                          )}
                        </CardTitle>
                        <CardDescription className="line-clamp-3 text-xs text-slate-500 leading-relaxed mt-1">{room.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col justify-between p-6 pt-0 space-y-6">
                        <div>
                          <div className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Available Equipment</div>
                          <div className="flex flex-wrap gap-1.5">
                            {room.equipment.slice(0, 4).map(eq => (
                              <span key={eq} className="rounded-full bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 text-2xs flex items-center gap-1">
                                {getEquipmentEmoji(eq)} {eq}
                              </span>
                            ))}
                            {room.equipment.length > 4 && (
                              <span className="rounded-full bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 text-2xs">
                                +{room.equipment.length - 4} More
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Capacity Summary Section or Deactivation message */}
                        {isDeactivated ? (
                          <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-800 text-2xs leading-relaxed">
                            <span className="font-extrabold uppercase block text-[9px] mb-0.5 text-rose-900">Deactivated:</span>
                            {room.deactivationReason || "This space is temporarily closed for maintenance."}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 border-t border-slate-100/80 pt-4">
                            <Users className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-semibold text-slate-500">Capacity:</span>
                            <span className="text-xs font-bold text-slate-800">{room.capacity} People</span>
                          </div>
                        )}

                        <div className="flex gap-3 pt-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setViewDetailsRoom(room)} 
                            className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition font-semibold px-4 py-2.5 text-xs rounded-lg flex-1 h-10 shadow-xs"
                          >
                            View Details
                          </Button>
                          <Button 
                            type="button" 
                            disabled={isDeactivated}
                            onClick={() => setSelectedRoom(room)} 
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 text-xs rounded-lg transition flex-1 h-10 shadow-xs disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed disabled:border-transparent"
                          >
                            {isDeactivated ? "Unavailable" : "Book Room"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form Wizard Column */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between border-b pb-4 mb-4">
                  <Button variant="ghost" size="sm" onClick={() => { setSelectedRoom(null); setFormStep(1); }} className="p-0 hover:bg-transparent">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back to Rooms
                  </Button>
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${formStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>1</span>
                    <span className="text-xs text-muted-foreground">Details</span>
                    <span className="w-4 h-px bg-muted" />
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${formStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>2</span>
                    <span className="text-xs text-muted-foreground">Applicant</span>
                    <span className="w-4 h-px bg-muted" />
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${formStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>3</span>
                    <span className="text-xs text-muted-foreground">Faculty</span>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Booking {selectedRoom.name} - Step {formStep} of 3</CardTitle>
                    <CardDescription>Fill out all required details accurately.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* STEP 1: SCHEDULE & CAPACITY DETAILS */}
                    {formStep === 1 && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label>Requested Date</Label>
                            <Input 
                              type="date" 
                              min={new Date().toISOString().split('T')[0]} 
                              value={formData.schedule.requestedDate} 
                              onChange={(e) => setFormData(prev => ({ ...prev, schedule: { ...prev.schedule, requestedDate: e.target.value } }))} 
                            />
                          </div>
                          <TimePicker12Hour 
                            label="Start Time"
                            value={formData.schedule.startTime}
                            onChange={(time) => setFormData(prev => ({ ...prev, schedule: { ...prev.schedule, startTime: time } }))}
                          />
                          <TimePicker12Hour 
                            label="End Time"
                            value={formData.schedule.endTime}
                            onChange={(time) => setFormData(prev => ({ ...prev, schedule: { ...prev.schedule, endTime: time } }))}
                          />
                        </div>

                        <div className="flex gap-4">
                          <Button variant="secondary" size="sm" onClick={checkAvailability}>Check Slot Availability</Button>
                          <div className="flex items-center text-sm font-semibold">
                            Duration: <span className="text-primary ml-1">{calculateDuration()}</span>
                          </div>
                        </div>

                        {/* Availability Warnings */}
                        {availabilityCheck && (
                          <div className={`p-4 rounded-md border text-sm flex items-start gap-3 ${availabilityCheck.available ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                            {availabilityCheck.available ? <CheckCircle className="w-5 h-5 text-green-600 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />}
                            <div>
                              <p className="font-semibold">{availabilityCheck.status}</p>
                              <p className="text-xs mt-1">{availabilityCheck.message}</p>
                              {availabilityCheck.suggestions && availabilityCheck.suggestions.length > 0 && (
                                <div className="mt-3">
                                  <p className="font-medium text-xs">Suggested nearest available slots:</p>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {availabilityCheck.suggestions.map((s, idx) => (
                                      <Button 
                                        key={idx} 
                                        type="button" 
                                        variant="outline" 
                                        size="xs" 
                                        onClick={() => {
                                          setFormData(prev => ({ ...prev, schedule: { ...prev.schedule, startTime: s.startTime, endTime: s.endTime } }));
                                          setAvailabilityCheck(null);
                                        }}
                                      >
                                        {s.startTime} - {s.endTime}
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Activity / Project Category</Label>
                            <Select 
                              value={formData.category} 
                              onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Category" />
                              </SelectTrigger>
                              <SelectContent>
                                {CATEGORIES.map(c => (
                                  <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Number of Participants</Label>
                            <Input 
                              type="number" 
                              min={0} 
                              value={formData.teamDetails.participantsCount === 0 ? "0" : (formData.teamDetails.participantsCount || "")} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormData(prev => ({ 
                                  ...prev, 
                                  teamDetails: { 
                                    ...prev.teamDetails, 
                                    participantsCount: val === "" ? "" as any : parseInt(val)
                                  } 
                                }));
                              }} 
                            />
                            <p className="text-2xs text-muted-foreground mt-1">Max capacity for {selectedRoom.name} is {selectedRoom.capacity} persons.</p>
                          </div>
                        </div>

                        <div>
                          <Label>Purpose of Request</Label>
                          <Textarea 
                            placeholder="Briefly state the purpose of booking..." 
                            value={formData.purpose} 
                            onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                          />
                        </div>
                      </div>
                    )}

                    {/* STEP 2: APPLICANT DETAILS & TEAM MEMBERS */}
                    {formStep === 2 && (
                      <div className="space-y-6">
                        <h3 className="font-semibold text-sm border-b pb-2">Applicant Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label>Requested By</Label>
                            <Input value={formData.applicantDetails.applicantName} onChange={(e) => setFormData(prev => ({ ...prev, applicantDetails: { ...prev.applicantDetails, applicantName: e.target.value } }))} required />
                          </div>
                          <div>
                            <Label>PRN Number</Label>
                            <Input value={formData.applicantDetails.prn} onChange={(e) => setFormData(prev => ({ ...prev, applicantDetails: { ...prev.applicantDetails, prn: e.target.value } }))} required />
                          </div>
                          <div>
                            <Label>Roll Number</Label>
                            <Input value={formData.applicantDetails.rollNo} onChange={(e) => setFormData(prev => ({ ...prev, applicantDetails: { ...prev.applicantDetails, rollNo: e.target.value } }))} required />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="md:col-span-2">
                            <Label>Department / Branch</Label>
                            <Select 
                              value={formData.applicantDetails.department}
                              onValueChange={(val) => setFormData(prev => ({ ...prev, applicantDetails: { ...prev.applicantDetails, department: val } }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Department" />
                              </SelectTrigger>
                              <SelectContent>
                                {BRANCHES.map(b => (
                                  <SelectItem key={b} value={b}>{b}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Year</Label>
                            <Select 
                              value={formData.applicantDetails.year}
                              onValueChange={(val) => setFormData(prev => ({ ...prev, applicantDetails: { ...prev.applicantDetails, year: val } }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Year" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="FE">First Year (FE)</SelectItem>
                                <SelectItem value="SE">Second Year (SE)</SelectItem>
                                <SelectItem value="TE">Third Year (TE)</SelectItem>
                                <SelectItem value="BE">Fourth Year (BE)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Division</Label>
                            <Input placeholder="A/B/C" value={formData.applicantDetails.division} onChange={(e) => setFormData(prev => ({ ...prev, applicantDetails: { ...prev.applicantDetails, division: e.target.value } }))} required />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Mobile Number</Label>
                            <Input type="tel" value={formData.applicantDetails.mobile} onChange={(e) => setFormData(prev => ({ ...prev, applicantDetails: { ...prev.applicantDetails, mobile: e.target.value } }))} required />
                          </div>
                          <div>
                            <Label>Email Address</Label>
                            <Input type="email" value={formData.applicantDetails.email} onChange={(e) => setFormData(prev => ({ ...prev, applicantDetails: { ...prev.applicantDetails, email: e.target.value } }))} required />
                          </div>
                        </div>

                        <h3 className="font-semibold text-sm border-b pb-2 pt-4 flex justify-between items-center">
                          <span>Team & Project details</span>
                          <Button type="button" variant="outline" size="sm" onClick={addTeamMember} className="h-8">
                            <Plus className="w-3.5 h-3.5 mr-1" /> Add Member
                          </Button>
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Team Name</Label>
                            <Input placeholder="Project / Team Name" value={formData.teamDetails.teamName} onChange={(e) => setFormData(prev => ({ ...prev, teamDetails: { ...prev.teamDetails, teamName: e.target.value } }))} />
                          </div>
                          <div>
                            <Label>Project Name</Label>
                            <Input placeholder="Core Project Title" value={formData.teamDetails.projectName} onChange={(e) => setFormData(prev => ({ ...prev, teamDetails: { ...prev.teamDetails, projectName: e.target.value } }))} />
                          </div>
                        </div>

                        {teamMembers.length > 0 && (
                          <div className="space-y-3">
                            <Label>Dynamic Team Members</Label>
                            {teamMembers.map((member, idx) => (
                              <div key={idx} className="flex flex-col md:flex-row gap-2 border p-3 rounded bg-secondary/15 relative">
                                <Button type="button" variant="ghost" size="sm" onClick={() => removeTeamMember(idx)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 md:hidden">
                                  <Trash className="w-4 h-4" />
                                </Button>
                                <div className="flex-1">
                                  <Input placeholder="Full Name" value={member.fullName} onChange={(e) => handleMemberChange(idx, 'fullName', e.target.value)} className="h-8 text-xs bg-background" />
                                </div>
                                <div className="w-32">
                                  <Input placeholder="PRN" value={member.prn} onChange={(e) => handleMemberChange(idx, 'prn', e.target.value)} className="h-8 text-xs bg-background" />
                                </div>
                                <div className="w-40">
                                  <Input placeholder="Branch" value={formData.applicantDetails.department} disabled className="h-8 text-xs bg-background/50" />
                                </div>
                                <div className="w-28">
                                  <Select value={member.year} onValueChange={(val) => handleMemberChange(idx, 'year', val)}>
                                    <SelectTrigger className="h-8 text-xs bg-background">
                                      <SelectValue placeholder="Year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="FE">FE</SelectItem>
                                      <SelectItem value="SE">SE</SelectItem>
                                      <SelectItem value="TE">TE</SelectItem>
                                      <SelectItem value="BE">BE</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Button type="button" variant="ghost" size="sm" onClick={() => removeTeamMember(idx)} className="text-red-500 hover:text-red-700 hidden md:inline-flex self-center">
                                  <Trash className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* STEP 3: RECOMMENDING FACULTY & RESOURCE REQUIREMENTS */}
                    {formStep === 3 && (
                      <div className="space-y-6">
                        <h3 className="font-semibold text-sm border-b pb-2">Recommending Faculty Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label>Faculty Name</Label>
                            <Input value={formData.facultyRecommendation.facultyName} onChange={(e) => setFormData(prev => ({ ...prev, facultyRecommendation: { ...prev.facultyRecommendation, facultyName: e.target.value } }))} required />
                          </div>
                          <div>
                            <Label>Faculty Department</Label>
                            <Input value={formData.facultyRecommendation.facultyDepartment} onChange={(e) => setFormData(prev => ({ ...prev, facultyRecommendation: { ...prev.facultyRecommendation, facultyDepartment: e.target.value } }))} required />
                          </div>
                          <div>
                            <Label>Faculty Designation</Label>
                            <Select 
                              value={formData.facultyRecommendation.facultyDesignation}
                              onValueChange={(val) => setFormData(prev => ({ ...prev, facultyRecommendation: { ...prev.facultyRecommendation, facultyDesignation: val } }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Designation" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                                <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                                <SelectItem value="Professor">Professor</SelectItem>
                                <SelectItem value="Head of Department">Head of Department (HOD)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Faculty Mobile Number</Label>
                            <Input type="tel" value={formData.facultyRecommendation.facultyMobile} onChange={(e) => setFormData(prev => ({ ...prev, facultyRecommendation: { ...prev.facultyRecommendation, facultyMobile: e.target.value } }))} required />
                          </div>
                          <div>
                            <Label>Faculty Email Address</Label>
                            <Input type="email" value={formData.facultyRecommendation.facultyEmail} onChange={(e) => setFormData(prev => ({ ...prev, facultyRecommendation: { ...prev.facultyRecommendation, facultyEmail: e.target.value } }))} required />
                          </div>
                        </div>

                        <h3 className="font-semibold text-sm border-b pb-2 pt-4">Resource & Equipment Requirements</h3>
                        <div>
                          <Label className="mb-2 block">Select Required Equipment</Label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {selectedRoom.equipment.map(eq => (
                              <div key={eq} className="flex items-center space-x-2 border p-2 rounded hover:bg-secondary/10 cursor-pointer">
                                <Checkbox 
                                  id={`eq-${eq}`} 
                                  checked={formData.resourceRequirements.requiredEquipment.includes(eq)} 
                                  onCheckedChange={() => handleEquipmentToggle(eq)}
                                />
                                <label htmlFor={`eq-${eq}`} className="text-xs leading-none cursor-pointer">{eq}</label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          <div>
                            <Label>Other Equipment Required</Label>
                            <Input placeholder="Laptop adapters, prototypes display area..." value={formData.resourceRequirements.otherEquipment} onChange={(e) => setFormData(prev => ({ ...prev, resourceRequirements: { ...prev.resourceRequirements, otherEquipment: e.target.value } }))} />
                          </div>
                          <div>
                            <Label>Special Requirements</Label>
                            <Input placeholder="Extended seating, specific audio setups..." value={formData.specialRequirements} onChange={(e) => setFormData(prev => ({ ...prev, specialRequirements: e.target.value }))} />
                          </div>
                        </div>

                        <h3 className="font-semibold text-sm border-b pb-2 pt-4">Room Usage Rules & Guidelines</h3>
                        <div className="space-y-3 bg-secondary/10 p-4 border rounded">
                          {[
                            { key: 'cleanliness', text: "I agree to maintain complete cleanliness inside the facility." },
                            { key: 'noDamage', text: "I agree to not damage any equipment or furniture inside the room." },
                            { key: 'timings', text: "I agree to strictly follow the allocated timings and vacate immediately after." },
                            { key: 'returnEquipment', text: "I agree to return all borrowed markers, connection cables, or equipment." },
                            { key: 'policies', text: "I agree to follow all official IDEA Hub guidelines and policies." }
                          ].map(rule => (
                            <div key={rule.key} className="flex items-start space-x-2">
                              <Checkbox 
                                id={`rule-${rule.key}`}
                                // @ts-ignore
                                checked={formData.guidelinesChecked[rule.key]}
                                onCheckedChange={(val) => setFormData(prev => ({
                                  ...prev,
                                  guidelinesChecked: { ...prev.guidelinesChecked, [rule.key]: val }
                                }))}
                              />
                              <label htmlFor={`rule-${rule.key}`} className="text-xs cursor-pointer select-none leading-tight">{rule.text}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions Row */}
                    <div className="flex justify-between items-center mt-8 pt-4 border-t">
                      {formStep > 1 ? (
                        <Button variant="outline" onClick={prevStep}>Previous</Button>
                      ) : (
                        <div />
                      )}
                      
                      <div className="flex gap-2">
                        {formStep < 3 ? (
                          <>
                            <Button variant="ghost" onClick={() => handleFormSubmit("Draft")}>Save Draft</Button>
                            <Button onClick={nextStep}>Next Step</Button>
                          </>
                        ) : (
                          <>
                            <Button variant="ghost" onClick={() => handleFormSubmit("Draft")}>Save Draft</Button>
                            <Button onClick={() => handleFormSubmit("Submitted")} className="bg-green-600 hover:bg-green-700">Submit Application</Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Room Info Side Column */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-md">Room Inventory Status</CardTitle>
                    <CardDescription>Real-time equipment check for selection.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {inventoryStatus.length > 0 ? (
                      <div className="space-y-3">
                        {inventoryStatus.slice(0, 5).map(inv => (
                          <div key={inv.equipment} className="flex justify-between items-center text-xs border-b pb-2">
                            <span className="font-medium">{inv.equipment}</span>
                            <span className="text-muted-foreground">
                              {inv.remaining} / {inv.total} Available
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground flex items-center gap-2 p-2 bg-muted/40 rounded">
                        <Info className="w-4 h-4 text-primary" /> Enter Date and Time slot in Step 1 to load real-time equipment availability.
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 space-y-4 text-xs">
                    <img src={selectedRoom.image} alt={selectedRoom.name} className="w-full h-32 object-cover rounded-md mb-2" />
                    <h3 className="font-bold text-sm">{selectedRoom.name}</h3>
                    <p className="text-muted-foreground leading-relaxed">{selectedRoom.description}</p>
                    <div>
                      <div className="font-semibold mb-1">Room Capacity:</div>
                      <div>Max {selectedRoom.capacity} participants</div>
                    </div>
                  </CardContent>
                </Card>
            </div>
          </div>
        )}
      </div>
    )}



      {/* -------------------- MY REQUESTS / HISTORY TAB -------------------- */}
      {activeTab === "history" && (
        <div className="space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              { label: "Total Requests", val: stats.total, color: "bg-blue-50 border-blue-200 text-blue-700" },
              { label: "Pending Requests", val: stats.pending, color: "bg-amber-50 border-amber-200 text-amber-700" },
              { label: "Approved Requests", val: stats.approved, color: "bg-green-50 border-green-200 text-green-700" },
              { label: "Rejected Requests", val: stats.rejected, color: "bg-red-50 border-red-200 text-red-700" },
              { label: "Upcoming Bookings", val: stats.upcoming, color: "bg-indigo-50 border-indigo-200 text-indigo-700" },
              { label: "Today's Bookings", val: stats.todayBookings, color: "bg-orange-50 border-orange-200 text-orange-700" },
              { label: "Completed Bookings", val: stats.completed, color: "bg-slate-50 border-slate-200 text-slate-700" }
            ].map(card => (
              <Card key={card.label} className={`${card.color} border hover:shadow-md transition duration-200`}>
                <CardContent className="p-3 text-center">
                  <div className="text-xs font-semibold leading-tight">{card.label}</div>
                  <div className="text-xl font-extrabold mt-1">{card.val}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Requests List Table */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>My Requests History</CardTitle>
                  <CardDescription>Track status and actions for your requests.</CardDescription>
                </CardHeader>
                <CardContent>
                  {myRequests.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="border-b bg-muted/50 text-muted-foreground uppercase font-bold">
                            <th className="p-3">Request ID</th>
                            <th className="p-3">Room Type</th>
                            <th className="p-3">Date</th>
                            <th className="p-3">Time</th>
                            <th className="p-3 text-center">Status</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {myRequests.map((req) => (
                            <tr 
                              key={req._id} 
                              className={`border-b hover:bg-secondary/5 cursor-pointer ${selectedRequestDetails?._id === req._id ? 'bg-secondary/10' : ''}`}
                              onClick={() => setSelectedRequestDetails(req)}
                            >
                              <td className="p-3 font-semibold">{req.requestId}</td>
                              <td className="p-3">{req.facilityRequired}</td>
                              <td className="p-3">{req.schedule.requestedDate}</td>
                              <td className="p-3">{req.schedule.startTime} - {req.schedule.endTime}</td>
                              <td className="p-3 text-center">
                                <span className={`px-2.5 py-0.5 rounded-full text-3xs font-extrabold uppercase ${
                                  req.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                  req.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                  req.status === 'Conditional Approval' ? 'bg-amber-100 text-amber-700' :
                                  req.status === 'Draft' ? 'bg-slate-100 text-slate-700' :
                                  'bg-blue-100 text-blue-700'
                                }`}>
                                  {req.status}
                                </span>
                              </td>
                              <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex justify-end gap-1.5">
                                  {['Approved', 'Conditional Approval'].includes(req.status) && (
                                    <>
                                      <Button variant="outline" size="xs" onClick={() => downloadPdf(req._id)} className="h-7 px-2">
                                        <Download className="w-3.5 h-3.5" />
                                      </Button>
                                      <Button variant="outline" size="xs" onClick={() => printForm(req)} className="h-7 px-2">
                                        <Printer className="w-3.5 h-3.5" />
                                      </Button>
                                    </>
                                  )}
                                  {['Submitted', 'Faculty Verified', 'Coordinator Review'].includes(req.status) && (
                                    <Button variant="destructive" size="xs" onClick={() => cancelRequest(req._id)} className="h-7 px-2 text-2xs">
                                      Cancel
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground p-8 text-center bg-muted/10 border border-dashed rounded">No requests submitted yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Request Detail Panel (Timeline, History, QR details) */}
            <div>
              {selectedRequestDetails ? (
                <Card className="sticky top-20 border-primary/20">
                  <CardHeader className="border-b pb-4 bg-primary/5">
                    <CardTitle className="text-md flex justify-between items-center">
                      <span>Request Details</span>
                      <span className="text-xs font-mono font-semibold">{selectedRequestDetails.requestId}</span>
                    </CardTitle>
                    <CardDescription>{selectedRequestDetails.facilityRequired} Booking</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-5 text-xs">
                    
                    {/* Status Tracker Timeline */}
                    <div>
                      <div className="font-semibold mb-3">Status Timeline</div>
                      <div className="relative border-l border-primary/20 pl-4 space-y-4">
                        {[
                          { key: 'Submitted', label: 'Submitted & Created' },
                          { key: 'Faculty Verified', label: 'Faculty Verified' },
                          { key: 'Coordinator Review', label: 'Coordinator Review' },
                          { key: 'Coordinator Approved', label: 'Coordinator Approved' },
                          { key: 'IDEA Hub Head Review', label: 'Head Review' },
                          { key: 'Final Decision', label: 'Final Decision' }
                        ].map((node, index) => {
                          let isDone = false;
                          const currentStatus = selectedRequestDetails.status;
                          
                          if (node.key === 'Submitted' && ['Submitted', 'Faculty Verified', 'Coordinator Review', 'Coordinator Approved', 'IDEA Hub Head Review', 'Approved', 'Conditional Approval', 'Completed'].includes(currentStatus)) isDone = true;
                          if (node.key === 'Faculty Verified' && selectedRequestDetails.facultyRecommendation?.verified) isDone = true;
                          if (node.key === 'Coordinator Review' && ['Coordinator Review', 'Coordinator Approved', 'IDEA Hub Head Review', 'Approved', 'Conditional Approval', 'Completed'].includes(currentStatus)) isDone = true;
                          if (node.key === 'Coordinator Approved' && ['Coordinator Approved', 'IDEA Hub Head Review', 'Approved', 'Conditional Approval', 'Completed'].includes(currentStatus)) isDone = true;
                          if (node.key === 'IDEA Hub Head Review' && ['IDEA Hub Head Review', 'Approved', 'Conditional Approval', 'Completed'].includes(currentStatus)) isDone = true;
                          if (node.key === 'Final Decision' && ['Approved', 'Conditional Approval', 'Rejected', 'Completed'].includes(currentStatus)) isDone = true;

                          return (
                            <div key={index} className="relative">
                              <span className={`absolute -left-6 top-0 w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isDone ? 'bg-primary border-primary text-white' : 'bg-background border-muted-foreground'}`}>
                                {isDone && <Check className="w-2 h-2" />}
                              </span>
                              <div className={`${isDone ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>{node.label}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="border-t pt-3 grid grid-cols-2 gap-y-2">
                      <span className="text-muted-foreground">Purpose:</span>
                      <span className="font-medium text-right">{selectedRequestDetails.purpose}</span>
                      
                      <span className="text-muted-foreground">Category:</span>
                      <span className="font-medium text-right">{selectedRequestDetails.category}</span>
                      
                      <span className="text-muted-foreground">Participants:</span>
                      <span className="font-medium text-right">{selectedRequestDetails.teamDetails?.participantsCount} Persons</span>

                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-bold text-right text-primary">{selectedRequestDetails.status}</span>
                    </div>

                    {/* Remarks history audit trail */}
                    {selectedRequestDetails.approvalHistory?.length > 0 && (
                      <div className="border-t pt-3">
                        <div className="font-semibold mb-2">Audit History Remarks</div>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                          {selectedRequestDetails.approvalHistory.map((hist: any, hIdx: number) => (
                            <div key={hIdx} className="bg-secondary/20 p-2 rounded text-2xs border">
                              <div className="flex justify-between font-semibold text-muted-foreground">
                                <span>{hist.role} ({hist.byName})</span>
                                <span>{new Date(hist.date).toLocaleDateString()}</span>
                              </div>
                              <div className="mt-1">Action: <span className="font-bold">{hist.action}</span></div>
                              {hist.remarks && <div className="mt-1 text-muted-foreground italic">"{hist.remarks}"</div>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* PDF Actions */}
                    {['Approved', 'Conditional Approval'].includes(selectedRequestDetails.status) && (
                      <div className="flex gap-2 border-t pt-4">
                        <Button className="flex-1" size="sm" onClick={() => downloadPdf(selectedRequestDetails._id)}>
                          <Download className="w-4 h-4 mr-2" /> Download PDF
                        </Button>
                        <Button className="flex-1" variant="outline" size="sm" onClick={() => printForm(selectedRequestDetails)}>
                          <Printer className="w-4 h-4 mr-2" /> Print Form
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="h-full border border-dashed rounded-md flex items-center justify-center p-8 text-center text-muted-foreground text-xs">
                  <Info className="w-5 h-5 mb-2 block mx-auto text-muted-foreground" /> Select a request from the history table to view real-time timeline, remarks, audit trail, and print commands.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Room Details Modal */}
      <Dialog open={!!viewDetailsRoom} onOpenChange={(open) => !open && setViewDetailsRoom(null)}>
        <DialogContent className="max-w-md md:max-w-lg rounded-2xl bg-white border border-slate-200">
          {viewDetailsRoom && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900">{viewDetailsRoom.name}</DialogTitle>
                <DialogDescription className="text-slate-500">
                  Full details and equipment checklist.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <img src={viewDetailsRoom.image} alt={viewDetailsRoom.name} className="w-full h-48 object-cover rounded-xl border border-slate-100" />
                
                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1">Description</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{viewDetailsRoom.description}</p>
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-xs font-semibold text-slate-600">Capacity Limit:</span>
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">👥 {viewDetailsRoom.capacity} People</span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-2">Available Equipment Checklist ({viewDetailsRoom.equipment.length})</h4>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {viewDetailsRoom.equipment.map((eq) => (
                      <div key={eq} className="flex items-center gap-2 bg-blue-50/50 text-blue-700 rounded-lg p-2 border border-blue-100/40">
                        <span className="text-sm">{getEquipmentEmoji(eq)}</span>
                        <span className="text-xs font-medium truncate">{eq}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setViewDetailsRoom(null)}
                    className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold px-4 py-2 text-xs rounded-lg h-9"
                  >
                    Close
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => {
                      setSelectedRoom(viewDetailsRoom);
                      setViewDetailsRoom(null);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 text-xs rounded-lg transition h-9"
                  >
                    Book Room
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

export default SpecialRoomPermission;
