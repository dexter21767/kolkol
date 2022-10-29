const { addonBuilder } = require("stremio-addon-sdk");

const {catalog,search,meta,stream} = require("./source");
// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/manifest.md
const manifest = require("./manifest");
const builder = new addonBuilder(manifest)



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


module.exports = builder.getInterface()