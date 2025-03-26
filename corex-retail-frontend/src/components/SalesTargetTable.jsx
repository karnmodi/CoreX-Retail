    "use client"

import React from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { ArrowUpDown, Edit, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const data = [
  {
    id: "1",
    period: "March 2023",
    type: "Monthly",
    target: 150000,
    achieved: 97500,
    progress: 65,
    status: "on-track",
  },
  {
    id: "2",
    period: "Q1 2023",
    type: "Quarterly",
    target: 450000,
    achieved: 189000,
    progress: 42,
    status: "at-risk",
  },
  {
    id: "3",
    period: "2023",
    type: "Annual",
    target: 1800000,
    achieved: 504000,
    progress: 28,
    status: "behind",
  },
  {
    id: "4",
    period: "February 2023",
    type: "Monthly",
    target: 140000,
    achieved: 145600,
    progress: 104,
    status: "on-track",
  },
  {
    id: "5",
    period: "January 2023",
    type: "Monthly",
    target: 130000,
    achieved: 118300,
    progress: 91,
    status: "on-track",
  },
  {
    id: "6",
    period: "Q4 2022",
    type: "Quarterly",
    target: 420000,
    achieved: 393900,
    progress: 94,
    status: "on-track",
  },
  {
    id: "7",
    period: "December 2022",
    type: "Monthly",
    target: 145000,
    achieved: 152300,
    progress: 105,
    status: "on-track",
  },
  {
    id: "8",
    period: "November 2022",
    type: "Monthly",
    target: 135000,
    achieved: 128250,
    progress: 95,
    status: "on-track",
  },
];

export function SalesTargetsTable() {
  const columns = [
    {
      
      accessorKey: "period",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Period
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type",
    },
    {
      accessorKey: "target",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Target
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const amount = Number.parseFloat(row.getValue("target"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "GBP",
        }).format(amount);

        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "achieved",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Achieved
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const amount = Number.parseFloat(row.getValue("achieved"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "GBP",
        }).format(amount);

        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "progress",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Progress
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const progress = Number.parseFloat(row.getValue("progress"));

        return (
          <div className="flex items-center gap-2">
            <Progress value={progress} className="w-[60px]" />
            <span>{progress}%</span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status");

        return (
          <Badge
            variant="outline"
            className={
              status === "on-track"
                ? "bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800"
                : status === "at-risk"
                  ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-800"
                  : "bg-red-100 text-red-800 hover:bg-red-100 hover:text-red-800"
            }
          >
            {status === "on-track" ? "On Track" : status === "at-risk" ? "At Risk" : "Behind"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const target = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit Target</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>
    </div>
  );
}