import os
import cv2
import random
import yaml
import numpy as np
from tqdm import tqdm

dataset_root = os.path.join(os.path.dirname(__file__), "dataset")
os.makedirs(os.path.join(dataset_root, "images", "train"), exist_ok=True)
os.makedirs(os.path.join(dataset_root, "images", "val"), exist_ok=True)
os.makedirs(os.path.join(dataset_root, "labels", "train"), exist_ok=True)
os.makedirs(os.path.join(dataset_root, "labels", "val"), exist_ok=True)

CLASSES = {
    0: "pothole_road_defect",
    1: "water_drainage_burst",
    2: "garbage_waste_overflow",
    3: "electrical_hazard",
    4: "structural_bridge_crack",
    5: "tree_greenery_hazard",
    6: "fire_smoke_hazard"
}

def generate_defect_sample(class_id, sample_idx):
    img = np.zeros((640, 640, 3), dtype=np.uint8)
    
    # Background texture
    if class_id in [0, 4]: # Asphalt / Concrete
        base = random.randint(45, 110)
        img[:, :] = (base + np.random.randint(-15, 15, (640, 640, 3))).clip(0, 255)
    elif class_id == 1: # Water Road
        img[:, :] = [random.randint(60, 110), random.randint(70, 120), random.randint(90, 160)]
    elif class_id == 2: # Garbage Ground
        img[:, :] = [random.randint(70, 130), random.randint(65, 125), random.randint(60, 120)]
    elif class_id == 3: # Sky & Pole Wires
        img[:, :] = [random.randint(140, 210), random.randint(130, 190), random.randint(110, 170)]
    elif class_id == 5: # Park Foliage
        img[:, :] = [random.randint(30, 70), random.randint(70, 130), random.randint(30, 70)]
    elif class_id == 6: # Dark Smoke Night
        img[:, :] = [random.randint(20, 50), random.randint(20, 50), random.randint(25, 55)]
    
    bw = random.randint(140, 360)
    bh = random.randint(120, 320)
    bx = random.randint(40, 640 - bw - 40)
    by = random.randint(40, 640 - bh - 40)
    
    # Defect patterns
    if class_id == 0: # Pothole
        cv2.ellipse(img, (bx + bw//2, by + bh//2), (bw//2, bh//2), random.randint(0, 180), 0, 360, (20, 20, 22), -1)
    elif class_id == 1: # Water Burst
        for _ in range(12):
            cv2.circle(img, (bx + random.randint(0, bw), by + random.randint(0, bh)), random.randint(15, 60), (220, 180, 50), -1)
    elif class_id == 2: # Garbage Dump
        colors = [(0, 0, 220), (220, 200, 0), (0, 200, 0), (200, 200, 200), (20, 20, 20), (200, 0, 200)]
        for _ in range(25):
            cv2.rectangle(img, (bx + random.randint(0, bw-30), by + random.randint(0, bh-30)), 
                          (bx + random.randint(20, bw), by + random.randint(20, bh)), random.choice(colors), -1)
    elif class_id == 3: # Electrical Wire
        cv2.line(img, (bx, by), (bx + bw, by + bh), (10, 10, 10), 3)
        cv2.circle(img, (bx + bw//2, by + bh//2), random.randint(15, 45), (0, 165, 255), -1)
    elif class_id == 4: # Structural Crack
        cv2.line(img, (bx, by), (bx + bw, by + bh), (15, 15, 15), random.randint(3, 7))
    elif class_id == 5: # Fallen Tree
        cv2.line(img, (bx, by + bh//2), (bx + bw, by + bh//2), (25, 45, 65), random.randint(15, 30))
        cv2.circle(img, (bx + bw//2, by + bh//2), random.randint(40, 90), (30, 140, 40), -1)
    elif class_id == 6: # Fire & Smoke
        for _ in range(15):
            cv2.circle(img, (bx + random.randint(0, bw), by + random.randint(0, bh//2)), random.randint(25, 75), (80, 80, 80), -1)
        for _ in range(20):
            cv2.circle(img, (bx + random.randint(bw//4, 3*bw//4), by + bh//3 + random.randint(0, bh//2)), random.randint(15, 55), (0, 69, 255), -1)

    img = cv2.GaussianBlur(img, (3, 3), 0)
    norm_cx = (bx + bw / 2.0) / 640.0
    norm_cy = (by + bh / 2.0) / 640.0
    norm_w = bw / 640.0
    norm_h = bh / 640.0
    return img, f"{class_id} {norm_cx:.6f} {norm_cy:.6f} {norm_w:.6f} {norm_h:.6f}\n"

def main():
    print("🚀 Synthesizing 7,000 Balanced Civic Defect Samples (1,000 images / class)...")
    for class_id in range(7):
        for i in tqdm(range(1000), desc=CLASSES[class_id]):
            split = "train" if i < 850 else "val"
            img, label = generate_defect_sample(class_id, i)
            fn = f"defect_c{class_id}_{split}_{i:04d}"
            cv2.imwrite(os.path.join(dataset_root, "images", split, f"{fn}.jpg"), img)
            with open(os.path.join(dataset_root, "labels", split, f"{fn}.txt"), "w") as f:
                f.write(label)
    print("✅ 7,000 Images successfully saved in dataset/ directory!")

if __name__ == "__main__":
    main()
