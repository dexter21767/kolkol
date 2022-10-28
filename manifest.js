//var manifest  = require("./addon")
const list = require("./lists.json")

//{"name": "skip","isRequired": false,"options": [0,100,200,300]},
var manifest = {
    "id": "community.kolkol",
    "version": "0.0.1",
    "name": "KOLKOL by dexter21767",
    "description": "stream everything over https with multiple subtitles",
    "logo": "https://static.netpop.app/img/loklok-white.png",
    "background": "https://github.com/Stremio/stremio-art/raw/main/originals/reiphantomhive1.png",
    "contactEmail": "ahmidiyasser@gmail.com",
    "catalogs": [],
    "resources": [
        {
            "name": "stream",
            "types": [
                "movie",
                "series",
                "anime"
            ],
            "idPrefixes": [
                "kolkol_id:"
            ]
        },
        {
            "name": "meta",
            "types": [
                "movie",
                "series",
                "anime"
            ],
            "idPrefixes": [
                "kolkol_id:"
            ]
        }
    ],
    "types": [
        "movie",
        "series",
        "anime"
    ],
    "behaviorHints": {
        "configurable": false,
        "configurationRequired": false
    }
}

var genersParm = {}
var regionsParm = {}

for(let types = 0; types<list.data.length;types++){
    let type = list.data[types].name == "TV Series"? "series":(list.data[types].name == "Movie"? "movie":(list.data[types].name == "Anime"? "anime":"series"))
    //if (type == "anime"||type=="movie") break 
    let genresArray = []

    for (let genres = 0;genres<list.data[types].screeningItems[1].items.length;genres++){
    genresArray.push(list.data[types].screeningItems[1].items[genres].name)
    genersParm[list.data[types].screeningItems[1].items[genres].name]={
        id:list.data[types].screeningItems[1].items[genres].params,
        name:list.data[types].screeningItems[1].items[genres].name
    }
}

    for (let items = 0;items<list.data[types].screeningItems[0].items.length;items++){
    manifest.catalogs.push({
        id:list.data[types].screeningItems[0].items[items].name,
        type: "KOLKOL "+type,
        name: list.data[types].screeningItems[0].items[items].name,
        extra:[
        //{"name": "genre","isRequired": false,"options": genresArray},    
        {"name": "skip","isRequired": false,"options": [0,100,200,300]}
        ]
    })
    regionsParm[list.data[types].screeningItems[0].items[items].name]={
        id:list.data[types].screeningItems[0].items[items].params,
        name:list.data[types].screeningItems[0].items[items].name
    }
    }
//console.log(genresArray)
}

const size = Buffer.byteLength(JSON.stringify(manifest))
const kiloBytes = size / 1024;
const megaBytes = kiloBytes / 1024;
console.log(kiloBytes)
//console.log(JSON.stringify(regionsParm))
module.exports = manifest