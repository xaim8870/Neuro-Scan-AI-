import os
import torch
import numpy as np
import base64
import cv2
import requests
from PIL import Image
from typing import Dict, Any

from utils.preprocess import preprocess
from utils.model_def import YOLOv12SwinClassifier
from utils.gradcam import GradCAM
from utils.db import supabase


# =================================================
# MODEL DOWNLOAD (HUGGING FACE)
# =================================================
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
MODEL_DIR = os.path.join(BASE_DIR, "model")
MODEL_PATH = os.path.join(MODEL_DIR, "best.pt")

HF_MODEL_URL = (
    "https://huggingface.co/usamaJabar/BrainTumorClassifier/resolve/main/best.pt"
)

def download_model_if_needed():
    os.makedirs(MODEL_DIR, exist_ok=True)

    if not os.path.exists(MODEL_PATH):
        print("⬇️ Downloading model from Hugging Face...")
        r = requests.get(HF_MODEL_URL, stream=True)
        r.raise_for_status()

        with open(MODEL_PATH, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)

        print("✅ Model downloaded successfully")


# =================================================
# MODEL SETUP
# =================================================
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

download_model_if_needed()
ckpt = torch.load(MODEL_PATH, map_location=device)

CLASS_NAMES = ckpt["class_names"]
NUM_CLASSES = len(CLASS_NAMES)

model = YOLOv12SwinClassifier(num_classes=NUM_CLASSES).to(device)
model.load_state_dict(ckpt["model_state"])
model.eval()

gradcam = GradCAM(model, model.merge_conv)


# =================================================
# HELPERS
# =================================================
def overlay_cam(image: Image.Image, cam: np.ndarray) -> str:
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


def save_scan(result: Dict[str, Any], file_name: str = "scan.png") -> None:
    try:
        supabase.table("scans").insert({
            "file_name": file_name,
            "diagnosis": result["prediction"],
            "confidence": result["confidence"],
            "probabilities": result["probabilities"],
            "gradcam_url": result["gradcam"],
        }).execute()
    except Exception as e:
        print(f"⚠️ Supabase insert failed: {e}")


# =================================================
# MAIN INFERENCE
# =================================================
def predict_image(image: Image.Image) -> Dict[str, Any]:
    """
    Full inference + GradCAM + persistence
    (no torch.no_grad because GradCAM needs backward)
    """
    x = preprocess(image).to(device)
    x.requires_grad_(True)

    logits = model(x)
    probs = torch.softmax(logits, dim=1)

    conf, idx = torch.max(probs, dim=1)
    pred_idx: int = int(idx.item())

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

    save_scan(result)
    return result
