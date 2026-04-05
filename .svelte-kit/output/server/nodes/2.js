

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.ChQ1xTWu.js","_app/immutable/chunks/ywAkdKnm.js","_app/immutable/chunks/CpHWPyoU.js","_app/immutable/chunks/BgcG3xhf.js"];
export const stylesheets = [];
export const fonts = [];
