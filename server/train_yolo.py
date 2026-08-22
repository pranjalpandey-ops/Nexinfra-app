"""
NEXINFRA YOLO CUSTOM MODEL TRAINER
Script to fine-tune YOLOv8 / YOLOv9 on the 6 Municipal Civic Defect Classes.
"""

import os
import yaml
from pathlib import Path

try:
    from ultralytics import YOLO
except ImportError:
    print("❌ Please install ultralytics: pip install ultralytics")
    exit(1)

# Dataset YAML Configuration
DATASET_CONFIG = {
    "path": "./dataset",
    "train": "images/train",
    "val": "images/val",
    "names": {
        0: "pothole",
        1: "water_burst",
        2: "solid_waste",
        3: "electrical_hazard",
        4: "bridge_crack",
        5: "fallen_tree"
    }
}

def create_dataset_yaml(output_path="civic_defects.yaml"):
    with open(output_path, "w") as f:
        yaml.dump(DATASET_CONFIG, f, default_flow_style=False)
    print(f"✅ Created dataset configuration at: {output_path}")
    return output_path

def train_custom_yolo(
    base_model="yolov8n.pt",
    epochs=50,
    imgsz=640,
    batch=16,
    device="cpu"
):
    print("=" * 60)
    print(f"🚀 Starting Ultralytics YOLO Fine-Tuning ({base_model})")
    print(f"   Classes: 6 Municipal Defect Classes")
    print(f"   Epochs: {epochs} | Batch: {batch} | Image Size: {imgsz}")
    print("=" * 60)

    yaml_file = create_dataset_yaml()
    
    # Load base model
    model = YOLO(base_model)

    try:
        # Start training
        results = model.train(
            data=yaml_file,
            epochs=epochs,
            imgsz=imgsz,
            batch=batch,
            device=device,
            name="nexinfra_civic_yolo",
            save=True,
            plots=True
        )

        print("\n🎉 Training completed successfully!")
        print(f"📁 Best weights saved to: runs/detect/nexinfra_civic_yolo/weights/best.pt")

        # Export to ONNX for optional in-browser execution
        onnx_path = model.export(format="onnx")
        print(f"📦 Exported ONNX model to: {onnx_path}")

        return results
    except Exception as e:
        print(f"ℹ️ Training requires labeled dataset in ./dataset folder: {e}")
        print("💡 You can download the pre-labeled Civic Defect dataset from Roboflow or use the default pre-trained weights.")

if __name__ == "__main__":
    train_custom_yolo(epochs=25)
