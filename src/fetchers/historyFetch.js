import { BASE_URL } from "./apiFetch";

const API_BASE = `${BASE_URL}/api/query/history`;

// Get user's query history
export async function getHistoryFetch(token) {
  const res = await fetch(API_BASE, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to load history");
  }

  return res.json();
}
