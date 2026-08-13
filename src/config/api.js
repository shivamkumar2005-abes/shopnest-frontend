// Central place for the backend base URL.
// In development, CRA's "proxy" field in package.json still handles relative
// "/api/..." calls, so this resolves to "" locally unless you set the env var.
// In production (Vercel), REACT_APP_API_URL must be set to your live backend.
export const API_BASE_URL = process.env.REACT_APP_API_URL || '';
