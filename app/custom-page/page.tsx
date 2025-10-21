"use client";

import Link from "next/link";
import { createThirdwebClient } from "thirdweb";
import { useActiveAccount, useConnectModal } from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";
import { useState, useEffect } from "react";
import { Wallet } from "lucide-react";

// Thirdweb client configuration
const client = createThirdwebClient({
  clientId: '653735974139d2d7320b290660b79654',
});

export default function HomePage() {
  const { isConnecting, connect } = useConnectModal();
  const account = useActiveAccount();
  const [isMobile, setIsMobile] = useState(false);

  // In-app wallet with social login
  const iaWallet = inAppWallet({ 
    auth: { 
      options: ['apple', 'google'] 
    } 
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleConnect = async () => {
    try {
      await connect({
        client: client,
        wallets: [iaWallet],
      });
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await iaWallet.disconnect();
    } catch (error) {
      console.error("Disconnect failed:", error);
    }
  };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start max-w-2xl w-full">
        <h1 className="text-4xl font-black tracking-tight text-center sm:text-left">
          Welcome to Social Login
        </h1>
        
        <p className="font-mono text-sm/6 text-center sm:text-left tracking-[-.01em] max-w-xl">
          Connect your wallet using Apple or Google social login powered by Thirdweb.
        </p>

        {/* Wallet Connection Section */}
        <div className="w-full flex flex-col gap-4 items-center">
          {account ? (
            <div className="w-full bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                  Wallet Connected
                </h3>
              </div>
              <div className="space-y-2 text-sm text-green-800 dark:text-green-200">
                <p><strong>Address:</strong> {account.address}</p>
                <p><strong>Connected:</strong> Yes</p>
              </div>
              <button
                onClick={handleDisconnect}
                className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Disconnect Wallet
              </button>
            </div>
          ) : (
            <div className="w-full">
              {/* Connect Wallet Button */}
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-orange-500 hover:to-yellow-400 disabled:from-gray-400 disabled:to-gray-500 text-black disabled:text-gray-300 font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
              >
                {isMobile ? <Wallet size={20} /> : null}
                {isConnecting ? "Connecting..." : "Connect Wallet"}
                {!isMobile && <Wallet size={20} />}
              </button>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Connect with Apple or Google
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-4 items-center flex-col sm:flex-row w-full">
          <Link 
            href="/"
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto"
          >
            Go to the main page
          </Link>
        </div>
      </main>
    </div>
  );
}
