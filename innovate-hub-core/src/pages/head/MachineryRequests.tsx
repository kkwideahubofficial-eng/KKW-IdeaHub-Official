import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import { Check, X, Eye } from "lucide-react";

// Helper to safely format date avoiding timezone shifts
const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

interface Request {
  _id: string;
  machineryId: { name: string; imageUrl: string };
  studentId: { name: string; branch: string; year: string; email: string; mobile: string };
  teamMembers: { name: string; branch?: string; year?: string; mobile?: string; email?: string }[];
  usageDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  groupPhotoUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
}

const MachineryRequests = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [rejectionReason, setRejectionReason] = useState("");
  const [viewDialog, setViewDialog] = useState<{ open: boolean; request: Request | null }>({ open: false, request: null });

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

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected', reason?: string) => {
    try {
      await api.patch(`/machinery/requests/${id}/status`, { status, rejectionReason: reason });
      toast.success(`Request ${status}`);
      setRejectDialog({ open: false, id: null });
      setRejectionReason("");
      fetchRequests();
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Machinery Requests</h1>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <p className="text-muted-foreground">No requests found.</p>
        ) : (
          requests.map((req) => (
            <Card key={req._id} className="overflow-hidden">
              <CardHeader className="bg-muted/30 pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{req.machineryId?.name || "Unknown Machine"}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Requested by <span className="font-semibold text-foreground">{req.studentId?.name}</span> ({req.studentId?.branch})
                    </p>
                  </div>
                  <Badge variant={req.status === 'approved' ? 'default' : req.status === 'rejected' ? 'destructive' : 'secondary'}>
                    {req.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 grid md:grid-cols-2 gap-4">
                <div className="space-y-2 text-sm">
                  <p><strong>Date:</strong> {formatDate(req.usageDate)}</p>
                  <p><strong>Time:</strong> {req.startTime} - {req.endTime}</p>
                  <p className="line-clamp-2" title={req.purpose}><strong>Purpose:</strong> {req.purpose}</p>
                  <p><strong>Team Size:</strong> {req.teamMembers.length + 1} Students</p>
                </div>
                <div className="flex items-end justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setViewDialog({ open: true, request: req })}>
                    <Eye className="w-4 h-4 mr-2" /> View Details
                  </Button>
                  
                  {req.status === 'pending' && (
                    <>
                      <Button variant="default" size="sm" onClick={() => handleStatusUpdate(req._id, 'approved')}>
                        <Check className="w-4 h-4 mr-2" /> Approve
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => setRejectDialog({ open: true, id: req._id })}>
                        <X className="w-4 h-4 mr-2" /> Reject
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(val) => setRejectDialog({ ...rejectDialog, open: val })}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Request</DialogTitle></DialogHeader>
          <Textarea 
            placeholder="Reason for rejection..." 
            value={rejectionReason} 
            onChange={(e) => setRejectionReason(e.target.value)} 
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, id: null })}>Cancel</Button>
            <Button variant="destructive" onClick={() => rejectDialog.id && handleStatusUpdate(rejectDialog.id, 'rejected', rejectionReason)}>Confirm Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={viewDialog.open} onOpenChange={(val) => setViewDialog({ ...viewDialog, open: val })}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Request Details</DialogTitle></DialogHeader>
          {viewDialog.request && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Machine Info</h3>
                  <div className="p-3 bg-muted rounded-md text-sm">
                     <p><strong>Machine:</strong> {viewDialog.request.machineryId?.name}</p>
                     <p><strong>Date:</strong> {formatDate(viewDialog.request.usageDate)}</p>
                     <p><strong>Time:</strong> {viewDialog.request.startTime} - {viewDialog.request.endTime}</p>
                  </div>
                </div>
                <div>
                   <h3 className="font-semibold mb-2">Requester Info</h3>
                   <div className="p-3 bg-muted rounded-md text-sm">
                     <p><strong>Name:</strong> {viewDialog.request.studentId?.name || viewDialog.request.teamMembers[0]?.name || '-'}</p>
                     <p><strong>Email:</strong> {viewDialog.request.studentId?.email || viewDialog.request.teamMembers[0]?.email || '-'}</p>
                     <p><strong>Mobile:</strong> {viewDialog.request.studentId?.mobile || viewDialog.request.teamMembers[0]?.mobile || '-'}</p>
                     <p><strong>Branch/Year:</strong> {(viewDialog.request.studentId?.branch || viewDialog.request.teamMembers[0]?.branch || '-')} / {(viewDialog.request.studentId?.year || viewDialog.request.teamMembers[0]?.year || '-')}</p>
                   </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Purpose</h3>
                <p className="text-sm border p-3 rounded-md bg-muted/20">{viewDialog.request.purpose}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Team Members ({viewDialog.request.teamMembers.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {viewDialog.request.teamMembers.map((m, i) => (
                    <div key={i} className="p-3 bg-muted rounded-md border">
                      <p className="font-semibold mb-1 text-foreground">Student {i + 1}: {m.name}</p>
                      {m.email && <p className="text-xs text-muted-foreground"><strong>Email:</strong> {m.email}</p>}
                      {m.mobile && <p className="text-xs text-muted-foreground"><strong>Mobile:</strong> {m.mobile}</p>}
                      {(m.branch || m.year) && (
                        <p className="text-xs text-muted-foreground">
                          <strong>Branch/Year:</strong> {m.branch || '-'} / {m.year || '-'}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Group Photo</h3>
                {viewDialog.request.groupPhotoUrl ? (
                    <img src={viewDialog.request.groupPhotoUrl} alt="Group" className="w-full max-h-64 object-contain border rounded-md" />
                ) : (
                    <p className="text-muted-foreground">No photo uploaded.</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MachineryRequests;
