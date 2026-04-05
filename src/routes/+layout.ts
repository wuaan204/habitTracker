// Disable SSR — this is a fully client-side local-first app.
// All data lives in localStorage; no server rendering needed.
export const prerender = true;
export const ssr = false;
