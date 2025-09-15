// src/fetchers/authFetch.js
import { postFetch, getFetch, saveToken, getToken } from "./apiFetch";

export async function signupFetch({ name, email, password }) {
  const data = await postFetch("/api/users/signup", { name, email, password });
  if (data?.token) saveToken(data.token);
  return data;
}

export async function signinFetch({ email, password }) {
  const data = await postFetch("/api/users/signin", { email, password });
  if (data?.token) saveToken(data.token);
  return data;
}

export async function meFetch() {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");
  return getFetch("/api/users/me", token);
}

export async function forgotPasswordFetch(email) {
  return postFetch("/api/users/forgot-password", { email });
}

export async function resetPasswordFetch(token, newPassword) {
  return postFetch("/api/users/reset-password", { token, newPassword });
}