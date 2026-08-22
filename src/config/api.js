/**
 * NEXINFRA CENTRALIZED AI API CONFIGURATION
 * Resolves the central backend API URL from VITE_API_URL or environment.
 * All client devices and frontend instances connect to this single central AI backend.
 */

const rawApiUrl = import.meta.env.VITE_API_URL;

// Normalize: remove trailing slash if present
export const API_URL = rawApiUrl
  ? rawApiUrl.replace(/\/+$/, "")
  : (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1"
      ? `${window.location.protocol}//${window.location.hostname}:4000`
      : "http://localhost:4000");

export default API_URL;
