import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, FileText, Mail, Phone, User } from "lucide-react";

function ProfilePage() {
  return (
    <div className="flex flex-col">
      <header className="border-b">
        <div className="container py-4">
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">View and manage your profile information</p>
        </div>
      </header>
      <main className="flex-1 p-6">
        <div className="grid gap-6 md:grid-cols-[300px_1fr]">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/placeholder.svg" alt="Karan Modi" />
                  <AvatarFallback>KM</AvatarFallback>
                </Avatar>
                <div className="space-y-1 text-center">
                  <h2 className="text-xl font-bold">Karan Modi</h2>
                  <p className="text-sm text-muted-foreground">Administrator</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">
                    Management
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Sales
                  </Badge>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <User className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
              <Separator className="my-6" />
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">karanmodi3282@gmail.com</span>
                </div>
                <div className="flex items-center">
                  <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">+44 786 706 4191</span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Eastern Time (ET)</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Joined January 2022</span>
                </div>
              </div>
            </CardContent>
          </Card>
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
                          <Label className="text-xs text-muted-foreground">Full Name</Label>
                          <p>Karan Modi</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Email</Label>
                          <p>karanmodi3282@gmail.com</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Phone</Label>
                          <p>+44 786 706 4191</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Location</Label>
                          <p>Leicester, UK</p>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <Label className="text-xs text-muted-foreground">Bio</Label>
                        <p className="text-sm">
                          Retail management professional with over 5 years of experience in inventory management, staff
                          supervision, and sales optimization. Passionate about creating efficient systems and
                          delivering exceptional customer experiences.
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
                          <Label className="text-xs text-muted-foreground">Role</Label>
                          <p>Administrator</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Department</Label>
                          <p>Management</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Employee ID</Label>
                          <p>EMP-001</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Start Date</Label>
                          <p>January 15, 2022</p>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <Label className="text-xs text-muted-foreground">Responsibilities</Label>
                        <p className="text-sm">
                          Overseeing all retail operations, managing inventory systems, supervising staff, analyzing
                          sales data, and implementing strategies to improve store performance.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="activity" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your recent actions and updates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="mr-4 h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">Generated Sales Report</h3>
                            <span className="text-xs text-muted-foreground">2 hours ago</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            You generated the monthly sales performance report
                          </p>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-start">
                        <div className="mr-4 h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">Updated Profile</h3>
                            <span className="text-xs text-muted-foreground">Yesterday</span>
                          </div>
                          <p className="text-sm text-muted-foreground">You updated your profile information</p>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-start">
                        <div className="mr-4 h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">Approved Time Off Request</h3>
                            <span className="text-xs text-muted-foreground">2 days ago</span>
                          </div>
                          <p className="text-sm text-muted-foreground">You approved Sarah Williams' time off request</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="settings" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>Update your profile information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="full-name">Full Name</Label>
                          <Input id="full-name" defaultValue="Karan Modi" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" defaultValue="karanmodi3282@gmail.com" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input id="phone" defaultValue="+1 (555) 123-4567" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input id="location" defaultValue="New York, NY" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Input
                          id="bio"
                          defaultValue="Retail management professional with over 5 years of experience..."
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button>Save Changes</Button>
                      </div>
                    </div>
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