"use client";

import { useEffect, useState } from "react";

export default function ExtractDataPage() {
  const [status, setStatus] = useState<string>("Processing...");
  const [extractedData, setExtractedData] = useState<any>(null);
  const [manualUrl, setManualUrl] = useState<string>("");

  const extractDataFromUrl = (url?: string) => {
    try {
      // Get the current URL or use provided URL
      const currentUrl = url || window.location.href;
      console.log("Processing URL:", currentUrl);

        // Check if this is the embedded-wallet.thirdweb.com page
        if (currentUrl.includes('embedded-wallet.thirdweb.com')) {
          // Extract authResult from URL
          const url = new URL(currentUrl);
          const urlParams = new URLSearchParams(url.search);
          const authResult = urlParams.get('authResult');
          
          if (authResult) {
            try {
              const parsedAuthResult = JSON.parse(decodeURIComponent(authResult));
              console.log("Parsed auth result:", parsedAuthResult);

              // Extract user data
              const storedToken = parsedAuthResult.storedToken;
              if (storedToken && storedToken.authDetails) {
                const userData = {
                  address: storedToken.authDetails.userWalletId || "unknown",
                  email: storedToken.authDetails.email || "unknown",
                  name: storedToken.authDetails.email?.split('@')[0] || "Social User",
                  provider: "social"
                };

                console.log("Extracted user data:", userData);
                setExtractedData(userData);

                // Save to localStorage
                localStorage.setItem('thirdweb-login-data', JSON.stringify(userData));
                setStatus("✅ Data extracted and saved to localStorage!");

                // Try to redirect back to custom page
                setTimeout(() => {
                  window.location.href = '/custom-page?login=success&address=' + encodeURIComponent(userData.address) + '&provider=social';
                }, 2000);

              } else {
                setStatus("❌ No auth details found in URL");
              }
            } catch (parseError) {
              console.error("Failed to parse auth result:", parseError);
              setStatus("❌ Failed to parse auth result");
            }
          } else {
            setStatus("❌ No authResult found in URL");
          }
        } else {
          setStatus("❌ Not on embedded-wallet.thirdweb.com page");
        }
      } catch (error) {
        console.error("Error extracting data:", error);
        setStatus("❌ Error extracting data: " + error);
      }
    };

    extractDataFromUrl();
  }, []);

  const handleManualExtract = () => {
    if (manualUrl.trim()) {
      setStatus("Processing manual URL...");
      extractDataFromUrl(manualUrl);
    } else {
      setStatus("❌ Please enter a URL");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Extracting Login Data
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {status}
          </p>
          
          {extractedData && (
            <div className="mt-4 p-3 bg-green-100 dark:bg-green-900 rounded-lg text-left">
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Extracted Data:</h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>Email:</strong> {extractedData.email}
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>Wallet ID:</strong> {extractedData.address}
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>Provider:</strong> {extractedData.provider}
              </p>
            </div>
          )}
          
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
          
          {/* Manual URL input */}
          <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Manual URL Extraction:</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              If automatic extraction didn't work, copy the URL from the login tab and paste it here:
            </p>
            <textarea
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              placeholder="Paste the embedded-wallet.thirdweb.com URL here..."
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              rows={3}
            />
            <button
              onClick={handleManualExtract}
              className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm"
            >
              Extract Data from URL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
