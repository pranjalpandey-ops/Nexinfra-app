import React, { useState, useEffect, useRef } from 'react';

// Simple CCTV monitor that captures webcam video, sends frames to backend for detection,
// and displays the returned defect information.
export default function CCTVMonitor() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [defects, setDefects] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  // Start webcam stream when component mounts
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error('Camera error:', err);
      }
    }
    startCamera();
    return () => {
        // Stop all tracks on unmount
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(t => t.stop());
        }
    };
  }, []);

  // Capture a frame and send to backend every interval
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(captureAndDetect, 2000); // every 2 seconds
    return () => clearInterval(interval);
  }, [isRunning]);

  async function captureAndDetect() {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(async blob => {
      if (!blob) return;
      const form = new FormData();
      form.append('frame', blob, 'frame.jpg');
      try {
        const resp = await fetch('http://localhost:4000/api/detect', {
          method: 'POST',
          body: form,
        });
        const data = await resp.json();
        setDefects(prev => [...prev, data]);
      } catch (e) {
        console.error('Detection error', e);
      }
    }, 'image/jpeg');
  }

  return (
    <div className="flex flex-col items-center p-4 bg-[#070A10] min-h-screen text-slate-100">
      <h2 className="text-2xl font-bold mb-4">CCTV Live Monitor</h2>
      <video
        ref={videoRef}
        autoPlay
        muted
        className="w-full max-w-2xl rounded-lg shadow-lg"
        onClick={() => setIsRunning(!isRunning)}
        title="Click video to start/stop detection"
      />
      {/* Hidden canvas used for frame extraction */}
      <canvas ref={canvasRef} className="hidden" />
      <button
        onClick={() => setIsRunning(!isRunning)}
        className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded transition"
      >
        {isRunning ? 'Stop Detection' : 'Start Detection'}
      </button>
      <div className="mt-6 w-full max-w-2xl">
        <h3 className="text-xl font-semibold mb-2">Detected Defects</h3>
        {defects.length === 0 && <p className="text-slate-400">No detections yet.</p>}
        <ul className="space-y-2">
          {defects.map((d, i) => (
            <li key={i} className="bg-[#111217] p-3 rounded">
              <pre className="text-xs overflow-x-auto">{JSON.stringify(d, null, 2)}</pre>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
