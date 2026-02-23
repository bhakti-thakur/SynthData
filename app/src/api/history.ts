import { API_BASE_URL } from "./client";

export type HistoryActivity = {
  id: string;
  activity_type: string;
  mode: string;
  created_at: string;
  dataset_id?: string | null;
  input_metadata?: Record<string, unknown> | null;
  result_snapshot?: Record<string, unknown> | null;
  download_url?: string | null;
};

export type HistoryResponse = {
  activities: HistoryActivity[];
};

export async function getHistory(): Promise<HistoryResponse> {
  const response = await fetch(`${API_BASE_URL}/history`, {
    method: "GET",
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.detail ?? "Failed to load history");
  }

  return payload as HistoryResponse;
}
