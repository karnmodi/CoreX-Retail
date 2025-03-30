import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Plus, XCircle } from "lucide-react";

function RequestsPage() {
  const timeOffRequests = [
    { id: 1, employee: "Alex Johnson", type: "Vacation", from: "2024-04-10", to: "2024-04-15", status: "Pending" },
    { id: 2, employee: "Sarah Williams", type: "Sick Leave", from: "2024-04-05", to: "2024-04-06", status: "Approved" },
    { id: 3, employee: "Michael Brown", type: "Personal", from: "2024-04-20", to: "2024-04-22", status: "Pending" },
    { id: 4, employee: "Emily Davis", type: "Vacation", from: "2024-05-01", to: "2024-05-07", status: "Pending" },
    { id: 5, employee: "David Wilson", type: "Sick Leave", from: "2024-03-28", to: "2024-03-29", status: "Rejected" },
  ];

  const supplyRequests = [
    { id: 1, requestedBy: "Alex Johnson", items: "Office Supplies", quantity: 5, urgency: "Normal", status: "Pending" },
    {
      id: 2,
      requestedBy: "Sarah Williams",
      items: "Cleaning Supplies",
      quantity: 3,
      urgency: "High",
      status: "Approved",
    },
    { id: 3, requestedBy: "Michael Brown", items: "Printer Ink", quantity: 2, urgency: "Normal", status: "Pending" },
    { id: 4, requestedBy: "Emily Davis", items: "Paper", quantity: 10, urgency: "Low", status: "Approved" },
  ];

  return (
    <div className="flex flex-col">
      <header className="border-b">
        <div className="container py-4">
          <h1 className="text-3xl font-bold">Requests</h1>
          <p className="text-muted-foreground">Manage time off and supply requests</p>
        </div>
      </header>
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm font-medium">
              <Clock className="mr-1 h-3 w-3" />5 Pending Requests
            </Badge>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </div>

        <Tabs defaultValue="timeoff" className="mb-6">
          <TabsList>
            <TabsTrigger value="timeoff">Time Off Requests</TabsTrigger>
            <TabsTrigger value="supplies">Supply Requests</TabsTrigger>
            <TabsTrigger value="other">Other Requests</TabsTrigger>
          </TabsList>
          <TabsContent value="timeoff" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Time Off Requests</CardTitle>
                <CardDescription>Manage employee time off requests</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeOffRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.employee}</TableCell>
                        <TableCell>{request.type}</TableCell>
                        <TableCell>{request.from}</TableCell>
                        <TableCell>{request.to}</TableCell>
                        <TableCell>
                          <div
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              request.status === "Approved"
                                ? "bg-green-100 text-green-800"
                                : request.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {request.status}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {request.status === "Pending" && (
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                <XCircle className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          )}
                          {request.status !== "Pending" && (
                            <Button variant="ghost" size="sm">
                              Details
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="supplies" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Supply Requests</CardTitle>
                <CardDescription>Manage inventory and supply requests</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Requested By</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Urgency</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supplyRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.requestedBy}</TableCell>
                        <TableCell>{request.items}</TableCell>
                        <TableCell>{request.quantity}</TableCell>
                        <TableCell>
                          <div
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              request.urgency === "High"
                                ? "bg-red-100 text-red-800"
                                : request.urgency === "Normal"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                            }`}
                          >
                            {request.urgency}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              request.status === "Approved"
                                ? "bg-green-100 text-green-800"
                                : request.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {request.status}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {request.status === "Pending" && (
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                <XCircle className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          )}
                          {request.status !== "Pending" && (
                            <Button variant="ghost" size="sm">
                              Details
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="other" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Other Requests</CardTitle>
                <CardDescription>Manage miscellaneous requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-6">
                    <Clock className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium">No Active Requests</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                    There are no active miscellaneous requests at this time. Create a new request using the button
                    above.
                  </p>
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    New Request
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

export default RequestsPage;