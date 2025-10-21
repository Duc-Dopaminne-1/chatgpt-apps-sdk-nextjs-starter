"use client";

import { useEffect } from "react";
import { createThirdwebClient } from "thirdweb";
import { createWallet } from "thirdweb/wallets";

const client = createThirdwebClient({
  clientId: "653735974139d2d7320b290660b79654",
});
const wallet = createWallet("embedded");

export default function ThirdwebCallbackPage() {
  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const provider = params.get("provider") || "unknown";
        
        // Khôi phục phiên sau redirect với strategy tương ứng
        await wallet.connect({ 
          client,
          strategy: provider as "google" | "apple"
        });

        const account = await wallet.getAccount(); // địa chỉ ví
        // Tùy phiên bản SDK, bạn có thể có thêm API để lấy email/name nếu bạn bật "Auth + OIDC"
        // ví dụ: const user = await wallet.getUser(); (nếu có)

        window.opener?.postMessage(
          {
            type: "thirdweb-login-success",
            payload: {
              address: account?.address,
              // Nếu bạn có cách lấy email/name từ SDK/BE, gán vào đây
              email: undefined,
              name: undefined,
              provider,
            },
          },
          "*" // tốt nhất thay "*" bằng origin của trang gốc
        );

        window.close();
      } catch (e) {
        console.error("Callback error:", e);
        // Trong trường hợp không có window.opener (bị chặn), có thể redirect về "/" kèm query
        // location.replace(`/?login=success`);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Finishing sign-in...
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You can close this tab.
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
