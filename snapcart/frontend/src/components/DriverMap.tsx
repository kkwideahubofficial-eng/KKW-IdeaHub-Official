"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Fix Leaflet icons
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface DriverMapProps {
  driverLoc: { lat: number; lng: number };
  customerLoc: { lat: number; lng: number };
}

// Component to handle map camera updates
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

export default function DriverMap({ driverLoc, customerLoc }: DriverMapProps) {
  // Center map on driver
  return (
    <div className="h-[300px] w-full rounded-lg overflow-hidden border-2 border-slate-200">
      <MapContainer 
        center={driverLoc} 
        zoom={14} 
        scrollWheelZoom={false} 
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <RecenterMap lat={driverLoc.lat} lng={driverLoc.lng} />

        {/* Driver Marker */}
        <Marker position={driverLoc}>
            <Popup>You (Driver)</Popup>
        </Marker>

        {/* Customer Marker */}
        <Marker position={customerLoc}>
            <Popup>Customer (Destination)</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
