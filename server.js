#!/usr/bin/env node

const { serveHTTP, publishToCentral } = require("stremio-addon-sdk")
const addonInterface = require("./addon")
serveHTTP(addonInterface, { port: process.env.PORT || 63355 ,cacheMaxAge : process.env.cacheMaxAge || 0})

// when you've deployed your addon, un-comment this line
publishToCentral("https://2ecbbd610840-kolkol.baby-beamup.club/manifest.json").catch(e=>{console.error(e)})
// for more information on deploying, see: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/deploying/README.md
