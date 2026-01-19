import { useState, useRef, ChangeEvent } from "react";
import { Upload, X, ScanEye, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface UploadZoneProps {
  onAnalyze: (file: File) => void;
  isAnalyzing: boolean;
}

export function UploadZone({ onAnalyze, isAnalyzing }: UploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Only accept images
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }
    setFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const triggerAnalyze = () => {
    if (file) onAnalyze(file);
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div 
        className={cn(
          "relative group cursor-pointer transition-all duration-300 ease-in-out",
          "border-2 border-dashed rounded-3xl overflow-hidden min-h-[400px] flex flex-col items-center justify-center",
          dragActive ? "border-primary bg-blue-50/50 scale-[1.01]" : "border-slate-200 bg-white hover:border-primary/50 hover:bg-slate-50",
          preview ? "border-solid border-slate-200 bg-slate-900" : ""
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !preview && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
        />

        {preview ? (
          <div className="relative w-full h-full min-h-[400px]">
            <img 
              src={preview} 
              alt="MRI Preview" 
              className="absolute inset-0 w-full h-full object-contain bg-black"
            />
            <button
              onClick={(e) => { e.stopPropagation(); clearFile(); }}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white/80 text-sm font-mono truncate px-2">{file?.name}</p>
            </div>
          </div>
        ) : (
          <div className="text-center p-8 space-y-4">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
              <Upload className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Upload MRI Scan</h3>
              <p className="text-slate-500 max-w-xs mx-auto">
                Drag & drop your MRI scan here, or click to browse files.
              </p>
            </div>
            <div className="pt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
              <span className="px-2 py-1 bg-slate-100 rounded-md">DICOM</span>
              <span className="px-2 py-1 bg-slate-100 rounded-md">PNG</span>
              <span className="px-2 py-1 bg-slate-100 rounded-md">JPG</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-center">
        <Button
          size="lg"
          onClick={triggerAnalyze}
          disabled={!file || isAnalyzing}
          className={cn(
            "rounded-full px-8 py-6 text-lg font-semibold shadow-lg shadow-primary/25 transition-all duration-300",
            !file && "opacity-50 cursor-not-allowed",
            "hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0"
          )}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing Scan...
            </>
          ) : (
            <>
              <ScanEye className="w-5 h-5 mr-2" />
              Analyze Scan
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
