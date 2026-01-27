import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ScanResponse } from "@shared/routes";

/**
 * ✅ Fetch recent scans from backend
 */
export function useScans() {
  return useQuery<ScanResponse[]>({
    queryKey: ["recent-scans"],
    queryFn: async () => {
      const res = await fetch("http://localhost:8000/recent-scans");

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();

      // Map backend → frontend
      return data.map((scan: any) => ({
        id: scan.id,
        fileName: scan.file_name,
        diagnosis: scan.diagnosis,
        confidence: scan.confidence / 100,
        createdAt: new Date(scan.created_at),
        imageUrl: scan.gradcam_url
          ? `data:image/png;base64,${scan.gradcam_url}`
          : "",
        probabilities: scan.probabilities ?? {},
      }));
    },
  });
}

/**
 * ✅ Analyze MRI scan using FastAPI backend
 * + auto-refresh recent scans
 */
export function useAnalyzeScan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      file: File
    ): Promise<
      ScanResponse & {
        probabilities?: Record<string, number>;
      }
    > => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:8000/predict", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();

      return {
        id: Date.now(),
        fileName: file.name,
        diagnosis: data.prediction,
        confidence: data.confidence / 100,
        createdAt: new Date(),
        imageUrl: data.gradcam
          ? `data:image/png;base64,${data.gradcam}`
          : "",
        probabilities: data.probabilities,
      };
    },

    // 🔥 THIS is what refreshes Recent Scans
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recent-scans"] });
    },
  });
}
