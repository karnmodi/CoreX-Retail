import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Simple utility function to join classnames
const cn = (...classes) => classes.filter(Boolean).join(' ');

export function Calendar({ 
  className,
  selected,
  onSelect,
  mode = "single", // single, multiple, range
  numberOfMonths = 1, // Default to 1 to avoid key conflicts
  defaultMonth = new Date(),
  initialFocus,
  disabled,
  ...props 
}) {
  const [currentMonth, setCurrentMonth] = useState(defaultMonth || new Date());
  const [hoverDate, setHoverDate] = useState(null);
  
  // Get days in month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Get day of week for first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };
  
  // Format date as ISO string for stable keys
  const formatDateKey = (date) => {
    if (!date) return '';
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  };
  
  // Generate days for the current month
  const generateDays = (year, month) => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    // Create array of day objects
    const days = [];
    
    // Get the last day of the previous month
    const lastMonthDate = new Date(year, month, 0);
    const lastMonthDay = lastMonthDate.getDate();
    
    // Add cells for days from previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
      const day = lastMonthDay - firstDayOfMonth + i + 1;
      const date = new Date(year, month - 1, day);
      days.push({ 
        day, 
        date,
        key: formatDateKey(date),
        currentMonth: false 
      });
    }
    
    // Add cells for days in the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ 
        day, 
        date,
        key: formatDateKey(date),
        currentMonth: true 
      });
    }
    
    // Add cells for days from next month to complete the grid (42 cells for 6 rows)
    const totalDaysAdded = firstDayOfMonth + daysInMonth;
    const nextMonthDays = 42 - totalDaysAdded;
    
    for (let day = 1; day <= nextMonthDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({ 
        day, 
        date,
        key: formatDateKey(date),
        currentMonth: false 
      });
    }
    
    return days;
  };
  
  // Check if a date is selected
  const isDateSelected = (date) => {
    if (!selected || !date) return false;
    
    if (mode === "single") {
      return selected && date.toDateString() === selected.toDateString();
    }
    
    if (mode === "range") {
      return (
        (selected.from && date.toDateString() === selected.from.toDateString()) ||
        (selected.to && date.toDateString() === selected.to.toDateString()) ||
        (selected.from && selected.to && 
          date >= selected.from && 
          date <= selected.to)
      );
    }
    
    if (mode === "multiple") {
      return selected.some(d => d.toDateString() === date.toDateString());
    }
    
    return false;
  };
  
  // Check if a date is in range between from and to date (for highlighting)
  const isDateInRange = (date) => {
    if (!selected || !selected.from || !selected.to || !date) return false;
    
    return date > selected.from && date < selected.to;
  };
  
  // Check if a date is disabled
  const isDateDisabled = (date) => {
    if (!disabled || !date) return false;
    
    if (disabled.before && date < disabled.before) {
      return true;
    }
    
    if (disabled.after && date > disabled.after) {
      return true;
    }
    
    if (disabled.dates && Array.isArray(disabled.dates)) {
      return disabled.dates.some(d => d.toDateString() === date.toDateString());
    }
    
    return false;
  };
  
  // Handle date click
  const handleDateClick = (date) => {
    if (!date || isDateDisabled(date)) return;
    
    if (mode === "single") {
      onSelect && onSelect(date);
    } else if (mode === "range") {
      if (!selected || !selected.from) {
        onSelect && onSelect({ from: date, to: undefined });
      } else if (selected.from && !selected.to) {
        if (date < selected.from) {
          onSelect && onSelect({ from: date, to: selected.from });
        } else {
          onSelect && onSelect({ from: selected.from, to: date });
        }
      } else {
        onSelect && onSelect({ from: date, to: undefined });
      }
    } else if (mode === "multiple") {
      const isAlreadySelected = isDateSelected(date);
      if (isAlreadySelected) {
        onSelect && onSelect(selected.filter(d => d.toDateString() !== date.toDateString()));
      } else {
        onSelect && onSelect([...(selected || []), date]);
      }
    }
  };
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => {
      const prevMonth = new Date(prev);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      return prevMonth;
    });
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(prev => {
      const nextMonth = new Date(prev);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return nextMonth;
    });
  };
  
  // Generate calendar for multiple months
  const generateMonths = () => {
    const months = [];
    
    for (let i = 0; i < numberOfMonths; i++) {
      const monthDate = new Date(currentMonth);
      monthDate.setMonth(monthDate.getMonth() + i);
      
      months.push({
        year: monthDate.getFullYear(),
        month: monthDate.getMonth(),
        monthName: monthDate.toLocaleString('default', { month: 'long' }),
        days: generateDays(monthDate.getFullYear(), monthDate.getMonth())
      });
    }
    
    return months;
  };
  
  const months = generateMonths();
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  
  return (
    <div className={cn("p-0 select-none bg-white", className)} {...props}>
      <div className="flex items-center justify-between p-3 border-b">
        <button
          onClick={goToPreviousMonth}
          className="p-1 rounded-md hover:bg-gray-100"
          type="button"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        <div className="flex space-x-4">
          {months.map((month, idx) => (
            <span key={`header-${month.year}-${month.month}`} className="font-medium">
              {month.monthName} {month.year}
            </span>
          ))}
        </div>
        
        <button
          onClick={goToNextMonth}
          className="p-1 rounded-md hover:bg-gray-100"
          type="button"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      
      <div className="flex p-2">
        {months.map((month, monthIndex) => (
          <div 
            key={`month-${month.year}-${month.month}`} 
            className={cn(
              "flex-1",
              monthIndex > 0 && "border-l"
            )}
          >
            <div className="grid grid-cols-7 mb-1">
              {dayNames.map((day, idx) => (
                <div 
                  key={`dayname-${idx}-${monthIndex}`} 
                  className="h-8 flex items-center justify-center text-xs text-gray-500 font-medium"
                >
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7">
              {month.days.map((day) => {
                const isSelected = isDateSelected(day.date);
                const isInRange = isDateInRange(day.date);
                const isDisabled = isDateDisabled(day.date);
                
                return (
                  <div 
                    key={`day-${day.key}-${monthIndex}`}
                    className={cn(
                      "relative p-0 text-center",
                      !day.currentMonth && "text-gray-400",
                      isInRange && "bg-gray-100"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => handleDateClick(day.date)}
                      onMouseEnter={() => setHoverDate(day.date)}
                      onMouseLeave={() => setHoverDate(null)}
                      className={cn(
                        "h-9 w-9 mx-auto flex items-center justify-center rounded-md text-sm",
                        isSelected
                          ? "bg-gray-200 text-black" 
                          : day.currentMonth
                            ? "hover:bg-gray-100"
                            : "text-gray-400 hover:bg-gray-50",
                        isDisabled && "opacity-50 cursor-not-allowed"
                      )}
                      disabled={!day.currentMonth || isDisabled}
                    >
                      {day.day}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}