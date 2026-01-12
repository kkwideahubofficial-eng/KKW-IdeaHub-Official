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
            if (task && task.assignmentId) {
                setActiveTask(task);
            } else {
                console.warn("Found invalid task in storage (missing assignmentId), clearing it.");
                localStorage.removeItem("active_delivery_task");
                setActiveTask(null);
            }
            // Optionally restore tasks list too if needed
          } catch(e) {
            console.error("Failed to restore task", e);
            localStorage.removeItem("active_delivery_task"); 
          }
      }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
        try {
            // 0. Get User Identity (Fix for Socket 500 Error)
            let userId = localStorage.getItem("driver_id");
            if (!userId || userId === "driver_001") {
                 try {
                     const meRes = await axios.get('/api/me');
                     if (meRes.data && meRes.data._id) {
                         userId = meRes.data._id;
                         localStorage.setItem("driver_id", userId!); // Save valid ID
                     }
                 } catch (e) {
                     console.error("Failed to fetch user ID", e);
                     // If auth fails, redirect
                     router.push("/login");
                     return;
                 }
            }

            // 1. Check for Active Order from Backend (Source of Truth)
            try {
                const activeOrderRes = await axios.get('/api/delivery/current-order');
                if (activeOrderRes.data.active && activeOrderRes.data.assignment) {
                    const assignment = activeOrderRes.data.assignment;
                    if (assignment && assignment.order) {
                        const recoverTask: Task = {
                            assignmentId: assignment._id,
                            orderId: assignment.order._id,
                            customerName: assignment.order.address?.fullName || "Unknown Customer",
                            address: assignment.order.address?.fullAddress || "Unknown Address",
                            status: 'ACCEPTED',
                            location: { 
                                lat: assignment.order.address?.latitude || 0, 
                                lng: assignment.order.address?.longitude || 0 
                            }
                        };
                        setActiveTask(recoverTask);
                        localStorage.setItem("active_delivery_task", JSON.stringify(recoverTask)); // Sync LocalStorage
                        console.log("Recovered active task from backend:", recoverTask);
                    } else {
                        console.warn("Active assignment found but order data is missing:", assignment);
                    }
                }
            } catch (e) {
                console.error("Failed to recover active order", e);
            }

            // 2. Get available (pending) tasks
            const assignmentsRes = await axios.get('/api/delivery/get-assignments');
            const newTasks = assignmentsRes.data
                .filter((assignment: any) => assignment.order) // Filter out bad data
                .map((assignment: any) => ({
                    assignmentId: assignment._id,
                    orderId: assignment.order._id,
                    customerName: assignment.order.address?.fullName || "Unknown",
                    address: assignment.order.address?.fullAddress || "Unknown Address",
                    status: 'PENDING',
                    location: { 
                        lat: assignment.order.address?.latitude || 0, 
                        lng: assignment.order.address?.longitude || 0 
                    }
                }));
            
            // Filter out the active task from available tasks (if any)
            setTasks(prev => {
                 // We don't have access to the *latest* activeTask state here reliably due to closures, 
                 // but we can check the one we might have just recovered or stored.
                 // A safer way is to trust the backend list + filtering.
                 // If the backend 'get-assignments' already excludes 'assigned' ones, we don't need complex filtering.
                 // Usually get-assignments returns 'brodcasted'.
                 return newTasks;
            });

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

            // Connect Socket with Valid ID
            if (!socket) {
                const newSocket = io("http://localhost:4000"); 
                setSocket(newSocket);

                newSocket.on("connect", () => {
                    console.log("Driver Connected to Socket");
                    newSocket.emit("identity", userId);
                });

                newSocket.on("new-delivery-task", (task: Task) => {
                    console.log("New Task Received:", task);
                    setTasks(prev => [...prev, task]);
                    new Audio('/notification.mp3').play().catch(e => console.log('Audio play failed', e));
                });
            }

        } catch (e) {
            console.error("Failed to fetch tasks/history", e);
        }
    };
    fetchData();

    return () => {
        if (socket) socket.disconnect();
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
          const userId = localStorage.getItem("driver_id");
          if(!userId) {
              alert("User ID missing. Please refresh or re-login.");
              return;
          }

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
          if(simIntervalRef.current) clearInterval(simIntervalRef.current);
          
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
                        className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'available' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                    >
                        Active Requests
                    </button>
                    <button 
                         onClick={() => setActiveTab('history')}
                         className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'history' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                    >
                        History
                    </button>
                </div>
                <button onClick={() => { localStorage.clear(); router.push('/driver/login'); }} className="text-destructive font-medium flex items-center gap-2">
                    <Power className="w-4 h-4" /> Logout
                </button>
            </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
            {/* Available Tasks */}
            {/* Available Tasks / History */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    {activeTab === 'available' ? <Package className="w-5 h-5 text-primary" /> : <Clock className="w-5 h-5 text-primary" />} 
                    {activeTab === 'available' ? 'Available Tasks' : 'Delivery History'}
                </h2>

                {activeTab === 'available' ? (
                    tasks.length === 0 ? (
                        <div className="bg-card p-6 rounded-xl shadow-sm border border-border text-center text-muted-foreground">
                            No new tasks at the moment...
                        </div>
                    ) : (
                        tasks.map((task, idx) => (
                            <div key={idx} className="bg-card p-6 rounded-xl shadow-sm border border-border hover:shadow-md transition">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-foreground">{task.customerName}</h3>
                                        <p className="text-muted-foreground text-sm">#{task.orderId.slice(-6)}</p>
                                    </div>
                                    <span className="bg-warning/20 text-warning text-xs px-2 py-1 rounded-full font-medium">PENDING</span>
                                </div>
                                <div className="flex items-start gap-2 text-muted-foreground mb-4 text-sm">
                                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                                    <p>{task.address}</p>
                                </div>
                                <button 
                                    onClick={() => handleAccept(task)}
                                    className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:bg-primary/90"
                                >
                                    Accept Delivery
                                </button>
                            </div>
                        ))
                    )
                ) : (
                    history.length === 0 ? (
                         <div className="bg-card p-6 rounded-xl shadow-sm border border-border text-center text-muted-foreground">
                            No delivery history yet.
                        </div>
                    ) : (
                        history.map((task, idx) => (
                             <div key={idx} className="bg-card p-6 rounded-xl shadow-sm border border-border opacity-75 hover:opacity-100 transition">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-foreground">{task.customerName}</h3>
                                        <p className="text-muted-foreground text-sm">Order #{task.orderId.slice(-6)}</p>
                                    </div>
                                    <span className="bg-success/20 text-success text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" /> DELIVERED
                                    </span>
                                </div>
                                <div className="flex items-start gap-2 text-muted-foreground text-sm">
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
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-primary" /> Active Delivery
                </h2>
                {activeTask ? (
                    <div className="bg-card p-6 rounded-xl shadow-lg border-2 border-primary/20">
                         <div className="flex justify-between items-start mb-6">
                             <div>
                                 <span className="text-xs font-bold text-primary uppercase tracking-wide">Current Destination</span>
                                 <h3 className="text-xl font-bold text-foreground mt-1">{activeTask.customerName}</h3>
                             </div>
                             <button onClick={handleComplete} className="text-sm text-success font-medium hover:underline">Mark Delivered</button>
                         </div>
                         
                         <div className="bg-primary/10 p-4 rounded-lg mb-6">
                             <div className="flex items-start gap-3">
                                 <MapPin className="w-5 h-5 text-primary mt-0.5" />
                                 <p className="text-primary-foreground font-medium text-foreground">{activeTask.address}</p>
                             </div>
                             {activeTask.location && (
                                <div className="mt-2 text-xs text-primary pl-8">
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
                                 ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                                 : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20 shadow-xl"
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
                                            
                                          const userId = localStorage.getItem("driver_id");
                                            if(!userId) {
                                                alert("User ID missing. Please re-login.");
                                                return;
                                            }
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
