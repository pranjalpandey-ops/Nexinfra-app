import React, { useState, useEffect, useRef } from 'react';

const BACKEND_URL = 'http://localhost:4000';

export default function CCTVMonitor() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [defects, setDefects] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState('');

  // =========================
  // START CAMERA
  // =========================
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Camera error:', err);
        setError('Unable to access camera.');
      }
    }

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  // =========================
  // AUTOMATIC DETECTION
  // =========================
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      captureAndDetect();
    }, 2000);

    return () => clearInterval(interval);
  }, [isRunning]);

  // =========================
  // CAPTURE FRAME
  // =========================
  async function captureAndDetect() {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video.videoWidth || !video.videoHeight) {
      return;
    }

    setIsDetecting(true);
    setError('');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setIsDetecting(false);
        return;
      }

      const formData = new FormData();

      formData.append(
        'frame',
        blob,
        'cctv-frame.jpg'
      );

      try {
        const response = await fetch(
          `${BACKEND_URL}/api/detect-frame`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(
            `Backend returned ${response.status}`
          );
        }

        const data = await response.json();

        console.log('Detection result:', data);

        if (data.success) {
          setDefects(data.detections || []);
        } else {
          setDefects([]);
          setError(data.message || 'Detection failed');
        }

      } catch (err) {
        console.error('Detection error:', err);
        setError(
          'Could not connect to NEXinfra detection server.'
        );
      } finally {
        setIsDetecting(false);
      }
    }, 'image/jpeg', 0.85);
  }

  // =========================
  // TOGGLE DETECTION
  // =========================
  function toggleDetection() {
    setIsRunning((prev) => !prev);
  }

  // =========================
  // RENDER
  // =========================
  return (
    <div className="flex flex-col items-center p-6 bg-[#070A10] min-h-screen text-slate-100">

      {/* HEADER */}
      <div className="w-full max-w-5xl mb-6">

        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-2xl font-bold font-heading">
              NEXinfra CCTV Monitor
            </h2>

            <p className="text-slate-400 text-sm mt-1">
              Real-time infrastructure defect detection
            </p>
          </div>

          {/* LIVE STATUS */}
          <div className="flex items-center gap-2">

            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isRunning
                  ? 'bg-red-500 animate-pulse'
                  : 'bg-slate-500'
              }`}
            />

            <span
              className={`text-xs font-bold tracking-wider ${
                isRunning
                  ? 'text-red-400'
                  : 'text-slate-400'
              }`}
            >
              {isRunning ? 'DETECTION LIVE' : 'DETECTION OFF'}
            </span>

          </div>

        </div>

      </div>


      {/* VIDEO AREA */}
      <div className="relative w-full max-w-5xl rounded-xl overflow-hidden border border-slate-800 bg-black shadow-2xl">

        {/* CAMERA VIDEO */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full aspect-video object-cover"
        />

        {/* DETECTION OVERLAY */}
        <div className="absolute inset-0 pointer-events-none">

          {defects.map((defect, index) => {
            const box = defect.box;
            if (!box) return null;

            const boxLeft = box.normX !== undefined ? `${box.normX}%` : `${box.x}px`;
            const boxTop = box.normY !== undefined ? `${box.normY}%` : `${box.y}px`;
            const boxWidth = box.normW !== undefined ? `${box.normW}%` : `${box.width}px`;
            const boxHeight = box.normH !== undefined ? `${box.normH}%` : `${box.height}px`;
            const boxColor = defect.color || '#EF4444';

            return (
              <div
                key={index}
                className="absolute border-2 transition-all duration-200"
                style={{
                  left: boxLeft,
                  top: boxTop,
                  width: boxWidth,
                  height: boxHeight,
                  borderColor: boxColor,
                  boxShadow: `0 0 15px ${boxColor}40`,
                  backgroundColor: `${boxColor}15`
                }}
              >
                <div
                  className="absolute -top-7 left-0 text-white text-xs font-bold px-2 py-1 rounded shadow-md whitespace-nowrap flex items-center gap-1.5"
                  style={{ backgroundColor: boxColor }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  <span>{defect.class || 'DEFECT'}</span>
                  <span className="opacity-90 font-mono">
                    {Math.round((defect.confidence || 0) * 100)}%
                  </span>
                </div>
              </div>
            );
          })}

        </div>


        {/* DETECTION LOADING */}
        {isDetecting && (
          <div className="absolute top-4 right-4">

            <div className="flex items-center gap-2 bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg text-xs">

              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />

              ANALYZING FRAME...

            </div>

          </div>
        )}

      </div>


      {/* HIDDEN CANVAS */}
      <canvas
        ref={canvasRef}
        className="hidden"
      />


      {/* CONTROLS */}
      <div className="w-full max-w-5xl mt-4 flex items-center gap-3">

        <button
          onClick={toggleDetection}
          className={`px-5 py-2.5 rounded-lg font-bold transition ${
            isRunning
              ? 'bg-red-500 hover:bg-red-400 text-white'
              : 'bg-cyan-500 hover:bg-cyan-400 text-black'
          }`}
        >
          {isRunning
            ? 'Stop Detection'
            : 'Start Detection'}
        </button>


        {/* MANUAL CAPTURE */}
        <button
          onClick={captureAndDetect}
          disabled={isDetecting}
          className="px-5 py-2.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition"
        >
          {isDetecting
            ? 'Analyzing...'
            : 'Capture Frame'}
        </button>

      </div>


      {/* ERROR */}
      {error && (
        <div className="w-full max-w-5xl mt-4 bg-red-950/40 border border-red-500/40 text-red-300 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}


      {/* DETECTION RESULTS */}
      <div className="w-full max-w-5xl mt-6">

        <div className="flex items-center justify-between mb-3">

          <h3 className="text-lg font-semibold">
            Detected Defects
          </h3>

          <span className="text-xs text-slate-500">
            {defects.length} detected
          </span>

        </div>


        {defects.length === 0 ? (

          <div className="bg-[#111217] border border-slate-800 rounded-lg p-5 text-center">

            <p className="text-slate-400 text-sm">
              No defects detected.
            </p>

          </div>

        ) : (

          <div className="grid gap-3">

            {defects.map((defect, index) => (

              <div
                key={index}
                className="bg-[#111217] border border-slate-800 rounded-lg p-4 flex items-center justify-between"
              >

                <div>

                  <p className="font-bold text-white">
                    {defect.class || 'Unknown Defect'}
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Bounding box detected
                  </p>

                </div>


                <div className="text-right">

                  <p className="text-cyan-400 font-bold">
                    {Math.round(
                      (defect.confidence || 0) * 100
                    )}
                    %
                  </p>

                  <p className="text-xs text-slate-500">
                    Confidence
                  </p>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}