// import React, { useEffect } from "react";
// import { useAuth } from "../../configs/AuthContext.jsx";
// import LogoutButton from "../../configs/Logout.jsx";
// import { useNavigate } from "react-router-dom";

// const DashboardAdmin = () => {
//   const { user, userData, logout } = useAuth();
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!user) {
//       navigate("/login");
//     }
//   }, [user, navigate]);

//   return (
//     <>
//       {/* <div className="dashboard-container">
//         <h1 className="text-red-500 text-3xl font-bold">
//           Welcome Admin,{" "}
//           {userData?.firstName + " " + userData?.lastName ||
//             user?.displayName ||
//             "Loading..."}
//         </h1>
//         <p>Email: {user?.email}</p>
//       </div> */}
//     </>
//   );
// };

// export default DashboardAdmin;

import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../configs/AuthContext.jsx";
import LogoutButton from "../../configs/Logout.jsx";
import { useNavigate } from "react-router-dom";
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

// Import icons from lucide-react
import {
  BarChart3,
  Bell,
  Calendar,
  Cog,
  DollarSign,
  FileText,
  LogOut,
  Package,
  PieChart,
  Settings,
  ShoppingBag,
  TrendingUp,
  User,
  Users,
} from "lucide-react";

const DashboardAdmin = () => {
  const { user, userData, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <main className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">
            Welcome,
            <span className="text-red-500 font-bold"> Admin </span>
            <span class name="text-blue font-bold">
              {userData?.firstName + " " + userData?.lastName ||
                user?.displayName ||
                "Loading..."}
            </span>
          </h1>
          <p className="text-muted-foreground">
            Email: karanmodi3282@gmail.com
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
              <p className="text-xs text-muted-foreground">
                +2 since last month
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
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$245,678</div>
              <p className="text-xs text-muted-foreground">
                +$12,345 since last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$89,432</div>
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
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates across the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="mr-2 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      New staff member added
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Sarah Johnson joined the team
                    </p>
                  </div>
                  <div className="ml-auto text-xs text-muted-foreground">
                    2h ago
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="mr-2 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Package className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Inventory updated
                    </p>
                    <p className="text-xs text-muted-foreground">
                      25 new items added to stock
                    </p>
                  </div>
                  <div className="ml-auto text-xs text-muted-foreground">
                    5h ago
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="mr-2 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Sales milestone reached
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Monthly target exceeded by 15%
                    </p>
                  </div>
                  <div className="ml-auto text-xs text-muted-foreground">
                    1d ago
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-2xl font-bold mb-4">Management</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Management</CardTitle>
              <CardDescription>Manage your business operations</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center gap-4">
                <Cog className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Business Operations</p>
                  <p className="text-sm text-muted-foreground">
                    Manage locations and departments
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Staff Management</p>
                  <p className="text-sm text-muted-foreground">
                    Oversee employee information
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Inventory Control</p>
                  <p className="text-sm text-muted-foreground">
                    Track and manage products
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <Link to="/management">Go to Management</Link>
              </Button>
            </CardFooter>
          </Card>

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
                <Link to="/reports">Go to Reports</Link>
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
                <Link to="/requests">Go to Requests</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Settings</CardTitle>
              <CardDescription>Configure your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-4">
                <Settings className="h-12 w-12 text-primary/50" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <Link to="/settings">Go to Settings</Link>
              </Button>
            </CardFooter>
          </Card>

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
                <Link to="/notifications">Go to Notifications</Link>
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
                <Link to="/profile">Go to Profile</Link>
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
