const axios = require('axios').default;
const sufix = "kolkol_id:";
require('dotenv').config();
const logger = require('./logger')

  
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
[host,port] = process.env.proxy.split(":") 
client = axios.create({
    timeout: 5000,
 //   httpAgent, httpsAgent,
 proxy:{host:host,port:port},
    headers: {
        'lang': 'en',
        'versioncode': '11',
        'clienttype': 'ios_jike_default',
        "Content-Type": 'application/json'
    }
});

async function request(config) {
  
    id = Buffer.from(JSON.stringify(config)).toString('base64')
    let cached = AxiosCache.get(id);
    if (cached) {
        return cached
    } else {
        return await client(config)
            .then(res => {
                if (res && res.data) AxiosCache.set(id, res.data);
                return res.data;
            })
            .catch(error => {
                if (error.response) {
                    logger.error('error on source.js request:', error.response.status, error.response.statusText, error.config.url)
                    console.error('error on source.js request:', error.response.status, error.response.statusText, error.config.url);
                } else {
                    logger.error(error)
                    console.error(error);
                }
            });
    }
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
        logger.info("stream", type, meta_id, ep_id)
        console.log("stream", type, meta_id, ep_id)
        ep = EpisodesCache.get(ep_id);
        while(!ep){
            meta = await meta(type, meta_id);
            if(!meta) break
            ep = EpisodesCache.get(ep_id);
        }
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
                url: `${api.apiUrl}/media/previewInfo?category=${category}&contentId=${meta_id}&episodeId=${ep_id}&definition=${def.code}`,
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
        logger.error(e)
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
        url = `${api.apiUrl}/movieDrama/get?id=${meta_id}&category=${category}`
        //console.log(url)
        var config = {
            method: "get",
            url: url,
        };
        response = await request(config)
        if (!response) throw "error getting data"
        logger.info(url)
        console.log(url)
        if (response.msg != "Success") throw "error"
        data = response.data
        var meta = {
            type: data.episodeCount ? "series" : "movie",
            id: sufix + data.id,
            name: data.name,
            poster: (data.coverVerticalUrl),
            background: (data.coverHorizontalUrl),
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
            EpisodesCache.set(ep.id, ep);
            videos.push({
                id: `${sufix}${meta_id}:${ep.id}`,
                title: id.name ? id.name : "episode " + ep.seriesNo,
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

        return meta
    } catch (e) {
        logger.error(e)
        console.error(e)
    }
}

async function search(type, id, query,skip) {
    try {
        const meta = []
        logger.info("search", type, id,query)
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
            url: api.apiUrl + '/search/v1/searchWithKeyWord',
            data: data
        };
        logger.info(config)
        response = await request(config)

        if (!response) throw "error getting data"
        if (response.msg != "Success") throw "error"
        data = response.data.searchResults
        for (let i = 0; i < data.length; i++) {
            meta.push({
                type: data[i].dramaType.name =="movie"?"movie":"series",
                id: sufix + data[i].id,
                name: data[i].name,
                poster: (data[i].coverVerticalUrl)
            })
        }
        return meta

    } catch (e) {
        logger.error(e)
        console.error(e)
    }
}

async function catalog(type, id, skip, genre) {
    try {
        const meta = []
        logger.info("catalog", type, id, skip, genre)
        console.log("catalog", type, id, skip, genre)
        if (skip) skip = Math.round((skip / 10) + 1);
        else skip = 1;
        res_type = types[type]
        category = genre ? series_genres[genre].id : "";
        region = id ? series_regions[id].id : "";
        var data = `{"size": 100,"params": "${res_type}","area": "${region}","category": "${category}","year": "","subtitles": "","order": "up"}`;
        console.log(data)
        var config = {
            method: 'post',
            url: api.apiUrl + '/search/v1/search',
            data: data
        };
        logger.info(config)
        response = await request(config)

        if (!response) throw "error getting data"
        if (response.msg != "Success") throw "error"
        data = response.data.searchResults
        for (let i = 0; i < data.length; i++) {
            meta.push({
                type: type,
                id: sufix + data[i].id,
                name: data[i].name,
                poster: data[i].coverVerticalUrl
            })
        }
        return meta

    } catch (e) {
        logger.error(e)
        console.error(e)
    }
}





module.exports = {
    catalog,
    search,
    meta,
    stream
};
