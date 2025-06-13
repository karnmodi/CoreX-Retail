"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";

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
    <DropdownMenuContext.Provider
      value={{ open, setOpen, triggerRef, contentRef }}
    >
      <div className="relative inline-block">{children}</div>
    </DropdownMenuContext.Provider>
  );
};

const DropdownMenuLabel = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        "px-2 py-1.5 text-sm font-semibold text-gray-500",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const DropdownMenuSeparator = ({ className, ...props }) => {
  return (
    <div
      className={cn("my-1 h-px bg-gray-200", className)}
      role="separator"
      {...props}
    />
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
  align = "start",
  side = "bottom",
  sideOffset = 4,
  alignOffset = 0,
  avoidCollisions = true,
  ...props
}) => {
  const { open, setOpen, triggerRef, contentRef } =
    useContext(DropdownMenuContext);

  const [mounted, setMounted] = useState(false);

  // Handle outside clicks and Escape key
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

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Position the content
  useEffect(() => {
    if (!open || !mounted || !contentRef.current || !triggerRef.current) return;

    const positionDropdown = () => {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Get scroll position
      const scrollX = window.scrollX || document.documentElement.scrollLeft;
      const scrollY = window.scrollY || document.documentElement.scrollTop;

      // Determine the initial position based on side and align props
      let top = 0;
      let left = 0;

      // Calculate vertical position based on side
      if (side === "bottom") {
        top = triggerRect.bottom + sideOffset;
      } else if (side === "top") {
        top = triggerRect.top - contentRect.height - sideOffset;
      } else if (side === "right") {
        top = triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
        left = triggerRect.right + sideOffset;
      } else if (side === "left") {
        top = triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
        left = triggerRect.left - contentRect.width - sideOffset;
      }

      // Calculate horizontal position based on align (for top and bottom sides)
      if (side === "top" || side === "bottom") {
        if (align === "start") {
          left = triggerRect.left + alignOffset;
        } else if (align === "end") {
          left = triggerRect.right - contentRect.width - alignOffset;
        } else if (align === "center") {
          left =
            triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
        }
      }

      // Avoid collisions with viewport edges if avoidCollisions is enabled
      if (avoidCollisions) {
        // Right edge collision detection
        if (left + contentRect.width > viewportWidth - 8) {
          left = Math.max(8, viewportWidth - contentRect.width - 8);
        }

        // Left edge collision detection
        if (left < 8) {
          left = 8;
        }

        // Bottom edge collision detection
        if (top + contentRect.height > viewportHeight - 8) {
          // If side is bottom, flip to top
          if (side === "bottom") {
            top = triggerRect.top - contentRect.height - sideOffset;
          }

          // If still colliding, position at bottom of viewport
          if (top + contentRect.height > viewportHeight - 8) {
            top = viewportHeight - contentRect.height - 8;
          }
        }

        // Top edge collision detection
        if (top < 8) {
          // If side is top, flip to bottom
          if (side === "top") {
            top = triggerRect.bottom + sideOffset;
          }

          // If still colliding, position at top of viewport
          if (top < 8) {
            top = 8;
          }
        }
      }

      // Apply the computed position (adding scroll position for absolute positioning)
      contentRef.current.style.top = `${top + scrollY}px`;
      contentRef.current.style.left = `${left + scrollX}px`;
    };

    // Position initially and on window resize
    positionDropdown();

    const handleResize = () => {
      positionDropdown();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
    };
  }, [open, mounted, align, side, sideOffset, alignOffset, avoidCollisions]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      className={cn(
        "fixed z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-lg",
        className
      )}
      style={{ position: "fixed" }}
      role="menu"
      aria-orientation="vertical"
      {...props}
    >
      {children}
    </div>
  );
};

const DropdownMenuItem = ({ children, className, onSelect, ...props }) => {
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
      role="menuitem"
      {...props}
    >
      {children}
    </button>
  );
};

const DropdownMenuPortal = ({ children }) => {
  return <>{children}</>;
};

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuPortal,
};
