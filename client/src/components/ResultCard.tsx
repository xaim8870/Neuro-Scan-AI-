import { CheckCircle2, AlertTriangle, Brain, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { type ScanResponse } from "@shared/routes";
import { motion } from "framer-motion";

interface ResultCardProps {
  result: ScanResponse & {
    probabilities?: Record<string, number>;
    imageUrl?: string; // gradcam
  };
}

export function ResultCard({ result }: ResultCardProps) {
  const isHealthy = result.diagnosis.toLowerCase().includes("no");
  const confidencePercent = Math.round(result.confidence * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100"
    >
      <div className={cn("p-1", isHealthy ? "bg-emerald-500" : "bg-primary")} />

      <div className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className={cn(
            "p-3 rounded-xl",
            isHealthy ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-primary"
          )}>
            <Activity className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Analysis Results</h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* LEFT: Diagnosis + Confidence */}
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase mb-2">Diagnosis</p>
              <div className="flex items-center gap-3">
                {isHealthy ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-amber-500" />
                )}
                <span className="text-3xl font-bold text-slate-900">
                  {result.diagnosis}
                </span>
              </div>
            </div>

            {/* Confidence Bar */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-slate-500">Confidence</span>
                <span className="text-2xl font-bold">{confidencePercent}%</span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${confidencePercent}%` }}
                  transition={{ duration: 1 }}
                  className={cn(
                    "h-full rounded-full",
                    confidencePercent > 90 ? "bg-emerald-500" :
                    confidencePercent > 75 ? "bg-blue-500" : "bg-amber-500"
                  )}
                />
              </div>
            </div>

            {/* Class Probability Breakdown */}
            {result.probabilities && (
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase mb-3">
                  Class Probabilities
                </p>
                <div className="space-y-2">
                  {Object.entries(result.probabilities).map(([cls, prob]) => (
                    <div key={cls}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="capitalize">{cls.replace("_", " ")}</span>
                        <span>{prob.toFixed(2)}%</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full">
                        <div
                          className="h-2 bg-primary rounded-full"
                          style={{ width: `${prob}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Grad-CAM + Details */}
          <div className="space-y-6">
            {result.imageUrl && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Grad-CAM Heatmap
                </h4>
                <img
                  src={result.imageUrl}
                  alt="Grad-CAM"
                  className="rounded-xl border shadow"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Highlighted regions indicate areas influencing the model decision.
                </p>
              </div>
            )}

            <div className="bg-slate-50 rounded-2xl p-6 border">
              <h4 className="font-semibold mb-3">Scan Details</h4>
              <ul className="text-sm space-y-2">
                <li className="flex justify-between">
                  <span>ID</span>
                  <span className="font-mono">#{result.id}</span>
                </li>
                <li className="flex justify-between">
                  <span>File</span>
                  <span className="truncate max-w-[140px]">{result.fileName}</span>
                </li>
                <li className="flex justify-between">
                  <span>Model</span>
                  <span className="text-primary">YOLOv12 + Swin</span>
                </li>
                <li className="flex justify-between">
                  <span>Time</span>
                  <span>{new Date().toLocaleTimeString()}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
