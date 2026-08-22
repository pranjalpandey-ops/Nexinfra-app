import Hls from "hls.js";
import { BACKEND_API_BASE } from "./visionAiService";

/**
 * Fetches stream inventory from the Backend Stream Gateway
 */
export async function fetchCctvStreams() {
  try {
    const res = await fetch(`${BACKEND_API_BASE}/api/streams`, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(1500)
    });
    if (res.ok) {
      const data = await res.json();
      return data.streams || [];
    }
  } catch (err) {
    // offline
  }
  return null;
}

/**
 * Attaches HLS or MP4 stream to an HTML5 video element with hls.js lifecycle management
 */
export function attachHlsStream(videoElement, streamUrl, onStatusChange) {
  if (!videoElement || !streamUrl) return null;

  if (Hls.isSupported() && (streamUrl.includes(".m3u8") || streamUrl.includes("hls"))) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 30
    });

    onStatusChange?.("CONNECTING");

    hls.loadSource(streamUrl);
    hls.attachMedia(videoElement);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      onStatusChange?.("LIVE");
      videoElement.play().catch(() => {});
    });

    hls.on(Hls.Events.ERROR, (event, data) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            onStatusChange?.("OFFLINE");
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            onStatusChange?.("CONNECTING");
            hls.recoverMediaError();
            break;
          default:
            onStatusChange?.("OFFLINE");
            hls.destroy();
            break;
        }
      }
    });

    return {
      destroy: () => {
        try {
          hls.destroy();
        } catch (e) {}
      }
    };
  } else if (videoElement.canPlayType("application/vnd.apple.mpegurl") || streamUrl.endsWith(".mp4") || streamUrl.endsWith(".webm")) {
    onStatusChange?.("CONNECTING");
    videoElement.src = streamUrl;
    videoElement.onloadedmetadata = () => {
      onStatusChange?.("LIVE");
      videoElement.play().catch(() => {});
    };
    videoElement.onerror = () => {
      onStatusChange?.("OFFLINE");
    };

    return {
      destroy: () => {
        videoElement.src = "";
      }
    };
  }

  onStatusChange?.("NO_STREAM");
  return null;
}

/**
 * Formats stream status badge styling
 */
export function getStreamStatusBadge(status) {
  switch (status) {
    case "LIVE":
      return { label: "LIVE STREAM", color: "text-emerald-400 bg-emerald-950/80 border-emerald-500/60", dot: "bg-emerald-400 animate-ping", isLive: true };
    case "CONNECTING":
      return { label: "CONNECTING...", color: "text-amber-300 bg-amber-950/80 border-amber-500/60", dot: "bg-amber-400 animate-pulse", isLive: false };
    case "OFFLINE":
      return { label: "STREAM OFFLINE", color: "text-red-400 bg-red-950/80 border-red-500/60", dot: "bg-red-500", isLive: false };
    case "NO_STREAM":
      return { label: "NO STREAM CONFIGURED", color: "text-slate-400 bg-slate-900 border-slate-700", dot: "bg-slate-500", isLive: false };
    case "DEMO_SAMPLE":
    default:
      return { label: "DEMO MODE (STATIC SAMPLE)", color: "text-purple-300 bg-purple-950/80 border-purple-500/60", dot: "bg-purple-400", isLive: false };
  }
}
