import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./configs/AuthContext";
import { StaffProvider } from "./configs/StaffContext";
import { RosterProvider } from "./configs/RostersContext";
import { InventoryProvider } from "./configs/InventoryContext";
import { TooltipProvider } from "./components/ui/tooltip";
import { ToastProvider } from "./components/ui/use-toast";
import routes from "./Routes/Routes";
import { NotificationProvider } from "./configs/notificationsContext";

function App() {
  // Create router using the imported routes configuration
  const router = createBrowserRouter(routes);

  return (
    <AuthProvider>
      <ToastProvider>
        <TooltipProvider>
          <StaffProvider>
            <InventoryProvider>
              <RosterProvider>
                <NotificationProvider>
                  <RouterProvider router={router} />
                </NotificationProvider>
              </RosterProvider>
            </InventoryProvider>
          </StaffProvider>
        </TooltipProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
