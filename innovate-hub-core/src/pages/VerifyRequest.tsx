import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertTriangle, ShieldCheck, User, Calendar, Clock, FileText, ArrowLeft, Settings, Database } from "lucide-react";

const VerifyRequest = () => {
  const { requestId } = useParams();
  const [request, setRequest] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVerificationDetails = async () => {
      try {
        const res = await api.get(`/machinery/requests/${requestId}/verify-public`);
        setRequest(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load verification details.");
      } finally {
        setLoading(false);
      }
    };
    if (requestId) fetchVerificationDetails();
  }, [requestId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span>Verifying PDF Permission Credentials...</span>
        </div>
      </div>
    );
  }

  const isValid = request && [
    "Approved", "Approved With Conditions", "Material Allocated", 
    "Machine Scheduled", "Completed"
  ].includes(request.status);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl border-t-4 border-primary overflow-hidden">
        
        {/* Verification Status Header */}
        <div className={`p-6 text-center ${isValid ? 'bg-green-50/50' : 'bg-red-50/50'}`}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-md mb-3">
            {isValid ? (
              <ShieldCheck className="w-10 h-10 text-green-600 animate-pulse" />
            ) : (
              <XCircle className="w-10 h-10 text-red-600" />
            )}
          </div>
          
          <h2 className={`text-xl font-extrabold tracking-tight ${isValid ? 'text-green-800' : 'text-red-800'}`}>
            {isValid ? "VERIFICATION VALID" : "VERIFICATION INVALID / REJECTED"}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            AICTE IDEA Lab KKWIEER Digital Signature System
          </p>
        </div>

        <CardContent className="p-6 space-y-6 text-xs">
          {error || !request ? (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-800 rounded">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <div>
                <p className="font-semibold">Error Loading Request</p>
                <p className="text-3xs mt-1">The request ID is incorrect or the booking has been deleted from the database.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Request ID & Project */}
              <div className="space-y-3">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Request ID:</span>
                  <span className="font-mono font-bold text-primary">{request.requestId}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Project Name:</span>
                  <span className="font-semibold text-right">{request.projectName}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-semibold">{request.projectCategory}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Approval Status:</span>
                  <span className={`font-bold uppercase ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                    {request.status}
                  </span>
                </div>
              </div>

              {/* Student details */}
              <div className="bg-secondary/15 p-4 rounded-lg space-y-3 border">
                <h3 className="font-bold text-foreground flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-primary" /> Student Information</h3>
                <div>
                  <div className="font-bold">{request.students?.[0]?.name || request.studentId?.name || "N/A"}</div>
                  <div className="text-3xs text-muted-foreground">
                    PRN: {request.students?.[0]?.prn || "N/A"} | Branch: {request.students?.[0]?.branch || "N/A"} ({request.students?.[0]?.year || "N/A"})
                  </div>
                </div>
                {request.teamName && (
                  <div className="text-3xs text-muted-foreground">
                    <b>Team Name:</b> {request.teamName} | <b>Total Students:</b> {request.numberOfStudents}
                  </div>
                )}
              </div>

              {/* Resources details */}
              <div className="space-y-2">
                <h3 className="font-bold text-primary flex items-center gap-1.5"><Settings className="w-3.5 h-3.5 text-primary" /> Requested Resources</h3>
                
                {request.requestedMachines?.length > 0 && (
                  <div className="border rounded-md p-3 bg-slate-50 space-y-2">
                    <p className="font-semibold text-2xs uppercase text-slate-500">Machines</p>
                    {request.requestedMachines.map((m: any, idx: number) => (
                      <div key={idx} className="flex flex-col gap-0.5 border-b pb-1 last:border-b-0 last:pb-0">
                        <div className="font-semibold flex justify-between">
                          <span>• {m.machineId?.name || m.machineName}</span>
                          <span className="text-muted-foreground font-mono">{m.startTime} - {m.endTime}</span>
                        </div>
                        <div className="text-3xs text-muted-foreground flex justify-between">
                          <span>Usage Date: {m.usageDate ? new Date(m.usageDate).toLocaleDateString() : 'N/A'}</span>
                          <span>Duration: {m.usageHours} hrs</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {request.requestedMaterials?.length > 0 && (
                  <div className="border rounded-md p-3 bg-slate-50 space-y-2">
                    <p className="font-semibold text-2xs uppercase text-slate-500">Materials</p>
                    {request.requestedMaterials.map((m: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-foreground font-medium">
                        <span>• {m.materialId?.name || m.materialName}</span>
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-bold font-mono">Qty: {m.quantityRequired}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Digital Signatures check */}
              <div className="border-t pt-4 space-y-3">
                <h4 className="font-bold text-primary text-xs uppercase tracking-wider mb-2">Digital Signature Verification</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border p-2.5 rounded bg-slate-50 text-center">
                    <div className="font-semibold text-2xs text-muted-foreground">Coordinator</div>
                    <div className={`text-xs font-bold mt-1 flex items-center justify-center gap-1 ${isValid ? 'text-green-700' : 'text-amber-600'}`}>
                      {isValid ? (
                        <><CheckCircle className="w-3.5 h-3.5" /> VERIFIED</>
                      ) : (
                        <><AlertTriangle className="w-3.5 h-3.5" /> PENDING</>
                      )}
                    </div>
                  </div>
                  <div className="border p-2.5 rounded bg-slate-50 text-center">
                    <div className="font-semibold text-2xs text-muted-foreground">Lab Head</div>
                    <div className={`text-xs font-bold mt-1 flex items-center justify-center gap-1 ${isValid ? 'text-green-700' : 'text-amber-600'}`}>
                      {isValid ? (
                        <><CheckCircle className="w-3.5 h-3.5" /> VERIFIED</>
                      ) : (
                        <><XCircle className="w-3.5 h-3.5" /> UNSIGNED</>
                      )}
                    </div>
                  </div>
                </div>
                {request.headConditions && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded p-3 text-3xs mt-2">
                    <b>Conditional Approval Terms:</b> {request.headConditions}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex gap-2 pt-4">
            <Link to="/" className="w-full">
              <Button variant="outline" className="w-full gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </Button>
            </Link>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyRequest;
