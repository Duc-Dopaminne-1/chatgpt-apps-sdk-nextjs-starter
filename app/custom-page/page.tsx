"use client";

import Link from "next/link";
import { createThirdwebClient } from "thirdweb";
import { useActiveAccount, useConnectModal } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
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
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);

  // Embedded wallet for social login
  const embeddedWallet = createWallet("embedded");

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleConnectGoogle = async () => {
    try {
      setIsConnectingWallet(true);

      // Connect with Google using embedded wallet
      await embeddedWallet.connect({
        client: client,
        strategy: "google",
      });

      // Get account after connection
      const connectedAccount = await embeddedWallet.getAccount();

      setUserInfo({
        email: "user@example.com", // This would come from the auth response
        name: "Google User",
        provider: "google"
      });

      console.log("Connected account:", connectedAccount);

    } catch (error) {
      console.error("Google connection failed:", error);
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const handleConnectApple = async () => {
    try {
      setIsConnectingWallet(true);

      // Connect with Apple using embedded wallet
      await embeddedWallet.connect({
        client: client,
        strategy: "apple",
      });

      // Get account after connection
      const connectedAccount = await embeddedWallet.getAccount();

      setUserInfo({
        email: "user@icloud.com", // This would come from the auth response
        name: "Apple User",
        provider: "apple"
      });

      console.log("**** Connected account:", connectedAccount);

    } catch (error) {
      console.error("Apple connection failed:", error);
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await embeddedWallet.disconnect();
      setUserInfo(null);
    } catch (error) {
      console.error("Disconnect failed:", error);
    }
  };

  const handleGetUserData = async () => {
    try {
      setIsLoadingUserData(true);
      console.log("Getting user data after social login...");
      
      // Try to get account from embedded wallet
      const connectedAccount = await embeddedWallet.getAccount();
      console.log("Retrieved account:", connectedAccount);
      
      if (connectedAccount?.address) {
        setUserInfo({
          address: connectedAccount.address,
          email: "user@example.com", // This would come from the auth response
          name: "Social User",
          provider: "social"
        });
        console.log("User data updated successfully!");
      } else {
        console.log("No account found. Please try logging in again.");
        alert("No account found. Please try logging in again.");
      }
    } catch (error) {
      console.error("Failed to get user data:", error);
      alert("Failed to get user data. Please try logging in again.");
    } finally {
      setIsLoadingUserData(false);
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
            {account || userInfo ? (
                <div className="w-full bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                      Wallet Connected
                    </h3>
                  </div>
                  <div className="space-y-2 text-sm text-green-800 dark:text-green-200">
                    {(account || userInfo?.address) && (
                      <p><strong>Address:</strong> {account?.address || userInfo?.address}</p>
                    )}
                    {userInfo && (
                        <>
                          {userInfo.email && <p><strong>Email:</strong> {userInfo.email}</p>}
                          {userInfo.name && <p><strong>Name:</strong> {userInfo.name}</p>}
                          <p><strong>Provider:</strong> {userInfo.provider}</p>
                        </>
                    )}
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
                <div className="w-full space-y-3">
                  {/* Google Connect Button */}
                  <button
                      onClick={handleConnectGoogle}
                      disabled={isConnectingWallet}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white disabled:text-gray-300 font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                  >
                    {isConnectingWallet ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                    )}
                    {isConnectingWallet ? "Connecting..." : "Connect with Google"}
                  </button>

                  {/* Apple Connect Button */}
                  <button
                      onClick={handleConnectApple}
                      disabled={isConnectingWallet}
                      className="w-full bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800 disabled:from-gray-400 disabled:to-gray-500 text-white disabled:text-gray-300 font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                  >
                    {isConnectingWallet ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                        </svg>
                    )}
                    {isConnectingWallet ? "Connecting..." : "Connect with Apple"}
                  </button>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                    Choose your preferred login method
                  </p>
                </div>
            )}
          </div>

          {/* Get User Data Button - for after social login */}
          {!userInfo && !account && (
            <div className="w-full bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Already logged in elsewhere?
              </h3>
              <p className="text-xs text-blue-800 dark:text-blue-200 mb-3">
                If you've already logged in with Google/Apple in another tab, click below to retrieve your data.
              </p>
              <button
                onClick={handleGetUserData}
                disabled={isLoadingUserData}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white disabled:text-gray-300 font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoadingUserData ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Getting User Data...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Get My User Data
                  </>
                )}
              </button>
            </div>
          )}

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
