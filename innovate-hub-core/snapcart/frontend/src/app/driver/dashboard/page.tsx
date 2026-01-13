"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import dynamic from "next/dynamic";
import { MapPin, Navigation, Package, Power, Clock, CheckCircle, ChevronRight, AlertCircle, Locate } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";



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
  
  const handleUseLiveLocation = () => {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
    }
    
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            const newLoc = { lat: latitude, lng: longitude };
            setCurrentLoc(newLoc);
            
            // Reverse geocode to fill fields
            try {
                 const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                 if(res.data && res.data.address) {
                     const addr = res.data.address;
                     setManualAddress({
                         houseNo: addr.house_number || '',
                         street: addr.road || addr.suburb || '',
                         landmark: addr.neighbourhood || '',
                         city: addr.city || addr.town || addr.village || '',
                         district: addr.state_district || '',
                         state: addr.state || '',
                         zip: addr.postcode || ''
                     });
                 }
            } catch(e) {
                console.error("Reverse geocoding failed", e);
            }

             // Notify server immediately
            const userId = localStorage.getItem("driver_id");
            if(socket && userId) {
                socket.emit("update-location", {
                    userId,
                    latitude,
                    longitude
                });
            }
        },
        (error) => {
            console.error(error);
            setGeoError("Unable to retrieve your location. Check GPS settings or allow permission.");
        }
    );
};

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
                const activeOrderRes = await axios.get('/api/delivery/current-order', {
                    headers: { 'x-driver-id': userId } 
                });
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
            } catch (e: any) {
                console.error("Failed to recover active order", e.response?.data || e.message || String(e));
            }

            // 2. Get available (pending) tasks
            const assignmentsRes = await axios.get('/api/delivery/get-assignments', {
                headers: { 'x-driver-id': userId }
            });
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
                    setTasks(prev => {
                        // Prevent duplicates
                        if (prev.some(t => t.orderId === task.orderId)) return prev;
                        return [...prev, task];
                    });
                    // new Audio('/notification.mp3').play().catch(e => console.log('Audio play failed', e)); // Disable missing audio
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
                  let errorMsg = "";
                  switch(err.code) {
                      case 1: 
                          errorMsg = "Permission denied. Please allow location access.";
                          break;
                      case 2: 
                          errorMsg = "Position unavailable. Check GPS signal.";
                          break;
                      case 3: 
                          errorMsg = "Location request timed out.";
                          break;
                      default:
                          errorMsg = `An unknown error occurred: ${err.message}`;
                  }
                  
                  // Only alert if it's a manual request, silent fail/log otherwise
                  toast.error(errorMsg);
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
    <div className="min-h-screen bg-gray-50/50 font-sans text-gray-900 pb-20">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
                 <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-600/20">
                    <Navigation className="w-6 h-6" />
                 </div>
                 <div>
                    <h1 className="text-xl font-bold tracking-tight text-gray-900">Driver Dashboard</h1>
                    <p className="text-xs text-gray-500 font-medium">Ready to deliver • {socket ? <span className="text-green-600">Considered Online</span> : <span className="text-amber-500">Connecting...</span>}</p>
                 </div>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end"> 
                <div className="bg-gray-100/50 p-1 rounded-xl flex shadow-inner">
                    {['available', 'history'].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all z-10 ${
                                activeTab === tab ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {activeTab === tab && (
                                <motion.div 
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-white rounded-lg shadow-sm border border-gray-200/50"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10 capitalize">{tab} Tasks</span>
                        </button>
                    ))}
                </div>
                
                <button 
                    onClick={() => { 
                        if(confirm("Reset all dashboard data? This clears local tasks.")) {
                            localStorage.clear(); 
                            window.location.reload(); 
                        }
                    }} 
                    className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    title="Reset Dashboard Data"
                >
                    <AlertCircle className="w-5 h-5" />
                </button>
                <button 
                    onClick={() => { localStorage.removeItem("driver_id"); router.push('/driver/login'); }} 
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Logout"
                >
                    <Power className="w-5 h-5" />
                </button>
            </div>
        </header>

        <main className="max-w-7xl mx-auto p-4 md:p-8 grid lg:grid-cols-12 gap-8">
            
            {/* Left Column: Task Lists */}
            <div className="lg:col-span-5 space-y-6">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        {activeTab === 'available' ? <Package className="w-5 h-5 text-blue-600" /> : <Clock className="w-5 h-5 text-purple-600" />} 
                        {activeTab === 'available' ? 'Available Requests' : 'Delivery History'}
                    </h2>
                    <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full font-bold">
                        {activeTab === 'available' ? tasks.length : history.length}
                    </span>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'available' ? (
                        tasks.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white p-8 rounded-2xl shadow-sm border border-dashed border-gray-200 text-center flex flex-col items-center justify-center min-h-[300px]"
                            >
                                <div className="bg-blue-50 p-4 rounded-full mb-4">
                                    <CheckCircle className="w-8 h-8 text-blue-400" />
                                </div>
                                <h3 className="text-gray-900 font-semibold mb-1">All Caught Up!</h3>
                                <p className="text-gray-500 text-sm max-w-[200px]">Waiting for new orders to be assigned...</p>
                            </motion.div>
                        ) : (
                            <div className="space-y-4">
                                {tasks.map((task, idx) => (
                                    <motion.div 
                                        key={task.orderId}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all group"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{task.customerName}</h3>
                                                <p className="text-gray-400 text-xs font-mono tracking-wider">#{task.orderId.slice(-8).toUpperCase()}</p>
                                            </div>
                                            <span className="bg-amber-50 text-amber-600 text-xs px-2 py-1 rounded-md font-bold uppercase tracking-wider">Pending</span>
                                        </div>
                                        <div className="flex items-start gap-3 text-gray-500 text-sm mb-5 bg-gray-50 p-3 rounded-lg">
                                            <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
                                            <p className="leading-relaxed">{task.address}</p>
                                        </div>
                                        <button 
                                            onClick={() => handleAccept(task)}
                                            className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold shadow-lg shadow-gray-200 hover:bg-blue-600 hover:shadow-blue-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                        >
                                            Accept Delivery <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        )
                    ) : (
                        // History View
                        <div className="space-y-3">
                            {history.length === 0 ? (
                                 <div className="text-center py-12 text-gray-400">No history yet</div>
                            ) : (
                                history.map((task, idx) => (
                                    <motion.div 
                                        key={idx}
                                        initial={{ opacity: 0 }} 
                                        animate={{ opacity: 1 }}
                                        className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center opacity-75 hover:opacity-100 transition-opacity"
                                    >
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{task.customerName}</h4>
                                            <p className="text-xs text-gray-500 truncate max-w-[200px]">{task.address}</p>
                                        </div>
                                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" /> Done
                                        </span>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Right Column: Active Task & Map */}
            <div className="lg:col-span-7">
                 <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                    <Navigation className="w-5 h-5 text-indigo-600" /> Current Mission
                 </h2>
                 
                 <AnimatePresence mode="wait">
                 {activeTask ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden relative"
                    >
                        {/* Decorative Gradient */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

                        <div className="p-6 md:p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">In Progress</span>
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{activeTask.customerName}</h3>
                                </div>
                                <button onClick={handleComplete} className="text-sm font-semibold text-green-600 hover:text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 transition-colors">
                                    Mark Delivered
                                </button>
                            </div>

                            {/* Address Card */}
                            <div className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-100">
                                <div className="flex gap-4">
                                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 h-fit">
                                        <MapPin className="w-6 h-6 text-indigo-500" />
                                    </div>
                                    <div>
                                        <p className="text-gray-900 font-medium text-lg leading-snug">{activeTask.address}</p>
                                        <p className="text-gray-400 text-xs mt-1">Order #{activeTask.orderId}</p>
                                        
                                        {activeTask.location && (
                                            <div className="mt-3 flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50/50 w-fit px-2 py-1 rounded">
                                                <Locate className="w-3 h-3" />
                                                <span>Target: {activeTask.location.lat.toFixed(4)}, {activeTask.location.lng.toFixed(4)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Map Container */}
                            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-inner bg-gray-100 h-[320px] mb-6 relative group">
                                {activeTask.location && currentLoc ? (
                                    <DriverMap driverLoc={currentLoc} customerLoc={activeTask.location} />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-50">
                                        <div className="text-center">
                                            <Locate className="w-10 h-10 mx-auto mb-2 opacity-50 animate-pulse" />
                                            <p>Acquiring GPS Signal...</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Controls */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <button 
                                    onClick={toggleDriving}
                                    className={`py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 ${
                                        isDriving 
                                        ? "bg-red-50 text-red-600 border-2 border-red-100 hover:bg-red-100"
                                        : "bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
                                    }`}
                                >
                                    {isDriving ? (
                                        <><Power className="w-5 h-5" /> Stop Simulation</>
                                    ) : (
                                        <><Navigation className="w-5 h-5" /> Start Simulation</>
                                    )}
                                </button>
                                
                                <div className="flex items-center justify-between px-5 bg-gray-50 rounded-xl border border-gray-100">
                                     <span className="text-sm font-medium text-gray-600">Mock GPS</span>
                                      <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={useSimulation} onChange={(e) => setUseSimulation(e.target.checked)} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                      </label>
                                </div>
                            </div>

                            {/* Manual Location Panel */}
                            <div className="mt-8 pt-6 border-t border-dashed border-gray-200">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                        Manual Location Override
                                    </h4>
                                    <button 
                                        onClick={handleUseLiveLocation}
                                        className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 font-semibold transition flex items-center gap-1.5"
                                    >
                                        <Locate className="w-3 h-3" /> Get Device Location
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {['houseNo', 'street', 'city', 'state', 'zip'].map(field => (
                                        <input 
                                            key={field}
                                            type="text" 
                                            placeholder={
                                                field === 'zip' ? 'PIN / Zip Code' :
                                                field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1').trim()
                                            }
                                            className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none transition-shadow focus:ring-2"
                                            value={(manualAddress as any)[field]}
                                            onChange={e => setManualAddress({...manualAddress, [field]: e.target.value})}
                                        />
                                    ))}
                                    <button 
                                        onClick={async () => {
                                             // Same logic as before, just triggering it
                                             // We need to DRY this up or Copy paste the logic?
                                             // I kept the handler outside the return, so I can just invoke custom logic here or copy-paste the query build.
                                             // For brevity in this replacement, I'll copy the click handler logic or call a function if I had extracted it.
                                             // Since I'm replacing the whole return, I need to inline the click handler logic again or ideally, extract it.
                                             // I will inline it for safety to ensure it works.
                                             /* INLINED LOGIC FROM PREVIOUS HANDLER */
                                            const parts = [manualAddress.houseNo, manualAddress.street, manualAddress.city, manualAddress.state, manualAddress.zip, "India"].filter(Boolean);
                                            const query = parts.join(", ");
                                            if(!query) return alert("Enter details");
                                            
                                            try {
                                                const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
                                                if(res.data && res.data.length > 0) {
                                                    const { lat, lon, display_name } = res.data[0];
                                                    const validLat = parseFloat(lat);
                                                    const validLng = parseFloat(lon);
                                                    setCurrentLoc({ lat: validLat, lng: validLng });
                                                    const userId = localStorage.getItem("driver_id");
                                                    if(socket && userId) socket.emit("update-location", { userId, latitude: validLat, longitude: validLng });
                                                    setGeoError(null);
                                                    alert(`Updated: ${display_name}`);
                                                } else { alert("Address not found"); }
                                            } catch(e) { console.error(e); alert("Failed"); }
                                        }}
                                        className="col-span-2 bg-gray-800 text-white font-medium py-2.5 rounded-lg hover:bg-black transition shadow-lg shadow-gray-200"
                                    >
                                        Update Map Location
                                    </button>
                                </div>
                            </div>
                            
                            {geoError && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <div>
                                        <p className="font-bold">Location Error</p>
                                        <p>{geoError}</p>
                                    </div>
                                </motion.div>
                            )}

                        </div>
                    </motion.div>
                 ) : (
                     <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-gray-300 p-8 text-center text-gray-400">
                         <div className="bg-gray-50 p-6 rounded-full mb-6 animate-pulse">
                            <Navigation className="w-12 h-12 text-gray-300" />
                         </div>
                         <h3 className="text-xl font-bold text-gray-900 max-w-md">Ready for Action</h3>
                         <p className="max-w-xs mx-auto mt-2">Select a task from the list on the left to start your delivery mission.</p>
                     </div>
                 )}
                 </AnimatePresence>
            </div>
        </main>
    </div>
  );
}
