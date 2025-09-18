const API_BASE = "http://localhost:3000/api/query";

// Generate SQL from natural language prompt
export async function generateSQLFetch(prompt, dbFilename, token) {
  const res = await fetch(`${API_BASE}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt, dbFilename }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to generate SQL");
  }

  return res.json();
}

// Execute SQL query
export async function executeSQLFetch(sql, dbFilename, token) {
  const res = await fetch(`${API_BASE}/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ sql, dbFilename }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to execute SQL");
  }

  return res.json();
}
