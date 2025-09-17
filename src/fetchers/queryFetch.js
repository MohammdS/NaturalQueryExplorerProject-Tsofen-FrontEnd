import { postFetch } from "./apiFetch";

// Generate SQL from natural language without executing
export async function generateQueryFetch({ prompt, dbFilename }, token) {
  return postFetch("/api/query/generate", { prompt, dbFilename }, token);
}

// Execute (possibly user-edited) SQL against DB
export async function executeQueryFetch({ sql, dbFilename }, token) {
  return postFetch("/api/query/execute", { sql, dbFilename }, token);
}

// Legacy NL -> SQL (optional)
export async function nlToSqlFetch({ prompt, schema }) {
  return postFetch("/api/query/nl-to-sql", { prompt, schema });
}
