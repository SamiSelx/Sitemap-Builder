const express = require('express')
const app = express()
const path = require('path')
const fs = require('fs')
const fetchLinks = require('./utils/fetchLinks')
const generateSitemapXML = require('./utils/generateSitemapXML')

app.use(express.urlencoded({extended:true}))
app.use(express.json())

app.use('/',express.static(path.join(__dirname,'public')))


app.post('/sitemap',async (req,res)=>{
    const { baseUrl } = req.body;

    if (!baseUrl) {
        return res.status(400).send('failed to generate sitemap')
    }
    try {
        const visited = new Set();
        const links = await fetchLinks(baseUrl, visited,baseUrl);
        console.log('links after fetched ',links);
        const sitemapXml = generateSitemapXML(links)
        fs.writeFileSync('./src/public/sitemap.xml',sitemapXml)
        res.status(200).send(sitemapXml)
    } catch (error) {
        console.log(error);
        res.status(400).send('failed to generate sitemap')
    }

})


app.listen(5000,()=>console.log('Server Started on port 5000'))

