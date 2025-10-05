import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";

const BookSlots = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [formData, setFormData] = useState({
    teamName: "",
    projectTitle: "",
    description: "",
    timeSlot: "",
  });

  const timeSlots = [
    "09:00 AM - 11:00 AM",
    "11:00 AM - 01:00 PM",
    "02:00 PM - 04:00 PM",
    "04:00 PM - 06:00 PM",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.teamName && formData.projectTitle && formData.timeSlot && date) {
      toast.success("Booking request submitted successfully! Waiting for coordinator approval.");
      setFormData({ teamName: "", projectTitle: "", description: "", timeSlot: "" });
    } else {
      toast.error("Please fill in all required fields");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Book a Lab Slot</h1>
        <p className="text-muted-foreground">
          Reserve innovation lab facilities for your project
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Calendar Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
            <CardDescription>Choose your preferred date for lab access</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              disabled={(date) => date < new Date()}
            />
          </CardContent>
        </Card>

        {/* Booking Form */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
            <CardDescription>Fill in your project information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">Team Name *</Label>
                <Input
                  id="teamName"
                  placeholder="Innovation Squad"
                  value={formData.teamName}
                  onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectTitle">Project Title *</Label>
                <Input
                  id="projectTitle"
                  placeholder="AI-Powered Solution"
                  value={formData.projectTitle}
                  onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Project Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of your project..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeSlot">Preferred Time Slot *</Label>
                <select
                  id="timeSlot"
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.timeSlot}
                  onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                  required
                >
                  <option value="">Select a time slot</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              {date && (
                <div className="p-3 bg-accent rounded-md">
                  <p className="text-sm text-accent-foreground">
                    <strong>Selected Date:</strong> {date.toLocaleDateString()}
                  </p>
                </div>
              )}

              <Button type="submit" className="w-full">
                Submit Booking Request
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Info Section */}
      <Card className="mt-8">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-lg mb-3">Booking Guidelines</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• All booking requests require coordinator approval</li>
            <li>• You will receive a confirmation email once approved</li>
            <li>• Approved bookings will receive a QR code for lab access</li>
            <li>• Cancellations must be made at least 24 hours in advance</li>
            <li>• Maximum booking duration is 2 hours per session</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookSlots;
