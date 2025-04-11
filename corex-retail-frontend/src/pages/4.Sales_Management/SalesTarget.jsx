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

  const [showAddTargetModal, setShowAddTargetModal] = useState(false);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddTarget = () => {
    setShowAddTargetModal(true);
  };

  // Only show loading state for salesTargets operation
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

    let targetKey = "";
    if (type === "monthly") {
      targetKey = `monthly-${currentYear}-${String(currentMonth).padStart(
        2,
        "0"
      )}`;
    } else if (type === "quarterly") {
      const currentQuarter = Math.ceil(currentMonth / 3);
      targetKey = `quarterly-${currentYear}-Q${currentQuarter}`;
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

  const monthlyTarget = getTargetSummary("monthly");
  const quarterlyTarget = getTargetSummary("quarterly");
  const yearlyTarget = getTargetSummary("yearly");

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
          {[monthlyTarget, quarterlyTarget, yearlyTarget].map(
            (target, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {index === 0
                      ? "Monthly Target"
                      : index === 1
                      ? "Quarterly Target"
                      : "Annual Target"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    £{target.target?.toLocaleString() || "0"}
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${
                        target.percentage >= 75
                          ? "bg-green-500"
                          : target.percentage >= 50
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{
                        width: `${Math.min(target.percentage || 0, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {target.percentage?.toFixed(1) || "0"}% achieved (£
                    {target.achieved?.toLocaleString() || "0"})
                  </p>
                </CardContent>
              </Card>
            )
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sales Targets</CardTitle>
            <CardDescription>
              View and manage all your sales targets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SalesTargetsTable targets={salesTargets?.allTargets || []} />
          </CardContent>
        </Card>
      </div>

      {/* Modal for adding target goes here */}
    </div>
  );
}
