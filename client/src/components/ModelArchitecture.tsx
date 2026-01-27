import { Cpu } from "lucide-react";
import { ArchitectureDiagram } from "./ArchitectureDiagram";

export function ModelArchitecture() {
  return (
    <div className="space-y-10">
      <div className="bg-white rounded-2xl p-8 border space-y-6">
        <div className="flex items-center gap-3">
          <Cpu className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold">YOLOv12 + Swin Transformer</h3>
        </div>

        <p className="text-slate-600 leading-relaxed">
          The proposed architecture integrates a hierarchical Swin Transformer
          backbone with a YOLO-inspired multi-scale feature fusion neck. This
          hybrid design captures both global context and fine-grained spatial
          details, making it well-suited for medical MRI analysis.
        </p>

        <ul className="grid md:grid-cols-2 gap-4 text-sm text-slate-600">
          <li>• Swin Transformer (Tiny)</li>
          <li>• Multi-scale feature extraction (C3, C4, C5)</li>
          <li>• YOLO-style FPN fusion neck</li>
          <li>• Global average pooling</li>
          <li>• Dropout regularization (p = 0.4)</li>
          <li>• Softmax multi-class classification</li>
        </ul>

        <p className="text-xs text-slate-400">
          Architecture optimized for interpretability using Grad-CAM.
        </p>
      </div>

      {/* Diagram */}
      <ArchitectureDiagram />
    </div>
  );
}
