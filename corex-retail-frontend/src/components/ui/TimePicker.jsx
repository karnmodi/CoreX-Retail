import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

const TimePicker = ({ 
  value = "12:00", 
  onChange, 
  className, 
  disabled = false,
  label,
  showIcon = true
}) => {
  const [hours, setHours] = useState("12");
  const [minutes, setMinutes] = useState("00");
  const [period, setPeriod] = useState("AM");
  const [isOpen, setIsOpen] = useState(false);

  // Initialize time from the value prop
  useEffect(() => {
    if (value) {
      let timeValue = value;
      
      // Handle 24-hour format
      if (value.includes(":")) {
        const [hoursValue, minutesValue] = value.split(":");
        
        // Convert 24-hour format to 12-hour format
        let hoursInt = parseInt(hoursValue, 10);
        let newPeriod = "AM";
        
        if (hoursInt >= 12) {
          newPeriod = "PM";
          if (hoursInt > 12) {
            hoursInt -= 12;
          }
        }
        if (hoursInt === 0) {
          hoursInt = 12;
        }
        
        setHours(hoursInt.toString());
        setMinutes(minutesValue);
        setPeriod(newPeriod);
      }
    }
  }, [value]);

  // Convert to 24-hour format for output when the time changes
  const updateTime = () => {
    let hoursInt = parseInt(hours, 10);
    
    // Convert to 24-hour format
    if (period === "PM" && hoursInt < 12) {
      hoursInt += 12;
    } else if (period === "AM" && hoursInt === 12) {
      hoursInt = 0;
    }
    
    const newTimeValue = `${hoursInt.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    
    if (onChange) {
      onChange(newTimeValue);
    }
    
    setIsOpen(false);
  };

  // Handle hours input
  const handleHoursChange = (e) => {
    let newHours = e.target.value.replace(/[^0-9]/g, "");
    
    if (newHours === "") {
      setHours("");
      return;
    }
    
    const hoursInt = parseInt(newHours, 10);
    
    if (hoursInt >= 0 && hoursInt <= 12) {
      setHours(hoursInt.toString());
    }
  };

  // Handle minutes input
  const handleMinutesChange = (e) => {
    let newMinutes = e.target.value.replace(/[^0-9]/g, "");
    
    if (newMinutes === "") {
      setMinutes("");
      return;
    }
    
    const minutesInt = parseInt(newMinutes, 10);
    
    if (minutesInt >= 0 && minutesInt <= 59) {
      setMinutes(minutesInt.toString().padStart(2, '0'));
    }
  };

  // Toggle AM/PM
  const togglePeriod = () => {
    setPeriod(period === "AM" ? "PM" : "AM");
  };

  // Quick time selections
  const timePresets = [
    { hours: "12", minutes: "00", period: "AM", label: "12:00 AM" },
    { hours: "6", minutes: "00", period: "AM", label: "6:00 AM" },
    { hours: "9", minutes: "00", period: "AM", label: "9:00 AM" },
    { hours: "12", minutes: "00", period: "PM", label: "12:00 PM" },
    { hours: "1", minutes: "00", period: "PM", label: "1:00 PM" },
    { hours: "5", minutes: "00", period: "PM", label: "5:00 PM" },
    { hours: "8", minutes: "00", period: "PM", label: "8:00 PM" },
    { hours: "11", minutes: "30", period: "PM", label: "11:30 PM" },
  ];

  // Format display time
  const displayTime = () => {
    return `${hours || "12"}:${minutes || "00"} ${period}`;
  };

  // Handle preset selection
  const selectPreset = (preset) => {
    setHours(preset.hours);
    setMinutes(preset.minutes);
    setPeriod(preset.period);
    
    // Automatically update when a preset is selected
    setTimeout(() => {
      updateTime();
    }, 0);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            {showIcon && <Clock className="mr-2 h-4 w-4" />}
            {displayTime()}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-72 p-4">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div className="grid gap-1 text-center">
                <Label htmlFor="hours">Hours</Label>
                <Input
                  id="hours"
                  className="w-16 text-center"
                  value={hours}
                  onChange={handleHoursChange}
                  onBlur={() => {
                    if (hours === "") setHours("12");
                    if (parseInt(hours, 10) === 0) setHours("12");
                  }}
                />
              </div>
              
              <div className="text-2xl font-bold mt-5">:</div>
              
              <div className="grid gap-1 text-center">
                <Label htmlFor="minutes">Minutes</Label>
                <Input
                  id="minutes"
                  className="w-16 text-center"
                  value={minutes}
                  onChange={handleMinutesChange}
                  onBlur={() => {
                    if (minutes === "") setMinutes("00");
                    else setMinutes(minutes.padStart(2, '0'));
                  }}
                />
              </div>
              
              <div className="grid gap-1">
                <Label>AM/PM</Label>
                <Button 
                  variant="outline"
                  className="w-16"
                  onClick={togglePeriod}
                >
                  {period}
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {timePresets.map((preset, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => selectPreset(preset)}
                  className="text-xs"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            
            <div className="flex justify-end">
              <Button onClick={updateTime}>Apply</Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export { TimePicker };