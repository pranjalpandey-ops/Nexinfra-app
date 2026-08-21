"""
==============================================================================
NEXINFRA AI - SAMPLE DATASET GENERATOR
==============================================================================
Generates starter annotated images for all 6 civic defect classes so you can
immediately test and verify the local YOLO training & ONNX export pipeline!
"""

import os
import sys
import random
from pathlib import Path
from PIL import Image, ImageDraw

if sys.platform == "win32" and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

def generate_samples(num_train=20, num_val=6):
    base = Path("dataset")
    img_train_dir = base / "images" / "train"
    lbl_train_dir = base / "labels" / "train"
    img_val_dir = base / "images" / "val"
    lbl_val_dir = base / "labels" / "val"

    for d in [img_train_dir, lbl_train_dir, img_val_dir, lbl_val_dir]:
        d.mkdir(parents=True, exist_ok=True)

    # 6 classes: Pothole(0), Water(1), Waste(2), Electrical(3), Crack(4), Greenery(5)
    class_colors = [
        (40, 40, 40),     # 0: Road Pothole (dark cavity)
        (0, 180, 240),    # 1: Water Burst (cyan/blue pool)
        (220, 150, 20),   # 2: Waste Overflow (amber/plastic mix)
        (255, 100, 0),    # 3: Electrical Spark (orange flash)
        (120, 120, 140),  # 4: Bridge Crack (concrete fissure)
        (34, 139, 34)     # 5: Fallen Tree (green foliage)
    ]

    print("🎨 Generating starter annotated dataset for 6 civic defect classes...")

    splits = [
        (img_train_dir, lbl_train_dir, num_train, "train"),
        (img_val_dir, lbl_val_dir, num_val, "val")
    ]

    for img_dir, lbl_dir, count, split_name in splits:
        for i in range(count):
            img_w, img_h = 640, 640
            bg_color = (random.randint(70, 90), random.randint(70, 90), random.randint(70, 90))
            img = Image.new("RGB", (img_w, img_h), color=bg_color)
            draw = ImageDraw.Draw(img)

            # Randomly select a defect class (0..5)
            class_id = i % 6
            color = class_colors[class_id]

            # Bounding box coordinates
            bw = random.randint(120, 280)
            bh = random.randint(100, 240)
            bx = random.randint(50, img_w - bw - 50)
            by = random.randint(50, img_h - bh - 50)

            # Draw simulated defect
            if class_id in [0, 1, 2]:
                draw.ellipse([bx, by, bx + bw, by + bh], fill=color, outline=(255, 255, 255))
            else:
                draw.rectangle([bx, by, bx + bw, by + bh], fill=color, outline=(255, 255, 255))

            # Save image
            filename = f"defect_{split_name}_{i:03d}"
            img_path = img_dir / f"{filename}.jpg"
            img.save(img_path, "JPEG")

            # Convert to YOLO normalized format: class cx cy w h
            norm_cx = (bx + bw / 2.0) / img_w
            norm_cy = (by + bh / 2.0) / img_h
            norm_w = bw / img_w
            norm_h = bh / img_h

            lbl_path = lbl_dir / f"{filename}.txt"
            with open(lbl_path, "w") as f:
                f.write(f"{class_id} {norm_cx:.6f} {norm_cy:.6f} {norm_w:.6f} {norm_h:.6f}\n")

    print(f"✅ Generated {num_train} training samples and {num_val} validation samples in ./dataset/")

if __name__ == "__main__":
    generate_samples()
