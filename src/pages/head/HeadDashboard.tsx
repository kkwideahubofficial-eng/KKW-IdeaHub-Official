import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, ListTodo } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/lib/axios";

const HeadDashboard = () => {
    const [stats, setStats] = useState({ machines: 0, pendingRequests: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch basic amounts - inefficient but works for now
                const [mRes, rRes] = await Promise.all([
                    api.get('/machinery'),
                    api.get('/machinery/requests')
                ]);
                const pending = rRes.data.filter((r: any) => r.status === 'pending').length;
                setStats({ machines: mRes.data.length, pendingRequests: pending });
            } catch (e) {
                console.error(e);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-2">Idea Lab Head Dashboard</h1>
            <p className="text-muted-foreground mb-8">Manage machinery inventory and approve student requests.</p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Machinery</CardTitle>
                        <Settings className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.machines}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                        <ListTodo className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingRequests}</div>
                    </CardContent>
                </Card>
            </div>

            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid md:grid-cols-2 gap-4">
                <Link to="/head/requests">
                    <Button size="lg" className="w-full h-24 text-lg" variant="secondary">
                        <ListTodo className="mr-3 h-6 w-6" /> Review Requests
                    </Button>
                </Link>
                <Link to="/head/machinery">
                    <Button size="lg" className="w-full h-24 text-lg" variant="outline">
                        <Settings className="mr-3 h-6 w-6" /> Manage Inventory
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default HeadDashboard;
