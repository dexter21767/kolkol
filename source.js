const axios = require('axios').default;
require('dotenv').config();
const [host,port] = process.env.proxy.split(":");
const region = process.env.region;

const sufix = "kolkol_id:";

const series_genres = { "All Categories": { "id": "", "name": "All Categories" }, "Drama": { "id": "8", "name": "Drama" }, "Action": { "id": "1", "name": "Action" }, "Romance": { "id": "18", "name": "Romance" }, "Fantasy": { "id": "10", "name": "Fantasy" }, "Animation": { "id": "3", "name": "Animation" }, "Suspense": { "id": "16", "name": "Suspense" }, "Sci-Fi": { "id": "19", "name": "Sci-Fi" }, "Horror": { "id": "13", "name": "Horror" }, "Comedy": { "id": "5", "name": "Comedy" }, "Crime": { "id": "6", "name": "Crime" }, "Adventure": { "id": "2", "name": "Adventure" }, "Thriller": { "id": "23", "name": "Thriller" }, "Family": { "id": "9", "name": "Family" }, "Musical": { "id": "63,14,15", "name": "Musical" }, "War": { "id": "24", "name": "War" }, "LGBTQ": { "id": "65", "name": "LGBTQ" }, "Catastrophe": { "id": "64", "name": "Catastrophe" }, "Documentary": { "id": "7", "name": "Documentary" }, "other": { "id": "7,4,11,12,17,22,21,20,25", "name": "other" } }
const series_regions = { "All regions": { "id": "", "name": "All regions" }, "America": { "id": "61", "name": "America" }, "Korea": { "id": "53", "name": "Korea" }, "U.K": { "id": "60", "name": "U.K" }, "Japan": { "id": "44", "name": "Japan" }, "Thailand": { "id": "57", "name": "Thailand" }, "Europe": { "id": "37,60,58,50,54,55,48,46,45,34,35,38,39,43,62", "name": "Europe" }, "China": { "id": "32,56", "name": "China" }, "India": { "id": "40", "name": "India" }, "Australia": { "id": "27", "name": "Australia" }, "Indonesia": { "id": "41", "name": "Indonesia" }, "other": { "id": "26,28,29,30,31,33,36,42,47,49,59", "name": "other" } }
const types = { "series": "TV,SETI,MINISERIES,VARIETY,TALK,COMIC,DOCUMENTARY", "movie": "MOVIE", "anime": "COMIC" }


const api = {
    api: Buffer.from("aHR0cHM6Ly9nYS1tb2JpbGUtYXBpLmxva2xvay50dg==", 'base64').toString('ascii'),
    apiUrl: Buffer.from("aHR0cHM6Ly9nYS1tb2JpbGUtYXBpLmxva2xvay50di9jbXMvYXBw", 'base64').toString('ascii'),
    searchApi: Buffer.from("aHR0cHM6Ly9sb2tsb2suY29t", 'base64').toString('ascii'),
    mainImageUrl: Buffer.from("aHR0cHM6Ly9pbWFnZXMud2VzZXJ2Lm5s", 'base64').toString('ascii')
}

const NodeCache = require("node-cache");
const AxiosCache = new NodeCache({ stdTTL: (0.5 * 60 * 60), checkperiod: (1 * 60 * 60) });
const StreamCache = new NodeCache({ stdTTL: (0.5 * 60 * 60), checkperiod: (1 * 60 * 60) });
const subsCache = new NodeCache({ stdTTL: (0.5 * 60 * 60), checkperiod: (1 * 60 * 60) });
const MetaCache = new NodeCache({ stdTTL: (0.5 * 60 * 60), checkperiod: (1 * 60 * 60) });
const CatalogCache = new NodeCache({ stdTTL: (0.5 * 60 * 60), checkperiod: (1 * 60 * 60) });
const EpisodesCache = new NodeCache({ stdTTL: (0.5 * 60 * 60), checkperiod: (1 * 60 * 60) });

client = axios.create({
    baseURL:api.apiUrl,
    proxy: { protocol: 'http', host: host, port:port } ,
    timeout: 50000,
    headers: {
        'proxy-type': region,
        'lang': 'en',
        'versioncode' : 33,
        clienttype : 'android_tem3',
        deviceid: randomString(),
        "Content-Type": 'application/json'
    }
});

async function request(config) {

        return await client(config)
            .then(res => {
                return res.data;
            })
            .catch(error => {
                if (error.response) {
                    console.error(error);
                    console.error('error on source.js request:', error.response.status, error.response.statusText, error.config.url);
                } else {
                    console.error(error);
                }
            });
    
}


function getsubtitles(subs) {
    let subtitles = [];
    for (let i = 0; i < subs.length; i++) {
        subtitles.push({
            id: subs[i].languageAbbr + i,
            url: subs[i].subtitlingUrl,
            lang: subs[i].language
        });
    }
    return subtitles;
}

async function getStream(config, def, subs) {
    try {
        res = await request(config)
        if (!res) throw "error"
        data = res.data
        return ({ url: data.mediaUrl, name: def.code.replace('GROOT_',"KOLKOL "), description: def.description, subtitles: subs })
    } catch {

    }
}
async function stream(type, meta_id, ep_id) {
    try {

        console.log("stream", type, meta_id, ep_id,)
        if(!ep_id) return [];
        let cacheID = `${type}_${meta_id}_${ep.id}`
        ep = EpisodesCache.get(cacheID);
        if(!ep) return [];

        let subs = getsubtitles(ep.subtitlingList);
        if (type == "movie") {
            category = 0
        } else {
            category = 1
        }
        const promises = []
        for (let i = 0; i < ep.definitionList.length; i++) {
            let def = ep.definitionList[i]
            var config = {
                method: 'get',
                url: `/media/previewInfo?category=${category}&contentId=${meta_id}&episodeId=${ep_id}&definition=${def.code}`,
                headers: {
                    'lang': 'en',
                    'versioncode': '11',
                    'clienttype': 'ios_jike_default'
                }
            };
            promises.push(getStream(config, def, subs))
        }
        return Promise.allSettled(promises).then(res => {
            const streams = []
            for (let i = 0; i < res.length; i++) {
                if (res[i].status == "fulfilled") {
                    streams.push(res[i].value)
                }
            }
            return streams
        })

    } catch (e) {
        console.error(e)
    }

}

async function meta(type, meta_id) {
    try {
        if (type == "movie") {
            category = 0
        } else {
            category = 1
        }
        url = `/movieDrama/get?id=${meta_id}&category=${category}`
        //console.log(url)
        const cacheID = `${type}_${meta_id}`
        let cached = MetaCache.get(cacheID)
        if (cached) return cached
        var config = {
            method: "get",
            url: url,
        };
        response = await request(config)
        if (!response) throw "error getting data"
        console.log(url)
        if (response.msg != "Success") throw "error"
        data = response.data
        var meta = {
            type: data.episodeCount ? "series" : "movie",
            id: sufix + data.id,
            name: data.name,
            poster: encodeURI(data.coverVerticalUrl),
            background: encodeURI(data.coverHorizontalUrl),
            genres: data.tagNameList,
            description: data.introduction,
            releaseInfo: data.year,
            imdbRating: data.score,

            country: data.country,
            id: "kisskh:" + data.id.toString(),
            name: data.name,
        }
        const videos=[];
        for (let i = 0; i < data.episodeVo.length; i++) {
            ep = data.episodeVo[i]
            let cacheID = `${type}_${meta_id}_${ep.id}`
            EpisodesCache.set(cacheID, ep);
            console.log(ep.name)
            videos.push({
                id: `${sufix}${meta_id}:${ep.id}`,
                title: ep.name ? ep.name : "episode " + ep.seriesNo,
                //released:,
                episode: ep.seriesNo,
                season: data.seriesNo ? data.seriesNo : 1,
            })
        }
        if (type == "movie"){
            meta.id = videos[0].id
        }else {
            meta.videos = videos;
        }
        if(meta) MetaCache.set(cacheID,meta)
        return meta
    } catch (e) {
        console.error(e)
    }
}

async function search(type, id, query,skip) {
    try {
        const meta = []
        console.log("search", type, id, query)
        if (skip) skip = Math.round((skip / 10) + 1);
        else skip = 1;
        res_type = types[type]
        //category = genre ? series_genres[genre].id : "";
        //region = id ? series_regions[id].id : "";
        var data = `{"searchKeyWord":"${query}","size": 50,"sort": "","searchType": ""}`;
        console.log(data)
        var config = {
            method: 'post',
            url: '/search/v1/searchWithKeyWord',
            data: data
        };
        response = await request(config)

        if (!response) throw "error getting data"
        if (response.msg != "Success") throw "error"
        data = response.data.searchResults
        for (let i = 0; i < data.length; i++) {
            meta.push({
                type: data[i].dramaType.name =="movie"?"movie":"series",
                id: sufix + data[i].id,
                name: data[i].name,
                poster: encodeURI(data[i].coverVerticalUrl)
            })
        }
        return meta

    } catch (e) {
        console.error(e)
    }
}

async function catalog(type, id, skip, genre) {
    try {
        const meta = []
        console.log("catalog", type, id, skip, genre)
        if (typeof skip != "int" || !skip) skip = parseInt(skip) || 0;
        skip += 100;
        res_type = types[type]
        category = genre ? series_genres[genre].id : "";
        region = id ? series_regions[id].id : "";
        

        const cacheID = `${type}_${id}`;
        let cached = CatalogCache.get(cacheID)
        if(cached?.skip >= skip) return cached.meta;
        

        var data = `{"size": ${skip},"params": "${res_type}","area": "${region}","category": "${category}","year": "","subtitles": "","order": "up"}`;
        console.log(data)
        var config = {
            method: 'post',
            url: '/search/v1/search',
            data: data
        };

        response = await request(config)

        if (!response) throw "error getting data"
        if (response.msg != "Success") throw "error"
        data = response.data.searchResults
        console.log(data.length)
        for (let i = 0; i < data.length; i++) {
            meta.push({
                type: type,
                id: sufix + data[i].id,
                name: data[i].name,
                poster: encodeURI(data[i].coverVerticalUrl)
            })
        }
        if(meta?.length) CatalogCache.set(cacheID,{skip,meta})
        return meta

    } catch (e) {
        console.error(e)
    }
}


function randomString() {
    const length = 16;
    const chars = '0123456789abcdef'
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}
 


module.exports = {
    catalog,
    search,
    meta,
    stream
};
