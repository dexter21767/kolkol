const axios = require('axios').default;
require('dotenv').config();
const [proxy_host, proxy_port] = process.env.proxy.split(":");
const proxy_region = process.env.region;

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
const rawMetaCache = new NodeCache({ stdTTL: (0.5 * 60 * 60), checkperiod: (1 * 60 * 60) });
const StreamCache = new NodeCache({ stdTTL: (0.5 * 60 * 60), checkperiod: (1 * 60 * 60) });
const subsCache = new NodeCache({ stdTTL: (0.5 * 60 * 60), checkperiod: (1 * 60 * 60) });
const MetaCache = new NodeCache({ stdTTL: (0.5 * 60 * 60), checkperiod: (1 * 60 * 60) });
const CatalogCache = new NodeCache({ stdTTL: (0.5 * 60 * 60), checkperiod: (1 * 60 * 60) });
const EpisodesCache = new NodeCache({ stdTTL: (0.5 * 60 * 60), checkperiod: (1 * 60 * 60) });

client = axios.create({
    baseURL: api.apiUrl,
    proxy: { protocol: 'http', host: proxy_host, port: proxy_port },
    timeout: 50000,
    headers: {
        'proxy-type': proxy_region,
        'lang': 'en',
        'versioncode': 33,
        clienttype: 'android_tem3',
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
        return ({ url: data.mediaUrl, name: def.code.replace('GROOT_', "KOLKOL "), description: def.description, subtitles: subs })
    } catch {

    }
}
async function stream(type, meta_id, ep_id) {
    try {

        console.log("stream", type, meta_id, ep_id)

        if (!ep_id) {
            let metadata = MetaCache.get(`${type}_${meta_id}`)
            if (!metadata) metadata = await meta(type, meta_id);
            if (!metadata) return [];
            ep_id = metadata.id.split(':').pop()
        }
        let cacheID = `${type}_${meta_id}_${ep_id}`;

        ep = EpisodesCache.get(cacheID);
        if (!ep) return [];



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
        //console.log(data);
        let meta = {
            type: data.episodeCount ? "series" : "movie",
            id: sufix + data.id,
            name: data.name,
            poster: encodeURI(data.coverVerticalUrl),
            background: encodeURI(data.coverHorizontalUrl),
            genres: data.tagNameList || [],
            description: data.introduction || '',
            releaseInfo: data.year.toString() || '',
            imdbRating: data.score,
            country: data.areaNameList?.[0],

        }
        const videos = [];
        data.episodeVo.forEach(ep => {
            let cacheID = `${type}_${meta_id}_${ep.id}`
            EpisodesCache.set(cacheID, ep);
            console.log(ep.name)
            videos.push({
                id: `${sufix}${meta_id}:${ep.id}`,
                title: ep.name ? ep.name : "episode " + ep.seriesNo,
                //released:,
                episode: ep.seriesNo,
                season: data.seriesNo ? data.seriesNo : 1,
                released: new Date(data.year.toString()),
                available: true,
            })
        })

        if (type == "movie") {
            meta.id = videos[0].id
            meta.behaviorHints = { "defaultVideoId": videos[0].id }
        }
        else {
            meta.videos = videos;
        }
        if (meta) MetaCache.set(cacheID, meta)
        return meta
    } catch (e) {
        console.error(e)
    }
}

async function search(type, id, query, skip) {
    try {
        const metas = []
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
        searchResults = response.data.searchResults
        searchResults.forEach(Result => {
            let meta = {
                type: Result.dramaType.name == "movie" ? "movie" : "series",
                id: sufix + Result.id,
                name: Result.name,
                poster: encodeURI(Result.coverVerticalUrl)
            }
            if (meta.type == "movie") meta.behaviorHints = { "defaultVideoId": meta.id }
            metas.push(meta)

        });
        return metas

    } catch (e) {
        console.error(e)
    }
}

async function catalog(type, id, skip, genre) {
    try {
        const metas = []
        console.log("catalog", type, id, skip, genre)
        if (typeof skip != "int" || !skip) skip = parseInt(skip) || 0;
        skip += 100;
        const res_type = types[type]
        const category = genre ? series_genres[genre].id : "";
        const region = id ? series_regions[id].id : "";


        const cacheID = `${type}_${id}`;
        let cached = CatalogCache.get(cacheID)
        if (cached?.skip >= skip) return cached.metas.slice(0, skip);


        let data = `{"size": ${skip},"params": "${res_type}","area": "${region}","category": "${category}","year": "","subtitles": "","order": "up"}`;
        console.log(data)
        const config = {
            method: 'post',
            url: '/search/v1/search',
            data: data
        };

        response = await request(config)

        if (!response) throw "error getting data"
        if (response.msg != "Success") throw "error"

        searchResults = response.data.searchResults
        searchResults.forEach(Result => {
            let meta = {
                type: type,
                id: sufix + Result.id,
                name: Result.name,
                poster: encodeURI(Result.coverVerticalUrl)
            }
            if (meta.type == "movie") meta.behaviorHints = { "defaultVideoId": meta.id }
            metas.push(meta)
        });
        if (metas?.length) CatalogCache.set(cacheID, { skip, metas })
        return metas

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
