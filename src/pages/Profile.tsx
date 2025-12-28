import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  mobile: string;
  year: string;
  branch: string;
  role: string;
}

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [profile, setProfile] = useState<UserProfile>({
    id: "",
    name: "",
    email: "",
    mobile: "",
    year: "",
    branch: "",
    role: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get("/auth/profile");
      setProfile({
        ...response.data.user,
        mobile: response.data.user.mobile || "",
        year: response.data.user.year || "",
        branch: response.data.user.branch || "",
      });
    } catch (error) {
      toast.error("Failed to fetch profile data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateProfile = async () => {
    if (!profile.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setSubmitting(true);
    try {
      const { name, mobile, year, branch } = profile;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const response = await axios.put("/auth/profile", { name, mobile, year, branch });
      
      // Update local storage user data if needed to reflect name changes immediately across app
      const rawUser = localStorage.getItem("idea_hub_user");
      if (rawUser) {
        const user = JSON.parse(rawUser);
        user.name = name;
        user.mobile = mobile;
        user.year = year;
        user.branch = branch;
        localStorage.setItem("idea_hub_user", JSON.stringify(user));
      }

      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    setSubmitting(true);
    try {
       // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const response = await axios.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      toast.success("Password changed successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl space-y-8">
      <h1 className="text-3xl font-bold text-foreground mb-6">My Profile</h1>

      {/* Profile Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Manage your personal details and contact info.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profile.name}
                disabled={!isEditing}
                onChange={(e) => handleProfileChange("name", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" value={profile.email} disabled className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                value={profile.mobile}
                disabled={!isEditing}
                onChange={(e) => handleProfileChange("mobile", e.target.value)}
                placeholder="+91 9999999999"
              />
            </div>

            {profile.role !== 'coordinator' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Input
                    id="branch"
                    value={profile.branch}
                    disabled={!isEditing}
                    onChange={(e) => handleProfileChange("branch", e.target.value)}
                    placeholder="Ex. Computer Engineering"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Engineering Year</Label>
                  {isEditing ? (
                    <Select
                      value={profile.year}
                      onValueChange={(value) => handleProfileChange("year", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FE">FE (First Year)</SelectItem>
                        <SelectItem value="SE">SE (Second Year)</SelectItem>
                        <SelectItem value="TE">TE (Third Year)</SelectItem>
                        <SelectItem value="BE">BE (Final Year)</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={profile.year || "Not set"} disabled />
                  )}
                </div>
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2 border-t pt-4">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => {
                  fetchProfile(); // Reset changes
                  setIsEditing(false);
              }} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={handleUpdateProfile} disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Profile
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          )}
        </CardFooter>
      </Card>

      {/* Change Password Card */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password securely.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-start border-t pt-4">
          <Button onClick={handleChangePassword} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Change Password
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Profile;
