/**
 * NEXINFRA CENTRALIZED AI API CONFIGURATION
 * Resolves the central backend API URL from VITE_API_URL, localStorage, or dynamic hostname.
 * All client devices and frontend instances connect to this central AI backend.
 */

export function getResolvedApiUrl() {
  if (typeof window !== "undefined") {
    const customUrl = localStorage.getItem("nexinfra_api_url");
    if (customUrl) return customUrl.replace(/\/+$/, "");
  }

  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
    return envUrl.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined" && window.location.hostname) {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:4000`;
  }

  return "http://localhost:4000";
}

export const API_URL = getResolvedApiUrl();
export default API_URL;
