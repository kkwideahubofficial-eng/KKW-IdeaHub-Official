"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import dynamic from "next/dynamic";
import { MapPin, Navigation, Package, Power, Clock, CheckCircle } from "lucide-react";
import axios from "axios";

// Dynamically import Map to avoid SSR issues
const DriverMap = dynamic(() => import("@/components/DriverMap"), { ssr: false });

// Types
interface Task {
    assignmentId?: string; // Mapped from assignment._id
    orderId: string;
    customerName: string;
    address: string;
    status: 'PENDING' | 'ACCEPTED' | 'DELIVERED';
    location?: { lat: number, lng: number }; 
}

export default function DriverDashboard() {
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isDriving, setIsDriving] = useState(false);
  const [currentLoc, setCurrentLoc] = useState<{ lat: number, lng: number } | null>(null);
  const [history, setHistory] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<'available' | 'history'>('available');
  const [geoError, setGeoError] = useState<string | null>(null);
  
  // Geolocation Tracking
  const watchIdRef = useRef<number | null>(null);
  const [useSimulation, setUseSimulation] = useState(false);
  
  // Simulation Refs
  const routeIndex = useRef(0);
  const simIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [manualAddress, setManualAddress] = useState({
      houseNo: '',
      street: '',
      landmark: '',
      city: '',
      district: '',
      state: '',
      zip: '',
  });

  const mockRoute = [
      { lat: 19.0760, lng: 72.8777 },
      { lat: 19.0770, lng: 72.8787 },
      { lat: 19.0780, lng: 72.8797 },
      { lat: 19.0790, lng: 72.8807 },
      { lat: 19.0800, lng: 72.8817 },
  ];

  // Load state from local storage on mount
  useEffect(() => {
      console.log("Driver Dashboard v1.2 loaded");
      const savedTask = localStorage.getItem("active_delivery_task");
      if (savedTask) {
          try {
            const task = JSON.parse(savedTask);
            setActiveTask(task);
            // Optionally restore tasks list too if needed
          } catch(e) {
            console.error("Failed to restore task", e);
          }
      }
  }, []);

  useEffect(() => {
    // Auth Check
    const token = localStorage.getItem("driver_token");
    if (!token) router.push("/driver/login");

    const fetchData = async () => {
        try {
            // Get available (pending) tasks
            const assignmentsRes = await axios.get('/api/delivery/get-assignments');
            const newTasks = assignmentsRes.data.map((assignment: any) => ({
                assignmentId: assignment._id,
                orderId: assignment.order._id,
                customerName: assignment.order.address.fullName,
                address: assignment.order.address.fullAddress,
                status: 'PENDING',
                location: { 
                    lat: assignment.order.address.latitude || 0, 
                    lng: assignment.order.address.longitude || 0 
                }
            }));
            // Filter out if currently active
            const savedTaskStr = localStorage.getItem("active_delivery_task");
            const savedTask = savedTaskStr ? JSON.parse(savedTaskStr) : null;
            
            const filteredTasks = savedTask 
                ? newTasks.filter((t: any) => t.orderId !== savedTask.orderId)
                : newTasks;

            setTasks(filteredTasks);

             // Get History
             const historyRes = await axios.get('/api/delivery/history');
             console.log("History API Response:", historyRes.data);

             const historyTasks = historyRes.data.map((assignment: any) => ({
                assignmentId: assignment._id,
                orderId: assignment.order ? assignment.order._id : "Unknown Order",
                customerName: assignment.order?.address?.fullName || "Unknown Customer",
                address: assignment.order?.address?.fullAddress || "Unknown Address",
                status: 'DELIVERED', 
                location: { 
                    lat: assignment.order?.address?.latitude || 0, 
                    lng: assignment.order?.address?.longitude || 0 
                }
            }));
            setHistory(historyTasks);

        } catch (e) {
            console.error("Failed to fetch tasks/history", e);
        }
    };
    fetchData();

    // Socket Connection
    const newSocket = io("http://localhost:4000"); // Point to Socket Server
    setSocket(newSocket);

    newSocket.on("connect", () => {
        console.log("Driver Connected to Socket");
        const userId = localStorage.getItem("driver_id") || "driver_001";
        newSocket.emit("identity", userId);
    });

    // Listen for new tasks
    newSocket.on("new-delivery-task", (task: Task) => {
        console.log("New Task Received:", task);
        setTasks(prev => [...prev, task]);
        // Play notification sound
        new Audio('/notification.mp3').play().catch(e => console.log('Audio play failed', e));
    });

    return () => {
        newSocket.disconnect();
        if(watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
        if(simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [router]);

  const handleAccept = async (task: Task) => {
      try {
          if(task.assignmentId) {
             await axios.get(`/api/delivery/assignment/${task.assignmentId}/accept-assignment`);
          }
          
          const acceptedTask = { ...task, status: 'ACCEPTED' as const };
          setActiveTask(acceptedTask);
          setTasks(prev => prev.filter(t => t.orderId !== task.orderId));
          
          // Persist to Local Storage
          localStorage.setItem("active_delivery_task", JSON.stringify(acceptedTask));
      } catch(e) {
          console.error("Failed to accept task", e);
          alert("Failed to accept task. It might be taken.");
          // Refresh list
          window.location.reload(); 
      }
  };

  const toggleDriving = () => {
      if(!socket || !activeTask) return;

      if(isDriving) {
          setIsDriving(false);
          // Stop Real GPS
          if(watchIdRef.current !== null) {
              navigator.geolocation.clearWatch(watchIdRef.current);
              watchIdRef.current = null;
          }
           // Stop Simulation
          if(simIntervalRef.current) {
              clearInterval(simIntervalRef.current);
              simIntervalRef.current = null;
          }
      } else {
          setIsDriving(true);
          setGeoError(null);
          const userId = localStorage.getItem("driver_id") || "driver_001";

          if (useSimulation) {
              // --- SIMULATION MODE ---
              simIntervalRef.current = setInterval(() => {
                  const loc = mockRoute[routeIndex.current % mockRoute.length];
                  routeIndex.current++;
                  
                  socket.emit("update-location", {
                      userId,
                      latitude: loc.lat,
                      longitude: loc.lng
                  });
                  
                  setCurrentLoc(loc); 
              }, 3000); 

          } else {
              // --- REAL GPS MODE ---
              if (!navigator.geolocation) {
                  setGeoError("Geolocation is not supported by your browser");
                  setIsDriving(false);
                  return;
              }

              const success = (position: GeolocationPosition) => {
                  const { latitude, longitude } = position.coords;
                  const loc = { lat: latitude, lng: longitude };

                  socket.emit("update-location", {
                      userId,
                      latitude,
                      longitude
                  });
                  
                  setCurrentLoc(loc); 
              };

              const error = (err: GeolocationPositionError) => {
                  console.error("Geolocation error code:", err.code);
                  let errorMsg = "Unable to retrieve your location.";
                  
                  switch(err.code) {
                      case 1: // PERMISSION_DENIED
                          errorMsg = "Location permission denied. Please allow location access.";
                          break;
                      case 2: // POSITION_UNAVAILABLE
                          errorMsg = "Location unavailable. Try enabling 'Use Simulation' below.";
                          break;
                      case 3: // TIMEOUT
                          errorMsg = "Location request timed out. Try Simulation mode.";
                          break;
                      default:
                          errorMsg = `An unknown error occurred: ${err.message}`;
                  }
                  
                  setGeoError(errorMsg);
                  setIsDriving(false);
                  // Cleanup if it failed immediately
                  if(watchIdRef.current !== null) {
                      navigator.geolocation.clearWatch(watchIdRef.current);
                      watchIdRef.current = null;
                  }
              };

              const options = {
                  enableHighAccuracy: true,
                  timeout: 10000,
                  maximumAge: 0
              };

              watchIdRef.current = navigator.geolocation.watchPosition(success, error, options);
          }
      }
  };

  const handleComplete = async () => {
      console.log("Completing Task:", activeTask);
      if(!activeTask) return;
      try {
          if(activeTask.assignmentId) {
             console.log("Marking assignment complete:", activeTask.assignmentId);
             await axios.get(`/api/delivery/assignment/${activeTask.assignmentId}/complete-assignment`);
          } else {
             console.error("Missing assignmentId on activeTask!", activeTask);
             alert("Error: Critical Data Missing (assignmentId). History won't be saved.");
          }

          setActiveTask(null);
          setIsDriving(false);
          localStorage.removeItem("active_delivery_task"); // Clear storage
          if(driveInterval.current) clearInterval(driveInterval.current);
          
          // Refresh History
          const historyRes = await axios.get('/api/delivery/history');
          const historyTasks = historyRes.data.map((assignment: any) => ({
                assignmentId: assignment._id,
                orderId: assignment.order._id,
                customerName: assignment.order.address.fullName,
                address: assignment.order.address.fullAddress,
                status: 'DELIVERED', 
                location: { 
                    lat: assignment.order.address.latitude || 0, 
                    lng: assignment.order.address.longitude || 0 
                }
         }));
         setHistory(historyTasks);
         setActiveTab('history'); // Switch to history tab to show completion

      } catch(e) {
          console.error("Failed to complete task", e);
          alert("Error completing task");
      }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
        <header className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Driver Dashboard</h1>
            <div className="flex items-center gap-4"> 
                <div className="bg-white rounded-lg p-1 shadow-sm flex">
                    <button 
                        onClick={() => setActiveTab('available')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'available' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Active Requests
                    </button>
                    <button 
                         onClick={() => setActiveTab('history')}
                         className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'history' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        History
                    </button>
                </div>
                <button onClick={() => { localStorage.clear(); router.push('/driver/login'); }} className="text-red-600 font-medium flex items-center gap-2">
                    <Power className="w-4 h-4" /> Logout
                </button>
            </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
            {/* Available Tasks */}
            {/* Available Tasks / History */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    {activeTab === 'available' ? <Package className="w-5 h-5" /> : <Clock className="w-5 h-5" />} 
                    {activeTab === 'available' ? 'Available Tasks' : 'Delivery History'}
                </h2>

                {activeTab === 'available' ? (
                    tasks.length === 0 ? (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center text-gray-500">
                            No new tasks at the moment...
                        </div>
                    ) : (
                        tasks.map((task, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-gray-900">{task.customerName}</h3>
                                        <p className="text-gray-500 text-sm">#{task.orderId.slice(-6)}</p>
                                    </div>
                                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">PENDING</span>
                                </div>
                                <div className="flex items-start gap-2 text-gray-600 mb-4 text-sm">
                                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                                    <p>{task.address}</p>
                                </div>
                                <button 
                                    onClick={() => handleAccept(task)}
                                    className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-800"
                                >
                                    Accept Delivery
                                </button>
                            </div>
                        ))
                    )
                ) : (
                    history.length === 0 ? (
                         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center text-gray-500">
                            No delivery history yet.
                        </div>
                    ) : (
                        history.map((task, idx) => (
                             <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 opacity-75 hover:opacity-100 transition">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-gray-900">{task.customerName}</h3>
                                        <p className="text-gray-500 text-sm">Order #{task.orderId.slice(-6)}</p>
                                    </div>
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" /> DELIVERED
                                    </span>
                                </div>
                                <div className="flex items-start gap-2 text-gray-600 text-sm">
                                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                                    <p>{task.address}</p>
                                </div>
                            </div>
                        ))
                    )
                )}
            </div>

            {/* Active Task */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    <Navigation className="w-5 h-5" /> Active Delivery
                </h2>
                {activeTask ? (
                    <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-100">
                         <div className="flex justify-between items-start mb-6">
                             <div>
                                 <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">Current Destination</span>
                                 <h3 className="text-xl font-bold text-gray-900 mt-1">{activeTask.customerName}</h3>
                             </div>
                             <button onClick={handleComplete} className="text-sm text-green-600 font-medium hover:underline">Mark Delivered</button>
                         </div>
                         
                         <div className="bg-blue-50 p-4 rounded-lg mb-6">
                             <div className="flex items-start gap-3">
                                 <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                                 <p className="text-blue-900">{activeTask.address}</p>
                             </div>
                             {activeTask.location && (
                                <div className="mt-2 text-xs text-blue-600 pl-8">
                                    📍 Customer Simulated at: {activeTask.location.lat.toFixed(4)}, {activeTask.location.lng.toFixed(4)}
                                </div>
                             )}
                         </div>

                         {/* Live Map Visualization */}
                         {activeTask.location && currentLoc && (
                             <div className="mb-6">
                                 <DriverMap driverLoc={currentLoc} customerLoc={activeTask.location} />
                             </div>
                         )}

                         <button 
                             onClick={toggleDriving}
                             className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition ${
                                 isDriving 
                                 ? "bg-red-100 text-red-600 hover:bg-red-200"
                                 : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 shadow-xl"
                             }`}
                         >
                             {isDriving ? (
                                 <>Stop Simulation</>
                             ) : (
                                 <><Navigation className="w-6 h-6" /> Start Driving Simulation</>
                             )}
                         </button>
                         <p className="text-center text-xs text-gray-400 mt-3">
                             *Simulates GPS movement for demo
                         </p>
                          <div className="flex items-center justify-center gap-2 mt-4">
                              <input 
                                  type="checkbox" 
                                  id="useSim"
                                  checked={useSimulation}
                                  onChange={(e) => setUseSimulation(e.target.checked)}
                                  className="w-4 h-4"
                              />
                              <label htmlFor="useSim" className="text-sm text-gray-600">
                                  Use Simulation (Mock GPS)
                              </label>
                          </div>

                          {geoError && (
                              <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200 text-center">
                                  ⚠️ {geoError}
                              </div>
                          )}
                          
                          {/* Manual Location Fallback Form */}
                          <div className="mt-6 border-t pt-4">
                              <p className="text-sm text-gray-600 mb-3 font-medium flex items-center gap-2">
                                <MapPin className="w-4 h-4"/> Manual Location Entry
                              </p>
                              
                              <div className="grid grid-cols-2 gap-3 mb-3">
                                <input 
                                    type="text" placeholder="House / Flat No." 
                                    className="p-2 border rounded-lg text-xs"
                                    value={manualAddress.houseNo}
                                    onChange={e => setManualAddress({...manualAddress, houseNo: e.target.value})}
                                />
                                <input 
                                    type="text" placeholder="Street / Area" 
                                    className="p-2 border rounded-lg text-xs"
                                    value={manualAddress.street}
                                    onChange={e => setManualAddress({...manualAddress, street: e.target.value})}
                                />
                                <input 
                                    type="text" placeholder="Landmark (Optional)" 
                                    className="p-2 border rounded-lg text-xs"
                                    value={manualAddress.landmark}
                                    onChange={e => setManualAddress({...manualAddress, landmark: e.target.value})}
                                />
                                <input 
                                    type="text" placeholder="City / Town" 
                                    className="p-2 border rounded-lg text-xs"
                                    value={manualAddress.city}
                                    onChange={e => setManualAddress({...manualAddress, city: e.target.value})}
                                />
                                <input 
                                    type="text" placeholder="District" 
                                    className="p-2 border rounded-lg text-xs"
                                    value={manualAddress.district}
                                    onChange={e => setManualAddress({...manualAddress, district: e.target.value})}
                                />
                                <input 
                                    type="text" placeholder="State" 
                                    className="p-2 border rounded-lg text-xs"
                                    value={manualAddress.state}
                                    onChange={e => setManualAddress({...manualAddress, state: e.target.value})}
                                />
                                <input 
                                    type="text" placeholder="PIN / Zip Code" 
                                    className="p-2 border rounded-lg text-xs col-span-2"
                                    value={manualAddress.zip}
                                    onChange={e => setManualAddress({...manualAddress, zip: e.target.value})}
                                />
                              </div>

                              <button 
                                onClick={async () => {
                                    // Construct query
                                    const parts = [
                                        manualAddress.houseNo,
                                        manualAddress.street,
                                        manualAddress.city,
                                        manualAddress.state,
                                        manualAddress.zip,
                                        "India" // Default country
                                    ].filter(Boolean);
                                    
                                    const query = parts.join(", ");
                                    if(!query) {
                                        alert("Please enter address details");
                                        return;
                                    }
                                    
                                    try {
                                        const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
                                        if(res.data && res.data.length > 0) {
                                            const { lat, lon } = res.data[0];
                                            const validLat = parseFloat(lat);
                                            const validLng = parseFloat(lon);
                                            
                                            const loc = { lat: validLat, lng: validLng };
                                            setCurrentLoc(loc);
                                            
                                            const userId = localStorage.getItem("driver_id") || "driver_001";
                                            if(socket) {
                                                socket.emit("update-location", {
                                                    userId,
                                                    latitude: validLat,
                                                    longitude: validLng
                                                });
                                            }
                                            setGeoError(null);
                                            alert(`Location set to: ${res.data[0].display_name}`);
                                        } else {
                                            alert("Address not found. Try less specific details.");
                                        }
                                    } catch(e) {
                                        console.error(e);
                                        alert("Failed to find location");
                                    }
                                }}
                                className="w-full bg-gray-800 text-white py-2 rounded-lg text-sm font-medium hover:bg-black transition"
                              >
                                Update Location on Map
                              </button>
                          </div>
                    </div>
                ) : (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-200 p-10 rounded-xl flex flex-col items-center justify-center text-gray-400">
                        <Navigation className="w-12 h-12 mb-3 opacity-20" />
                        <p>No active delivery selected.</p>
                        <p className="text-sm">Accept a task to start navigation.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}
