# 🚀 Nexinfra YOLO Real-Time Defect Detection Training Guide

This guide details the complete end-to-end pipeline to train a custom **YOLOv8 / YOLOv9 / YOLOv11** neural network for municipal defect detection and deploy it into the **Nexinfra CCTV & Live Video Engine**.

---

## 🏗️ 6-Class Municipal Defect Taxonomy
The model is configured to detect and triage 6 core smart-city civic defect classes:

| Class ID | Defect Category | Assigned Department | SLA | Color |
|---|---|---|---|---|
| **0** | `pothole_road_defect` | Road Works & Pavement | 4h | 🔴 `#EF4444` |
| **1** | `water_drainage_burst` | Hydro & Water Supply Grid | 3h | 🔵 `#00F0FF` |
| **2** | `garbage_waste_overflow` | Sanitation & Solid Waste | 8h | 🟡 `#F59E0B` |
| **3** | `electrical_hazard` | Power & Streetlight Grid | 2h | 🟠 `#F97316` |
| **4** | `structural_bridge_crack` | Structural Engineering | 4h | 🟣 `#8B5CF6` |
| **5** | `tree_greenery_hazard` | Urban Forestry & Parks | 6h | 🟢 `#10B981` |

---

## 🛠️ Method A: Train on Google Colab (Free GPU - Recommended)

Google Colab provides free NVIDIA T4 / V100 GPUs for fast training in ~15–20 minutes.

### 1. Open Google Colab & Select GPU
1. Go to [colab.research.google.com](https://colab.research.google.com).
2. Set Runtime to **T4 GPU** (`Runtime > Change runtime type > T4 GPU`).

### 2. Run the Training Script
Copy and paste this code cell in Colab:

```python
# 1. Install Ultralytics & ONNX
!pip install -q ultralytics onnx onnxruntime

# 2. Setup Dataset & Configuration
import yaml
from ultralytics import YOLO

# Define data.yaml directly in Colab
data_config = {
    'path': '/content/dataset', # Path to dataset
    'train': 'images/train',
    'val': 'images/val',
    'nc': 6,
    'names': [
        'pothole_road_defect',
        'water_drainage_burst',
        'garbage_waste_overflow',
        'electrical_hazard',
        'structural_bridge_crack',
        'tree_greenery_hazard'
    ]
}

with open('data.yaml', 'w') as f:
    yaml.dump(data_config, f)

# 3. Train YOLOv11 / YOLOv8 Nano for Real-Time High FPS
model = YOLO("yolo11n.pt")  # Pretrained weights

results = model.train(
    data="data.yaml",
    epochs=50,
    imgsz=640,
    batch=16,
    device=0,
    name="nexinfra_yolo"
)

# 4. Export directly to ONNX
onnx_file = model.export(format="onnx", imgsz=640, opset=12, dynamic=False)
print(f"Model exported: {onnx_file}")

# 5. Download model.onnx to your computer
from google.colab import files
files.download(onnx_file)
```

### 3. Deploy ONNX to Nexinfra
Once downloaded, place the file into:
```
backend/models/model.onnx
```

---

## 💻 Method B: Train Locally on your Computer

### 1. Install Dependencies
In your terminal, navigate to `nexinfra-ai/`:
```bash
cd nexinfra-ai
pip install -r requirements.txt
```

### 2. Scaffold Dataset Directories
```bash
python download_dataset.py --scaffold
```
This creates:
```
nexinfra-ai/dataset/
  ├── images/
  │   ├── train/  (put training images here)
  │   └── val/    (put validation images here)
  └── labels/
      ├── train/  (put YOLO .txt labels here)
      └── val/    (put YOLO .txt labels here)
```

### 3. Start Training
```bash
python train_yolo.py --data data.yaml --epochs 50 --batch 16 --model yolo11n.pt
```
*Note: If you don't have an NVIDIA GPU, add `--device cpu`.*

The script will automatically train the model and save the exported `model.onnx` into `backend/models/model.onnx`!

---

## 🎥 Real-Time Verification & Live CCTV Testing

### 1. Test Locally with Webcam / Video File
```bash
python test_inference.py --source 0 --conf 0.40
```

### 2. Start the Nexinfra Backend
In a terminal:
```bash
cd backend
npm install
npm run dev
```

### 3. Start the Nexinfra Frontend
In a second terminal:
```bash
npm install
npm run dev
```

### 4. Open CCTV Monitor in Nexinfra
- Navigate to the **CCTV Monitor** in the UI.
- Click **"Start Detection"**.
- The video stream will send frames to `http://localhost:4000/api/detect-frame`, run ONNX inference in real-time, and project glowing bounding boxes over detected civic defects!
