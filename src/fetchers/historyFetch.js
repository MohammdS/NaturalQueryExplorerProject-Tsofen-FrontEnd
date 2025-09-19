const API_BASE = "http://localhost:3000/api/query/history";

// Get user's query history
export async function getHistoryFetch(token) {
  console.log("historyFetch: Making request to:", API_BASE);
  console.log("historyFetch: Token:", token ? "Present" : "Missing");
  
  const res = await fetch(API_BASE, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log("historyFetch: Response status:", res.status);
  console.log("historyFetch: Response ok:", res.ok);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.log("historyFetch: Error response:", err);
    throw new Error(err.error || "Failed to load history");
  }

  const data = await res.json();
  console.log("historyFetch: Response data:", data);
  return data;
}
