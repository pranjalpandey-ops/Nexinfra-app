# 🛰️ NEXinfra CCTV AI Training Workspace

This dedicated workspace contains everything needed to retrain the YOLOv8 real-time municipal defect detector on **7,000 images (1,000 photos per defect class)** and deploy the resulting `model.onnx` into the Nexinfra surveillance gateway.

---

## 🏗️ 7 Municipal Defect Classes

| Class ID | Defect Category | Assigned Department | SLA | Color |
|---|---|---|---|---|
| **0** | `pothole_road_defect` | Road Works & Pavement | 4h | 🔴 `#EF4444` |
| **1** | `water_drainage_burst` | Hydro & Water Supply Grid | 3h | 🔵 `#00F0FF` |
| **2** | `garbage_waste_overflow` | Sanitation & Solid Waste | 8h | 🟡 `#F59E0B` |
| **3** | `electrical_hazard` | Power & Streetlight Grid | 2h | 🟠 `#F97316` |
| **4** | `structural_bridge_crack` | Structural Engineering | 4h | 🟣 `#8B5CF6` |
| **5** | `tree_greenery_hazard` | Urban Forestry & Parks | 6h | 🟢 `#10B981` |
| **6** | `fire_smoke_hazard` | Fire & Disaster Response | 1h | 🔥 `#DC2626` |

---

## ⚡ Option 1: Train on Google Colab (Recommended - Free GPU)
1. Open [Google Colab](https://colab.research.google.com).
2. Upload `NEXinfra_CCTV_Retrainer_Colab.ipynb` from this folder.
3. Select **T4 GPU** (`Runtime > Change runtime type > T4 GPU`).
4. Click **Runtime > Run all**.
5. When complete, Colab automatically downloads `model.onnx` to your computer.

---

## 💻 Option 2: Train Locally on your PC
```bash
cd cctv_ai_training
pip install -r requirements.txt
python generate_1000_samples_per_class.py
python train_yolo.py
```

---

## 🔌 Reconnecting to Nexinfra
Copy the generated `model.onnx` into:
```
backend/models/model.onnx
```
Restart the backend:
```bash
cd backend
node server.js
```
