import React, { useEffect, useState } from "react";
import { SalesTargetsTable } from "@/components/SalesTargetTable";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2 } from "lucide-react";
import { SalesHeader } from "@/components/SalesHeader";
import { useSales } from "@/configs/SalesContext";

export default function SalesTargetsPage() {
  const {
    loadSalesTargets,
    salesTargets,
    loading,
    error,
    createOrUpdateSalesTarget,
  } = useSales();

  const [showTargetModal, setShowTargetModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [targetFormData, setTargetFormData] = useState({
    targetType: "monthly",
    period: "",
    amount: "",
    description: "",
  });

  useEffect(() => {
    const loadTargets = async () => {
      try {
        const currentYear = new Date().getFullYear().toString();
        const currentMonth = (new Date().getMonth() + 1)
          .toString()
          .padStart(2, "0");
        await loadSalesTargets({ year: currentYear, month: currentMonth });
      } catch (err) {
        console.error("Error loading targets:", err);
      }
    };
    loadTargets();
  }, []);

  const getTodayDate = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(today.getDate()).padStart(2, "0")}`;
  };

  const formatPeriodBasedOnType = (targetType) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const date = String(today.getDate()).padStart(2, "0");
    const quarter = Math.ceil((today.getMonth() + 1) / 3);

    switch (targetType) {
      case "daily":
        return `${year}-${month}-${date}`;
      case "monthly":
        return `${year}-${month}`;
      case "quarterly":
        return `${year}-Q${quarter}`;
      case "yearly":
        return `${year}`;
      default:
        return "";
    }
  };

  const handleAddTarget = () => {
    setIsEditMode(false);
    setTargetFormData({
      targetType: "monthly",
      period: formatPeriodBasedOnType("monthly"),
      amount: "",
      description: "",
    });
    setShowTargetModal(true);
  };

  const handleEditTarget = (target) => {
    setIsEditMode(true);
    setTargetFormData({
      targetType: target.targetType,
      period: target.period,
      amount: target.amount,
      description: target.description || "",
    });
    setShowTargetModal(true);
  };

  const handleTargetTypeChange = (value) => {
    setTargetFormData((prev) => ({
      ...prev,
      targetType: value,
      period: formatPeriodBasedOnType(value),
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTargetFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) || "" : value,
    }));
  };

  const handleSubmitTarget = async (e) => {
    e.preventDefault();

    try {
      const result = await createOrUpdateSalesTarget(targetFormData);
      setShowTargetModal(false);

      if (result) {
        const updatedSalesTargets = { ...salesTargets };

        if (!updatedSalesTargets.allTargets) {
          updatedSalesTargets.allTargets = [];
        }

        const targetId = `${targetFormData.targetType}-${targetFormData.period}`;
        const existingTargetIndex = updatedSalesTargets.allTargets.findIndex(
          (t) => `${t.targetType}-${t.period}` === targetId
        );

        if (existingTargetIndex >= 0) {
          updatedSalesTargets.allTargets[existingTargetIndex] = {
            ...updatedSalesTargets.allTargets[existingTargetIndex],
            amount: parseFloat(targetFormData.amount),
            description: targetFormData.description,
          };
        } else {
          updatedSalesTargets.allTargets.push({
            targetType: targetFormData.targetType,
            period: targetFormData.period,
            amount: parseFloat(targetFormData.amount),
            description: targetFormData.description,
          });
        }

        if (!updatedSalesTargets.summary) {
          updatedSalesTargets.summary = {};
        }

        if (
          (targetFormData.targetType === "daily" &&
            getTargetSummary("daily").target === 0) ||
          (targetFormData.targetType === "monthly" &&
            getTargetSummary("monthly").target === 0) ||
          (targetFormData.targetType === "yearly" &&
            getTargetSummary("yearly").target === 0)
        ) {
          updatedSalesTargets.summary[targetId] = {
            period: targetFormData.period,
            type: targetFormData.targetType,
            target: parseFloat(targetFormData.amount),
            achieved: 0,
            percentage: 0,
          };
        }

        const currentYear = new Date().getFullYear().toString();
        const currentMonth = (new Date().getMonth() + 1)
          .toString()
          .padStart(2, "0");
        loadSalesTargets({ year: currentYear, month: currentMonth });
      }
    } catch (err) {
      console.error("Error saving target:", err);
    }
  };
  if (loading.salesTargets) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col">
        <SalesHeader
          title="Sales Targets"
          description="View and manage your sales targets"
        />
        <div className="p-4 md:p-6 space-y-4">
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        </div>
      </div>
    );
  }

  const getTargetSummary = (type) => {
    if (!salesTargets || !salesTargets.summary)
      return { target: 0, achieved: 0, percentage: 0 };

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();

    let targetKey = "";
    if (type === "daily") {
      const formattedDate = `${currentYear}-${String(currentMonth).padStart(
        2,
        "0"
      )}-${String(currentDay).padStart(2, "0")}`;
      targetKey = `daily-${formattedDate}`;
    } else if (type === "monthly") {
      targetKey = `monthly-${currentYear}-${String(currentMonth).padStart(
        2,
        "0"
      )}`;
    } else if (type === "yearly") {
      targetKey = `yearly-${currentYear}`;
    }

    return (
      salesTargets.summary[targetKey] || {
        target: 0,
        achieved: 0,
        percentage: 0,
      }
    );
  };

  const dailyTarget = getTargetSummary("daily");
  const monthlyTarget = getTargetSummary("monthly");
  const yearlyTarget = getTargetSummary("yearly");

  // Sort targets by date (most recent first)
  const sortedTargets = salesTargets?.allTargets
    ? [...salesTargets.allTargets].sort((a, b) => {
        // For daily targets, compare directly
        if (a.targetType === "daily" && b.targetType === "daily") {
          return new Date(b.period) - new Date(a.period);
        }

        // For different target types or non-daily targets
        // First prioritize by type: daily > monthly > quarterly > yearly
        const typeOrder = { daily: 0, monthly: 1, quarterly: 2, yearly: 3 };
        if (typeOrder[a.targetType] !== typeOrder[b.targetType]) {
          return typeOrder[a.targetType] - typeOrder[b.targetType];
        }

        // Then by period (most recent first)
        return b.period.localeCompare(a.period);
      })
    : [];

  return (
    <div className="flex flex-col">
      <SalesHeader
        title="Sales Targets"
        description="View and manage your sales targets"
      />

      <div className="p-4 md:p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Target Management</h2>
          <Button
            onClick={handleAddTarget}
            disabled={loading.updateSalesTarget}
          >
            {loading.updateSalesTarget ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Set New Target
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Daily Target ({new Date().toLocaleDateString()})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                £{dailyTarget.target?.toLocaleString() || "0"}
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${
                    dailyTarget.percentage >= 75
                      ? "bg-green-500"
                      : dailyTarget.percentage >= 50
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{
                    width: `${Math.min(dailyTarget.percentage || 0, 100)}%`,
                  }}
                ></div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {dailyTarget.percentage?.toFixed(1) || "0"}% achieved (£
                {dailyTarget.achieved?.toLocaleString() || "0"})
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Target
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                £{monthlyTarget.target?.toLocaleString() || "0"}
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${
                    monthlyTarget.percentage >= 75
                      ? "bg-green-500"
                      : monthlyTarget.percentage >= 50
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{
                    width: `${Math.min(monthlyTarget.percentage || 0, 100)}%`,
                  }}
                ></div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {monthlyTarget.percentage?.toFixed(1) || "0"}% achieved (£
                {monthlyTarget.achieved?.toLocaleString() || "0"})
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Annual Target
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                £{yearlyTarget.target?.toLocaleString() || "0"}
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${
                    yearlyTarget.percentage >= 75
                      ? "bg-green-500"
                      : yearlyTarget.percentage >= 50
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{
                    width: `${Math.min(yearlyTarget.percentage || 0, 100)}%`,
                  }}
                ></div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {yearlyTarget.percentage?.toFixed(1) || "0"}% achieved (£
                {yearlyTarget.achieved?.toLocaleString() || "0"})
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sales Targets</CardTitle>
            <CardDescription>
              View and manage all your sales targets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SalesTargetsTable
              targets={sortedTargets}
              onEditTarget={handleEditTarget}
            />
          </CardContent>
        </Card>
      </div>

      {/* Target Creation/Edit Modal */}
      {showTargetModal && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-6">
            {/* Header */}
            <div className="space-y-1">
              <h2 className="text-xl font-bold">
                {isEditMode ? "Edit Target" : "Create New Target"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isEditMode
                  ? "Update your sales target details below."
                  : "Set a new sales target for your team."}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitTarget} className="space-y-6">
              {/* Target Type */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="targetType" className="text-right font-medium">
                  Type
                </label>
                <Select
                  value={targetFormData.targetType}
                  onValueChange={handleTargetTypeChange}
                  // disabled={isEditMode}
                >
                  <SelectTrigger className="col-span-3 rounded-xl">
                    <SelectValue placeholder="Select target type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Period */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="period" className="text-right font-medium">
                  Period
                </label>
                <Input
                  id="period"
                  name="period"
                  value={targetFormData.period}
                  onChange={handleInputChange}
                  className="col-span-3 rounded-xl"
                  // disabled={isEditMode}
                  placeholder={
                    targetFormData.targetType === "daily"
                      ? "YYYY-MM-DD"
                      : targetFormData.targetType === "monthly"
                      ? "YYYY-MM"
                      : targetFormData.targetType === "quarterly"
                      ? "YYYY-Q#"
                      : "YYYY"
                  }
                />
              </div>

              {/* Amount */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="amount" className="text-right font-medium">
                  Amount (£)
                </label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  value={targetFormData.amount}
                  onChange={handleInputChange}
                  className="col-span-3 rounded-xl"
                  placeholder="Target amount in GBP"
                  required
                />
              </div>

              {/* Description */}
              <div className="grid grid-cols-4 items-start gap-4">
                <label
                  htmlFor="description"
                  className="text-right font-medium pt-2"
                >
                  Description
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={targetFormData.description}
                  onChange={handleInputChange}
                  className="col-span-3 rounded-xl"
                  placeholder="Optional description"
                  rows={3}
                />
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTargetModal(false)}
                  className="px-4 py-2 rounded-xl bg-muted text-sm hover:bg-muted/60"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  disabled={loading.updateSalesTarget}
                  className="rounded-xl"
                >
                  {loading.updateSalesTarget ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : isEditMode ? (
                    "Update Target"
                  ) : (
                    "Create Target"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
