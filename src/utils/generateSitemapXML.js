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

module.exports = generateSitemapXML