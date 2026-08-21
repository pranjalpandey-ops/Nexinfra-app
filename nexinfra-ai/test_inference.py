"""
==============================================================================
NEXINFRA AI - REAL-TIME YOLO INFERENCE & WEBCAM TESTER
==============================================================================
Tests the trained YOLO / ONNX model directly against a webcam stream,
video file, or test images to inspect FPS and bounding boxes.

Usage:
    # Test on Live Webcam:
    python test_inference.py --source 0

    # Test on an Image or Video File:
    python test_inference.py --source test_image.jpg --conf 0.4
"""

import sys
import time
import argparse
from pathlib import Path

# Ensure UTF-8 output on Windows consoles
if sys.platform == "win32" and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

def run_realtime_test(source="0", model_path="../backend/models/model.onnx", conf_thresh=0.45):
    try:
        import cv2
        from ultralytics import YOLO
    except ImportError:
        print("❌ Please install dependencies: pip install opencv-python ultralytics")
        sys.exit(1)

    # If ONNX file exists, load it directly, else fallback to best.pt or yolo11n.pt
    target_model = model_path
    if not Path(target_model).exists():
        fallback_pt = "runs/train/nexinfra_civic_detector/weights/best.pt"
        if Path(fallback_pt).exists():
            target_model = fallback_pt
        else:
            target_model = "yolo11n.pt"
            print(f"⚠️ Model at {model_path} not found. Defaulting to pretrained {target_model}")

    print(f"⚡ Loading model for Real-time test: {target_model}")
    model = YOLO(target_model, task="detect")

    # Camera / Video source
    is_cam = source.isdigit()
    cam_index = int(source) if is_cam else source
    cap = cv2.VideoCapture(cam_index)

    if not cap.isOpened():
        print(f"❌ Failed to open video source: {source}")
        return

    print("🎥 Live Inference Started! Press 'q' to exit.")
    fps_history = []

    while True:
        start_time = time.time()
        ret, frame = cap.read()
        if not ret:
            print("Video stream ended or frame unavailable.")
            break

        # Run inference
        results = model.predict(frame, conf=conf_thresh, verbose=False)
        annotated_frame = results[0].plot()

        # Compute FPS
        elapsed = time.time() - start_time
        fps = 1.0 / elapsed if elapsed > 0 else 0
        fps_history.append(fps)
        if len(fps_history) > 30:
            fps_history.pop(0)
        avg_fps = sum(fps_history) / len(fps_history)

        # Draw HUD overlay
        cv2.putText(
            annotated_frame,
            f"NEXINFRA YOLO REAL-TIME | FPS: {avg_fps:.1f}",
            (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (0, 255, 255),
            2
        )

        cv2.imshow("Nexinfra Real-Time YOLO Defect Monitor", annotated_frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    print("🛑 Live Inference Stopped.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Nexinfra Real-time Inference Tester")
    parser.add_argument("--source", type=str, default="0", help="Webcam index (0) or path to video/image")
    parser.add_argument("--model", type=str, default="../backend/models/model.onnx", help="Path to ONNX or PT model")
    parser.add_argument("--conf", type=float, default=0.40, help="Confidence threshold")
    args = parser.parse_args()

    run_realtime_test(source=args.source, model_path=args.model, conf_thresh=args.conf)
