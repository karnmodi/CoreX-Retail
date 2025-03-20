"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";

// Simple utility function to join classnames
const cn = (...classes) => classes.filter(Boolean).join(" ");

// Create context for the dropdown menu
const DropdownMenuContext = createContext({
  open: false,
  setOpen: () => {},
  triggerRef: { current: null },
  contentRef: { current: null },
});

const DropdownMenu = ({ children }) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const contentRef = useRef(null);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, triggerRef, contentRef }}>
      <div className="relative inline-block">{children}</div>
    </DropdownMenuContext.Provider>
  );
};

const DropdownMenuTrigger = ({ children, asChild, className, ...props }) => {
  const { open, setOpen, triggerRef } = useContext(DropdownMenuContext);

  const handleClick = (e) => {
    e.preventDefault();
    setOpen(!open);
    props.onClick?.(e);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ref: triggerRef,
      onClick: handleClick,
      "aria-expanded": open,
      "aria-haspopup": true,
      ...props,
    });
  }

  return (
    <button
      type="button"
      ref={triggerRef}
      className={className}
      onClick={handleClick}
      aria-expanded={open}
      aria-haspopup={true}
      {...props}
    >
      {children}
    </button>
  );
};

const DropdownMenuContent = ({ 
  children, 
  className, 
  align = "center", 
  sideOffset = 4,
  ...props 
}) => {
  const { open, setOpen, triggerRef, contentRef } = useContext(DropdownMenuContext);

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

  // Position the content
  useEffect(() => {
    if (!open || !contentRef.current || !triggerRef.current) return;

    const updatePosition = () => {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();
      
      const scrollX = window.scrollX || document.documentElement.scrollLeft;
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      
      let top = triggerRect.bottom + sideOffset + scrollY;
      let left = 0;
      
      // Horizontal alignment
      if (align === "start") {
        left = triggerRect.left + scrollX;
      } else if (align === "end") {
        left = triggerRect.right - contentRect.width + scrollX;
      } else {
        // Center
        left = triggerRect.left + (triggerRect.width / 2) - (contentRect.width / 2) + scrollX;
      }
      
      // Check if dropdown would go off-screen to the right
      if (left + contentRect.width > window.innerWidth) {
        left = window.innerWidth - contentRect.width - 10;
      }
      
      // Check if dropdown would go off-screen to the left
      if (left < 0) {
        left = 10;
      }
      
      contentRef.current.style.top = `${top}px`;
      contentRef.current.style.left = `${left}px`;
    };
    
    updatePosition();
    window.addEventListener('resize', updatePosition);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, align, sideOffset]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white py-1 shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const DropdownMenuItem = ({ 
  children, 
  className, 
  onSelect,
  ...props 
}) => {
  const { setOpen } = useContext(DropdownMenuContext);

  const handleClick = (e) => {
    onSelect?.(e);
    setOpen(false);
    props.onClick?.(e);
  };

  return (
    <button
      type="button"
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-gray-100 focus:text-gray-900 hover:bg-gray-100",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem };