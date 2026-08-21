"""
==============================================================================
NEXINFRA AI - CIVIC DATASET DOWNLOADER & PREPARER
==============================================================================
Helper script to download civic defect datasets from Roboflow or organize
local raw images into the YOLO standard dataset structure:

dataset/
  ├── images/
  │   ├── train/
  │   ├── val/
  │   └── test/
  └── labels/
      ├── train/
      ├── val/
      └── test/
"""

import os
import sys
import argparse
from pathlib import Path

# Ensure UTF-8 output on Windows consoles
if sys.platform == "win32" and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

def create_dataset_scaffold(root_dir="dataset"):
    """Creates the standard directory tree for YOLO training."""
    dirs = [
        "images/train", "images/val", "images/test",
        "labels/train", "labels/val", "labels/test"
    ]
    base = Path(root_dir)
    for d in dirs:
        (base / d).mkdir(parents=True, exist_ok=True)
    print(f"✅ Created YOLO dataset directory structure under ./{root_dir}/")
    print(f"👉 Place your training images in {root_dir}/images/train and annotations in {root_dir}/labels/train")

def download_roboflow_dataset(api_key, workspace, project, version):
    """Downloads an annotated dataset directly using Roboflow API."""
    try:
        from roboflow import Roboflow
    except ImportError:
        print("❌ Roboflow library missing. Run: pip install roboflow")
        return

    rf = Roboflow(api_key=api_key)
    proj = rf.workspace(workspace).project(project)
    version_data = proj.version(version)
    dataset = version_data.download("yolov8", location="./dataset")
    print(f"🎉 Dataset downloaded to {dataset.location}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Nexinfra Dataset Downloader & Setup")
    parser.add_argument("--scaffold", action="store_true", help="Create empty YOLO folder structure")
    parser.add_argument("--roboflow", action="store_true", help="Download from Roboflow")
    parser.add_argument("--api-key", type=str, help="Roboflow API key")
    parser.add_argument("--workspace", type=str, help="Roboflow workspace")
    parser.add_argument("--project", type=str, help="Roboflow project")
    parser.add_argument("--version", type=int, default=1, help="Dataset version")

    args = parser.parse_args()

    if args.roboflow and args.api_key:
        download_roboflow_dataset(args.api_key, args.workspace, args.project, args.version)
    else:
        create_dataset_scaffold()
