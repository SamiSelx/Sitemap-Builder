const axios = require('axios')
const cheerio = require('cheerio')

async function fetchLinks(url, visited,baseUrl) {
    const links = new Set();

    // File (FIFO)
    const queue = [url];

    while (queue.length > 0) {
        const currentUrl = queue.shift();

        if (visited.has(currentUrl)) continue;
        visited.add(currentUrl);
        
        try {
            if(currentUrl.includes('?')) continue
            links.add(currentUrl)
            const response = await axios.get(currentUrl);
            const html = response.data;
            const dom = cheerio.load(html);
            
            dom('a').each((_, element) => {
                let href = dom(element).attr('href');
                // href startsWith / that's mean go to direct link
                if (href && (href.startsWith(baseUrl) || href.startsWith('/'))) {
                    try {
                        href = new URL(href, currentUrl).href;
                        if (!visited.has(href)) {
                            links.add(href);
                            queue.push(href);
                        }
                    } catch (error) {
                        console.log('Invalid URL');
                    }
                }
            });
        } catch (error) {
            console.error('Error fetching or parsing the URL:', error);
        }
    }

    return Array.from(links);
}


module.exports = fetchLinks