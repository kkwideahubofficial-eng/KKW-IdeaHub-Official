import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from 'date-fns';
import { Loader2, Package } from 'lucide-react';
import { toast } from 'sonner';
import OrderTimeline from '@/components/OrderTimeline';
import { ChevronDown, ChevronUp, User, Phone } from 'lucide-react';
import axios from 'axios';

interface Order {
  _id: string;
  userId: string; // Would benefit from populate
  items: any[];
  shippingAddress: { fullName: string; city: string; };
  amounts: { total: number };
  status: string;
  createdAt: string;
}

const ManageOrders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [driverDetails, setDriverDetails] = useState<any>(null);

    const toggleExpand = async (orderId: string) => {
        if (expandedOrderId === orderId) {
            setExpandedOrderId(null);
            setDriverDetails(null);
        } else {
            setExpandedOrderId(orderId);
            setDriverDetails(null); // Reset
            // Fetch driver details from SnapCart if needed
            // Assuming SnapCart API is open or we proxy. 
            // For now, let's try to fetch if status is SHIPPED/PROCESSING
            try {
               // Use env var for Snapcart URL in production
               const SNAPCART_URL = import.meta.env.VITE_SNAPCART_URL || 'http://localhost:3000';
               const url = `${SNAPCART_URL}/api/delivery/public/status/${orderId}`;
               console.log("Fetching driver info from:", url);
               const res = await axios.get(url);
               console.log("Snapcart Response:", res.data);
               if(res.data) {
                 setDriverDetails(res.data);
               }
            } catch(e) {
                console.error("Fetch Error:", e);
                toast.error("Could not fetch driver details");
            }
        }
    };

    const fetchOrders = async () => {
        try {
            // Need a new Admin API for fetching ALL orders. 
            // Currently using /orders which might filter by user. 
            // We need to implement `getAllOrders` in backend or verify `getMyOrders` limitation.
            // For now, let's assume coordinator can see all or we add a new endpoint.
            // Let's use the same endpoint but update backend logic for Coordinator role if needed.
            const res = await api.get('/orders/admin/all'); 
            setOrders(res.data);
        } catch (error) {
            console.error("Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            toast.success(`Order #${orderId.slice(-4)} updated to ${newStatus}`);
            setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <h1 className="text-3xl font-bold mb-8">Manage Orders</h1>

            <div className="bg-white rounded-md border">
                <div className="grid grid-cols-7 gap-4 p-4 font-medium text-sm bg-muted/40 border-b">
                    <div className="col-span-1">Order ID</div>
                    <div className="col-span-1">Date</div>
                    <div className="col-span-2">Customer</div>
                    <div className="col-span-1">Total</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-1">Actions</div>
                </div>
                
                <div className="divide-y">
                    {orders.map((order) => (
                        <React.Fragment key={order._id}>
                        <div 
                            className={`grid grid-cols-7 gap-4 p-4 items-center text-sm hover:bg-gray-50 cursor-pointer transition ${expandedOrderId === order._id ? 'bg-gray-50' : ''}`}
                            onClick={() => toggleExpand(order._id)}
                        >
                            <div className="col-span-1 font-mono flex items-center gap-2">
                                {expandedOrderId === order._id ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                                {order._id.slice(-8).toUpperCase()}
                            </div>
                            <div className="col-span-1 text-muted-foreground">{format(new Date(order.createdAt), 'dd MMM')}</div>
                            <div className="col-span-2">
                                <div className="font-medium">{order.shippingAddress?.fullName || 'Unknown'}</div>
                                <div className="text-xs text-muted-foreground">{order.shippingAddress?.city}</div>
                            </div>
                            <div className="col-span-1 font-bold">₹{order.amounts.total.toFixed(2)}</div>
                            <div className="col-span-1">
                                <Badge variant="outline" className={
                                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-700 hover:bg-red-100' : 
                                    'bg-blue-50 text-blue-700 hover:bg-blue-50'
                                }>{order.status}</Badge>
                            </div>
                            <div className="col-span-1" onClick={(e) => e.stopPropagation()}>
                                {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                                     <Select onValueChange={(val) => handleStatusUpdate(order._id, val)}>
                                        <SelectTrigger className="h-8 w-full">
                                            <SelectValue placeholder="Update" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PROCESSING">Processing</SelectItem>
                                            <SelectItem value="SHIPPED">Shipped</SelectItem>
                                            <SelectItem value="DELIVERED">Delivered</SelectItem>
                                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                        </SelectContent>
                                     </Select>
                                )}
                            </div>
                        </div>
                        {expandedOrderId === order._id && (
                            <div className="p-4 bg-gray-50 border-b animate-in fade-in zoom-in-95 duration-200">
                                <div className="bg-white p-4 rounded-lg border shadow-sm">
                                    <h3 className="font-semibold text-sm text-gray-700 mb-4">Order Status Timeline</h3>
                                    <OrderTimeline status={order.status} createdAt={order.createdAt} />
                                    
                                    {driverDetails && driverDetails.assignedDriver && (
                                        <div className="mt-4 pt-4 border-t flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                 <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                                                     <User size={18} />
                                                 </div>
                                                 <div>
                                                     <p className="text-xs text-gray-500 uppercase font-bold">Delivery Partner</p>
                                                     <p className="font-semibold text-gray-800">{driverDetails.assignedDriver.name}</p>
                                                     <p className="text-xs text-gray-600 flex items-center gap-1">
                                                         <Phone size={12}/> {driverDetails.assignedDriver.mobile}
                                                     </p>
                                                 </div>
                                            </div>
                                            <Button size="sm" variant="outline" onClick={()=>window.open(`tel:${driverDetails.assignedDriver.mobile}`)}>
                                                Call Partner
                                            </Button>
                                        </div>
                                    )}

                                    {/* Fallback if no driver details but status implies one might exist */}
                                    {!driverDetails && (order.status === 'SHIPPED' || order.status === 'PROCESSING') && (
                                        <div className="mt-4 text-xs text-gray-400 text-center italic">
                                            Fetching delivery partner details... (Ensure SnapCart is running)
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        </React.Fragment>
                    ))}
                    
                    {orders.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">No orders found.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageOrders;
