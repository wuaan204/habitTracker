export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.D2FJ58D-.js",app:"_app/immutable/entry/app.CfOnfZol.js",imports:["_app/immutable/entry/start.D2FJ58D-.js","_app/immutable/chunks/B8bT_eL8.js","_app/immutable/chunks/ywAkdKnm.js","_app/immutable/chunks/BgcG3xhf.js","_app/immutable/entry/app.CfOnfZol.js","_app/immutable/chunks/ywAkdKnm.js","_app/immutable/chunks/CpHWPyoU.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
