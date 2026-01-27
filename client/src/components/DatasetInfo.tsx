import { Database } from "lucide-react";

export function DatasetInfo() {
  return (
    <div className="grid md:grid-cols-4 gap-6">
      <div className="bg-white rounded-2xl p-6 border">
        <Database className="w-6 h-6 text-primary mb-3" />
        <p className="text-sm text-slate-500">Total Images</p>
        <p className="text-2xl font-bold">7,023</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border">
        <p className="text-sm text-slate-500">Classes</p>
        <p className="text-lg font-semibold">Glioma</p>
        <p className="text-lg font-semibold">Meningioma</p>
        <p className="text-lg font-semibold">Pituitary</p>
        <p className="text-lg font-semibold">No Tumor</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border">
        <p className="text-sm text-slate-500">Input Size</p>
        <p className="text-2xl font-bold">512 × 512</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border">
        <p className="text-sm text-slate-500">Source</p>
        <p className="text-md font-semibold">BraTS / Figshare</p>
        <p className="text-xs text-slate-400 mt-2">
          Curated & preprocessed for MRI classification
        </p>
      </div>
    </div>
  );
}
