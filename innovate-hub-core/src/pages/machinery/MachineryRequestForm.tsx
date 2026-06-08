import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  PlusCircle, Trash2, ArrowLeft, ArrowRight, Save, Check, Upload, Calendar, 
  Clock, ShieldAlert, Award, FileText, User, Users, Server, Database,
  ChevronDown, ChevronUp
} from "lucide-react";

interface Machine {
  _id: string;
  name: string;
  capacity: number;
}

interface Material {
  _id: string;
  name: string;
  unit: string;
  remainingQuantity: number;
  currentStock: number;
  allocatedQuantity: number;
}

const MachineryRequestForm = () => {
  const { id } = useParams(); // 'new' or request ID to edit
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [expandedStudents, setExpandedStudents] = useState<Record<number, boolean>>({ 0: true });
  const [machinesList, setMachinesList] = useState<Machine[]>([]);
  const [materialsList, setMaterialsList] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // Form State
  const [projectName, setProjectName] = useState("");
  const [projectCategory, setProjectCategory] = useState("Academic Project");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectObjectives, setProjectObjectives] = useState("");
  const [expectedOutcome, setExpectedOutcome] = useState("");

  const [teamName, setTeamName] = useState("");
  const [numberOfStudents, setNumberOfStudents] = useState(1);
  const [students, setStudents] = useState<any[]>([
    { name: "", prn: "", branch: "Computer Engineering", year: "3rd Year", division: "A", mobile: "", email: "" }
  ]);

  const [facultyGuide, setFacultyGuide] = useState({
    name: "",
    department: "Computer Engineering",
    email: "",
    mobile: "",
    designation: "Assistant Professor",
    remarks: ""
  });

  const [selectedMachines, setSelectedMachines] = useState<string[]>([]);
  const [machineDetails, setMachineDetails] = useState<Record<string, any>>({});
  
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [materialDetails, setMaterialDetails] = useState<Record<string, any>>({});

  const [uploadedFiles, setUploadedFiles] = useState({
    designFileUrl: "",
    cadFileUrl: "",
    circuitDiagramUrl: "",
    supportingDocsUrl: ""
  });

  const [benefits, setBenefits] = useState({
    researchContribution: "",
    competitionParticipation: "",
    patentPossibility: "",
    startupPotential: "",
    futureScope: "",
    technologyImpact: "",
    expectedDeliverables: "",
    communityImpact: ""
  });

  const [declaration, setDeclaration] = useState({
    infoAccurate: false,
    filesBelongToTeam: false,
    agreeToRules: false,
    acceptResponsibility: false
  });

  useEffect(() => {
    fetchInitialResourceLists();
  }, []);

  const fetchInitialResourceLists = async () => {
    setLoading(true);
    try {
      const [mRes, matRes] = await Promise.all([
        api.get("/machinery"),
        api.get("/materials")
      ]);
      setMachinesList(mRes.data);
      setMaterialsList(matRes.data);

      const targetMachineId = searchParams.get("machineId");
      if (targetMachineId) {
        setSelectedMachines([targetMachineId]);
        setMachineDetails({
          [targetMachineId]: {
            usageDate: new Date().toISOString().split("T")[0],
            startTime: "10:00",
            endTime: "12:00",
            usageHours: 2,
            purposeOfUsage: "",
            specialRequirements: ""
          }
        });
      }

      // If editing existing request (non-'new')
      if (id && id !== "new") {
        const reqRes = await api.get(`/machinery/requests/${id}`);
        const rData = reqRes.data;

        setProjectName(rData.projectName || "");
        setProjectCategory(rData.projectCategory || "Academic Project");
        setProjectDescription(rData.projectDescription || "");
        setProjectObjectives(rData.projectObjectives || "");
        setExpectedOutcome(rData.expectedOutcome || "");
        
        setTeamName(rData.teamName || "");
        setNumberOfStudents(rData.numberOfStudents || 1);
        setStudents(rData.students || []);
        
        if (rData.facultyGuide) setFacultyGuide(rData.facultyGuide);

        // Populate machines
        if (rData.requestedMachines?.length > 0) {
          const machIds = rData.requestedMachines.map((m: any) => m.machineId?._id || m.machineId);
          setSelectedMachines(machIds);
          const md: Record<string, any> = {};
          rData.requestedMachines.forEach((m: any) => {
            const mId = m.machineId?._id || m.machineId;
            md[mId] = {
              usageDate: m.usageDate ? new Date(m.usageDate).toISOString().split("T")[0] : "",
              startTime: m.startTime || "",
              endTime: m.endTime || "",
              usageHours: m.usageHours || 0,
              purposeOfUsage: m.purposeOfUsage || "",
              specialRequirements: m.specialRequirements || ""
            };
          });
          setMachineDetails(md);
        }

        // Populate materials
        if (rData.requestedMaterials?.length > 0) {
          const matIds = rData.requestedMaterials.map((m: any) => m.materialId?._id || m.materialId);
          setSelectedMaterials(matIds);
          const matD: Record<string, any> = {};
          rData.requestedMaterials.forEach((m: any) => {
            const mId = m.materialId?._id || m.materialId;
            matD[mId] = {
              quantityRequired: m.quantityRequired || 1,
              purposeOfUsage: m.purposeOfUsage || ""
            };
          });
          setMaterialDetails(matD);
        }

        if (rData.uploadedFiles) setUploadedFiles(rData.uploadedFiles);
        if (rData.benefits) setBenefits(rData.benefits);
        if (rData.declaration) setDeclaration(rData.declaration);
      }
    } catch (error) {
      toast.error("Failed to load initial form metadata.");
    } finally {
      setLoading(false);
    }
  };

  // Adjust students length dynamically
  useEffect(() => {
    const targetCount = Math.max(1, Math.min(4, numberOfStudents));
    if (students.length !== targetCount) {
      const nextList = [...students];
      if (targetCount > nextList.length) {
        const newExpanded = { ...expandedStudents };
        for (let i = nextList.length; i < targetCount; i++) {
          nextList.push({ name: "", prn: "", branch: "Computer Engineering", year: "3rd Year", division: "A", mobile: "", email: "" });
          newExpanded[i] = true; // Auto-expand newly added student cards
        }
        setExpandedStudents(newExpanded);
      } else {
        nextList.length = targetCount;
      }
      setStudents(nextList);
    }
  }, [numberOfStudents]);

  const toggleStudentExpand = (idx: number) => {
    setExpandedStudents(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleStudentFieldChange = (idx: number, field: string, value: string) => {
    const list = [...students];
    list[idx] = { ...list[idx], [field]: value };
    setStudents(list);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);

    setUploadingField(fieldName);
    try {
      const res = await api.post('/machinery/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadedFiles(prev => ({ ...prev, [fieldName]: res.data.url }));
      toast.success("File uploaded successfully.");
    } catch {
      toast.error("File upload failed.");
    } finally {
      setUploadingField(null);
    }
  };

  const calculateHours = (mId: string, start: string, end: string) => {
    if (!start || !end) return;
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const diffMins = (eh * 60 + em) - (sh * 60 + sm);
    const hours = Number((diffMins / 60).toFixed(1));
    
    setMachineDetails(prev => ({
      ...prev,
      [mId]: {
        ...prev[mId],
        usageHours: Math.max(0, hours)
      }
    }));
  };

  const handleMachineDetailsChange = (mId: string, field: string, value: any) => {
    const updated = {
      ...machineDetails,
      [mId]: {
        ...(machineDetails[mId] || {}),
        [field]: value
      }
    };
    setMachineDetails(updated);

    if (field === 'startTime' || field === 'endTime') {
      const details = updated[mId];
      calculateHours(mId, details.startTime, details.endTime);
    }
  };

  const handleMaterialDetailsChange = (mId: string, field: string, value: any) => {
    setMaterialDetails(prev => ({
      ...prev,
      [mId]: {
        ...(prev[mId] || {}),
        [field]: value
      }
    }));
  };

  // Submit request or save draft
  const handleFormSubmit = async (statusType: "Draft" | "Submitted" | "Student Resubmitted") => {
    // Declarations validation
    if (statusType !== "Draft") {
      if (!declaration.agreeToRules || !declaration.acceptResponsibility || !declaration.infoAccurate || !declaration.filesBelongToTeam) {
        toast.error("You must agree to all declaration checkboxes before submitting.");
        return;
      }
      
      // Stock checks
      for (const mId of selectedMaterials) {
        const matItem = materialsList.find(m => m._id === mId);
        const details = materialDetails[mId] || {};
        if (matItem) {
          const qty = Number(details.quantityRequired) || 1;
          const remaining = Math.max(0, matItem.currentStock - matItem.allocatedQuantity);
          if (qty > remaining) {
            toast.error(`Auto Capacity Validation: Only ${remaining} ${matItem.unit} of "${matItem.name}" available.`);
            return;
          }
        }
      }
    }

    setIsSubmitting(true);

    const payload = {
      projectName,
      projectCategory,
      projectDescription,
      projectObjectives,
      expectedOutcome,
      teamName,
      numberOfStudents,
      students,
      facultyGuide,
      requestedMachines: selectedMachines.map(mId => ({
        machineId: mId,
        machineName: machinesList.find(m => m._id === mId)?.name || "",
        usageDate: machineDetails[mId]?.usageDate || "",
        startTime: machineDetails[mId]?.startTime || "",
        endTime: machineDetails[mId]?.endTime || "",
        usageHours: machineDetails[mId]?.usageHours || 0,
        purposeOfUsage: machineDetails[mId]?.purposeOfUsage || "",
        specialRequirements: machineDetails[mId]?.specialRequirements || ""
      })),
      requestedMaterials: selectedMaterials.map(mId => ({
        materialId: mId,
        materialName: materialsList.find(m => m._id === mId)?.name || "",
        quantityRequired: Number(materialDetails[mId]?.quantityRequired) || 1,
        purposeOfUsage: materialDetails[mId]?.purposeOfUsage || ""
      })),
      uploadedFiles,
      benefits,
      declaration,
      status: statusType
    };

    try {
      if (id && id !== "new") {
        await api.put(`/machinery/requests/${id}`, payload);
        toast.success(statusType === 'Draft' ? "Draft saved." : "Application resubmitted successfully!");
      } else {
        await api.post("/machinery/requests", payload);
        toast.success(statusType === 'Draft' ? "Draft saved." : "Application submitted successfully!");
      }
      navigate("/machinery");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    // Step 1 validation
    if (step === 1) {
      if (!projectName || !projectDescription || !projectObjectives || !expectedOutcome) {
        toast.error("Please fill in all project details.");
        return;
      }
      for (const stud of students) {
        if (!stud.name || !stud.prn || !stud.mobile || !stud.email) {
          toast.error("Please fill in all team student details.");
          return;
        }
      }
    }
    // Step 2 validation
    if (step === 2) {
      if (selectedMachines.length === 0) {
        toast.error("Please select at least one machine.");
        return;
      }
    }
    // Step 3 validation
    if (step === 3) {
      for (const mId of selectedMachines) {
        const details = machineDetails[mId];
        if (!details || !details.usageDate || !details.startTime || !details.endTime || !details.purposeOfUsage) {
          toast.error("Please fill in booking parameters for all selected machines.");
          return;
        }
      }
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const STEP_LABELS = [
    "Project & Team",
    "Faculty & Resources",
    "Booking & Files",
    "Review & Submit"
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl font-sans">
      {/* Visual Step Progress Bar */}
      <div className="mb-10 border-b pb-8 relative">
        <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase mb-4">
          <span>Apply Permission Form</span>
          <span className="text-primary">Step {step} of 4</span>
        </div>
        
        {/* Progress Line */}
        <div className="relative flex items-center justify-between mt-6 px-4">
          <div className="absolute left-6 right-6 top-4 h-0.5 bg-slate-200 -z-10" />
          <div 
            className="absolute left-6 top-4 h-0.5 bg-primary transition-all duration-300 -z-10" 
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          />
          {STEP_LABELS.map((label, idx) => {
            const stepNum = idx + 1;
            const isCompleted = step > stepNum;
            const isActive = step === stepNum;
            
            return (
              <div key={idx} className="flex flex-col items-center relative z-10 w-24">
                <button
                  type="button"
                  onClick={() => {
                    if (stepNum < step) setStep(stepNum);
                  }}
                  disabled={stepNum >= step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all font-bold text-xs ${
                    isActive 
                      ? 'bg-primary border-primary text-white shadow-md scale-110' 
                      : isCompleted
                        ? 'bg-primary border-primary text-white hover:bg-primary/90'
                        : 'bg-white border-slate-300 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : stepNum}
                </button>
                <span className={`text-[10px] sm:text-xs font-bold mt-2 text-center leading-tight ${isActive ? 'text-primary' : 'text-muted-foreground font-medium'}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <Card className="shadow-lg border-border/80">
        <CardContent className="p-8">
          
          {/* STEP 1: PROJECT & TEAM INFORMATION */}
          {step === 1 && (
            <div className="space-y-8">
              {/* Project Details Group */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-primary flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Project Information</h2>
                  <p className="text-[11px] text-muted-foreground font-semibold">Define your innovation or academic project specifics</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <Label htmlFor="projectName" className="text-xs font-bold">Project Name</Label>
                    <Input id="projectName" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Smart Autonomous Rover" className="h-10 mt-1" required />
                  </div>
                  <div>
                    <Label htmlFor="category" className="text-xs font-bold">Project Category</Label>
                    <Select value={projectCategory} onValueChange={setProjectCategory}>
                      <SelectTrigger className="h-10 mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Academic Project">Academic Project</SelectItem>
                        <SelectItem value="Research Project">Research Project</SelectItem>
                        <SelectItem value="Competition Project">Competition Project</SelectItem>
                        <SelectItem value="Startup Project">Startup Project</SelectItem>
                        <SelectItem value="Innovation Project">Innovation Project</SelectItem>
                        <SelectItem value="Prototype Development">Prototype Development</SelectItem>
                        <SelectItem value="Product Development">Product Development</SelectItem>
                        <SelectItem value="Other">Other Category</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="desc" className="text-xs font-bold">Project Description</Label>
                  <Textarea id="desc" value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)} placeholder="Summarize the core concepts and scope..." rows={4} className="mt-1" required />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="objectives" className="text-xs font-bold">Project Objectives</Label>
                    <Textarea id="objectives" value={projectObjectives} onChange={(e) => setProjectObjectives(e.target.value)} placeholder="What do you plan to achieve?" rows={3} className="mt-1" required />
                  </div>
                  <div>
                    <Label htmlFor="outcome" className="text-xs font-bold">Expected Outcome</Label>
                    <Textarea id="outcome" value={expectedOutcome} onChange={(e) => setExpectedOutcome(e.target.value)} placeholder="What is the final deliverable?" rows={3} className="mt-1" required />
                  </div>
                </div>
              </div>

              {/* Team Information Group */}
              <div className="space-y-6 pt-6 border-t border-slate-200">
                <div>
                  <h2 className="text-lg font-bold text-primary flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> Team Information</h2>
                  <p className="text-[11px] text-muted-foreground font-semibold">Add details for team members (Max 4 students)</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="teamName" className="text-xs font-bold">Team Name</Label>
                    <Input id="teamName" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Nikola Team" className="h-10 mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="numStudents" className="text-xs font-bold">Number of Students</Label>
                    <Select value={String(numberOfStudents)} onValueChange={(v) => setNumberOfStudents(Number(v))}>
                      <SelectTrigger className="h-10 mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Student (Individual)</SelectItem>
                        <SelectItem value="2">2 Students</SelectItem>
                        <SelectItem value="3">3 Students</SelectItem>
                        <SelectItem value="4">4 Students (Max Group)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Collapsible Student Cards UI */}
                <div className="space-y-4 mt-4">
                  {students.map((student, idx) => (
                    <Card key={idx} className="border-primary/20 bg-secondary/5 overflow-hidden shadow-2xs">
                      <button
                        type="button"
                        onClick={() => toggleStudentExpand(idx)}
                        className="w-full bg-primary/5 py-2.5 px-4 border-b border-primary/10 flex items-center justify-between text-left hover:bg-primary/10 transition-colors"
                      >
                        <span className="font-bold text-primary text-xs flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          Student {idx + 1} Info {student.name ? `(${student.name})` : ""}
                        </span>
                        {expandedStudents[idx] ? (
                          <ChevronUp className="w-4 h-4 text-primary shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-primary shrink-0" />
                        )}
                      </button>
                      
                      {expandedStudents[idx] && (
                        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                          <div>
                            <Label className="font-semibold">Full Name</Label>
                            <Input value={student.name} onChange={(e) => handleStudentFieldChange(idx, 'name', e.target.value)} className="h-9 mt-1" required />
                          </div>
                          <div>
                            <Label className="font-semibold">PRN Number</Label>
                            <Input value={student.prn} onChange={(e) => handleStudentFieldChange(idx, 'prn', e.target.value)} className="h-9 mt-1" required />
                          </div>
                          <div>
                            <Label className="font-semibold">Division</Label>
                            <Input value={student.division} onChange={(e) => handleStudentFieldChange(idx, 'division', e.target.value)} placeholder="A" className="h-9 mt-1" required />
                          </div>
                          <div>
                            <Label className="font-semibold">Branch</Label>
                            <Select value={student.branch} onValueChange={(v) => handleStudentFieldChange(idx, 'branch', v)}>
                              <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Computer Engineering">Computer Engineering</SelectItem>
                                <SelectItem value="AIDS">AIDS</SelectItem>
                                <SelectItem value="CSD">CSD</SelectItem>
                                <SelectItem value="ENTC">ENTC</SelectItem>
                                <SelectItem value="IT">IT</SelectItem>
                                <SelectItem value="Civil">Civil</SelectItem>
                                <SelectItem value="Mechanical">Mechanical</SelectItem>
                                <SelectItem value="Electrical">Electrical</SelectItem>
                                <SelectItem value="Robotics & Automation">Robotics & Automation</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="font-semibold">Year</Label>
                            <Select value={student.year} onValueChange={(v) => handleStudentFieldChange(idx, 'year', v)}>
                              <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1st Year">1st Year</SelectItem>
                                <SelectItem value="2nd Year">2nd Year</SelectItem>
                                <SelectItem value="3rd Year">3rd Year</SelectItem>
                                <SelectItem value="4th Year">4th Year</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="font-semibold">Mobile Number</Label>
                            <Input type="tel" value={student.mobile} onChange={(e) => handleStudentFieldChange(idx, 'mobile', e.target.value)} className="h-9 mt-1" required />
                          </div>
                          <div className="md:col-span-2 lg:col-span-3">
                            <Label className="font-semibold">Email Address</Label>
                            <Input type="email" value={student.email} onChange={(e) => handleStudentFieldChange(idx, 'email', e.target.value)} className="h-9 mt-1" required />
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: FACULTY & RESOURCES */}
          {step === 2 && (
            <div className="space-y-8">
              {/* Faculty Info */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-primary flex items-center gap-2"><Award className="w-5 h-5 text-primary" /> Faculty Guide Information (Record Only)</h2>
                  <p className="text-[11px] text-muted-foreground font-semibold">Faculty Guide details stored for institutional tracking only. No approvals will be routed to faculty.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gName" className="text-xs font-bold">Guide Name</Label>
                    <Input id="gName" value={facultyGuide.name} onChange={(e) => setFacultyGuide({ ...facultyGuide, name: e.target.value })} placeholder="Dr. A. B. Joshi" className="h-10 mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="gDept" className="text-xs font-bold">Department</Label>
                    <Select value={facultyGuide.department} onValueChange={(v) => setFacultyGuide({ ...facultyGuide, department: v })}>
                      <SelectTrigger className="h-10 mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Computer Engineering">Computer Engineering</SelectItem>
                        <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                        <SelectItem value="ENTC">ENTC</SelectItem>
                        <SelectItem value="Information Technology">Information Technology</SelectItem>
                        <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                        <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                        <SelectItem value="Robotics & Automation">Robotics & Automation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="gEmail" className="text-xs font-bold">Faculty Email</Label>
                    <Input id="gEmail" type="email" value={facultyGuide.email} onChange={(e) => setFacultyGuide({ ...facultyGuide, email: e.target.value })} placeholder="faculty@kkwagh.edu.in" className="h-10 mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="gMobile" className="text-xs font-bold">Faculty Mobile</Label>
                    <Input id="gMobile" value={facultyGuide.mobile} onChange={(e) => setFacultyGuide({ ...facultyGuide, mobile: e.target.value })} className="h-10 mt-1" />
                  </div>
                  <div className="lg:col-span-2">
                    <Label htmlFor="gDes" className="text-xs font-bold">Designation</Label>
                    <Input id="gDes" value={facultyGuide.designation} onChange={(e) => setFacultyGuide({ ...facultyGuide, designation: e.target.value })} placeholder="Assistant Professor" className="h-10 mt-1" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="gRemarks" className="text-xs font-bold">Remarks (If any)</Label>
                  <Textarea id="gRemarks" value={facultyGuide.remarks} onChange={(e) => setFacultyGuide({ ...facultyGuide, remarks: e.target.value })} placeholder="Special guidance notes or parameters..." rows={2} className="mt-1" />
                </div>
              </div>

              {/* Resource Selection */}
              <div className="space-y-6 pt-6 border-t border-slate-200">
                <div>
                  <h2 className="text-lg font-bold text-primary flex items-center gap-2"><Server className="w-5 h-5 text-primary" /> Machine Bookings</h2>
                  <p className="text-[11px] text-muted-foreground font-semibold">Select machine scheduling slots</p>
                </div>

                {/* Machines checklist */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {machinesList.map((mach) => (
                      <div 
                        key={mach._id} 
                        className={`flex items-center space-x-2 border p-3 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors ${selectedMachines.includes(mach._id) ? 'border-primary/50 bg-primary/5' : 'border-border/60'}`}
                        onClick={() => {
                          if (selectedMachines.includes(mach._id)) {
                            setSelectedMachines(prev => prev.filter(id => id !== mach._id));
                          } else {
                            setSelectedMachines(prev => [...prev, mach._id]);
                            setMachineDetails(prev => ({
                              ...prev,
                              [mach._id]: {
                                usageDate: new Date().toISOString().split("T")[0],
                                startTime: "10:00",
                                endTime: "12:00",
                                usageHours: 2,
                                purposeOfUsage: "",
                                specialRequirements: ""
                              }
                            }));
                          }
                        }}
                      >
                        <Checkbox checked={selectedMachines.includes(mach._id)} />
                        <Label className="cursor-pointer font-semibold text-xs leading-none">{mach.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: BOOKING & FILES */}
          {step === 3 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-lg font-bold text-primary flex items-center gap-2"><Calendar className="w-5 h-5 text-primary" /> Booking details & Document Uploads</h2>
                <p className="text-[11px] text-muted-foreground font-semibold">Define exact booking times, material quantities, and upload project files</p>
              </div>

              {/* Machine Details Inputs */}
              {selectedMachines.length > 0 && (
                <div className="space-y-6">
                  <h3 className="font-bold text-slate-800 border-b pb-1 text-xs">Machine Booking Parameters</h3>
                  {selectedMachines.map((mId) => {
                    const machine = machinesList.find(m => m._id === mId);
                    const details = machineDetails[mId] || {};
                    
                    return (
                      <div key={mId} className="p-4 border rounded-xl bg-slate-50/50 space-y-4">
                        <h4 className="font-bold text-primary text-xs">{machine?.name} Details</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <Label className="text-2xs">Requested Date</Label>
                            <Input 
                              type="date" 
                              value={details.usageDate} 
                              min={new Date().toISOString().split("T")[0]}
                              onChange={(e) => handleMachineDetailsChange(mId, 'usageDate', e.target.value)} 
                              className="h-9 mt-1"
                              required 
                            />
                          </div>
                          <div>
                            <Label className="text-2xs">Start Time</Label>
                            <Input 
                              type="time" 
                              value={details.startTime} 
                              onChange={(e) => handleMachineDetailsChange(mId, 'startTime', e.target.value)} 
                              className="h-9 mt-1"
                              required 
                            />
                          </div>
                          <div>
                            <Label className="text-2xs">End Time</Label>
                            <Input 
                              type="time" 
                              value={details.endTime} 
                              onChange={(e) => handleMachineDetailsChange(mId, 'endTime', e.target.value)} 
                              className="h-9 mt-1"
                              required 
                            />
                          </div>
                          <div className="bg-slate-100 p-2 rounded flex flex-col justify-center text-center border">
                            <span className="text-[10px] text-muted-foreground font-semibold uppercase leading-none">Duration</span>
                            <span className="font-extrabold text-sm text-primary mt-1">{details.usageHours || 0} Hrs</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-2xs">Purpose of Usage</Label>
                            <Textarea 
                              value={details.purposeOfUsage} 
                              onChange={(e) => handleMachineDetailsChange(mId, 'purposeOfUsage', e.target.value)} 
                              placeholder="Fabricate chassis for rover..." 
                              rows={2}
                              className="mt-1"
                              required
                            />
                          </div>
                          <div>
                            <Label className="text-2xs">Special Requirements / Setups</Label>
                            <Textarea 
                              value={details.specialRequirements} 
                              onChange={(e) => handleMachineDetailsChange(mId, 'specialRequirements', e.target.value)} 
                              placeholder="Requires dual extruder setup..." 
                              rows={2}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}



              {/* File Uploads */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h3 className="font-bold text-slate-800 border-b pb-1 text-xs">Project Document Uploads</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Upload Design File", field: "designFileUrl" },
                    { label: "Upload CAD File (STL/STEP/DWG)", field: "cadFileUrl" },
                    { label: "Upload Circuit Diagram", field: "circuitDiagramUrl" },
                    { label: "Upload Supporting Documents (PDF/ZIP)", field: "supportingDocsUrl" }
                  ].map((fileObj) => (
                    <div key={fileObj.field} className="p-3.5 border rounded-lg bg-slate-50/40 space-y-2">
                      <Label className="font-semibold text-2xs">{fileObj.label}</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="file" 
                          accept=".pdf,.docx,.stl,.step,.step,.dwg,.dxf,.zip,image/*"
                          onChange={(e) => handleFileUpload(e, fileObj.field)}
                          disabled={uploadingField !== null}
                          className="bg-background h-8 py-0.5 text-2xs cursor-pointer"
                        />
                      </div>
                      {uploadingField === fileObj.field && <span className="text-[10px] text-muted-foreground animate-pulse">Uploading file...</span>}
                      {/* @ts-ignore */}
                      {uploadedFiles[fileObj.field] && (
                        <p className="text-[10px] text-green-600 truncate">
                          Uploaded: {/* @ts-ignore */} {uploadedFiles[fileObj.field]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: DECLARATION & REVIEW */}
          {step === 4 && (
            <div className="space-y-8">
              {/* Review Page */}
              <div className="space-y-6 pt-6 border-t border-slate-200">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">Application Summary Review</h3>
                  <p className="text-[11px] text-muted-foreground font-semibold font-medium">Please review all information before submitting your application. Click Edit to adjust details.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card 1: Project Details */}
                  <Card className="border border-border/80 shadow-2xs">
                    <CardHeader className="py-2.5 px-4 bg-slate-50 border-b flex flex-row justify-between items-center">
                      <h4 className="font-bold text-xs text-primary flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Project Info</h4>
                      <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="h-6 text-[10px] font-bold text-primary hover:bg-primary/10">Edit</Button>
                    </CardHeader>
                    <CardContent className="p-4 space-y-1.5 text-2xs">
                      <p><strong>Name:</strong> {projectName}</p>
                      <p><strong>Category:</strong> {projectCategory}</p>
                      <p className="line-clamp-2"><strong>Description:</strong> {projectDescription}</p>
                      <p className="line-clamp-2"><strong>Objectives:</strong> {projectObjectives}</p>
                      <p className="line-clamp-2"><strong>Outcome:</strong> {expectedOutcome}</p>
                    </CardContent>
                  </Card>

                  {/* Card 2: Team Details */}
                  <Card className="border border-border/80 shadow-2xs">
                    <CardHeader className="py-2.5 px-4 bg-slate-50 border-b flex flex-row justify-between items-center">
                      <h4 className="font-bold text-xs text-primary flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Team Details ({teamName || "N/A"})</h4>
                      <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="h-6 text-[10px] font-bold text-primary hover:bg-primary/10">Edit</Button>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3 text-2xs max-h-[180px] overflow-y-auto">
                      {students.map((s, idx) => (
                        <div key={idx} className="border-b last:border-0 pb-1.5 mb-1.5 last:pb-0 last:mb-0">
                          <p className="font-bold text-slate-800">Student {idx + 1}: {s.name || "N/A"}</p>
                          <p className="text-[10px] text-muted-foreground">PRN: {s.prn} | Div: {s.division} | Year: {s.year} | Mobile: {s.mobile} | Email: {s.email}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Card 3: Faculty Guide */}
                  <Card className="border border-border/80 shadow-2xs">
                    <CardHeader className="py-2.5 px-4 bg-slate-50 border-b flex flex-row justify-between items-center">
                      <h4 className="font-bold text-xs text-primary flex items-center gap-1.5"><Award className="w-3.5 h-3.5" /> Faculty Guide</h4>
                      <Button variant="ghost" size="sm" onClick={() => setStep(2)} className="h-6 text-[10px] font-bold text-primary hover:bg-primary/10">Edit</Button>
                    </CardHeader>
                    <CardContent className="p-4 space-y-1.5 text-2xs">
                      <p><strong>Name:</strong> {facultyGuide.name || "N/A"}</p>
                      <p><strong>Department:</strong> {facultyGuide.department}</p>
                      <p><strong>Designation:</strong> {facultyGuide.designation}</p>
                      <p><strong>Contact:</strong> {facultyGuide.mobile} | {facultyGuide.email}</p>
                      {facultyGuide.remarks && <p><strong>Remarks:</strong> {facultyGuide.remarks}</p>}
                    </CardContent>
                  </Card>

                  {/* Card 4: Selected Resources */}
                  <Card className="border border-border/80 shadow-2xs">
                    <CardHeader className="py-2.5 px-4 bg-slate-50 border-b flex flex-row justify-between items-center">
                      <h4 className="font-bold text-xs text-primary flex items-center gap-1.5"><Server className="w-3.5 h-3.5" /> Machine Bookings</h4>
                      <Button variant="ghost" size="sm" onClick={() => setStep(3)} className="h-6 text-[10px] font-bold text-primary hover:bg-primary/10">Edit</Button>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3 text-2xs max-h-[180px] overflow-y-auto">
                      {selectedMachines.length > 0 ? (
                        <div>
                          <p className="font-bold text-slate-700">Machines Booked:</p>
                          {selectedMachines.map(mId => (
                            <p key={mId} className="text-[10px] text-muted-foreground ml-2">
                              - {machinesList.find(m => m._id === mId)?.name}: {machineDetails[mId]?.usageDate} @ {machineDetails[mId]?.startTime}-{machineDetails[mId]?.endTime} ({machineDetails[mId]?.usageHours} hrs)
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground italic">No resources selected.</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Card 5: Documents */}
                  <Card className="border border-border/80 shadow-2xs md:col-span-2">
                    <CardHeader className="py-2.5 px-4 bg-slate-50 border-b flex flex-row justify-between items-center">
                      <h4 className="font-bold text-xs text-primary flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Project Documents</h4>
                      <Button variant="ghost" size="sm" onClick={() => setStep(3)} className="h-6 text-[10px] font-bold text-primary hover:bg-primary/10">Edit</Button>
                    </CardHeader>
                    <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                      <div>
                        <span className="font-semibold text-slate-600 block">Design File:</span>{" "}
                        {uploadedFiles.designFileUrl ? (
                          <a href={uploadedFiles.designFileUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium break-all">{uploadedFiles.designFileUrl}</a>
                        ) : (
                          <span className="text-muted-foreground italic">None</span>
                        )}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-600 block">CAD File:</span>{" "}
                        {uploadedFiles.cadFileUrl ? (
                          <a href={uploadedFiles.cadFileUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium break-all">{uploadedFiles.cadFileUrl}</a>
                        ) : (
                          <span className="text-muted-foreground italic">None</span>
                        )}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-600 block">Circuit Diagram:</span>{" "}
                        {uploadedFiles.circuitDiagramUrl ? (
                          <a href={uploadedFiles.circuitDiagramUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium break-all">{uploadedFiles.circuitDiagramUrl}</a>
                        ) : (
                          <span className="text-muted-foreground italic">None</span>
                        )}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-600 block">Supporting Documents:</span>{" "}
                        {uploadedFiles.supportingDocsUrl ? (
                          <a href={uploadedFiles.supportingDocsUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium break-all">{uploadedFiles.supportingDocsUrl}</a>
                        ) : (
                          <span className="text-muted-foreground italic">None</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Declarations Group */}
              <div className="space-y-6 pt-6 border-t border-slate-200">
                <div>
                  <h2 className="text-lg font-bold text-primary flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-primary" /> Declaration Agreements</h2>
                  <p className="text-[11px] text-muted-foreground font-semibold">Verify compliance agreements prior to submitting request</p>
                </div>

                <div className="space-y-4 border p-6 rounded-xl bg-slate-50 border-primary/20">
                  {[
                    { label: "I verify that all information provided is accurate and true to our best knowledge.", field: "infoAccurate" },
                    { label: "I confirm that all uploaded design files and CAD schematics belong to our team.", field: "filesBelongToTeam" },
                    { label: "We agree to adhere to all IDEA Hub guidelines, lab policies, and safety instructions.", field: "agreeToRules" },
                    { label: "We accept full responsibility for resource usage, damages, or proper return of tools.", field: "acceptResponsibility" }
                  ].map((dec) => (
                    <div key={dec.field} className="flex items-start space-x-2.5 p-1">
                      <Checkbox 
                        id={dec.field} 
                        // @ts-ignore
                        checked={declaration[dec.field]}
                        // @ts-ignore
                        onCheckedChange={(c) => setDeclaration({ ...declaration, [dec.field]: !!c })}
                        className="mt-0.5"
                      />
                      <Label htmlFor={dec.field} className="font-semibold text-xs leading-tight cursor-pointer text-slate-700">
                        {dec.label}
                      </Label>
                    </div>
                  ))}
                </div>

                {/* Actions submit/draft */}
                <div className="flex gap-4 pt-4 border-t justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    disabled={isSubmitting} 
                    onClick={() => handleFormSubmit("Draft")}
                    className="gap-2 font-bold text-xs h-10 px-4"
                  >
                    <Save className="w-4 h-4 text-slate-500" /> Save as Draft
                  </Button>
                  <Button 
                    type="button" 
                    disabled={isSubmitting} 
                    onClick={() => handleFormSubmit(id && id !== 'new' ? "Student Resubmitted" : "Submitted")}
                    className="gap-2 font-bold text-xs h-10 px-4 bg-primary hover:bg-primary/90"
                  >
                    <Check className="w-4 h-4" /> {isSubmitting ? "Submitting..." : (id && id !== 'new' ? "Resubmit Application" : "Submit Request")}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="flex justify-between border-t pt-6 mt-8">
            <Button 
              type="button" 
              variant="outline" 
              onClick={prevStep} 
              disabled={step === 1}
              className="gap-1 font-semibold text-xs h-9"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </Button>
            
            {step < 4 ? (
              <Button 
                type="button" 
                onClick={nextStep}
                className="gap-1 font-semibold text-xs h-9 bg-primary"
              >
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <div className="w-20" /> // Spacer
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default MachineryRequestForm;
