/**
 * NEXINFRA CENTRALIZED AI API CONFIGURATION
 * Resolves the central backend API URL from localStorage, VITE_API_URL, or production Render server.
 */

export const PRODUCTION_BACKEND_URL = "https://nexinfra-app-main.onrender.com";

export function getResolvedApiUrl() {
  if (typeof window !== "undefined") {
    // 1. User manual override in Settings modal
    const customUrl = localStorage.getItem("nexinfra_api_url");
    if (customUrl && customUrl.trim()) return customUrl.trim().replace(/\/+$/, "");
  }

  // 2. Build-time environment variable
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
    return envUrl.replace(/\/+$/, "");
  }

  // 3. Local development
  if (typeof window !== "undefined") {
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (isLocalhost) {
      return ""; // Use same-origin relative paths which Vite proxies to http://127.0.0.1:4000
    }
  }

  // 4. Production Vercel / Cloud fallback (routes via Vercel proxy or direct Render HTTPS)
  return "";
}

export const API_URL = getResolvedApiUrl();
export default API_URL;
