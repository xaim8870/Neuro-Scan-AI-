import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import path from "path";
import express from "express";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Serve uploaded images (in a real app these would be in object storage)
  // For this demo we'll just return base64 data uri for the 'url' or handle it in memory
  
  app.get(api.scans.list.path, async (req, res) => {
    const scans = await storage.getScans();
    res.json(scans);
  });

  app.get(api.scans.get.path, async (req, res) => {
    const scan = await storage.getScan(Number(req.params.id));
    if (!scan) {
      return res.status(404).json({ message: 'Scan not found' });
    }
    res.json(scan);
  });

  app.post(api.scans.analyze.path, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No image file uploaded' });
      }

      // Simulate model analysis delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock Classification Logic
      const diagnoses = ["Glioma", "Meningioma", "Pituitary Tumor", "No Tumor"];
      // Deterministic based on file size to give consistent results for same file, or random
      const randomIndex = Math.floor(Math.random() * diagnoses.length);
      const diagnosis = diagnoses[randomIndex];
      const confidence = 0.85 + (Math.random() * 0.14); // 0.85 - 0.99

      // Convert buffer to base64 for storage/display in this simple demo
      // In production, upload to S3/Blob storage and save URL
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const mimeType = req.file.mimetype;
      const imageUrl = `data:${mimeType};base64,${b64}`;

      const scan = await storage.createScan({
        imageUrl: imageUrl,
        fileName: req.file.originalname,
        diagnosis: diagnosis,
        confidence: confidence,
      });

      res.status(201).json(scan);
    } catch (err) {
      console.error('Analysis error:', err);
      res.status(500).json({ message: 'Internal analysis error' });
    }
  });

  return httpServer;
}
