import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Calendar } from "lucide-react";
import { ReadMore } from "@/components/ReadMore";
import { getNextAvailableDate, formatTime12Hour } from "@/lib/dateUtils";

interface Machinery {
  _id: string;
  name: string;
  description: string;
  imageUrl?: string;
  capacity: number;
  timeSlots: { day: string; startTime: string; endTime: string }[];
  isAvailable: boolean;
}

const MachineryList = () => {
  const [machines, setMachines] = useState<Machinery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      const res = await api.get("/machinery"); // Publicly accessible or requires auth
      setMachines(res.data);
    } catch {
      toast.error("Failed to load machinery");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-4">Idea Lab Machinery</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explore our advanced machinery available for student projects. 
          Permission from the Idea Lab Head is required for usage.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {machines.filter(m => m.isAvailable).map((machine) => (
          <Card key={machine._id} className="flex flex-col hover:shadow-lg transition-shadow">
            <div className="relative h-48 w-full bg-muted">
               {machine.imageUrl ? (
                 <img src={machine.imageUrl} alt={machine.name} className="w-full h-full object-cover rounded-t-lg" />
               ) : (
                 <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">No Image</div>
               )}
               {machine.isAvailable && (
                 <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">Available</span>
               )}
            </div>
            
            <CardHeader>
              <CardTitle>{machine.name}</CardTitle>
              <div className="text-sm text-muted-foreground">
                <ReadMore text={machine.description} limit={30} />
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <div className="text-sm">
                <p><strong>Capacity:</strong> {machine.capacity} Students</p>
                <div className="flex items-start gap-2 mt-2">
                   <Calendar className="w-4 h-4 text-primary mt-0.5" />
                   <div>
                     <p className="font-semibold mb-1">Available Slots:</p>
                     <ul className="text-muted-foreground list-disc pl-4 space-y-1">
                        {machine.timeSlots.slice(0, 3).map((slot, i) => {
                           const dateStr = getNextAvailableDate(slot.day, slot.startTime);
                           
                           return (
                              <li key={i}>
                                {slot.day} ({dateStr}): {formatTime12Hour(slot.startTime)} - {formatTime12Hour(slot.endTime)}
                              </li>
                           );
                        })}

                        {machine.timeSlots.length > 3 && <li>+{machine.timeSlots.length - 3} more</li>}
                     </ul>
                   </div>
                </div>
              </div>
              
              <Link to={`/machinery/request/${machine._id}`} className="mt-auto">
                <Button className="w-full" disabled={!machine.isAvailable}>
                  {machine.isAvailable ? "Request Permission / Book Slot" : "Currently Unavailable"}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MachineryList;
