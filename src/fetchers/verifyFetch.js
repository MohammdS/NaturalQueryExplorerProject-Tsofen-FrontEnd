import { postFetch } from "./apiFetch";

export async function verifyFetch({ email, code }) {
  return await postFetch("/api/users/verify", { email, code });
}
