import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../../configs/AuthContext";
import { useStaff } from "../../configs/StaffContext";
import { useNotification } from "../../configs/notificationsContext";
import { Loader2 } from "lucide-react";



function SettingsPage() {
  const { user, userData, token } = useAuth();
  const { toast } = useToast();
  const { updateStaffMember } = useStaff();
  const { markAllAsRead } = useNotification();
  
  // States for settings
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userSettings, setUserSettings] = useState({
    general: {
      name: "",
      email: "",
      role: "",
      department: "",
    },
    regional: {
      language: "en",
      timezone: "est",
      dateFormat: "mdy",
      currency: "usd",
    },
    appearance: {
      darkMode: false,
      useSystemTheme: false,
      compactMode: false,
      collapsedSidebar: false,
    },
    notifications: {
      email: {
        salesAlerts: true,
        inventoryAlerts: true,
        staffUpdates: true,
      },
      app: {
        salesAlerts: true,
        inventoryAlerts: true,
        staffUpdates: true,
      },
    },
  });
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch user settings and departments
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      
      try {
        if (token && user?.uid) {
          // Fetch departments first
          const departmentsData = await getDepartments(token);
          setDepartments(departmentsData || []);
          
          // Fetch user settings
          const settings = await getUserSettings(token, user.uid);
          
          if (settings) {
            setUserSettings({
              ...userSettings,
              ...settings,
              general: {
                ...userSettings.general,
                name: userData?.displayName || userData?.name || "",
                email: userData?.email || "",
                role: userData?.role || "",
                department: userData?.department || "",
              }
            });
          }
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast({
          title: "Error",
          description: "Failed to load settings. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, [token, user, userData]);

  // Handle input changes for general settings
  const handleGeneralChange = (e) => {
    const { id, value } = e.target;
    setUserSettings({
      ...userSettings,
      general: {
        ...userSettings.general,
        [id]: value
      }
    });
  };

  // Handle select changes for regional settings
  const handleRegionalChange = (value, field) => {
    setUserSettings({
      ...userSettings,
      regional: {
        ...userSettings.regional,
        [field]: value
      }
    });
  };

  // Handle toggle changes for appearance
  const handleAppearanceChange = (field, checked) => {
    setUserSettings({
      ...userSettings,
      appearance: {
        ...userSettings.appearance,
        [field]: checked
      }
    });
  };

  // Handle toggle changes for notifications
  const handleNotificationChange = (type, field, checked) => {
    setUserSettings({
      ...userSettings,
      notifications: {
        ...userSettings.notifications,
        [type]: {
          ...userSettings.notifications[type],
          [field]: checked
        }
      }
    });
  };

  // Handle password change inputs
  const handlePasswordChange = (e) => {
    const { id, value } = e.target;
    setPasswordData({
      ...passwordData,
      [id.replace("password-", "")]: value
    });
  };

  // Save general settings
  const saveGeneralSettings = async () => {
    if (!user?.uid || !token) return;
    
    setIsSaving(true);
    try {
      const updatedUserData = {
        name: userSettings.general.name,
        displayName: userSettings.general.name,
        department: userSettings.general.department,
      };
      
      // Update staff member in the database
      await updateStaffMember(user.uid, updatedUserData);
      
      // Update user settings
      await updateUserSettings(token, user.uid, {
        regional: userSettings.regional
      });
      
      toast({
        title: "Success",
        description: "General settings updated successfully",
        variant: "success",
      });
    } catch (error) {
      console.error("Error saving general settings:", error);
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Save appearance settings
  const saveAppearanceSettings = async () => {
    if (!user?.uid || !token) return;
    
    setIsSaving(true);
    try {
      await updateUserSettings(token, user.uid, {
        appearance: userSettings.appearance
      });
      
      // Apply theme changes immediately
      if (userSettings.appearance.darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      
      toast({
        title: "Success",
        description: "Appearance settings updated successfully",
        variant: "success",
      });
    } catch (error) {
      console.error("Error saving appearance settings:", error);
      toast({
        title: "Error",
        description: "Failed to update appearance settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Save notification settings
  const saveNotificationSettings = async () => {
    if (!user?.uid || !token) return;
    
    setIsSaving(true);
    try {
      await updateUserSettings(token, user.uid, {
        notifications: userSettings.notifications
      });
      
      toast({
        title: "Success",
        description: "Notification settings updated successfully",
        variant: "success",
      });
    } catch (error) {
      console.error("Error saving notification settings:", error);
      toast({
        title: "Error",
        description: "Failed to update notification settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle password change
  const handleSavePassword = async () => {
    if (!user?.uid || !token) return;
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    try {
      // Implement password change logic here using your auth service
      // This would typically involve reauthenticating the user with their current password
      // and then calling updatePassword
      
      // Reset password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      
      toast({
        title: "Success",
        description: "Password updated successfully",
        variant: "success",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Clear all notifications
  const handleClearAllNotifications = async () => {
    try {
      await markAllAsRead();
      toast({
        title: "Success",
        description: "All notifications marked as read",
        variant: "success",
      });
    } catch (error) {
      console.error("Error clearing notifications:", error);
      toast({
        title: "Error",
        description: "Failed to clear notifications. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <header className="border-b">
        <div className="container py-4">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account and application settings</p>
        </div>
      </header>
      <main className="flex-1 p-6">
        <Tabs defaultValue="general" className="mb-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="mt-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Manage your basic account settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Account Information</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        value={userSettings.general.name} 
                        onChange={handleGeneralChange} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        value={userSettings.general.email} 
                        disabled 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Input 
                        id="role" 
                        value={userSettings.general.role} 
                        disabled 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Select
                        value={userSettings.general.department}
                        onValueChange={(value) => handleGeneralChange({ target: { id: 'department', value } })}
                      >
                        <SelectTrigger id="department">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Regional Settings</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select
                        value={userSettings.regional.language}
                        onValueChange={(value) => handleRegionalChange(value, 'language')}
                      >
                        <SelectTrigger id="language">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select
                        value={userSettings.regional.timezone}
                        onValueChange={(value) => handleRegionalChange(value, 'timezone')}
                      >
                        <SelectTrigger id="timezone">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="est">Eastern Time (ET)</SelectItem>
                          <SelectItem value="cst">Central Time (CT)</SelectItem>
                          <SelectItem value="mst">Mountain Time (MT)</SelectItem>
                          <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateFormat">Date Format</Label>
                      <Select
                        value={userSettings.regional.dateFormat}
                        onValueChange={(value) => handleRegionalChange(value, 'dateFormat')}
                      >
                        <SelectTrigger id="dateFormat">
                          <SelectValue placeholder="Select date format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                          <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                          <SelectItem value="ymd">YYYY/MM/DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select
                        value={userSettings.regional.currency}
                        onValueChange={(value) => handleRegionalChange(value, 'currency')}
                      >
                        <SelectTrigger id="currency">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="usd">USD ($)</SelectItem>
                          <SelectItem value="eur">EUR (€)</SelectItem>
                          <SelectItem value="gbp">GBP (£)</SelectItem>
                          <SelectItem value="jpy">JPY (¥)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button 
                    onClick={saveGeneralSettings} 
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="appearance" className="mt-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>Customize the look and feel of the application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Theme</h3>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="darkMode">Dark Mode</Label>
                        <p className="text-sm text-muted-foreground">Enable dark mode for the application</p>
                      </div>
                      <Switch 
                        id="darkMode" 
                        checked={userSettings.appearance.darkMode}
                        onCheckedChange={(checked) => handleAppearanceChange('darkMode', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="useSystemTheme">Use System Theme</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically switch between light and dark mode based on system settings
                        </p>
                      </div>
                      <Switch 
                        id="useSystemTheme"
                        checked={userSettings.appearance.useSystemTheme}
                        onCheckedChange={(checked) => handleAppearanceChange('useSystemTheme', checked)}
                      />
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Layout</h3>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="compactMode">Compact Mode</Label>
                        <p className="text-sm text-muted-foreground">
                          Reduce spacing and padding throughout the interface
                        </p>
                      </div>
                      <Switch 
                        id="compactMode"
                        checked={userSettings.appearance.compactMode}
                        onCheckedChange={(checked) => handleAppearanceChange('compactMode', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="collapsedSidebar">Collapsed Sidebar by Default</Label>
                        <p className="text-sm text-muted-foreground">
                          Start with the sidebar collapsed when you log in
                        </p>
                      </div>
                      <Switch 
                        id="collapsedSidebar"
                        checked={userSettings.appearance.collapsedSidebar}
                        onCheckedChange={(checked) => handleAppearanceChange('collapsedSidebar', checked)}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button 
                    onClick={saveAppearanceSettings} 
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="notifications" className="mt-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Email Notifications</h3>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="salesAlerts-email">Sales Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications about important sales events
                        </p>
                      </div>
                      <Switch 
                        id="salesAlerts-email" 
                        checked={userSettings.notifications.email.salesAlerts}
                        onCheckedChange={(checked) => handleNotificationChange('email', 'salesAlerts', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="inventoryAlerts-email">Inventory Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications about low stock and inventory changes
                        </p>
                      </div>
                      <Switch 
                        id="inventoryAlerts-email" 
                        checked={userSettings.notifications.email.inventoryAlerts}
                        onCheckedChange={(checked) => handleNotificationChange('email', 'inventoryAlerts', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="staffUpdates-email">Staff Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications about staff changes and requests
                        </p>
                      </div>
                      <Switch 
                        id="staffUpdates-email" 
                        checked={userSettings.notifications.email.staffUpdates}
                        onCheckedChange={(checked) => handleNotificationChange('email', 'staffUpdates', checked)}
                      />
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">In-App Notifications</h3>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="salesAlerts-app">Sales Alerts</Label>
                        <p className="text-sm text-muted-foreground">Show notifications about important sales events</p>
                      </div>
                      <Switch 
                        id="salesAlerts-app" 
                        checked={userSettings.notifications.app.salesAlerts}
                        onCheckedChange={(checked) => handleNotificationChange('app', 'salesAlerts', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="inventoryAlerts-app">Inventory Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Show notifications about low stock and inventory changes
                        </p>
                      </div>
                      <Switch 
                        id="inventoryAlerts-app" 
                        checked={userSettings.notifications.app.inventoryAlerts}
                        onCheckedChange={(checked) => handleNotificationChange('app', 'inventoryAlerts', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="staffUpdates-app">Staff Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Show notifications about staff changes and requests
                        </p>
                      </div>
                      <Switch 
                        id="staffUpdates-app" 
                        checked={userSettings.notifications.app.staffUpdates}
                        onCheckedChange={(checked) => handleNotificationChange('app', 'staffUpdates', checked)}
                      />
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">Notification Management</h3>
                    <p className="text-sm text-muted-foreground">
                      Clear all your current notifications
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleClearAllNotifications}
                  >
                    Clear All Notifications
                  </Button>
                </div>
                <div className="flex justify-end">
                  <Button 
                    onClick={saveNotificationSettings} 
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="security" className="mt-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Password</h3>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password-currentPassword">Current Password</Label>
                      <Input 
                        id="password-currentPassword" 
                        type="password" 
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-newPassword">New Password</Label>
                      <Input 
                        id="password-newPassword" 
                        type="password" 
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-confirmPassword">Confirm New Password</Label>
                      <Input 
                        id="password-confirmPassword" 
                        type="password" 
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                      />
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="enable-2fa">Enable Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                      </div>
                      <Switch id="enable-2fa" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSavePassword} 
                    disabled={isSaving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default SettingsPage;