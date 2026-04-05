

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "prerender": true,
  "ssr": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.tVt3ATK0.js","_app/immutable/chunks/ywAkdKnm.js","_app/immutable/chunks/CpHWPyoU.js"];
export const stylesheets = ["_app/immutable/assets/0.UE-KAu_o.css"];
export const fonts = [];
