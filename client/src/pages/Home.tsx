import { useState } from "react";
import { useScans, useAnalyzeScan } from "@/hooks/use-scans";
import { UploadZone } from "@/components/UploadZone";
import { ResultCard } from "@/components/ResultCard";
import { ModelInfo } from "@/components/ModelInfo";
import { ModelArchitecture } from "@/components/ModelArchitecture";
import { type ScanResponse } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { Brain, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";
const cn = clsx;

export default function Home() {
  const [result, setResult] = useState<ScanResponse | null>(null);
  const { toast } = useToast();
  const { data: recentScans } = useScans();
  const analyzeMutation = useAnalyzeScan();

  const handleAnalyze = async (file: File) => {
    try {
      const data = await analyzeMutation.mutateAsync(file);
      setResult(data);
      toast({
        title: "Analysis Complete",
        description: "The scan has been processed successfully.",
      });
      
      // Scroll to result
      document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    }
  };

  

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-primary rounded-lg p-2">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">NeuroScan AI</span>
            </div>
            <div className="flex gap-6 text-sm font-medium text-slate-600">
              <a href="#demo" className="hover:text-primary transition-colors">Demo</a>
              <a href="#model" className="hover:text-primary transition-colors">Model Info</a>
              <a href="#recent" className="hover:text-primary transition-colors">Recent Scans</a>
              <a href="#architecture" className="hover:text-primary transition-colors">Model Architecture</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 tech-grid">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm mb-6">
              Powered by Advanced CNN Architecture
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-6">
              Brain Tumor <span className="text-primary">Classification</span> System
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Upload MRI scans to instantly detect and classify brain tumors with 98.5% clinical accuracy using our state-of-the-art deep learning model.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex justify-center"
          >
            <a href="#demo" className="animate-bounce p-3 bg-white rounded-full shadow-lg text-primary border border-slate-100 mt-8">
              <ArrowDown className="w-6 h-6" />
            </a>
          </motion.div>
        </div>
      </div>

      {/* Main Interactive Demo Section */}
      <section id="demo" className="py-20 px-4 relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Interactive Diagnostic Tool</h2>
            <p className="text-slate-500 mt-2">Upload a scan to verify the model's capabilities</p>
          </div>

          <div className="space-y-12">
            <UploadZone onAnalyze={handleAnalyze} isAnalyzing={analyzeMutation.isPending} />
            
            <div id="result-section">
              {result && <ResultCard result={result} />}
            </div>
          </div>
        </div>
      </section>

      {/* Model Info Section */}
      <section id="model" className="py-20 px-4 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Model Performance & Dataset</h2>
            <p className="text-slate-500 mt-2">Transparency in AI architecture and training data</p>
          </div>
          <ModelInfo />
        </div>
      </section>

      {/* Recent Scans Section */}
      <section id="recent" className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Recent Analysis</h2>
              <p className="text-slate-500 mt-2">Latest scans processed by the system</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {recentScans?.slice(0, 5).map((scan) => (
              <motion.div 
                key={scan.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="aspect-square rounded-xl bg-black overflow-hidden mb-3 relative">
                  {/* Since we don't have real images in this mock, using a placeholder if url is empty */}
                  {/* In a real app, scan.imageUrl would be a valid URL */}
                  <div className="absolute inset-0 bg-slate-900 flex items-center justify-center text-slate-700">
                    <Brain className="w-12 h-12 opacity-20" />
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 truncate">{scan.fileName}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-slate-500">{new Date(scan.createdAt!).toLocaleDateString()}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    scan.diagnosis.toLowerCase().includes("no")
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-blue-100 text-blue-700"
                  }`}>
                      {Math.round(scan.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {(!recentScans || recentScans.length === 0) && (
              <div className="col-span-full text-center py-12 text-slate-400">
                <Brain className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No recent scans available. Be the first to analyze!</p>
              </div>
            )}
          </div>
        </div>
      </section>
     <section id="architecture" className="py-20 px-4 bg-white border-t">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Model Architecture
          </h2>
          <p className="text-slate-500 mb-8">
            Overview of the proposed deep learning architecture
          </p>
          <ModelArchitecture />
        </div>
      </section>

      
      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-white/10 rounded-lg p-2">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">NeuroScan AI</span>
          </div>
          <p className="max-w-md mx-auto text-sm">
            This tool is for educational and demonstration purposes only. 
            Always consult with a certified medical professional for diagnosis.
          </p>
          <div className="pt-8 text-xs border-t border-slate-800 w-full">
            © 2024 Brain Tumor Classification System. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
