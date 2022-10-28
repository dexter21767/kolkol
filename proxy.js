
const ProxyList = require('free-proxy');
const proxyList = new ProxyList();


var proxylist ;
async function proxy(){
    let proxies;
try {
    if(!proxylist) proxylist = await proxyList.get();
  console.log(proxylist)
  //proxies = await proxyList.get();
  proxies = await proxyList.getByCountryCode('BR')
  //proxies = sortByProtocole(proxies);
  console.log(proxies)
  return proxies
  //return(proxies.https?proxies.http:proxies.http)
} catch (error) {
  throw new Error(error);
}
}


function sortByProtocole(subs = Array) {
    try {
        let sorted = {}
        subs.map((e,
            i) => {
            if (sorted[e.protocol.toLowerCase()]) {
                sorted[e.protocol.toLowerCase()].push(e)
            } else {
                sorted[e.protocol.toLowerCase()] = [e]
            }
        })
        return sorted
    } catch (err) {
        return null
    }
}

module.exports = proxy