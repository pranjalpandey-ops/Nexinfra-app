"""
==============================================================================
NEXINFRA AI - CIVIC DEFECT YOLO TRAINING & ONNX EXPORT PIPELINE
==============================================================================
This script trains a custom YOLO model (YOLOv8 / YOLOv9 / YOLOv11) on civic
defect datasets and automatically exports the trained weights to ONNX format
for real-time CCTV & drone video stream inference in Nexinfra.

Usage:
    # Quick start training (YOLOv8n / YOLOv11n recommended for high FPS):
    python train_yolo.py --epochs 50 --batch 16 --model yolo11n.pt

    # Training on custom GPU with specific dataset:
    python train_yolo.py --data ./data.yaml --epochs 100 --imgsz 640 --device 0
"""

import os
import sys
import shutil
import argparse
from pathlib import Path

# Ensure UTF-8 output on Windows consoles
if sys.platform == "win32" and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

def train_and_export(
    data_yaml="data.yaml",
    model_name="yolo11n.pt",   # Options: yolo11n.pt, yolo11s.pt, yolov8n.pt, yolov9c.pt
    epochs=50,
    batch_size=16,
    img_size=640,
    device="0",               # "0" for NVIDIA GPU, "cpu" for CPU
    project_dir="runs/train",
    name="nexinfra_civic_detector",
    export_to_backend=True
):
    try:
        from ultralytics import YOLO
    except ImportError:
        print("❌ Ultralytics is not installed. Please run: pip install ultralytics onnx onnxruntime")
        sys.exit(1)

    print("=" * 70)
    print("🚀 NEXINFRA AI: INITIALIZING YOLO REAL-TIME TRAINING PIPELINE")
    print("=" * 70)
    print(f"📦 Base Model Architecture : {model_name}")
    print(f"📊 Dataset Config Path     : {data_yaml}")
    print(f"🔄 Epochs                  : {epochs}")
    print(f"📦 Batch Size              : {batch_size}")
    print(f"📐 Image Input Resolution  : {img_size}x{img_size}")
    print(f"⚡ Target Compute Device   : {device}")
    print("=" * 70)

    # 1. Load Pretrained Backbone
    print(f"\n[STEP 1/4] Loading pretrained weights: {model_name}...")
    model = YOLO(model_name)

    # 2. Train on Civic Defect Dataset
    print(f"\n[STEP 2/4] Commencing Neural Network Training...")
    results = model.train(
        data=data_yaml,
        epochs=epochs,
        batch=batch_size,
        imgsz=img_size,
        device=device,
        project=project_dir,
        name=name,
        exist_ok=True,
        pretrained=True,
        optimizer="auto",
        verbose=True,
        plots=True,
        save=True,
        val=True
    )

    # 3. Model Validation
    print(f"\n[STEP 3/4] Running Validation Evaluation...")
    metrics = model.val()
    print(f"✅ Validation Complete!")
    if hasattr(metrics, 'box'):
        print(f"   - mAP50    : {metrics.box.map50:.4f}")
        print(f"   - mAP50-95 : {metrics.box.map:.4f}")

    # 4. Export to ONNX for High-Speed Real-Time Inference
    print(f"\n[STEP 4/4] Exporting model to ONNX for Real-Time Production Deployment...")
    onnx_path = model.export(
        format="onnx",
        imgsz=img_size,
        dynamic=False,
        opset=12,
        simplify=True
    )

    print(f"✅ ONNX Export Successful: {onnx_path}")

    # Copy to Nexinfra backend models directory if requested
    if export_to_backend:
        backend_models_dir = Path(__file__).resolve().parent.parent / "backend" / "models"
        backend_models_dir.mkdir(parents=True, exist_ok=True)
        dest_onnx = backend_models_dir / "model.onnx"

        shutil.copy(onnx_path, dest_onnx)
        print(f"🎯 Successfully deployed ONNX model to Nexinfra Backend: {dest_onnx}")
        print("💡 The CCTV & Video Stream backend can now run real-time inference!")

    print("\n" + "=" * 70)
    print("🎉 TRAINING & EXPORT COMPLETED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Nexinfra YOLO Defect Detection Training Pipeline")
    parser.add_argument("--data", type=str, default="data.yaml", help="Path to data.yaml file")
    parser.add_argument("--model", type=str, default="yolo11n.pt", help="Base model (e.g. yolo11n.pt, yolov8n.pt)")
    parser.add_argument("--epochs", type=int, default=50, help="Number of training epochs")
    parser.add_argument("--batch", type=int, default=16, help="Batch size")
    parser.add_argument("--imgsz", type=int, default=640, help="Image resolution")
    parser.add_argument("--device", type=str, default="0", help="CUDA device index or 'cpu'")
    parser.add_argument("--name", type=str, default="nexinfra_civic_detector", help="Experiment name")
    parser.add_argument("--no-export", action="store_true", help="Skip copying to backend/models/model.onnx")

    args = parser.parse_args()

    train_and_export(
        data_yaml=args.data,
        model_name=args.model,
        epochs=args.epochs,
        batch_size=args.batch,
        img_size=args.imgsz,
        device=args.device,
        name=args.name,
        export_to_backend=not args.no_export
    )
