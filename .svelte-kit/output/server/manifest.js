export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "habitTracker/_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.DUn9RuFk.js",app:"_app/immutable/entry/app.CvBWRHkD.js",imports:["_app/immutable/entry/start.DUn9RuFk.js","_app/immutable/chunks/3u-uArFw.js","_app/immutable/chunks/ywAkdKnm.js","_app/immutable/chunks/BgcG3xhf.js","_app/immutable/entry/app.CvBWRHkD.js","_app/immutable/chunks/ywAkdKnm.js","_app/immutable/chunks/CpHWPyoU.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js'))
		],
		remotes: {
			
		},
		routes: [
			
		],
		prerendered_routes: new Set(["/habitTracker/"]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
