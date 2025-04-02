"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const AlertDialog = AlertDialogPrimitive.Root;

const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

const AlertDialogPortal = ({ children, ...props }) => (
  <AlertDialogPrimitive.Portal {...props}>
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {children}
    </div>
  </AlertDialogPrimitive.Portal>
);

const AlertDialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-all duration-300",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out",
      "data-[state=open]:fade-in",
      className
    )}
    {...props}
  />
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.name;

const AlertDialogContent = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 w-full max-w-lg scale-100 gap-4 bg-white p-6 opacity-100",
        "left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 rounded-lg shadow-lg",
        "animate-in data-[state=open]:fade-in-90 data-[state=open]:slide-in-from-bottom-10",
        "dark:bg-gray-900 dark:text-gray-50",
        "focus:outline-none focus-visible:ring focus-visible:ring-purple-500",
        className
      )}
      {...props}
    />
  </AlertDialogPortal>
));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.name;

const AlertDialogHeader = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

const AlertDialogFooter = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 sm:space-y-0",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

const AlertDialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold text-gray-900 dark:text-gray-50",
      className
    )}
    {...props}
  />
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.name;

const AlertDialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn(
      "text-sm text-gray-500 dark:text-gray-400",
      className
    )}
    {...props}
  />
));
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.name;

const AlertDialogCancel = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(
      "mt-2 inline-flex h-10 items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2",
      "text-sm font-medium text-gray-900 transition-colors",
      "hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-purple-500",
      "disabled:pointer-events-none disabled:opacity-50",
      "dark:border-gray-700 dark:bg-gray-800 dark:text-gray-50",
      "sm:mt-0",
      className
    )}
    {...props}
  />
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.name;

const AlertDialogAction = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(
      "mt-2 inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-4 py-2",
      "text-sm font-medium text-white transition-colors",
      "hover:bg-blue-700 focus:outline-none focus-visible:ring focus-visible:ring-purple-500",
      "disabled:pointer-events-none disabled:opacity-50",
      "sm:mt-0",
      className
    )}
    {...props}
  />
));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.name;

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction
};