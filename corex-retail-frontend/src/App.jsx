import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./configs/AuthContext";
import { StaffProvider } from "./configs/StaffContext";
import { RosterProvider } from "./configs/RostersContext";
import { InventoryProvider } from "./configs/InventoryContext";
import { SalesProvider } from "./configs/SalesContext";
import { ProfileProvider } from "./configs/ProfileContext";
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
          <ProfileProvider>
            <StaffProvider>
              <InventoryProvider>
                <RosterProvider>
                  <SalesProvider>
                    <NotificationProvider>
                      <RouterProvider router={router} />
                    </NotificationProvider>
                  </SalesProvider>
                </RosterProvider>
              </InventoryProvider>
            </StaffProvider>
          </ProfileProvider>
        </TooltipProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
