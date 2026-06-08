import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Check, X, Eye, FileDown, Loader2, Calendar, Clock, AlertTriangle, ShieldCheck, CheckCircle2 } from "lucide-react";

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

interface Request {
  _id: string;
  requestId: string;
  projectName: string;
  projectCategory: string;
  projectDescription: string;
  projectObjectives: string;
  expectedOutcome: string;
  teamName: string;
  status: string;
  createdAt: string;
  students: { name: string; prn: string; branch: string; year: string; email: string; mobile: string }[];
  requestedMachines: { machineId: any; machineName: string; usageDate: string; startTime: string; endTime: string; usageHours: number; purposeOfUsage: string; specialRequirements: string }[];
  requestedMaterials: { materialId: any; materialName: string; quantityRequired: number }[];
  uploadedFiles?: { designFileUrl?: string; cadFileUrl?: string; circuitDiagramUrl?: string; supportingDocsUrl?: string };
  benefits?: { researchContribution?: string; innovationContribution?: string; patentPossibility?: string; startupPotential?: string };
  approvalHistory?: { date: string; role: string; action: string; remarks: string; byName: string }[];
  coordinatorRemarks?: string;
  coordinatorChecks?: { machineAvailability: boolean; materialAvailability: boolean; projectFeasibility: boolean; studentEligibility: boolean; previousUsageHistory: boolean };
}

const MachineryRequests = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Rejection & Decision state
  const [decisionDialog, setDecisionDialog] = useState<{ open: boolean; id: string | null; action: 'Approved' | 'Rejected' | 'Approved With Conditions' | null }>({
    open: false,
    id: null,
    action: null
  });
  const [decisionRemarks, setDecisionRemarks] = useState("");
  const [conditionsText, setConditionsText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // View details state
  const [viewDialog, setViewDialog] = useState<{ open: boolean; request: Request | null }>({ open: false, request: null });
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/machinery/requests");
      setRequests(res.data);
    } catch {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const handleDecisionSubmit = async () => {
    if (!decisionDialog.id || !decisionDialog.action) return;
    setSubmitting(true);
    try {
      await api.patch(`/machinery/requests/${decisionDialog.id}/status`, {
        status: decisionDialog.action,
        remarks: decisionDialog.action === 'Approved' ? undefined : decisionRemarks,
        conditions: decisionDialog.action === 'Approved With Conditions' ? conditionsText : undefined
      });
      
      toast.success(`Request marked as ${decisionDialog.action}!`);
      setDecisionDialog({ open: false, id: null, action: null });
      setDecisionRemarks("");
      setConditionsText("");
      fetchRequests();
      
      if (viewDialog.open && viewDialog.request?._id === decisionDialog.id) {
        setViewDialog({ open: false, request: null });
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setSubmitting(false);
    }
  };

  const downloadPdf = async (id: string, reqId: string) => {
    setDownloadingId(id);
    try {
      const response = await api.get(`/machinery/requests/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PermissionLetter_${reqId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch {
      toast.error('Failed to download PDF.');
    } finally {
      setDownloadingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
      case 'Completed':
      case 'Material Allocated':
      case 'Machine Scheduled':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Approved With Conditions':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Pending':
      case 'Submitted':
      case 'Coordinator Approved':
      case 'Coordinator Review':
      case 'Head Review':
      case 'Student Resubmitted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Changes Requested':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Rejected':
      case 'Coordinator Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-extrabold tracking-tight mb-6 text-foreground">Machinery & Material Requests</h1>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-xs font-semibold">No resource permission requests found.</p>
        ) : (
          requests.map((req) => (
            <Card key={req._id} className="overflow-hidden border border-border/80 shadow-xs text-xs">
              <CardHeader className="bg-slate-50/50 pb-3 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-primary">{req.requestId}</span>
                      <span className="text-muted-foreground font-medium">•</span>
                      <span className="font-semibold text-slate-500">{req.projectCategory}</span>
                    </div>
                    <CardTitle className="text-base font-extrabold mt-1">{req.projectName}</CardTitle>
                    <p className="text-3xs text-muted-foreground mt-0.5">
                      Submitted by <span className="font-bold text-slate-800">{req.students?.[0]?.name || "Student"}</span> ({req.students?.[0]?.branch || "Branch"})
                    </p>
                  </div>
                  <Badge variant="outline" className={`font-bold text-[9px] uppercase ${getStatusColor(req.status)}`}>
                    {req.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 grid md:grid-cols-2 gap-4">
                <div className="space-y-2 text-slate-700 font-medium">
                  {req.requestedMachines?.length > 0 && (
                    <p><strong>Machines:</strong> {req.requestedMachines.map(m => m.machineName).join(', ')}</p>
                  )}
                  {req.requestedMaterials?.length > 0 && (
                    <p><strong>Materials:</strong> {req.requestedMaterials.map(m => m.materialName).join(', ')}</p>
                  )}
                  <p><strong>Requested Date:</strong> {req.requestedMachines?.[0]?.usageDate ? formatDate(req.requestedMachines[0].usageDate) : 'N/A'}</p>
                  <p><strong>Time Slot:</strong> {req.requestedMachines?.[0]?.startTime} - {req.requestedMachines?.[0]?.endTime}</p>
                </div>
                
                <div className="flex items-end justify-end gap-2 mt-4 md:mt-0">
                  <Button variant="outline" size="sm" onClick={() => setViewDialog({ open: true, request: req })} className="font-semibold text-xs gap-1">
                    <Eye className="w-3.5 h-3.5" /> View Details
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={downloadingId === req._id}
                    onClick={() => downloadPdf(req._id, req.requestId)}
                    className="font-semibold text-xs gap-1"
                  >
                    {downloadingId === req._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
                    PDF
                  </Button>
                  
                  {['Submitted', 'Coordinator Approved', 'Coordinator Review', 'Head Review', 'Student Resubmitted'].includes(req.status) && (
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        onClick={() => setDecisionDialog({ open: true, id: req._id, action: 'Approved' })} 
                        className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs"
                      >
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => setDecisionDialog({ open: true, id: req._id, action: 'Approved With Conditions' })}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold text-xs"
                      >
                        Cond. Approve
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => setDecisionDialog({ open: true, id: req._id, action: 'Rejected' })} 
                        className="font-bold text-xs"
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* ── APPROVE: compact one-click confirmation ─────────────────────── */}
      {decisionDialog.open && decisionDialog.action === 'Approved' && (
        <Dialog open={decisionDialog.open} onOpenChange={(val) => setDecisionDialog({ ...decisionDialog, open: val })}>
          <DialogContent className="max-w-sm text-xs text-slate-700">
            <DialogHeader>
              <DialogTitle className="text-base font-extrabold flex items-center gap-2 text-green-700">
                <CheckCircle2 className="w-5 h-5" /> Confirm Approval
              </DialogTitle>
            </DialogHeader>
            <div className="py-3">
              <p className="text-sm text-slate-600 font-medium">
                Are you sure you want to <span className="font-bold text-green-700">approve</span> this request?
              </p>
              <p className="text-3xs text-muted-foreground mt-2">
                The request will be marked as <b>Approved</b> and the student will be notified immediately.
              </p>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                disabled={submitting}
                onClick={() => setDecisionDialog({ open: false, id: null, action: null })}
              >
                Cancel
              </Button>
              <Button
                disabled={submitting}
                onClick={handleDecisionSubmit}
                className="bg-green-600 hover:bg-green-700 text-white font-bold gap-2 min-w-[140px]"
              >
                {submitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Approving...</> : <><Check className="w-3.5 h-3.5" /> Confirm Approval</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── REJECT / APPROVE WITH CONDITIONS: full remarks form ──────────── */}
      {decisionDialog.open && decisionDialog.action !== 'Approved' && (
        <Dialog open={decisionDialog.open} onOpenChange={(val) => setDecisionDialog({ ...decisionDialog, open: val })}>
          <DialogContent className="max-w-md text-xs text-slate-700">
            <DialogHeader>
              <DialogTitle className={`text-base font-extrabold flex items-center gap-2 ${
                decisionDialog.action === 'Rejected' ? 'text-red-700' : 'text-yellow-700'
              }`}>
                {decisionDialog.action === 'Rejected'
                  ? <><X className="w-5 h-5" /> Reject Request</>
                  : <><AlertTriangle className="w-5 h-5" /> Approve With Conditions</>
                }
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {decisionDialog.action === 'Approved With Conditions' && (
                <div className="space-y-1">
                  <Label className="font-bold">Approval Conditions / Constraints <span className="text-red-500">*</span></Label>
                  <Input 
                    value={conditionsText} 
                    onChange={(e) => setConditionsText(e.target.value)} 
                    placeholder="Must be returned by 5 PM, Wear safety gear..."
                  />
                </div>
              )}
              <div className="space-y-1">
                <Label className="font-bold">
                  {decisionDialog.action === 'Rejected' ? 'Rejection Reason' : 'Remarks / Notes'}
                  {decisionDialog.action === 'Rejected' && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <Textarea 
                  placeholder={decisionDialog.action === 'Rejected' ? 'Explain why this request is being rejected...' : 'Optional notes or remarks...'}
                  value={decisionRemarks} 
                  onChange={(e) => setDecisionRemarks(e.target.value)} 
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                disabled={submitting}
                onClick={() => setDecisionDialog({ open: false, id: null, action: null })}
              >
                Cancel
              </Button>
              <Button 
                disabled={submitting}
                onClick={handleDecisionSubmit}
                className={`font-bold gap-2 min-w-[150px] ${
                  decisionDialog.action === 'Rejected'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                }`}
              >
                {submitting
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...</>
                  : decisionDialog.action === 'Rejected'
                    ? <><X className="w-3.5 h-3.5" /> Confirm Rejection</>
                    : <><Check className="w-3.5 h-3.5" /> Confirm Approval</>
                }
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Detailed Request Modal Dialog */}
      {viewDialog.open && viewDialog.request && (
        <Dialog open={viewDialog.open} onOpenChange={(val) => setViewDialog({ ...viewDialog, open: val })}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto text-xs text-slate-700">
            <DialogHeader>
              <div className="flex justify-between border-b pb-2">
                <DialogTitle className="text-base font-extrabold">{viewDialog.request.requestId}: {viewDialog.request.projectName}</DialogTitle>
                <Badge variant="outline" className={`font-bold uppercase ${getStatusColor(viewDialog.request.status)}`}>{viewDialog.request.status}</Badge>
              </div>
            </DialogHeader>
            
            <div className="space-y-6 pt-3">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-primary mb-1.5 uppercase tracking-wider text-[10px]">Project Scope</h3>
                  <div className="p-3 bg-slate-50 border rounded-md font-medium">
                     <p><strong>Category:</strong> {viewDialog.request.projectCategory}</p>
                     <p className="mt-1"><strong>Description:</strong> {viewDialog.request.projectDescription}</p>
                     <p className="mt-1"><strong>Objectives:</strong> {viewDialog.request.projectObjectives}</p>
                     <p className="mt-1"><strong>Deliverables:</strong> {viewDialog.request.expectedOutcome}</p>
                  </div>
                </div>
                <div>
                   <h3 className="font-bold text-primary mb-1.5 uppercase tracking-wider text-[10px]">Requester Student</h3>
                   <div className="p-3 bg-slate-50 border rounded-md font-medium">
                     <p><strong>Name:</strong> {viewDialog.request.students?.[0]?.name || '-'}</p>
                     <p><strong>PRN Number:</strong> {viewDialog.request.students?.[0]?.prn || '-'}</p>
                     <p><strong>Email Address:</strong> {viewDialog.request.students?.[0]?.email || '-'}</p>
                     <p><strong>Mobile Number:</strong> {viewDialog.request.students?.[0]?.mobile || '-'}</p>
                     <p><strong>Branch/Year:</strong> {viewDialog.request.students?.[0]?.branch || '-'} / {viewDialog.request.students?.[0]?.year || '-'}</p>
                   </div>
                </div>
              </div>

              {/* Resource separations Machines / Materials */}
              <div className="grid md:grid-cols-2 gap-6 border-t pt-4">
                <div>
                  <h3 className="font-bold text-primary mb-1.5 uppercase tracking-wider text-[10px]">Requested Machinery</h3>
                  <div className="border rounded-md p-3 bg-secondary/5 space-y-2">
                    {viewDialog.request.requestedMachines?.length === 0 ? (
                      <p className="text-muted-foreground text-3xs italic">No machine bookings requested.</p>
                    ) : (
                      viewDialog.request.requestedMachines.map((m, i) => (
                        <div key={i} className="border-b pb-2 last:border-0 last:pb-0">
                          <p className="font-bold text-slate-800">• {m.machineName}</p>
                          <p className="text-3xs text-muted-foreground mt-0.5">
                            <b>Date:</b> {m.usageDate ? new Date(m.usageDate).toLocaleDateString() : 'N/A'} | <b>Slot:</b> {m.startTime} - {m.endTime} ({m.usageHours} hrs)
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-primary mb-1.5 uppercase tracking-wider text-[10px]">Requested Material Allocation</h3>
                  <div className="border rounded-md p-3 bg-secondary/5 space-y-2">
                    {viewDialog.request.requestedMaterials?.length === 0 ? (
                      <p className="text-muted-foreground text-3xs italic">No materials requested.</p>
                    ) : (
                      viewDialog.request.requestedMaterials.map((m, i) => (
                        <div key={i} className="flex justify-between items-center py-1 border-b last:border-0 font-medium">
                          <span>• {m.materialName}</span>
                          <span className="bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded font-mono text-[10px]">Qty: {m.quantityRequired}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Project Attachment downloads */}
              {viewDialog.request.uploadedFiles && Object.values(viewDialog.request.uploadedFiles).some(Boolean) && (
                <div className="border-t pt-4">
                  <h3 className="font-bold text-primary mb-2 uppercase tracking-wider text-[10px]">Project Attachments</h3>
                  <div className="flex flex-wrap gap-2 text-3xs">
                    {viewDialog.request.uploadedFiles.designFileUrl && (
                      <a href={viewDialog.request.uploadedFiles.designFileUrl} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="outline" className="h-7 text-3xs gap-1 font-semibold"><Eye className="w-3.5 h-3.5" /> View Design File</Button>
                      </a>
                    )}
                    {viewDialog.request.uploadedFiles.cadFileUrl && (
                      <a href={viewDialog.request.uploadedFiles.cadFileUrl} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="outline" className="h-7 text-3xs gap-1 font-semibold"><FileDown className="w-3.5 h-3.5" /> Download CAD File</Button>
                      </a>
                    )}
                    {viewDialog.request.uploadedFiles.circuitDiagramUrl && (
                      <a href={viewDialog.request.uploadedFiles.circuitDiagramUrl} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="outline" className="h-7 text-3xs gap-1 font-semibold"><FileDown className="w-3.5 h-3.5" /> Download Circuit Diagram</Button>
                      </a>
                    )}
                    {viewDialog.request.uploadedFiles.supportingDocsUrl && (
                      <a href={viewDialog.request.uploadedFiles.supportingDocsUrl} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="outline" className="h-7 text-3xs gap-1 font-semibold"><FileDown className="w-3.5 h-3.5" /> Download Supporting Docs</Button>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Coordinator review checks & remarks */}
              <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-bold text-primary mb-1.5 uppercase tracking-wider text-[10px]">Coordinator Review Checks</h3>
                  <div className="p-3 border rounded bg-slate-50 space-y-1 text-3xs font-semibold">
                    <p className={viewDialog.request.coordinatorChecks?.machineAvailability ? 'text-green-700' : 'text-slate-500'}>
                      {viewDialog.request.coordinatorChecks?.machineAvailability ? '✓' : '✗'} Machine Slot Availability Check
                    </p>
                    <p className={viewDialog.request.coordinatorChecks?.materialAvailability ? 'text-green-700' : 'text-slate-500'}>
                      {viewDialog.request.coordinatorChecks?.materialAvailability ? '✓' : '✗'} Materials stock reservation check
                    </p>
                    <p className={viewDialog.request.coordinatorChecks?.projectFeasibility ? 'text-green-700' : 'text-slate-500'}>
                      {viewDialog.request.coordinatorChecks?.projectFeasibility ? '✓' : '✗'} Project feasibility evaluation
                    </p>
                    <p className={viewDialog.request.coordinatorChecks?.studentEligibility ? 'text-green-700' : 'text-slate-500'}>
                      {viewDialog.request.coordinatorChecks?.studentEligibility ? '✓' : '✗'} Applicant eligibility checked
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-primary mb-1.5 uppercase tracking-wider text-[10px]">Coordinator Remarks</h3>
                  <p className="p-3 border rounded bg-slate-50 italic">
                    "{viewDialog.request.coordinatorRemarks || 'No remarks added by Coordinator.'}"
                  </p>
                </div>
              </div>

              {/* Approval History log */}
              {viewDialog.request.approvalHistory && viewDialog.request.approvalHistory.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-bold text-primary mb-2 uppercase tracking-wider text-[10px]">Approval History Logs</h3>
                  <div className="space-y-2 border rounded-md p-3 bg-slate-50/50">
                    {viewDialog.request.approvalHistory.map((h, i) => (
                      <div key={i} className="flex justify-between items-start border-b border-border/40 pb-2 last:border-0 last:pb-0">
                        <div>
                          <div className="font-semibold text-foreground flex items-center gap-1.5">
                            <Badge variant="secondary" className="text-[8px] uppercase tracking-wide font-bold">{h.role}</Badge>
                            <span>{h.action}</span>
                          </div>
                          {h.remarks && <p className="text-3xs text-muted-foreground mt-0.5">Remarks: {h.remarks}</p>}
                        </div>
                        <span className="text-3xs text-muted-foreground font-mono self-center">
                          {new Date(h.date).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="pt-4 border-t flex flex-wrap gap-2 justify-end">
              <Button variant="outline" onClick={() => setViewDialog({ open: false, request: null })}>Close Details</Button>
              {['Submitted', 'Coordinator Approved', 'Coordinator Review', 'Head Review', 'Student Resubmitted'].includes(viewDialog.request.status) && (
                <div className="flex gap-1.5">
                  <Button 
                    onClick={() => setDecisionDialog({ open: true, id: viewDialog.request?._id || null, action: 'Approved' })} 
                    className="bg-green-600 hover:bg-green-700 text-white font-bold"
                  >
                    Approve
                  </Button>
                  <Button 
                    onClick={() => setDecisionDialog({ open: true, id: viewDialog.request?._id || null, action: 'Approved With Conditions' })}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold"
                  >
                    Cond. Approve
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => setDecisionDialog({ open: true, id: viewDialog.request?._id || null, action: 'Rejected' })} 
                    className="font-bold"
                  >
                    Reject
                  </Button>
                </div>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
};

export default MachineryRequests;
