import { SalesTargetsTable } from "@/components/SalesTargetTable"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { SalesHeader } from "../../components/SalesHeader"

export default function SalesTargetsPage() {
  return (
    <div className="flex flex-col">
      <SalesHeader title="Sales Targets" description="View and manage your sales targets" />

      <div className description="View and manage your sales targets" />

      <div className="p-4 md:p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Target Management</h2>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Set New Target
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Monthly Target</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£150,000</div>
              <div className="mt-2 h-2 w-full rounded-full bg-muted">
                <div className="h-full w-[65%] rounded-full bg-green-500"></div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">65% achieved (£97,500)</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Quarterly Target</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£450,000</div>
              <div className="mt-2 h-2 w-full rounded-full bg-muted">
                <div className="h-full w-[42%] rounded-full bg-yellow-500"></div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">42% achieved (£189,000)</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Annual Target</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£1,800,000</div>
              <div className="mt-2 h-2 w-full rounded-full bg-muted">
                <div className="h-full w-[28%] rounded-full bg-red-500"></div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">28% achieved (£504,000)</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sales Targets</CardTitle>
            <CardDescription>View and manage all your sales targets</CardDescription>
          </CardHeader>
          <CardContent>
            <SalesTargetsTable />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

