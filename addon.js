const { addonBuilder } = require("stremio-addon-sdk");

const {catalog,search,meta,stream} = require("./source");
// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/manifest.md
const manifest = require("./manifest");
const builder = new addonBuilder(manifest)

builder.defineStreamHandler((args) => {
	console.log("addon.js streams:", args);
	if (args.id.match(/kolkol_id:[^xyz]*/i)) {
		return Promise.resolve(stream(args.type, args.id.split(":")[1],args.id.split(":")[2]))
		.then((streams) => ({ streams: streams }));
		//.then((streams) => { console.log('streams', streams)});
	} else {
		console.log('stream reject');
		return Promise.resolve({ streams: [] });
	}
});

builder.defineCatalogHandler((args) => {
	console.log("addon.js Catalog:", args);
	if (args.extra.search) {
		return Promise.resolve(search(args.type.split(" ")[1],args.id, args.extra.search,args.extra.skip))
			//.then((metas) => { console.log('metas', metas) });
			.then((metas) => ({ metas: metas }));
	} else {
		return Promise.resolve(catalog(args.type.split(" ")[1], args.id,args.extra.skip,args.extra.genre))
			//.then((metas) => { console.log('metas', metas) });
			.then((metas) => ({ metas: metas }));
	}
});

builder.defineMetaHandler((args) => {
	console.log("addon.js meta:", args);

	if (args.id.match(/kolkol_id:[^xyz]*/i)) {
		return Promise.resolve(meta(args.type, args.id.split(":")[1]))
			//.then((metas) => { console.log('metas', metas)});
			.then((meta) => ({ meta: meta }));
	} else {
		console.log('meta reject');
		return Promise.resolve({ meta: [] });
	}


});

module.exports = builder.getInterface()