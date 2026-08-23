import os
import glob
from ultralytics import YOLO

weights = glob.glob("runs/**/weights/best.pt", recursive=True)
if not weights:
    print("❌ No trained weights found in runs/ folder. Run training first!")
else:
    best_pt = weights[-1]
    print(f"✅ Found weights at: {best_pt}")
    model = YOLO(best_pt)
    onnx_path = model.export(format="onnx", imgsz=640, opset=17, simplify=True)
    print(f"🎉 ONNX Exported: {onnx_path}")
