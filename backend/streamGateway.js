/**
 * NEXINFRA CCTV STREAM & RTSP MEDIA GATEWAY
 * Manages RTSP stream ingestion, HLS transcoding, WebRTC WHEP bridging,
 * and explicit stream connectivity statuses (LIVE, CONNECTING, OFFLINE, NO STREAM CONFIGURED, DEMO_SAMPLE).
 */

const DEFAULT_STREAMS = [
  {
    id: "CAM-01",
    name: "Western Expressway - Sector 4",
    location: "Ward 4 • Km 14.2 Flyover Approach",
    category: "Road Damage / Pothole",
    latitude: 28.6139,
    longitude: 77.2090,
    ward: "Central District - Ward 4",
    streamType: "hls", // "hls" | "webrtc" | "video" | "demo"
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    rtspUrl: "rtsp://gateway.nexinfra.local:8554/cam01",
    status: "LIVE", // "LIVE" | "CONNECTING" | "OFFLINE" | "NO_STREAM" | "DEMO_SAMPLE"
    mediaGateway: "MediaMTX / FFmpeg HLS",
    resolution: "1080p @ 30fps",
    bitrate: "5.4 Mbps",
    fps: 30,
    sampleImage: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1200&auto=format&fit=crop&q=80",
    lastActive: new Date().toISOString()
  },
  {
    id: "CAM-02",
    name: "Hydro Main Junction - Sector 7",
    location: "Ward 7 • Subsurface Pipeline Grid",
    category: "Water / Drainage Burst",
    latitude: 28.6220,
    longitude: 77.2140,
    ward: "Sector 18 Ward - Zone A",
    streamType: "hls",
    streamUrl: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
    rtspUrl: "rtsp://gateway.nexinfra.local:8554/cam02",
    status: "LIVE",
    mediaGateway: "MediaMTX / FFmpeg HLS",
    resolution: "1080p @ 30fps",
    bitrate: "4.8 Mbps",
    fps: 30,
    sampleImage: "https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=1200&auto=format&fit=crop&q=80",
    lastActive: new Date().toISOString()
  },
  {
    id: "CAM-03",
    name: "Civic Market Center - South Ward",
    location: "Ward 9 • Central Commercial Plaza",
    category: "Solid Waste Overflow",
    latitude: 28.6060,
    longitude: 77.1945,
    ward: "North Green Corridor - Ward 2",
    streamType: "webrtc",
    streamUrl: "",
    rtspUrl: "",
    status: "NO_STREAM",
    mediaGateway: "WebRTC / WHEP Gateway",
    resolution: "720p @ 30fps",
    bitrate: "3.2 Mbps",
    fps: 0,
    sampleImage: "https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=1200&auto=format&fit=crop&q=80",
    lastActive: null
  },
  {
    id: "CAM-04",
    name: "Metro Viaduct Pillar #42",
    location: "Ward 12 • Ring Road Transit Corridor",
    category: "Structural Anomaly / Bridge Crack",
    latitude: 28.6290,
    longitude: 77.2020,
    ward: "Cyber Hub Transit Corridor - Ward 12",
    streamType: "hls",
    streamUrl: "https://cph-p2p-msl.akamaized.net/hls/live/200034/test/master.m3u8",
    rtspUrl: "rtsp://gateway.nexinfra.local:8554/cam04",
    status: "LIVE",
    mediaGateway: "MediaMTX / FFmpeg HLS",
    resolution: "4K UHD @ 60fps",
    bitrate: "12.0 Mbps",
    fps: 60,
    sampleImage: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=1200&auto=format&fit=crop&q=80",
    lastActive: new Date().toISOString()
  },
  {
    id: "CAM-05",
    name: "High-Tension Grid Substation 3",
    location: "Ward 2 • Industrial Power Ring",
    category: "Electrical & Streetlight",
    latitude: 28.6010,
    longitude: 77.2280,
    ward: "East Ring Ward 8",
    streamType: "rtsp",
    streamUrl: "",
    rtspUrl: "rtsp://192.168.1.105:554/live",
    status: "OFFLINE",
    mediaGateway: "RTSP Native Gateway (Camera Offline)",
    resolution: "1080p @ 30fps",
    bitrate: "0 Mbps",
    fps: 0,
    sampleImage: "https://images.unsplash.com/photo-1509390144018-8bc7f2868846?w=1200&auto=format&fit=crop&q=80",
    lastActive: null
  },
  {
    id: "CAM-06",
    name: "City Botanical Green Corridor",
    location: "Ward 15 • Public Park Expressway Perimeter",
    category: "Public Park & Greenery Hazard",
    latitude: 28.6065,
    longitude: 77.1950,
    ward: "South Perimeter Parks - Ward 15",
    streamType: "demo",
    streamUrl: "",
    rtspUrl: "",
    status: "DEMO_SAMPLE",
    mediaGateway: "Static Demo Asset (No Live RTSP Stream)",
    resolution: "1080p @ 30fps",
    bitrate: "--",
    fps: 0,
    sampleImage: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&auto=format&fit=crop&q=80",
    lastActive: null
  }
];

const activeStreams = new Map(DEFAULT_STREAMS.map((s) => [s.id, { ...s }]));

export function getAllStreams() {
  return Array.from(activeStreams.values());
}

export function getStreamById(id) {
  return activeStreams.get(id) || null;
}

export function registerStream(id, streamConfig) {
  const existing = activeStreams.get(id) || { id };
  const updated = {
    ...existing,
    ...streamConfig,
    lastActive: new Date().toISOString()
  };
  activeStreams.set(id, updated);
  return updated;
}

/**
 * Returns configuration blueprint for MediaMTX / FFmpeg RTSP ingestion
 */
export function getMediaGatewayConfig() {
  return {
    gateway: "MediaMTX (formerly rtsp-simple-server) & FFmpeg Transcoder Gateway",
    supportedProtocols: ["RTSP", "RTMP", "HLS", "WebRTC / WHEP", "LL-HLS"],
    rtspPort: 8554,
    hlsPort: 8888,
    webrtcPort: 8889,
    ffmpegTemplate: "ffmpeg -rtsp_transport tcp -i rtsp://<CAMERA_IP>:554/stream -c:v copy -c:a copy -f hls -hls_time 1 -hls_list_size 3 -hls_flags delete_segments /var/www/hls/<STREAM_ID>.m3u8",
    mediamtxConfigExample: {
      paths: {
        all: {
          source: "publisher",
          sourceOnDemand: "yes"
        }
      }
    }
  };
}
