"use client";

import { createThirdwebClient } from "thirdweb";
import { ThirdwebProvider } from "thirdweb/react";

// Thirdweb client configuration
const client = createThirdwebClient({
  clientId: '653735974139d2d7320b290660b79654',
});

export function ThirdwebProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThirdwebProvider>
      {children}
    </ThirdwebProvider>
  );
}
