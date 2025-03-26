"use client"

import React, { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, Edit, MoreHorizontal, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const data = [
  {
    id: "1",
    date: "2025-03-15",
    product: "Premium Headphones",
    category: "Electronics",
    quantity: 12,
    revenue: 1440,
    region: "North",
  },
  {
    id: "2",
    date: "2025-03-15",
    product: "Wireless Mouse",
    category: "Electronics",
    quantity: 25,
    revenue: 750,
    region: "South",
  },
  {
    id: "3",
    date: "2025-03-15",
    product: "Office Chair",
    category: "Furniture",
    quantity: 5,
    revenue: 1250,
    region: "East",
  },
  {
    id: "4",
    date: "2025-03-15",
    product: "Coffee Maker",
    category: "Appliances",
    quantity: 8,
    revenue: 880,
    region: "West",
  },
  {
    id: "5",
    date: "2025-03-14",
    product: "Laptop Stand",
    category: "Accessories",
    quantity: 15,
    revenue: 450,
    region: "North",
  },
  {
    id: "6",
    date: "2025-03-14",
    product: "Mechanical Keyboard",
    category: "Electronics",
    quantity: 10,
    revenue: 1200,
    region: "West",
  },
  {
    id: "7",
    date: "2025-03-14",
    product: "Desk Lamp",
    category: "Lighting",
    quantity: 20,
    revenue: 600,
    region: "South",
  },
  {
    id: "8",
    date: "2025-03-14",
    product: "External SSD",
    category: "Electronics",
    quantity: 7,
    revenue: 980,
    region: "East",
  },
  {
    id: "9",
    date: "2025-03-13",
    product: "Ergonomic Mouse",
    category: "Electronics",
    quantity: 18,
    revenue: 720,
    region: "West",
  },
  {
    id: "10",
    date: "2025-03-13",
    product: "Wireless Earbuds",
    category: "Electronics",
    quantity: 30,
    revenue: 1500,
    region: "North",
  },
];

export function SalesDailyTable() {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  const columns = [
    {
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue("date")}</div>,
    },
    {
      accessorKey: "product",
      header: "Product",
      cell: ({ row }) => <div>{row.getValue("product")}</div>,
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => <div>{row.getValue("category")}</div>,
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Quantity
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="text-right">{row.getValue("quantity")}</div>,
    },
    {
      accessorKey: "revenue",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Revenue
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="text-right">£{row.getValue("revenue")}</div>,
    },
    {
      accessorKey: "region",
      header: "Region",
      cell: ({ row }) => <div>{row.getValue("region")}</div>,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const record = row.original;

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
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash className="mr-2 h-4 w-4" />
                <span>Delete</span>
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
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Filter products..."
            value={(table.getColumn("product")?.getFilterValue() ?? "")}
            onChange={(event) => table.getColumn("product")?.setFilterValue(event.target.value)}
            className="max-w-xl"
          />
          <Select
            value={(table.getColumn("category")?.getFilterValue() ?? "")}
            onValueChange={(value) => table.getColumn("category")?.setFilterValue(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Categories">All Categories</SelectItem>
              <SelectItem value="Electronics">Electronics</SelectItem>
              <SelectItem value="Furniture">Furniture</SelectItem>
              <SelectItem value="Appliances">Appliances</SelectItem>
              <SelectItem value="Accessories">Accessories</SelectItem>
              <SelectItem value="Lighting">Lighting</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={(table.getColumn("region")?.getFilterValue() ?? "")}
            onValueChange={(value) => table.getColumn("region")?.setFilterValue(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Regions">All Regions</SelectItem>
              <SelectItem value="North">North</SelectItem>
              <SelectItem value="South">South</SelectItem>
              <SelectItem value="East">East</SelectItem>
              <SelectItem value="West">West</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
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
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} record(s) found.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}