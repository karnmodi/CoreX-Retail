"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "./ui/calender";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon, Download, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

export function SalesHeader({
  title,
  description,
  onDateChange,
  onSearchChange,
  onExport,
  initialDateRange,
  initialSearchTerm = "",
}) {
  const initialCallbackDone = useRef(false);

  const [date, setDate] = useState(() => {
    if (initialDateRange?.from && initialDateRange?.to) {
      return {
        from: new Date(initialDateRange.from),
        to: new Date(initialDateRange.to),
      };
    }

    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    return {
      from: thirtyDaysAgo,
      to: today,
    };
  });

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm || "");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const formatDisplayDate = (date) => {
    if (!date) return "";
    return format(date, "MMM d, yyyy");
  };

  const handleDateSelect = (selectedDate) => {
    if (!selectedDate) return;

    setDate(selectedDate);

    if (selectedDate?.from && selectedDate?.to && onDateChange) {
      setIsCalendarOpen(false);

      const from = format(selectedDate.from, "yyyy-MM-dd");
      const to = format(selectedDate.to, "yyyy-MM-dd");

      clearTimeout(window.dateChangeTimeout);
      window.dateChangeTimeout = setTimeout(() => {
        console.log(`SalesHeader: Date range selected: ${from} to ${to}`);
        onDateChange({ from, to });
      }, 100);
    }
  };

  // Handle search input with debounce
  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Debounce search to avoid too many rerenders
    if (onSearchChange) {
      clearTimeout(window.searchTimeout);
      window.searchTimeout = setTimeout(() => {
        onSearchChange(value);
      }, 300);
    }
  };

  // Handle export button click
  const handleExport = () => {
    if (onExport) {
      onExport({
        dateRange: {
          from: date.from ? format(date.from, "yyyy-MM-dd") : "",
          to: date.to ? format(date.to, "yyyy-MM-dd") : "",
        },
        searchTerm,
      });
    }
  };

  // Call the onDateChange callback only once on initial mount
  useEffect(() => {
    if (
      !initialCallbackDone.current &&
      initialDateRange?.from &&
      initialDateRange?.to &&
      onDateChange
    ) {
      initialCallbackDone.current = true;
      console.log(
        `SalesHeader: Initial date range: ${initialDateRange.from} to ${initialDateRange.to}`
      );

      setTimeout(() => {
        onDateChange(initialDateRange);
      }, 50);
    }

    // Cleanup on unmount
    return () => {
      clearTimeout(window.searchTimeout);
      clearTimeout(window.dateChangeTimeout);
    };
  }, [initialDateRange, onDateChange]);

  return (
    <div className="border-b">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 md:p-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full sm:w-[200px] pl-8"
              value={searchTerm}
              onChange={handleSearchInput}
            />
          </div>

          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="justify-start text-left font-normal w-full sm:w-auto"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {formatDisplayDate(date.from)} -{" "}
                      {formatDisplayDate(date.to)}
                    </>
                  ) : (
                    formatDisplayDate(date.from)
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={handleDateSelect}
                numberOfMonths={1}
              />
            </PopoverContent>
          </Popover>

          <Button variant="outline" size="icon" onClick={handleExport}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
