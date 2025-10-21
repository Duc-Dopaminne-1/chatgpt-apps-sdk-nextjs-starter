"use client";

import Link from "next/link";
import { createThirdwebClient } from "thirdweb";
import { useActiveAccount, useConnectModal } from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";
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
  const [notification, setNotification] = useState<string | null>(null);

  // In-app wallet for email and Google login
  const iaWallet = inAppWallet({
    auth: {
      options: ['email', 'google']
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

  // Auto-dismiss notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Check for existing login data on component mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check localStorage for any existing login data
    const checkExistingLogin = () => {
      try {
        const existingData = localStorage.getItem('thirdweb-login-data');
        if (existingData) {
          const parsedData = JSON.parse(existingData);
          console.log("Found existing login data:", parsedData);
          setUserInfo(parsedData);
          setNotification("✅ Found existing login data!");
        }
      } catch (error) {
        console.log("No existing login data found");
      }
    };

    // Check URL parameters for login success
    const checkUrlParams = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const loginSuccess = urlParams.get('login');
      const address = urlParams.get('address');
      const provider = urlParams.get('provider');

      if (loginSuccess === 'success' && address) {
        const userData = {
          address: address,
          email: "user@example.com",
          name: "Social User",
          provider: provider || "social"
        };

        setUserInfo(userData);
        localStorage.setItem('thirdweb-login-data', JSON.stringify(userData));
        setNotification("✅ Login data retrieved from URL!");

        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (loginSuccess === 'error') {
        const error = urlParams.get('error');
        setNotification(`❌ Login failed: ${error || 'Unknown error'}`);

        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    checkExistingLogin();
    checkUrlParams();
  }, []);

  // Handle external links with window.openai.openExternal()
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleClick = (e: Event) => {
      const a = (e?.target as HTMLElement)?.closest("a");
      if (!a || !a.href) return;

      const url = new URL(a.href, window.location.href);
      const appOrigin = window.location.origin;

      // Check if it's an external link
      if (
        url.origin !== window.location.origin &&
        url.origin !== appOrigin
      ) {
        try {
          if (window.openai) {
            window.openai.openExternal({ href: a.href });
            e.preventDefault();
            console.log("External link opened via openai.openExternal:", a.href);
          }
        } catch (error) {
          console.warn("openExternal failed, likely not in OpenAI client:", error);
        }
      }
    };

    // Use capture phase to intercept before Next.js Link components
    window.addEventListener("click", handleClick, true);

    return () => {
      window.removeEventListener("click", handleClick, true);
    };
  }, []);

  const handleEmailLogin = async () => {
    try {
      setIsConnectingWallet(true);
      console.log("Connecting with email...");

      await connect({
        client: client,
        wallets: [iaWallet],
      });

      console.log("Email connection initiated");

      // Try to get account after connection
      setTimeout(async () => {
        try {
          const connectedAccount = await iaWallet.getAccount();
          if (connectedAccount?.address) {
            console.log("Got account after email login:", connectedAccount);
            const userData = {
              address: connectedAccount.address,
              email: "user@example.com", // This would come from the auth response
              name: "Email User",
              provider: "email"
            };
            setUserInfo(userData);

            // Save to localStorage
            if (typeof window !== 'undefined') {
              localStorage.setItem('thirdweb-login-data', JSON.stringify(userData));
            }

            setNotification("✅ Email login successful!");
          }
        } catch (error) {
          console.log("Failed to get account after email login:", error);
          setNotification("❌ Failed to get account. Please try again.");
        }
      }, 2000);

    } catch (error) {
      console.error("Email connection failed:", error);
      setNotification("❌ Email login failed. Please try again.");
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsConnectingWallet(true);
      console.log("Connecting with Google...");

      await connect({
        client: client,
        wallets: [iaWallet],
      });

      console.log("Google connection initiated");

      // Try to get account after connection
      setTimeout(async () => {
        try {
          const connectedAccount = await iaWallet.getAccount();
          if (connectedAccount?.address) {
            console.log("Got account after Google login:", connectedAccount);
            const userData = {
              address: connectedAccount.address,
              email: "user@gmail.com", // This would come from the auth response
              name: "Google User",
              provider: "google"
            };
            setUserInfo(userData);

            // Save to localStorage
            if (typeof window !== 'undefined') {
              localStorage.setItem('thirdweb-login-data', JSON.stringify(userData));
            }

            setNotification("✅ Google login successful!");
          }
        } catch (error) {
          console.log("Failed to get account after Google login:", error);
          setNotification("❌ Failed to get account. Please try again.");
        }
      }, 2000);

    } catch (error) {
      console.error("Google connection failed:", error);
      setNotification("❌ Google login failed. Please try again.");
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await iaWallet.disconnect();
      setUserInfo(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('thirdweb-login-data');
      }
      console.log("Disconnected successfully");
    } catch (error) {
      console.error("Disconnect failed:", error);
    }
  };

  const handleGetUserData = async () => {
    const appOrigin = window.location.origin;

    window.addEventListener(
        "click",
        (e) => {
          const a = (e?.target as HTMLElement)?.closest("a");
          if (!a || !a.href) return;

          const url = new URL(a.href, window.location.href);

          // Nếu là link ngoài (khác origin hiện tại)
          if (url.origin !== window.location.origin && url.origin !== appOrigin) {
            try {
              if (window.openai) {
                // Dùng API của OpenAI client để mở link ngoài
                window.openai.openExternal({ href: a.href });
                e.preventDefault();
              } else {
                // Fallback: mở link bằng tab mới trong trình duyệt
                window.open(a.href, "_blank", "noopener,noreferrer");
                e.preventDefault();
              }
            } catch (err) {
              console.warn("openExternal failed, fallback to window.open", err);
              window.open(a.href, "_blank", "noopener,noreferrer");
              e.preventDefault();
            }
          }
        },
        true // Capture phase
    );

// Ví dụ: thêm link để thử
    const link = document.createElement("a");
    link.href = "https://www.youtube.com/";
    link.textContent = "Mở YouTube";
    link.style.fontSize = "20px";
    link.style.display = "block";
    link.style.margin = "20px";
    document.body.appendChild(link);


    try {
      setIsLoadingUserData(true);
      setNotification(null);
      console.log("Getting user data after social login...");
      console.log("Button clicked successfully!");

      // First, try to get from localStorage (in case login happened in another tab)
      const existingData = localStorage.getItem('thirdweb-login-data');
      if (existingData) {
        try {
          const parsedData = JSON.parse(existingData);
          if (parsedData.address) {
            setUserInfo(parsedData);
            setNotification("✅ User data found in localStorage!");
            return;
          }
        } catch (e) {
          console.log("Failed to parse existing data");
        }
      }

      // Create a timeout promise to prevent infinite waiting
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: No response from wallet')), 10000); // 10 seconds timeout
      });

      // Try to get account from in-app wallet with timeout
      const connectedAccount = await Promise.race([
        iaWallet.getAccount(),
        timeoutPromise
      ]) as any;

      console.log("Retrieved account:", connectedAccount);

      if (connectedAccount && typeof connectedAccount === 'object' && 'address' in connectedAccount && connectedAccount.address) {
        const userData = {
          address: connectedAccount.address,
          email: "user@example.com", // This would come from the auth response
          name: "Social User",
          provider: "social"
        };

        setUserInfo(userData);

        // Save to localStorage for persistence
        if (typeof window !== 'undefined') {
          localStorage.setItem('thirdweb-login-data', JSON.stringify(userData));
        }

        setNotification("✅ User data retrieved successfully!");
        console.log("User data updated successfully!");
      } else {
        console.log("No account found. Please try logging in again.");
        setNotification("❌ No account found. Please try logging in again.");
      }
    } catch (error) {
      console.error("Failed to get user data:", error);

      // Check if it's a timeout error
      if (error instanceof Error && error.message.includes('Timeout')) {
        setNotification("⏰ Login timeout. Please try logging in again or check if popup was blocked.");
      } else {
        setNotification("❌ Failed to get user data. Please try logging in again.");
      }
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
                <div className="w-full space-y-4">
                  {/* Login Buttons */}
                  <div className="space-y-3">
                    {/* Google Login Button */}
                    <button
                      onClick={handleGoogleLogin}
                      disabled={isConnectingWallet}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white disabled:text-gray-300 font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                    >
                      {isConnectingWallet ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Connecting...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          Connect with Google
                        </>
                      )}
                    </button>

                    {/* Email Login Button */}
                    <button
                      onClick={handleEmailLogin}
                      disabled={isConnectingWallet}
                      className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 disabled:from-gray-400 disabled:to-gray-500 text-white disabled:text-gray-300 font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                    >
                      {isConnectingWallet ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Connecting...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Connect with Email
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Choose your preferred login method to create or access your wallet
                  </p>
                </div>
            )}
          </div>

          {/* Get User Data Button - for after login */}
          {!userInfo && !account && (
            <div className="w-full bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Already logged in elsewhere?
              </h3>
              <p className="text-xs text-blue-800 dark:text-blue-200 mb-3">
                If you've already logged in with Google/Email in another tab, click below to retrieve your data.
              </p>

              {/* Debug info for iframe */}
              <div className="text-xs text-blue-600 dark:text-blue-400 mb-2 p-2 bg-blue-100 dark:bg-blue-900 rounded">
                <p><strong>Environment:</strong> {typeof window !== 'undefined' && window.parent !== window ? 'In iframe' : 'Standalone'}</p>
                <p><strong>Button Status:</strong> {isLoadingUserData ? 'Loading...' : 'Ready'}</p>
              </div>

              <button
                onClick={handleGetUserData}
                disabled={isLoadingUserData}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white disabled:text-gray-300 font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                style={{
                  pointerEvents: 'auto',
                  touchAction: 'manipulation',
                  userSelect: 'none'
                }}
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

              {/* Notification display */}
              {notification && (
                <div className={`mt-2 p-2 rounded text-xs ${
                  notification.includes('✅') 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : notification.includes('⏰')
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {notification}
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      const data = localStorage.getItem('thirdweb-login-data');
                      if (data) {
                        try {
                          const parsed = JSON.parse(data);
                          setUserInfo(parsed);
                          setNotification("✅ Data loaded from localStorage!");
                        } catch (e) {
                          setNotification("❌ Invalid data in localStorage");
                        }
                      } else {
                        setNotification("❌ No data found in localStorage");
                      }
                    }
                  }}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded text-xs"
                >
                  Check localStorage
                </button>

                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem('thirdweb-login-data');
                      setUserInfo(null);
                      setNotification("🔄 Data cleared. Please try logging in again.");
                    }
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-1 px-2 rounded text-xs"
                >
                  Clear Data
                </button>
              </div>

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
