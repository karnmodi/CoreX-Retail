import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../configs/AuthContext.jsx";
import LogoutButton from "../../configs/Logout.jsx";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LoadingSpinner from "../../components/Loading.jsx";
import { useStaff } from "../../configs/StaffContext.jsx";
import { useProfile } from "../../configs/ProfileContext.jsx";
import NotificationHeader from "../../components/NotificationHeader.jsx";

// Import icons from lucide-react
import {
  BarChart3,
  Bell,
  Calendar,
  Clock,
  FileText,
  Package,
  PoundSterling,
  Settings,
  ShoppingBag,
  TrendingUp,
  User,
  Users,
  Loader2,
  RefreshCw,
  FileEdit,
  Key,
  UserCheck,
  UserX,
  LogIn,
} from "lucide-react";
import { useInventory } from "../../configs/InventoryContext";
import { useToast } from "../../components/ui/use-toast.jsx";
import { Separator } from "@/components/ui/separator";

const DashboardAdmin = () => {
  const { user, userData, logout } = useAuth();
  const navigate = useNavigate();
  const { staff, newStaffCount } = useStaff();
  const [refreshingActivities, setRefreshingActivities] = useState(false);
  const { inventoryValue, formatCurrency, refreshInventoryValue } =
    useInventory();
  const {
    activityData,
    activityLoading,
    activityError,
    fetchActivityData,
  } = useProfile();

  useEffect(() => {
    const loadActivityData = async () => {
      try {
        await fetchActivityData(5);
      } catch (error) {
        console.error("Error loading activity data:", error);
      }
    };

    loadActivityData();
  }, [fetchActivityData]);

  const { toast } = useToast();

  const getChangeColor = () => {
    if (inventoryValue.change > 0) return "text-green-600";
    if (inventoryValue.change < 0) return "text-red-600";
    return "text-gray-500";
  };

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

  const formatChange = () => {
    const prefix = inventoryValue.change >= 0 ? "+" : "";
    return `${prefix}${formatCurrency(inventoryValue.change)} since last month`;
  };

  const handleValueRefresh = () => {
    refreshInventoryValue();
    toast({
      title: "Refreshing",
      description: "Updating inventory value data...",
    });
  };

  const handleRefreshActivities = async () => {
    setRefreshingActivities(true);
    try {
      await fetchActivityData(5);
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

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <main className="container mx-auto px-4 py-6">
        <div className="mb-8 flex justify-between items-start">
          {/* Left Side: Welcome Text */}
          <div>
            <h1 className="text-3xl font-bold text-primary flex flex-wrap items-center gap-2">
              Welcome,
              <span className="text-red-500 font-bold">Admin</span>
              <span className="text-blue-600 font-bold">
                {userData?.firstName + " " + userData?.lastName ||
                  user?.displayName || <LoadingSpinner />}
              </span>
            </h1>
            <p className="text-muted-foreground mt-1">
              {userData?.email || "Not Found"}
            </p>
          </div>

          {/* Right Side: Notification Icon */}
          <div className="ml-auto">
            <NotificationHeader />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{staff.length}</div>
              <p className="text-xs text-muted-foreground">
                +{newStaffCount} since last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Roster Coverage
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98%</div>
              <p className="text-xs text-muted-foreground">
                +4% since last week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Inventory Value
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleValueRefresh}
                  disabled={inventoryValue.isLoading}
                  className="p-0 h-8 w-8"
                >
                  {inventoryValue.isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
                <Package className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              {inventoryValue.isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    Loading...
                  </span>
                </div>
              ) : inventoryValue.error ? (
                <div className="text-sm text-red-500">Error loading data</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {formatCurrency(inventoryValue.currentValue)}
                  </div>
                  <p className={`text-xs ${getChangeColor()}`}>
                    {formatChange()}
                    {inventoryValue.percentChange !== 0 && (
                      <span className="ml-1">
                        ({inventoryValue.percentChange > 0 ? "+" : ""}
                        {inventoryValue.percentChange.toFixed(1)}%)
                      </span>
                    )}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <PoundSterling className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£89,432</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>Monthly sales performance</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                <BarChart3 className="h-16 w-16 text-muted-foreground/50" />
                <span className="ml-2 text-muted-foreground">
                  Sales chart will appear here
                </span>
              </div>
            </CardContent>
          </Card>
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
                            <h3 className="font-medium">{activity.title}</h3>
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
        </div>

        <h2 className="text-2xl font-bold mb-4">Reports & Requests</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Reports</CardTitle>
              <CardDescription>Access business analytics</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center gap-4">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Sales Reports</p>
                  <p className="text-sm text-muted-foreground">
                    View sales performance data
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Package className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Inventory Reports</p>
                  <p className="text-sm text-muted-foreground">
                    Track stock levels and movement
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Staff Reports</p>
                  <p className="text-sm text-muted-foreground">
                    Monitor employee performance
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <Link to="./more/reports">Go to Reports</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Requests</CardTitle>
              <CardDescription>Manage time off and supplies</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center gap-4">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Time Off Requests</p>
                  <p className="text-sm text-muted-foreground">
                    Manage employee leave
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Supply Requests</p>
                  <p className="text-sm text-muted-foreground">
                    Handle inventory orders
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Other Requests</p>
                  <p className="text-sm text-muted-foreground">
                    Manage miscellaneous requests
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <Link to="./more/requests">Go to Requests</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <CardDescription>View your alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-4">
                <Bell className="h-12 w-12 text-primary/50" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <Link to="./more/notifications">Go to Notifications</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Profile</CardTitle>
              <CardDescription>Manage your information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-4">
                <User className="h-12 w-12 text-primary/50" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <Link to="./more/profile">Go to Profile</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="flex justify-center">
          <LogoutButton />
        </div>
      </main>
    </div>
  );
};

export default DashboardAdmin;
