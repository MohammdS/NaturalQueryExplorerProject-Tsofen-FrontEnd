// src/fetchers/apiFetch.js
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

async function handle(res) {
  let data = null;
  try {
    data = await res.json();
  } catch (_) {}
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export async function getFetch(path, token) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return handle(res);
}

export async function postFetch(path, body, token) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  return handle(res);
}

// Helpers for token storage
export function saveToken(token) {
  localStorage.setItem("auth_token", token);
}
export function getToken() {
  return localStorage.getItem("auth_token");
}
export function clearToken() {
  localStorage.removeItem("auth_token");
}
