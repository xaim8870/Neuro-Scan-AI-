import architectureImg from "../../assets/architecture.png";
import { Cpu } from "lucide-react";

export function ArchitectureDiagram() {
  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-200 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-100 text-primary">
          <Cpu className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">
          Model Architecture Overview
        </h3>
      </div>

      <p className="text-slate-600 text-sm max-w-3xl">
        The proposed architecture combines a Swin Transformer backbone with a
        YOLO-inspired feature pyramid network for robust multi-scale feature
        fusion. Grad-CAM is integrated to enhance interpretability by highlighting
        salient tumor regions.
      </p>

      {/* Scrollable Diagram Container */}
      <div className="relative">
        {/* Hint */}
        <div className="text-xs text-slate-400 mb-2">
          Scroll horizontally to view the full architecture →
        </div>

        <div
          className="
            overflow-x-auto
            overflow-y-hidden
            rounded-xl
            border
            border-slate-200
            bg-slate-50
          "
        >
          <div className="min-w-[1200px] p-4">
            <img
  src={architectureImg}
  alt="Brain Tumor Classification Architecture Diagram"
  className="
    w-auto
    h-[520px]
    max-w-none
    select-none
  "
  draggable={false}
/>

          </div>
        </div>
      </div>

      {/* Caption */}
      <p className="text-xs text-slate-400">
        Figure: Deep learning architecture for brain tumor MRI classification
        using Swin Transformer, multi-scale feature fusion, and Grad-CAM
        explainability.
      </p>
    </div>
  );
}
