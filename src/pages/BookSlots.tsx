import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import axios from "../lib/axios";
import { useNavigate } from "react-router-dom";

const BookSlots = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [formData, setFormData] = useState({
    teamName: "",
    projectTitle: "",
    description: "",
    timeSlot: "",
  });

  const timeSlots = [
    { label: "09:00 AM - 11:00 AM", start: "09:00", end: "11:00" },
    { label: "11:00 AM - 01:00 PM", start: "11:00", end: "13:00" },
    { label: "02:00 PM - 04:00 PM", start: "14:00", end: "16:00" },
    { label: "04:00 PM - 06:00 PM", start: "16:00", end: "18:00" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = [
      { 
        field: 'teamName', 
        label: 'Team Name',
        minLength: 1,
        error: 'Team Name is required'
      },
      { 
        field: 'projectTitle', 
        label: 'Project Title',
        minLength: 3,
        error: 'Project Title must be at least 3 characters long'
      },
      { 
        field: 'timeSlot', 
        label: 'Time Slot',
        minLength: 1,
        error: 'Please select a time slot'
      },
    ];

    // Check for missing or invalid fields
    const invalidFields = requiredFields.filter(({ field, minLength }) => {
      const value = formData[field as keyof typeof formData];
      return !value || (minLength && value.length < minLength);
    });
    
    if (invalidFields.length > 0 || !date) {
      if (invalidFields.length > 0) {
        // Show the first error message
        toast.error(invalidFields[0].error);
      } else if (!date) {
        toast.error('Please select a date');
      }
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Format the date as YYYY-MM-DD
      const formattedDate = date.toISOString().split('T')[0];
      
      // Find the selected time slot
      const selectedSlot = timeSlots.find(slot => slot.label === formData.timeSlot);
      
      if (!selectedSlot) {
        throw new Error("Invalid time slot selected");
      }

      // Prepare the booking data
      const bookingData = {
        slotDate: formattedDate,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        purpose: formData.projectTitle,
        description: formData.description || '',
        teamName: formData.teamName
      };

      console.log('Submitting booking data:', JSON.stringify(bookingData, null, 2));
      
      // Make the API call
      const response = await axios.post('/bookings', bookingData);
      
      if (response.data) {
        toast.success("Booking request submitted successfully! Waiting for coordinator approval.");
        setFormData({ teamName: "", projectTitle: "", description: "", timeSlot: "" });
        navigate('/'); // Redirect to home page after successful booking
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      
      // Enhanced error handling
      let errorMessage = 'Failed to submit booking';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        
        if (error.response.data && error.response.data.errors) {
          // Handle validation errors
          const validationErrors = error.response.data.errors
            .map((err: any) => `${err.param}: ${err.msg}`)
            .join('\n');
          errorMessage = `Validation error: ${validationErrors}`;
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        errorMessage = 'No response from server. Please try again.';
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error:', error.message);
        errorMessage = error.message || 'An unexpected error occurred';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
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
                  {timeSlots.map((slot, index) => (
                    <option key={`slot-${index}`} value={slot.label}>
                      {slot.label}
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
