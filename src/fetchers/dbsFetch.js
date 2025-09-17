const API_BASE = "http://localhost:3000/api/dbs";

// Get all user databases
export async function getDbsFetch(token) {
  const res = await fetch(API_BASE, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
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
      Authorization: `Bearer ${token}`,
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
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to delete database");
  return res.json();
}

// Create a new empty database
export async function createDbFetch(name, token) {
  const res = await fetch(`${API_BASE}/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to create database");
  }

  return res.json();
}


// Get tables for a specific DB file
export async function getTablesFetch(filename) {
    const res = await fetch(`${API_BASE}/${filename}/tables`);
    if (!res.ok) throw new Error("Failed to fetch tables");
    return res.json();
  }

// Download a DB file
export async function downloadDbFetch(id, token) {
  const res = await fetch(`${API_BASE}/${id}/download`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to download database");
  return res.blob();
}
  