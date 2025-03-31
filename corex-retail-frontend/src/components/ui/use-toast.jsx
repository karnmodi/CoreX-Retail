import * as React from "react";
import { createContext, useContext, useState } from "react";
import { Loader2, X, CheckCircle, AlertCircle, Info } from "lucide-react";

// Create a Toast Context
const ToastContext = createContext({
  toast: () => {},
});

// Toast types and their corresponding styles
const TOAST_TYPES = {
  default: {
    className: "bg-white rounded-xl border-gray-500 text-gray-900",
    icon: <Info className="h-5 w-5 text-blue-500" />,
  },
  success: {
    className: "bg-green-50 rounded-xl border-green-500 text-green-800",
    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
  },
  error: {
    className: "bg-red-50 rounded-xl border-red-500 text-red-800",
    icon: <AlertCircle className="h-5 w-5 text-red-500" />,
  },
  warning: {
    className: "bg-yellow-50 rounded-xl border-yellow-500 text-yellow-800",
    icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
  },
  loading: {
    className: "bg-white rounded-xl border-gray-500 text-gray-900",
    icon: <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />,
  },
};

// Toast Component
const Toast = ({ id, title, description, variant = "default", onClose }) => {
  const toastType = TOAST_TYPES[variant] || TOAST_TYPES.default;

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-4 shadow-md ${toastType.className}`}
      role="alert"
    >
      <div className="mt-0.5">{toastType.icon}</div>
      <div className="flex-1">
        {title && <h3 className="font-medium">{title}</h3>}
        {description && <p className="text-sm opacity-90">{description}</p>}
      </div>
      <button
        onClick={() => onClose(id)}
        className="ml-auto mt-0.5 text-gray-500 hover:text-gray-900"
        aria-label="Close toast"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

// Toast Provider Component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Add a new toast
  const toast = ({ title, description, variant = "default", duration = 5000 }) => {
    const id = Date.now().toString();
    const newToast = { id, title, description, variant };
    
    setToasts((currentToasts) => [...currentToasts, newToast]);

    // Auto-dismiss toast after duration (except for loading toasts)
    if (variant !== "loading" && duration !== Infinity) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }

    // Return the toast ID so it can be dismissed programmatically
    return id;
  };

  // Dismiss a toast by ID
  const dismissToast = (id) => {
    setToasts((currentToasts) => 
      currentToasts.filter((toast) => toast.id !== id)
    );
  };

  // Update an existing toast (useful for changing loading → success/error)
  const updateToast = (id, updatedToast) => {
    setToasts((currentToasts) =>
      currentToasts.map((toast) =>
        toast.id === id ? { ...toast, ...updatedToast } : toast
      )
    );

    // If we're updating to a non-loading state, auto-dismiss
    if (updatedToast.variant !== "loading") {
      setTimeout(() => {
        dismissToast(id);
      }, updatedToast.duration || 5000);
    }
  };

  return (
    <ToastContext.Provider value={{ toast, dismissToast, updateToast }}>
      {children}
      
      {/* Toast container */}
      {toasts.length > 0 && (
        <div className="fixed bottom-0 right-0 z-50 p-4 md:p-6 max-h-screen overflow-hidden pointer-events-none">
          <div className="flex flex-col gap-2 max-w-md ml-auto">
            {toasts.map((toast) => (
              <div key={toast.id} className="pointer-events-auto">
                <Toast
                  {...toast}
                  onClose={dismissToast}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

// Custom hook to use the toast
export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  
  return context;
};

// Example usage:
// 1. Wrap your app with ToastProvider:
// <ToastProvider>
//   <App />
// </ToastProvider>
//
// 2. Use the toast anywhere in your components:
// const { toast, dismissToast, updateToast } = useToast();
//
// toast({ title: "Success!", description: "Item saved successfully", variant: "success" });
// toast({ title: "Error!", description: "Something went wrong", variant: "error" });
// const loadingToastId = toast({ title: "Loading...", variant: "loading", duration: Infinity });
// updateToast(loadingToastId, { title: "Success!", variant: "success" });