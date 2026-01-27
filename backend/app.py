from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io

from utils.predict import predict_image
from utils.db import supabase

app = FastAPI(title="BrainScan-AI Inference API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten later
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health():
    return {"status": "ok"}

@app.get("/recent-scans")
def recent_scans(limit: int = 10):
    res = (
        supabase
        .table("scans")
        .select("*")
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    return res.data

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    result = predict_image(image)

    return {
        "prediction": result["prediction"],
        "confidence": round(result["confidence"], 2),
        "probabilities": result["probabilities"],
        "gradcam": result["gradcam"],
    }
