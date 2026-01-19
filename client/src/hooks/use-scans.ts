import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type ScanResponse } from "@shared/routes";

// GET /api/scans - List recent scans
export function useScans() {
  return useQuery({
    queryKey: [api.scans.list.path],
    queryFn: async () => {
      const res = await fetch(api.scans.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch scans");
      return api.scans.list.responses[200].parse(await res.json());
    },
  });
}

// POST /api/analyze - Upload and analyze image
export function useAnalyzeScan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(api.scans.analyze.path, {
        method: api.scans.analyze.method,
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Invalid upload");
        }
        throw new Error("Analysis failed");
      }

      return api.scans.analyze.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      // Invalidate the list so the new scan appears immediately in "Recent Scans"
      queryClient.invalidateQueries({ queryKey: [api.scans.list.path] });
    },
  });
}
