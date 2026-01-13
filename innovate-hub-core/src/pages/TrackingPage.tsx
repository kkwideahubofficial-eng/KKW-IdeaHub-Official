import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Navigation, Package } from 'lucide-react';
import L from 'leaflet';
import api from '@/lib/axios';
import { API_BASE_URL, SOCKET_URL } from "@/lib/api";

// Fix Leaflet marker icon
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const socket = io(SOCKET_URL); // Connect to SnapCart Socket

const TrackingPage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState<any>(null);
    const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
    const [status, setStatus] = useState('PENDING');

    useEffect(() => {
        // Fetch initial order details
        const fetchOrder = async () => {
            try {
                const res = await api.get(`${API_BASE_URL}/orders/${id}`);
                setOrder(res.data);
                setStatus(res.data.status);
            } catch (error) {
                console.error("Failed to fetch order", error);
            }
        };
        fetchOrder();

        // Socket Listeners
        socket.on('connect', () => {
            console.log('Connected to Tracking Server');
            socket.emit('join-room', id); // Join room for this order
        });

        socket.on('update-deliveryBoy-location', (data: any) => {
             // Expecting data: { userId, location: { type: 'Point', coordinates: [lng, lat] } }
             if(data.location && data.location.coordinates) {
                 setLocation({
                     lat: data.location.coordinates[1],
                     lng: data.location.coordinates[0]
                 });
             }
        });
        
        // Listen for status updates if SnapCart broadcasts them
        socket.on('order-status-update', (data: any) => {
             if(data.orderId === id) {
                 setStatus(data.status);
             }
        });

        return () => {
            socket.off('update-deliveryBoy-location');
            socket.off('order-status-update');
        };
    }, [id]);

    if (!order) return <div className="p-10 text-center">Loading...</div>;

    const defaultCenter = { lat: 19.0760, lng: 72.8777 }; // Default Mumbai (or user address geo)
    // In a real app, geocode order.shippingAddress to get destination coords

    return (
        <div className="container mx-auto px-4 py-8 h-screen flex flex-col">
            <div className="flex items-center gap-4 mb-6">
                 <Link to="/my-orders">
                    <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5"/></Button>
                 </Link>
                 <div>
                     <h1 className="text-2xl font-bold">Track Order</h1>
                     <p className="text-muted-foreground text-sm">#{order._id.slice(-8).toUpperCase()}</p>
                 </div>
                 <div className="ml-auto">
                     <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium border border-primary/20">
                         {status}
                     </span>
                 </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 flex-1">
                {/* Map Section */}
                <Card className="lg:col-span-2 overflow-hidden h-[500px] lg:h-auto relative z-0">
                    <MapContainer center={location || defaultCenter} zoom={13} scrollWheelZoom={false} className="h-full w-full">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {location && (
                            <Marker position={location}>
                                <Popup>
                                    Delivery Partner <br /> Live Location
                                </Popup>
                            </Marker>
                        )}
                        {/* Destination Marker (Mock) */}
                        <Marker position={defaultCenter}>
                             <Popup>Destination</Popup>
                        </Marker>
                    </MapContainer>
                    {!location && (
                        <div className="absolute top-4 right-4 bg-white/90 p-2 rounded-md shadow text-xs z-[1000]">
                            Waiting for location update...
                        </div>
                    )}
                </Card>

                {/* Info Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Delivery Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-start gap-3">
                            <div className="bg-blue-100 p-2 rounded-full mt-1">
                                <Package className="text-blue-600 w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-medium text-sm">Estimated Delivery</h4>
                                <p className="text-2xl font-bold text-gray-900">25-35 min</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                             <div className="bg-green-100 p-2 rounded-full mt-1">
                                <Navigation className="text-green-600 w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-medium text-sm">Delivery Address</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                    {order.shippingAddress.fullName}<br/>
                                    {order.shippingAddress.addressLine1}<br/>
                                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                                </p>
                            </div>
                        </div>
                        
                        <div className="pt-4 border-t">
                             <h4 className="font-medium text-sm mb-3">Order Items</h4>
                             <ul className="space-y-2">
                                 {order.items.map((item: any, i: number) => (
                                     <li key={i} className="flex justify-between text-sm">
                                         <span>{item.quantity}x {item.name}</span>
                                         <span className="text-muted-foreground">₹{item.price}</span>
                                     </li>
                                 ))}
                             </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default TrackingPage;
