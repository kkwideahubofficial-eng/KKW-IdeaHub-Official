import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2, Download } from "lucide-react";
import { toast } from "sonner";

interface MachineryRecord {
  _id: string;
  machineryId: {
    _id: string;
    name: string;
  };
  studentId: {
    name: string;
    email: string;
    teamName?: string;
  };
  teamMembers: { name: string; branch: string; year: string; mobile?: string; email?: string }[];
  usageDate: string;
  startTime: string;
  endTime: string;
  actualEntryTime?: string;
  actualExitTime?: string;
  status: string;
}

const RecordStats = () => {
  const [records, setRecords] = useState<MachineryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("daily");

  const filters = [
    { label: "Daily", value: "daily" },
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
    { label: "Last 3 Months", value: "last3months" },
    { label: "Last 6 Months", value: "last6months" },
    { label: "Last 9 Months", value: "last9months" },
    { label: "Last 12 Months", value: "last12months" },
    { label: "Yearly", value: "yearly" },
  ];

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/machinery/records?filter=${filter}`);
      setRecords(res.data);
    } catch (error) {
      console.error("Failed to fetch records", error);
      toast.error("Failed to fetch records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [filter]);



  const handleDownload = () => {
    if (records.length === 0) return toast.error("No records to export");

    const doc = new jsPDF();

    // Add Title
    doc.setFontSize(18);
    doc.text("Machinery Records & Attendance Report", 14, 22);

    // Add Meta Info
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Filter: ${filters.find(f => f.value === filter)?.label}`, 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 36);

    // Define Columns
    const tableColumn = ["Date", "Machine", "Student", "Team", "Slot Time", "Entry", "Exit", "Status"];
    
    // Define Rows
    const tableRows = records.map(record => [
        format(new Date(record.usageDate), 'MMM d, yyyy'),
        record.machineryId?.name || "Unknown",
        record.studentId?.name || "Unknown",
        record.studentId?.teamName || "-",
        `${record.startTime} - ${record.endTime}`,
        record.actualEntryTime ? new Date(record.actualEntryTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "-",
        record.actualExitTime ? new Date(record.actualExitTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "-",
        record.status
    ]);

    // Generate Table
    // @ts-ignore
    doc.autoTable({
        startY: 44,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 30 },
            4: { cellWidth: 25 },
        }
    });

    // Save PDF
    doc.save(`machinery_records_${filter}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Machinery Records & Attendance</h1>
           <p className="text-muted-foreground">View machinery usage logs and student attendance.</p>
        </div>
        <Button variant="outline" onClick={handleDownload} disabled={loading || records.length === 0}>
            <Download className="w-4 h-4 mr-2" /> Download PDF
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
            <Button 
                key={f.value} 
                variant={filter === f.value ? "default" : "secondary"}
                onClick={() => setFilter(f.value)}
                size="sm"
            >
                {f.label}
            </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
           <CardTitle>{filters.find(f => f.value === filter)?.label} Records</CardTitle>
           <CardDescription>Showing {records.length} records found for this period.</CardDescription>
        </CardHeader>
        <CardContent>
            {loading ? (
                <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : records.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">No records found for this period.</div>
            ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Machine</TableHead>
                                <TableHead>Student / Team</TableHead>
                                <TableHead>Slot Time</TableHead>
                                <TableHead>Entry / Exit</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {records.map((record) => (
                                <TableRow key={record._id}>
                                    <TableCell className="whitespace-nowrap font-medium">
                                        {format(new Date(record.usageDate), 'MMM d, yyyy')}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-semibold">{record.machineryId?.name || 'Unknown Machine'}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium text-sm">{record.studentId?.name || 'Unknown Student'}</div>
                                        {record.studentId?.teamName && <div className="text-xs text-muted-foreground">{record.studentId.teamName}</div>}
                                        <div className="text-xs text-muted-foreground mt-0.5">{record.teamMembers?.length || 0} Members</div>
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        {record.startTime} - {record.endTime}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-xs">
                                            <span className="text-green-600 font-medium">In:</span> {record.actualEntryTime ? new Date(record.actualEntryTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
                                        </div>
                                        <div className="text-xs">
                                             <span className="text-red-500 font-medium">Out:</span> {record.actualExitTime ? new Date(record.actualExitTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={record.status === 'approved' ? 'default' : record.status === 'pending' ? 'outline' : 'secondary'}>
                                            {record.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RecordStats;
