import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, Upload } from "lucide-react";
import { Loader2 } from "lucide-react";


const ProfilePanel = ({ profileData, isUpdating, handleProfilePictureChange, getFullName, getInitials }) => {
    const getStatusColor = (status) => {
      switch (status?.toLowerCase()) {
        case 'active': return 'bg-green-500';
        case 'on leave': return 'bg-amber-500';
        case 'inactive': return 'bg-slate-400';
        case 'terminated': return 'bg-red-500';
        default: return 'bg-slate-400';
      }
    };
  
    const calculateTenure = (startDate) => {
      if (!startDate) return null;
      
      try {
        const start = new Date(startDate);
        const now = new Date();
        const diffYears = now.getFullYear() - start.getFullYear();
        const diffMonths = now.getMonth() - start.getMonth();
        const totalMonths = (diffYears * 12) + diffMonths;
        
        if (totalMonths < 12) {
          return `${totalMonths} month${totalMonths !== 1 ? 's' : ''}`;
        } else {
          const years = Math.floor(totalMonths / 12);
          const months = totalMonths % 12;
          return `${years} year${years !== 1 ? 's' : ''}${months > 0 ? `, ${months} month${months !== 1 ? 's' : ''}` : ''}`;
        }
      } catch (e) {
        return null;
      }
    };
  
    const tenureDisplay = calculateTenure(profileData?.startDate);
    
    return (
      <Card className="border-none shadow-md overflow-hidden">
        {/* Background gradient header */}
        <div className="relative h-32 bg-gradient-to-r from-primary/80 to-primary/40">
          <div className="absolute inset-0 bg-grid-white/5" />
        </div>
        
        <CardContent className="p-0 relative">
          {/* Profile picture with positioning on top of gradient */}
          <div className="flex flex-col items-center -mt-16 px-6">
            <div className="relative mb-4">
              <div className="p-1 rounded-full bg-background">
                <Avatar className="h-32 w-32 ring-4 ring-background">
                  <AvatarImage
                    src={profileData?.profilePicture}
                    alt={getFullName()}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-3xl bg-primary/10">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <label
                htmlFor="profile-picture"
                className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer shadow-lg hover:bg-primary/90 transition-colors"
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                <input
                  type="file"
                  id="profile-picture"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  disabled={isUpdating}
                />
              </label>
              
              {/* Status indicator */}
              <div className="absolute top-2 right-2 flex items-center">
                <span className={`h-3 w-3 rounded-full ${getStatusColor(profileData?.employeeStatus)} animate-pulse`} />
              </div>
            </div>
            
            <div className="space-y-1 text-center mb-4">
              <h2 className="text-2xl font-bold tracking-tight">{getFullName()}</h2>
              <div className="flex items-center justify-center gap-1 text-sm font-medium text-muted-foreground">
                <span>{profileData?.role || "Employee"}</span>
                <span className="text-xs">•</span>
                <span className="inline-flex items-center">
                  <span className={`mr-1.5 h-2 w-2 rounded-full ${getStatusColor(profileData?.employeeStatus)}`}></span>
                  {profileData?.employeeStatus || "Active"}
                </span>
              </div>
            </div>
            
            {/* Employee ID badge */}
            <div className="w-full mb-6">
              <div className="relative mx-auto max-w-[200px] p-2 bg-muted/50 rounded-lg text-center border border-border/30">
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 px-2 bg-white text-xs font-semibold text-muted-foreground">
                  EMPLOYEE ID
                </div>
                <div className="font-mono text-lg font-bold tracking-wider">
                  {profileData?.empId || "---"}
                </div>
              </div>
            </div>
            
            {/* Badges row */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <Badge variant="secondary" className="px-3 py-1">
                {profileData?.departmentType || "Department"}
              </Badge>
             
              <Badge variant="outline" className="px-3 py-1 border-primary/20 bg-primary/5">
                {profileData?.classificationType || "Classification"}
              </Badge>
            </div>
          </div>
          
          
          {/* Info cards in a grid */}
          <div className="grid gap-3 px-6 mb-6">
            <div className="flex space-x-4 items-center bg-muted/30 p-3 rounded-md">
              <div className="rounded-full bg-primary/10 p-2">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 truncate">
                <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                <p className="text-sm font-medium truncate">{profileData?.email}</p>
              </div>
            </div>
            
            {profileData?.phone && (
              <div className="flex space-x-4 items-center bg-muted/30 p-3 rounded-md">
                <div className="rounded-full bg-primary/10 p-2">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                  <p className="text-sm font-medium">{profileData?.phone}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Employment timeline */}
          <div className="px-6 mb-6">
            <h3 className="text-sm font-medium mb-2">Employment Timeline</h3>
            <div className="relative pl-6 pb-1">
              <div className="absolute left-0 top-1 h-full w-[2px] bg-muted"></div>
              
              {profileData?.startDate && (
                <div className="relative mb-4">
                  <div className="absolute left-[-9px] top-1 h-4 w-4 rounded-full bg-primary"></div>
                  <div className="text-xs text-muted-foreground mb-1">{profileData.startDate}</div>
                  <div className="text-sm font-medium">Joined as {profileData.role || "Employee"}</div>
                  {tenureDisplay && (
                    <div className="text-xs font-medium text-primary mt-1">
                      {tenureDisplay} with the company
                    </div>
                  )}
                </div>
              )}
              
              {/* Add promotions or other employment events here */}
              <div className="relative">
                <div className="absolute left-[-6px] top-1 h-2 w-2 rounded-full bg-muted-foreground"></div>
                <div className="text-xs text-muted-foreground mb-1">Present</div>
                <div className="text-sm font-medium">
                  {profileData?.currentEmployeeRating 
                    ? `Current rating: ${profileData.currentEmployeeRating}`
                    : "Current position"}
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick stats section */}
          <div className="bg-muted/30 p-6 rounded-t-xl mt-4">
            <h3 className="text-sm font-medium mb-4">Employee Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Department</p>
                <p className="text-sm font-medium">{profileData?.departmentType || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Location</p>
                <p className="text-sm font-medium">{profileData?.location || profileData?.state || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Division</p>
                <p className="text-sm font-medium">{profileData?.division || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Supervisor</p>
                <p className="text-sm font-medium">{profileData?.supervisor || "—"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  export default ProfilePanel;
  
