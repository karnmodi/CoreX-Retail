import React, { useState } from "react";
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
import { Edit, Trash2, Check, X, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSales } from "@/configs/SalesContext";

export function SalesTargetsTable({ targets = [], onEditTarget }) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetToDelete, setTargetToDelete] = useState(null);
  const { deleteSalesTarget, loading } = useSales();
  if (!targets || targets.length === 0) {
    return (
      <div className="py-4 text-center text-muted-foreground">
        No sales targets found. Create a new target to get started.
      </div>
    );
  }

  const formatTargetType = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

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
    const parts = period.split("-");

    if (targetType === "yearly") {
      return parts[0]; // Just the year
    }

    if (targetType === "quarterly") {
      return `Q${parts[1].replace("Q", "")} ${parts[0]}`;
    }

    if (targetType === "monthly") {
      const month = new Date(`${parts[0]}-${parts[1]}-01`).toLocaleString(
        "default",
        { month: "long" }
      );
      return `${month} ${parts[0]}`;
    }

    if (targetType === "daily") {
      return new Date(period).toLocaleDateString();
    }

    return period;
  };

  // Calculate achievement percentage using the target's summary if available
  const getTargetAchievement = (target) => {
    const achieved = target.achieved || 0;
    const percentage = target.amount > 0 ? (achieved / target.amount) * 100 : 0;

    return { achieved, percentage };
  };

  const handleDeleteTarget = async () => {
    if (!targetToDelete) return;

    try {
      const result = await deleteSalesTarget(targetToDelete);
      console.log("Delete result:", result);

      if (result) {
        setDeleteConfirmOpen(false);
        setTargetToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting target:", error);
    }
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
            const { achieved, percentage } = getTargetAchievement(target);

            return (
              <TableRow key={`${target.targetType}-${target.period}`}>
                <TableCell>
                  <Badge variant="outline">
                    {formatTargetType(target.targetType)}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  {formatPeriod(target.period, target.targetType)}
                </TableCell>
                <TableCell>£{target.amount.toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-full rounded-full ${getProgressBadgeColor(
                          achieved,
                          target.amount
                        )}`}
                        style={{ width: `${Math.min(percentage || 0, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs">
                      {percentage?.toFixed(1) || 0}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {target.description || "-"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEditTarget(target)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit target</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setTargetToDelete(
                                `${target.targetType}-${target.period}`
                              );
                              setDeleteConfirmOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete target</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              selected sales target.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setTargetToDelete(null);
                setDeleteConfirmOpen(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTarget}
              disabled={loading.deleteSalesTarget}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading.deleteSalesTarget ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
