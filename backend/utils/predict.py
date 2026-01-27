import os
import torch
import numpy as np
import base64
import cv2
from PIL import Image
from typing import Dict, Any

from utils.preprocess import preprocess
from utils.model_def import YOLOv12SwinClassifier
from utils.gradcam import GradCAM
from utils.db import supabase  # ✅ use your existing db.py


# -------------------------------------------------
# MODEL SETUP
# -------------------------------------------------
# predict.py is inside: backend/utils/
# model/best.pt is inside: backend/model/
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CKPT_PATH = os.path.join(BASE_DIR, "model", "best.pt")

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

ckpt = torch.load(CKPT_PATH, map_location=device)
CLASS_NAMES = ckpt["class_names"]
NUM_CLASSES = len(CLASS_NAMES)

model = YOLOv12SwinClassifier(num_classes=NUM_CLASSES).to(device)
model.load_state_dict(ckpt["model_state"])
model.eval()

# GradCAM target layer
gradcam = GradCAM(model, model.merge_conv)


# -------------------------------------------------
# HELPERS
# -------------------------------------------------
def overlay_cam(image: Image.Image, cam: np.ndarray) -> str:
    """
    Returns base64 encoded GradCAM overlay PNG
    Fixes Pylance OpenCV typing issues by ensuring contiguous uint8 arrays
    and encoding buffer as bytes via .tobytes().
    """
    img = np.array(image.resize((512, 512)), dtype=np.uint8)
    img = np.ascontiguousarray(img)

    cam_u8 = np.uint8(255.0 * cam)
    cam_u8 = np.ascontiguousarray(cam_u8)

    heatmap = cv2.applyColorMap(cam_u8, cv2.COLORMAP_JET)
    heatmap = np.ascontiguousarray(heatmap)

    overlay = cv2.addWeighted(img, 0.6, heatmap, 0.4, 0)
    overlay = np.ascontiguousarray(overlay)

    ok, buffer = cv2.imencode(".png", overlay)
    if not ok:
        raise RuntimeError("cv2.imencode failed")

    return base64.b64encode(buffer.tobytes()).decode("utf-8")


def save_scan(result, file_name: str = "uploaded_scan.png") -> None:
    """
    Persist scan to Supabase using existing `scans` table schema
    """
    try:
        supabase.table("scans").insert({
            "file_name": file_name,
            "diagnosis": result["prediction"],
            "confidence": result["confidence"],
            "probabilities": result["probabilities"],
            "gradcam_url": result["gradcam"],  # base64 stored here
        }).execute()
    except Exception as e:
        print(f"⚠️ Supabase insert failed: {e}")


# -------------------------------------------------
# MAIN INFERENCE
# -------------------------------------------------
def predict_image(image: Image.Image) -> Dict[str, Any]:
    """
    Full inference + GradCAM + persistence
    NOTE: Do NOT use @torch.no_grad() because GradCAM needs backward().
    """
    x = preprocess(image).to(device)
    x.requires_grad_(True)

    logits = model(x)
    probs = torch.softmax(logits, dim=1)

    conf, idx = torch.max(probs, dim=1)

    # ✅ Force correct type for Pylance and GradCAM
    pred_idx: int = int(idx.item())

    # Backward for GradCAM
    model.zero_grad(set_to_none=True)
    logits[0, pred_idx].backward()

    cam = gradcam.generate(pred_idx)
    cam_b64 = overlay_cam(image, cam)

    result: Dict[str, Any] = {
        "prediction": CLASS_NAMES[pred_idx],
        "confidence": float(conf.item() * 100),
        "probabilities": {
            CLASS_NAMES[i]: float(probs[0, i].item() * 100)
            for i in range(NUM_CLASSES)
        },
        "gradcam": cam_b64,
    }

    save_scan(result, file_name="scan.png")
    return result
