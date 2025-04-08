import React, { useState, useEffect } from "react";
import { useProfile } from "../../configs/ProfileContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  FileText,
  Mail,
  Phone,
  User,
  Upload,
  Check,
  Loader2,
  RefreshCw,
  Lock,
  Edit,
  Key,
  FileEdit,
  UserCheck,
  LogIn,
  Settings,
  UserX,
  AlertCircle,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import ProfilePanel  from "@/components/ProfilePanel";

// Map activity types to appropriate icons
const ActivityIcon = ({ type }) => {
  switch (type) {
    case "login":
      return <LogIn className="h-5 w-5 text-primary" />;
    case "profile_update":
      return <FileEdit className="h-5 w-5 text-primary" />;
    case "password_change":
      return <Key className="h-5 w-5 text-primary" />;
    case "profile_picture_update":
      return <UserCheck className="h-5 w-5 text-primary" />;
    case "logout":
      return <UserX className="h-5 w-5 text-primary" />;
    case "settings_update":
      return <Settings className="h-5 w-5 text-primary" />;
    default:
      return <FileText className="h-5 w-5 text-primary" />;
  }
};

function ProfilePage() {
  const {
    profileData,
    isLoading,
    error,
    isUpdating,
    updateUserProfile,
    uploadUserProfilePicture,
    getInitials,
    getFullName,
    activityData,
    activityLoading,
    activityError,
    fetchActivityData,
  } = useProfile();

  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [refreshingActivities, setRefreshingActivities] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    notes: "",
    department: "",
    role: "",
  });

  useEffect(() => {
    const loadActivityData = async () => {
      try {
        await fetchActivityData(10);
      } catch (error) {
        console.error("Error loading activity data:", error);
      }
    };

    loadActivityData();
  }, [fetchActivityData]);

  useEffect(() => {
    if (profileData) {
      setFormData({
        firstName: profileData.firstName || "",
        lastName: profileData.lastName || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        location: profileData.location || profileData.state || "",
        notes: profileData.notes || "",
        department: profileData.departmentType || "",
        role: profileData.role || "",
      });
    }
  }, [profileData]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    try {
      await updateUserProfile(formData);

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
        variant: "success",
      });

      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Update Failed",
        description:
          error.message || "There was an error updating your profile.",
        variant: "destructive",
      });
    }
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      await uploadUserProfilePicture(file);

      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been successfully updated.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description:
          error.message || "There was an error uploading your profile picture.",
        variant: "destructive",
      });
    }
  };

  const handleRefreshActivities = async () => {
    setRefreshingActivities(true);
    try {
      await fetchActivityData(10);
      toast({
        title: "Activities Refreshed",
        description: "Your activity list has been updated.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh activities. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRefreshingActivities(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive text-lg font-medium">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>No profile data available. Please log in again.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <header className="border-b">
        <div className="container py-4">
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">
            View and manage your profile information
          </p>
        </div>
      </header>
      <main className="flex-1 p-6">
        <div className="grid gap-6 md:grid-cols-[300px_1fr]">
          <ProfilePanel
            profileData={profileData}
            isUpdating={isUpdating}
            handleProfilePictureChange={handleProfilePictureChange}
            getFullName={getFullName}
            getInitials={getInitials}
          />
          <div className="space-y-6">
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About Me</CardTitle>
                    <CardDescription>Your personal information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Full Name
                          </Label>
                          <p>{getFullName()}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Email
                          </Label>
                          <p>{profileData.email}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Phone
                          </Label>
                          <p>{profileData.phone || "Not specified"}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Location
                          </Label>
                          <p>
                            {profileData.state ||
                              profileData.location ||
                              "Not specified"}
                          </p>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Bio
                        </Label>
                        <p className="text-sm">
                          {profileData.bio ||
                            profileData.jobFunctionDescription ||
                            "No bio specified"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Work Information</CardTitle>
                    <CardDescription>Your professional details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Role
                          </Label>
                          <p>{profileData.role || "Not specified"}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Department
                          </Label>
                          <p>{profileData.departmentType || "Not specified"}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Employee ID
                          </Label>
                          <p>{profileData.empId || "Not assigned"}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Start Date
                          </Label>
                          <p>{profileData.startDate || "Not specified"}</p>
                        </div>
                        {profileData.employeeType && (
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Employee Type
                            </Label>
                            <p>{profileData.employeeType}</p>
                          </div>
                        )}
                        {profileData.employeeStatus && (
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Status
                            </Label>
                            <p>{profileData.employeeStatus}</p>
                          </div>
                        )}
                      </div>
                      {profileData.supervisor && (
                        <>
                          <Separator />
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Supervisor
                            </Label>
                            <p className="text-sm">{profileData.supervisor}</p>
                          </div>
                        </>
                      )}
                      {profileData.jobFunctionDescription && (
                        <>
                          <Separator />
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Job Description
                            </Label>
                            <p className="text-sm">
                              {profileData.jobFunctionDescription}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="activity" className="mt-6 space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>
                        Your recent actions and updates
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefreshActivities}
                      disabled={refreshingActivities}
                    >
                      {refreshingActivities ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {activityLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : activityError ? (
                      <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <AlertCircle className="h-8 w-8 text-destructive" />
                        <p className="text-destructive">{activityError}</p>
                        <Button
                          onClick={handleRefreshActivities}
                          variant="outline"
                          size="sm"
                        >
                          Try Again
                        </Button>
                      </div>
                    ) : activityData && activityData.length > 0 ? (
                      <div className="space-y-4">
                        {activityData.map((activity, index) => (
                          <React.Fragment key={activity.id || index}>
                            <div className="flex items-start">
                              <div className="mr-4 h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                                <ActivityIcon type={activity.type} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-medium">
                                    {activity.title}
                                  </h3>
                                  <span className="text-xs text-muted-foreground">
                                    {activity.timestamp}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {activity.description}
                                </p>
                              </div>
                            </div>
                            {index < activityData.length - 1 && <Separator />}
                          </React.Fragment>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <Clock className="h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          No activity recorded yet.
                        </p>
                        <p className="text-xs text-muted-foreground text-center max-w-md">
                          Your recent account activities will appear here.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="settings" className="mt-6 space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Profile Settings</CardTitle>
                      <CardDescription>
                        Update your profile information
                      </CardDescription>
                    </div>
                    {!isEditing && (
                      <Button onClick={() => setIsEditing(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            disabled={!isEditing || isUpdating}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            disabled={!isEditing || isUpdating}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <div className="relative">
                            <Input
                              id="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              disabled={true}
                            />
                            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            disabled={!isEditing || isUpdating}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            disabled={!isEditing || isUpdating}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="department">Department</Label>
                          <Input
                            id="department"
                            value={formData.department}
                            onChange={handleInputChange}
                            disabled={!isEditing || isUpdating}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">Role</Label>
                          <Input
                            id="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            // disabled={!isEditing || isUpdating}
                            disabled={true}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">notes</Label>
                        <Textarea
                          id="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          disabled={!isEditing || isUpdating}
                          rows={4}
                        />
                      </div>
                      {isEditing && (
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                            disabled={isUpdating}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={isUpdating}>
                            {isUpdating ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Check className="mr-2 h-4 w-4" />
                                Save Changes
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;
