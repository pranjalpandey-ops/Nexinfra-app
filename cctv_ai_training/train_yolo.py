import os
import glob
import torch
from ultralytics import YOLO

def main():
    print(f"CUDA Available: {torch.cuda.is_available()}")
    yaml_path = os.path.join(os.path.dirname(__file__), "cctv_7class_dataset.yaml")
    
    print("🔥 Loading YOLOv8 nano pretrained model...")
    model = YOLO("yolov8n.pt")
    
    print("🚀 Starting training for 50 epochs...")
    results = model.train(
        data=yaml_path,
        epochs=50,
        imgsz=640,
        batch=16,
        device=0 if torch.cuda.is_available() else "cpu",
        name="nexinfra_cctv_run"
    )
    
    print("📦 Exporting to ONNX format...")
    weights = glob.glob("runs/**/nexinfra_cctv_run/weights/best.pt", recursive=True)
    best_pt = weights[-1] if weights else "runs/detect/nexinfra_cctv_run/weights/best.pt"
    trained_model = YOLO(best_pt)
    onnx_file = trained_model.export(format="onnx", imgsz=640, opset=17, simplify=True)
    print(f"🎉 Model exported successfully to: {onnx_file}")

if __name__ == "__main__":
    main()
