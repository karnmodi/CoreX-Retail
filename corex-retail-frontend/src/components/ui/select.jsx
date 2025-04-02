"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import { Check, ChevronDown } from "lucide-react";

// Simple utility function to join classnames
const cn = (...classes) => classes.filter(Boolean).join(" ");

// Create context for the select component
const SelectContext = createContext({
  open: false,
  setOpen: () => {},
  value: "",
  onValueChange: () => {},
  disabled: false,
});

const Select = ({
  children,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  className,
  ...props
}) => {
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(
    value ?? defaultValue ?? ""
  );

  // Update internal state when value prop changes
  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  const handleValueChange = (newValue) => {
    if (!disabled) {
      if (value === undefined) {
        setSelectedValue(newValue);
      }
      onValueChange?.(newValue);
      setOpen(false);
    }
  };

  return (
    <SelectContext.Provider
      value={{
        open,
        setOpen,
        value: selectedValue,
        onValueChange: handleValueChange,
        disabled,
      }}
    >
      <div className={cn("relative w-full", className)} {...props}>
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const SelectTrigger = ({ children, className, ...props }) => {
  const { open, setOpen, value, disabled } = useContext(SelectContext);
  const triggerRef = useRef(null);

  const handleClick = (e) => {
    if (!disabled) {
      setOpen(!open);
      props.onClick?.(e);
    }
  };

  return (
    <button
      type="button"
      ref={triggerRef}
      onClick={handleClick}
      aria-haspopup="listbox"
      aria-expanded={open}
      disabled={disabled}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <span className="truncate">{children}</span>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
};

const SelectValue = ({ placeholder, className, ...props }) => {
  const { value } = useContext(SelectContext);

  return (
    <span className={cn("flex truncate", className)} {...props}>
      {value || placeholder}
    </span>
  );
};

const SelectContent = ({
  children,
  className,
  position = "popper",
  ...props
}) => {
  const { open, setOpen } = useContext(SelectContext);
  const contentRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      className={cn(
        "absolute z-50 w-full min-w-[8rem] overflow-hidden rounded-md border bg-popover shadow-md",
        "top-full left-0 mt-1",
        className
      )}
      {...props}
    >
      <div className="max-h-[250px] overflow-auto p-1">{children}</div>
    </div>
  );
};

const SelectItem = ({
  children,
  value,
  className,
  disabled = false,
  ...props
}) => {
  const { onValueChange, value: selectedValue } = useContext(SelectContext);
  const isSelected = selectedValue === value;

  const handleClick = () => {
    if (!disabled) {
      onValueChange(value);
    }
  };

  return (
    <div
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled}
      onClick={handleClick}
      className={cn(
        "relative flex items-center justify-between py-2 px-3 text-sm",
        "hover:bg-gray-100 dark:hover:bg-gray-800", // Visible hover state
        isSelected ? "bg-blue-50 text-blue-600" : "bg-white hover:bg-gray-100",
        disabled
          ? "pointer-events-none opacity-50 cursor-not-allowed"
          : "cursor-pointer",
        className
      )}
      {...props}
    >
      <div className="flex items-center">
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {isSelected && <Check className="h-4 w-4 text-blue-600" />}
        </span>
        <span className="pl-5">{children}</span>
      </div>
      {props.category && (
        <span className="text-xs text-gray-500 ml-2">{props.category}</span>
      )}
      {props.stock && (
        <span className="text-xs text-green-600 ml-2">{props.stock} units</span>
      )}
    </div>
  );
};

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
