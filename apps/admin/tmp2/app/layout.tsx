import { AuthProvider } from "@/contexts/AuthContext";
import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { StoreProvider } from "./StoreProvider";

import "@/styles/globals.css";

interface Props {
  readonly children: ReactNode;
}

export default function DashboardRootLayout({ children }: Props) {
  return (
    <AuthProvider>
      <StoreProvider>
        <html lang="en">
          <body>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: "#363636",
                  color: "#fff",
                },
              }}
            />
          </body>
        </html>
      </StoreProvider>
    </AuthProvider>
  );
}
