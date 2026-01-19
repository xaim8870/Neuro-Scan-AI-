import { CheckCircle2, AlertTriangle, Brain, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { type ScanResponse } from "@shared/routes";
import { motion } from "framer-motion";

interface ResultCardProps {
  result: ScanResponse;
}

export function ResultCard({ result }: ResultCardProps) {
  const isHealthy = result.diagnosis.toLowerCase().includes("no tumor");
  const confidencePercent = Math.round(result.confidence * 100);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100"
    >
      <div className={cn(
        "p-1",
        isHealthy ? "bg-emerald-500" : "bg-primary"
      )} />
      
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

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Diagnosis</p>
              <div className="flex items-center gap-3">
                {isHealthy ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-amber-500" />
                )}
                <span className={cn(
                  "text-3xl font-bold",
                  isHealthy ? "text-emerald-600" : "text-slate-900"
                )}>
                  {result.diagnosis}
                </span>
              </div>
              <p className="mt-2 text-slate-600">
                {isHealthy 
                  ? "No abnormalities detected in the provided scan."
                  : `The model has identified patterns consistent with ${result.diagnosis.toLowerCase()}.`
                }
              </p>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Confidence Score</p>
                <span className="text-2xl font-bold text-slate-900">{confidencePercent}%</span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${confidencePercent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full transition-all duration-1000",
                    confidencePercent > 90 ? "bg-emerald-500" : 
                    confidencePercent > 75 ? "bg-blue-500" : "bg-amber-500"
                  )}
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Model confidence based on feature extraction from the input MRI.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-slate-500" />
              Scan Details
            </h4>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex justify-between border-b border-slate-200 pb-2">
                <span>Scan ID</span>
                <span className="font-mono text-slate-900">#{result.id}</span>
              </li>
              <li className="flex justify-between border-b border-slate-200 pb-2">
                <span>File Name</span>
                <span className="truncate max-w-[150px]" title={result.fileName}>{result.fileName}</span>
              </li>
              <li className="flex justify-between border-b border-slate-200 pb-2">
                <span>Classification</span>
                <span className="font-medium text-primary">Multi-Class CNN</span>
              </li>
              <li className="flex justify-between pt-1">
                <span>Analyzed At</span>
                <span>{new Date().toLocaleTimeString()}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
