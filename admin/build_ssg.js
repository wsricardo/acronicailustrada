const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const ssg = require('./ssg');

const SITE_PUBLIC_DIR = path.join(__dirname, '..', 'public');
const EDITIONS_DIR = path.join(SITE_PUBLIC_DIR, 'data', 'editions');

async function getEditionsFiles(dir, filelist = []) {
    if (!fs.existsSync(dir)) return filelist;
    const files = await fsp.readdir(dir);
    for (const file of files) {
        const filepath = path.join(dir, file);
        const stat = await fsp.stat(filepath);
        if (stat.isDirectory()) {
            if (file !== 'assets') { // ignore assets folders
                await getEditionsFiles(filepath, filelist);
            }
        } else if (file.endsWith('.json') && file.startsWith('edition-')) {
            filelist.push(path.relative(EDITIONS_DIR, filepath).replace(/\\/g, '/'));
        }
    }
    return filelist;
}

async function build() {
    try {
        const files = await getEditionsFiles(EDITIONS_DIR);
        const indexData = [];

        await Promise.all(files.map(async (file) => {
            const filepath = path.join(EDITIONS_DIR, file);
            if (fs.existsSync(filepath) && file.endsWith('.json')) {
                const data = JSON.parse(await fsp.readFile(filepath, 'utf8'));
                if (!data.status || data.status === 'published') {
                    indexData.push({
                        id: data.id || '',
                        file: file.replace(/\\/g, '/'),
                        title: `Edição ${data.number}`,
                        date: data.dateStr || '',
                        number: parseInt(data.number) || 0
                    });
                }
            }
        }));

        indexData.sort((a, b) => b.number - a.number);

        // ==== INÍCIO DO SSG (Static Site Generation) ====
        for (let i = 0; i < indexData.length; i++) {
            const entry = indexData[i];
            const jsonPath = path.join(EDITIONS_DIR, entry.file);
            try {
                const data = JSON.parse(await fsp.readFile(jsonPath, 'utf8'));
                const html = ssg.generateStaticHTML(data);
                
                // Salvar HTML na pasta da edição
                const editionDir = path.dirname(jsonPath);
                await fsp.writeFile(path.join(editionDir, 'index.html'), html, 'utf8');

                // Se for a edição mais recente, salvar também na raiz do site
                if (i === 0) {
                    const rootIndexHtml = path.join(SITE_PUBLIC_DIR, 'index.html');
                    await fsp.writeFile(rootIndexHtml, html, 'utf8');
                }
                console.log(`[SSG] Gerado: ${entry.file} -> index.html`);
            } catch (err) {
                console.error(`Erro ao gerar HTML SSG para ${entry.file}:`, err);
            }
        }
        
        // ==== GERAÇÃO DO SITEMAP.XML ====
        try {
            const domain = 'https://www.acronicailustrada.com.br';
            const today = new Date().toISOString().split('T')[0];
            let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
            
            sitemapXml += `  <url>\n    <loc>${domain}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

            for (let i = 0; i < indexData.length; i++) {
                const entry = indexData[i];
                const editionFolder = entry.file.split('/edition-')[0];
                sitemapXml += `  <url>\n    <loc>${domain}/data/editions/${editionFolder}/index.html</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
            }
            sitemapXml += `</urlset>`;
            
            await fsp.writeFile(path.join(SITE_PUBLIC_DIR, 'sitemap.xml'), sitemapXml, 'utf8');
            console.log('[SSG] Gerado: sitemap.xml');
        } catch (err) {
            console.error('Erro ao gerar sitemap.xml:', err);
        }
        // ==================================

        console.log('Build concluído com sucesso!');
    } catch (err) {
        console.error('Erro no build:', err);
    }
}

build();
