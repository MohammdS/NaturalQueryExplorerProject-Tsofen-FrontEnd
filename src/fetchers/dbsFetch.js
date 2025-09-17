const API_BASE = "http://localhost:3000/api/dbs"; // fallback if Vite env not used elsewhere

// Get all user databases
export async function getDbsFetch(token) {
  const res = await fetch(API_BASE, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error("Failed to fetch databases");
  return res.json();
}

// Upload a new DB file
export async function uploadDbFetch(file, token) {
  const formData = new FormData();
  formData.append("dbFile", file);

  const res = await fetch(API_BASE, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to upload database");
  }

  return res.json();
}

// Delete a DB
export async function deleteDbFetch(id, token) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error("Failed to delete database");
  return res.json();
}

// Get tables for a specific DB file
export async function getTablesFetch(filename, token) {
  const res = await fetch(`${API_BASE}/${filename}/tables`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error("Failed to fetch tables");
  return res.json();
}
