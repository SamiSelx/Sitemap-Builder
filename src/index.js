const express = require('express')
const app = express()
const path = require('path')
const axios = require('axios')
const cheerio = require('cheerio')
const {URL } = require('url')

app.use(express.urlencoded({extended:true}))
app.use(express.json())

app.use('/',express.static(path.join(__dirname,'public')))


const links = [];
app.post('/sitemap',async (req,res)=>{
    const { baseUrl } = req.body;

    if (!baseUrl) {
        return res.status(400).json({ error: 'URL is required' });
    }

    // async function getLinks(url){
    //     const response = await axios.get(url);
    //     const dom = cheerio.load(response.data);
        
    //     dom('a').each((_, element) => {
    //         const href = dom(element).attr('href');
    //         const exist = links.find(url=>url == href)
    //         if (href && href.startsWith('http') && !exist) {
    //             links.push(href);
    //             // getLinks(href)
    //         }
    //     });

    //     // console.log(links);

    // }

    // try {
    //     await getLinks(url)
    //     console.log(links);
    //     // const sitemapXml = generateSitemapXML(links)
    //     return res.status(200).json(links)
        
    // } catch (error) {
    //     res.status(500).json({ error: 'Error fetching the website' });
    // }

    // function generateSitemapXML(links) {
    //     let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    //     xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    //     links.forEach(link => {
    //         xml += `   <url>\n`;
    //         xml += `      <loc>${link}</loc>\n`;
    //         xml += `   </url>\n`;
    //     });
    
    //     xml += `</urlset>`;
    //     return xml;
    // }
    
    try {
        const visited = new Set();
        const links = await fetchLinks(baseUrl, visited);
        console.log('links after fetched ',links);
        const sitemapXml = generateSitemapXML(links)
        res.status(200).send(sitemapXml)
    } catch (error) {
        console.log(error);
        res.status(400).json({status:'failed',message:'failed to generate sitemap'})
    }
 
    async function fetchLinks(url, visited) {
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

    function generateSitemapXML(links) {
            let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
            xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
        
            links.forEach(link => {
                xml += `   <url>\n`;
                xml += `      <loc>${link}</loc>\n`;
                xml += `   </url>\n`;
            });
        
            xml += `</urlset>`;
            return xml;
    }
    

    
})
app.listen(5000,()=>console.log('Server Started on port 5000'))

