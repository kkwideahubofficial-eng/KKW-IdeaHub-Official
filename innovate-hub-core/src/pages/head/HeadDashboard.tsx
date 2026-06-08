import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Settings, ListTodo, CheckCircle, XCircle, AlertTriangle, TrendingUp, 
  BarChart4, DollarSign, PieChart, Layers, Calendar, Activity 
} from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/lib/axios";

const HeadDashboard = () => {
  const [stats, setStats] = useState({
    machinesCount: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    conditionalCount: 0,
    budgetUsed: 24500, // Mock budget tracking
    allocatedMaterials: 0,
    machineUtilization: 78 // Mock utilization %
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [mRes, rRes] = await Promise.all([
          api.get('/machinery'),
          api.get('/machinery/requests')
        ]);
        
        const reqs = rRes.data;
        const pending = reqs.filter((r: any) => ['Submitted', 'Coordinator Review', 'Head Review', 'Student Resubmitted'].includes(r.status)).length;
        const approved = reqs.filter((r: any) => ['Approved', 'Material Allocated', 'Machine Scheduled', 'Completed'].includes(r.status)).length;
        const rejected = reqs.filter((r: any) => ['Rejected', 'Coordinator Rejected'].includes(r.status)).length;
        const conditional = reqs.filter((r: any) => r.status === 'Approved With Conditions').length;

        // Sum allocated materials count
        let allocatedMatsCount = 0;
        reqs.forEach((r: any) => {
          if (r.requestedMaterials) {
            r.requestedMaterials.forEach((m: any) => {
              allocatedMatsCount += m.quantityRequired;
            });
          }
        });

        setStats({
          machinesCount: mRes.data.length,
          pendingCount: pending,
          approvedCount: approved,
          rejectedCount: rejected,
          conditionalCount: conditional,
          budgetUsed: 24500 + (approved * 120), // Dynamically increments budget as simulation
          allocatedMaterials: allocatedMatsCount,
          machineUtilization: 78 + (approved > 0 ? 2 : 0)
        });
      } catch (e) {
        console.error(e);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Idea Lab Head Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Review student prototype proposals, track resource allocations, and audit project deliverables.</p>
      </div>

      {/* Main Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Pending Reviews", value: stats.pendingCount, icon: ListTodo, color: "text-blue-600", bg: "bg-blue-50/50" },
          { label: "Approved Permissions", value: stats.approvedCount, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50/50" },
          { label: "Rejected Requests", value: stats.rejectedCount, icon: XCircle, color: "text-red-600", bg: "bg-red-50/50" },
          { label: "Conditional Approvals", value: stats.conditionalCount, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50/50" }
        ].map((card, idx) => (
          <Card key={idx} className="shadow-sm border-border/60 hover:shadow-md transition-shadow">
            <CardContent className="pt-6 flex justify-between items-center">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{card.label}</p>
                <p className="text-2xl font-extrabold text-foreground mt-1">{card.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.bg}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Operational Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Budget Tracker */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-emerald-600" /> Lab Budget Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-extrabold text-slate-800">₹{stats.budgetUsed}</div>
            <div className="w-full bg-slate-150 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[49%]" />
            </div>
            <p className="text-3xs text-muted-foreground">Allocation limit: ₹50,000 | Remaining: ₹{50000 - stats.budgetUsed}</p>
          </CardContent>
        </Card>

        {/* Resource Consumption */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5"><Layers className="w-4 h-4 text-indigo-600" /> Material Consumption</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-extrabold text-slate-800">{stats.allocatedMaterials} <span className="text-xs font-semibold text-muted-foreground">Units</span></div>
            <div className="w-full bg-slate-150 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full w-[65%]" />
            </div>
            <p className="text-3xs text-muted-foreground">Highest Category: Electronics Consumables</p>
          </CardContent>
        </Card>

        {/* Machine Utilization */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5"><Activity className="w-4 h-4 text-purple-600" /> Machine Utilization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-extrabold text-slate-800">{stats.machineUtilization}%</div>
            <div className="w-full bg-slate-150 h-2 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-full w-[78%]" />
            </div>
            <p className="text-3xs text-muted-foreground">Highest utilization: 3D Printer (Ultimaker S5)</p>
          </CardContent>
        </Card>

      </div>

      {/* Quick Actions & Analytics Visual Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Actions */}
        <Card className="shadow-sm border-border/80 lg:col-span-1">
          <CardHeader><CardTitle className="text-base font-bold">Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Link to="/head/requests" className="block">
              <Button size="lg" className="w-full h-18 text-sm gap-2 font-semibold bg-primary hover:bg-primary/95 text-white shadow-sm">
                <ListTodo className="h-5 w-5" /> Review Requests ({stats.pendingCount} pending)
              </Button>
            </Link>
            <Link to="/manage-machinery" className="block">
              <Button size="lg" className="w-full h-18 text-sm gap-2 font-semibold" variant="outline">
                <Settings className="h-5 w-5" /> Manage Machinery Inventory
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Analytics Distribution Graphs mockup */}
        <Card className="shadow-sm border-border/80 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold">Project Category Distribution</CardTitle>
            <CardDescription className="text-xs">Category metrics for ongoing student prototype applications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs font-semibold text-slate-700">
            {[
              { label: "Academic Project", percentage: 45, count: 18, color: "bg-blue-500" },
              { label: "Prototype Development", percentage: 25, count: 10, color: "bg-green-500" },
              { label: "Startup / Innovation Project", percentage: 20, count: 8, color: "bg-purple-500" },
              { label: "Research Project", percentage: 10, count: 4, color: "bg-amber-500" }
            ].map((cat) => (
              <div key={cat.label} className="space-y-1">
                <div className="flex justify-between items-center text-3xs font-bold">
                  <span>{cat.label} ({cat.count})</span>
                  <span>{cat.percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${cat.color}`} style={{ width: `${cat.percentage}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>

    </div>
  );
};

export default HeadDashboard;
