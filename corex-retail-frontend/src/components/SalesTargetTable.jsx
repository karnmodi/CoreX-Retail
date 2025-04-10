import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

export function SalesTargetsTable({ targets = [] }) {
  if (!targets || targets.length === 0) {
    return (
      <div className="py-4 text-center text-muted-foreground">
        No sales targets found. Create a new target to get started.
      </div>
    );
  }

  // Function to display target type in a readable format
  const formatTargetType = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Function to get badge color based on achievement percentage
  const getProgressBadgeColor = (achieved, target) => {
    if (!achieved || !target) return "bg-gray-500";
    
    const percentage = (achieved / target) * 100;
    
    if (percentage >= 100) return "bg-green-500";
    if (percentage >= 75) return "bg-green-400";
    if (percentage >= 50) return "bg-yellow-500";
    if (percentage >= 25) return "bg-orange-500";
    return "bg-red-500";
  };

  // Function to format period display
  const formatPeriod = (period, targetType) => {
    const parts = period.split('-');
    
    if (targetType === 'yearly') {
      return parts[0]; // Just the year
    }
    
    if (targetType === 'quarterly') {
      return `Q${parts[1].replace('Q', '')} ${parts[0]}`;
    }
    
    if (targetType === 'monthly') {
      const month = new Date(`${parts[0]}-${parts[1]}-01`).toLocaleString('default', { month: 'long' });
      return `${month} ${parts[0]}`;
    }
    
    if (targetType === 'daily') {
      return new Date(period).toLocaleDateString();
    }
    
    return period;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Period</TableHead>
            <TableHead>Target Amount</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {targets.map((target) => {
            // This would come from the summary in actual implementation
            const achieved = 0; // Placeholder
            const percentage = 0; // Placeholder
            
            return (
              <TableRow key={`${target.targetType}-${target.period}`}>
                <TableCell>
                  <Badge variant="outline">{formatTargetType(target.targetType)}</Badge>
                </TableCell>
                <TableCell className="font-medium">{formatPeriod(target.period, target.targetType)}</TableCell>
                <TableCell>£{target.amount.toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-full rounded-full ${getProgressBadgeColor(achieved, target.amount)}`}
                        style={{ width: `${Math.min(percentage || 0, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs">{percentage?.toFixed(1) || 0}%</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px] truncate">{target.description || "-"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}