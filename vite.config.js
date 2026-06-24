import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

// Plugin customizado para criar uma API local que gerencia os arquivos JSON
function localCMSPlugin() {
  return {
    name: 'local-cms-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url.startsWith('/api/editions') && req.url !== '/api/upload' && !req.url.startsWith('/api/generate-pdf') && !req.url.startsWith('/api/ai') && !req.url.startsWith('/api/news-db')) {
          return next();
        }

        const dataPath = path.resolve(__dirname, 'src/data/editions');
        
        // Setup API Headers
        res.setHeader('Content-Type', 'application/json; charset=utf-8');

        // GET /api/editions/list.json -> Lista todas as edições
        if (req.method === 'GET' && req.url === '/api/editions/list.json') {
          try {
            const files = fs.readdirSync(dataPath).filter(f => f.endsWith('.json'));
            const editions = files.map(file => {
              const contentStr = fs.readFileSync(path.join(dataPath, file), 'utf8').replace(/^\uFEFF/, '');
              const content = JSON.parse(contentStr);
              return {
                id: content.id,
                ano: content.ano,
                title: content.header?.titulo_principal || 'Edição sem Título',
                date: content.header?.dateline || '',
                status: content.status || 'published'
              };
            });
            // Ordenar da mais nova para a mais antiga (assumindo id maior = mais nova)
            editions.sort((a, b) => b.id - a.id);
            res.end(JSON.stringify(editions));
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // GET /api/editions/edition-:ano-:id.json -> Retorna uma edição específica
        const getMatch = req.url.match(/\/api\/editions\/edition-(\d+)-(\d+)\.json/);
        if (req.method === 'GET' && getMatch) {
          const ano = getMatch[1];
          const id = getMatch[2];
          const filePath = path.join(dataPath, `edition-${ano}-${id}.json`);
          if (fs.existsSync(filePath)) {
            res.end(fs.readFileSync(filePath, 'utf8'));
          } else {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Edição não encontrada' }));
          }
          return;
        }

        // POST/PUT /api/editions/:ano/:id -> Salva/Atualiza uma edição
        const postMatch = req.url.match(/\/api\/editions\/(\d+)\/(\d+)/);
        if ((req.method === 'POST' || req.method === 'PUT') && postMatch) {
          const ano = postMatch[1];
          const id = postMatch[2];
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              const payload = JSON.parse(body);
              // Garante o ID e Ano
              payload.id = parseInt(id, 10);
              payload.ano = parseInt(ano, 10);
              const filePath = path.join(dataPath, `edition-${ano}-${id}.json`);
              fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
              res.end(JSON.stringify({ success: true, message: `Edição ${ano}/${id} salva com sucesso.` }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Falha ao salvar o arquivo JSON', details: err.message }));
            }
          });
          return;
        }

        // DELETE /api/editions/:ano/:id -> Apaga uma edição
        const deleteMatch = req.url.match(/\/api\/editions\/(\d+)\/(\d+)/);
        if (req.method === 'DELETE' && deleteMatch) {
          const ano = deleteMatch[1];
          const id = deleteMatch[2];
          const filePath = path.join(dataPath, `edition-${ano}-${id}.json`);
          try {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              res.end(JSON.stringify({ success: true, message: `Edição ${ano}/${id} deletada com sucesso.` }));
            } else {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'Edição não encontrada.' }));
            }
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Falha ao deletar a edição.', details: err.message }));
          }
          return;
        }

        // ==========================================
        // ASSISTENTE EDITORIAL - API ROUTES
        // ==========================================
        const newsDbPath = path.resolve(__dirname, 'src/data/news');
        if (!fs.existsSync(newsDbPath)) {
          fs.mkdirSync(newsDbPath, { recursive: true });
        }

        // GET /api/news-db/list.json
        if (req.method === 'GET' && req.url === '/api/news-db/list.json') {
          try {
            const files = fs.readdirSync(newsDbPath).filter(f => f.endsWith('.json'));
            const newsList = files.map(file => {
              const contentStr = fs.readFileSync(path.join(newsDbPath, file), 'utf8');
              return JSON.parse(contentStr);
            });
            newsList.sort((a, b) => b.timestamp - a.timestamp);
            res.end(JSON.stringify(newsList));
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // POST /api/news-db
        if (req.method === 'POST' && req.url === '/api/news-db') {
          let body = '';
          req.on('data', chunk => { body += chunk.toString(); });
          req.on('end', () => {
            try {
              const payload = JSON.parse(body);
              payload.id = Date.now().toString();
              payload.timestamp = Date.now();
              const filePath = path.join(newsDbPath, `news-${payload.id}.json`);
              fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
              res.end(JSON.stringify({ success: true, message: 'Notícia salva', id: payload.id }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Falha ao salvar notícia', details: err.message }));
            }
          });
          return;
        }

        // POST /api/ai/search
        if (req.method === 'POST' && req.url === '/api/ai/search') {
          let body = '';
          req.on('data', chunk => { body += chunk.toString(); });
          req.on('end', async () => {
            try {
              const payload = JSON.parse(body);
              const q = (payload.query || '').toLowerCase();
              
              const feeds = [
                'https://g1.globo.com/rss/g1/',
                'https://www.cnnbrasil.com.br/feed/',
                'https://rss.uol.com.br/feed/noticias.xml',
                'https://feeds.bbci.co.uk/portuguese/rss.xml'
              ];
              
              const cheerio = (await import('cheerio')).default || (await import('cheerio'));
              let allResults = [];
              
              // Fetch from all feeds in parallel
              await Promise.all(feeds.map(async (feed) => {
                try {
                  const response = await fetch(feed);
                  const text = await response.text();
                  const $ = cheerio.load(text, { xmlMode: true });
                  
                  $('item').each((i, el) => {
                    const title = $(el).find('title').text().trim();
                    const snippet = $(el).find('description').text().replace(/(<([^>]+)>)/gi, "").substring(0, 150).trim();
                    
                    // Simple local filtering based on the search query
                    if (!q || title.toLowerCase().includes(q) || snippet.toLowerCase().includes(q)) {
                      allResults.push({
                        title: title,
                        url: $(el).find('link').text().trim(),
                        snippet: snippet
                      });
                    }
                  });
                } catch (e) {
                  console.error("Erro ao buscar feed", feed);
                }
              }));
              
              // Shuffle or sort if needed, here just returning first 15 matches
              res.end(JSON.stringify(allResults.slice(0, 15)));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Erro na busca RSS', details: err.message }));
            }
          });
          return;
        }

        // POST /api/ai/crawl
        if (req.method === 'POST' && req.url === '/api/ai/crawl') {
          let body = '';
          req.on('data', chunk => { body += chunk.toString(); });
          req.on('end', async () => {
            try {
              const payload = JSON.parse(body);
              const url = payload.url;
              
              const response = await fetch(url, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
              });
              const html = await response.text();
              const cheerio = (await import('cheerio')).default || (await import('cheerio'));
              const $ = cheerio.load(html);
              
              // Simple extraction
              $('script, style, nav, footer, header, aside').remove();
              const title = $('title').text() || $('h1').first().text();
              const text = $('body').text().replace(/\s+/g, ' ').trim();
              
              res.end(JSON.stringify({ title, text: text.substring(0, 15000) })); // limit text length
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Erro no crawler', details: err.message }));
            }
          });
          return;
        }

        // POST /api/upload -> Salva imagem localmente
        if (req.method === 'POST' && req.url === '/api/upload') {
          let body = '';
          req.on('data', chunk => { body += chunk.toString(); });
          req.on('end', () => {
            try {
              const payload = JSON.parse(body);
              
              // Remove qualquer header "data:image/xyz;base64," separando na vírgula
              const base64Data = payload.base64.split(',')[1] || payload.base64;
              const buffer = Buffer.from(base64Data, 'base64');
              
              const uploadDir = path.resolve(__dirname, 'public/uploads');
              if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
              }
              
              const safeName = payload.filename.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
              const uniqueName = Date.now() + '_' + safeName;
              const filePath = path.join(uploadDir, uniqueName);
              
              fs.writeFileSync(filePath, buffer);
              res.end(JSON.stringify({ success: true, url: `/uploads/${uniqueName}` }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Erro ao fazer upload da imagem', details: err.message }));
            }
          });
          return;
        }

        // POST /api/generate-pdf/:ano/:id -> Gera o PDF usando Puppeteer
        const pdfMatch = req.url.match(/\/api\/generate-pdf\/(\d+)\/(\d+)/);
        if (req.method === 'POST' && pdfMatch) {
          const ano = pdfMatch[1];
          const id = pdfMatch[2];
          res.setHeader('Content-Type', 'application/json');
          
          (async () => {
            try {
              // Import dinâmico do puppeteer apenas quando a rota for chamada
              const puppeteer = (await import('puppeteer')).default;
              
              // Inicializa o Chrome em background
              const browser = await puppeteer.launch({ headless: 'new' });
              const page = await browser.newPage();
              
              // Navega para a rota secreta de impressão do próprio servidor local
              const host = req.headers.host;
              const url = `http://${host}/edicao/${ano}/${id}/imprimir`;
              
              // Espera a página carregar todas as fontes e imagens (networkidle0)
              await page.goto(url, { waitUntil: 'networkidle0' });
              
              // Força o CSS de impressão (para background aparecer)
              await page.emulateMediaType('print');
              
              // Robô Inteligente de Diagramação: Lê o DOM e ajusta a escala das páginas
              const layoutMetrics = await page.evaluate(() => {
                const pages = document.querySelectorAll('.print-page');
                let adjustments = 0;
                
                pages.forEach(p => {
                  // Altura alvo aproximada para 65cm em pixels (96dpi) é ~2456px.
                  // A folha tem 65cm. O padding é 4cm. Área útil é ~61cm (~2305px).
                  const targetHeight = 2300; 
                  const actualHeight = p.scrollHeight;
                  
                  if (actualHeight > targetHeight) {
                    const ratio = targetHeight / actualHeight;
                    // Se o conteúdo transbordar até ~20%, aplicamos zoom negativo para caber na mesma página
                    if (ratio >= 0.82) {
                      p.style.zoom = ratio;
                      // Ajustamos o min-height para compensar o zoom visual e manter o fundo esticado
                      p.style.minHeight = (61 / ratio) + 'cm';
                      adjustments++;
                    }
                  } else if (actualHeight < targetHeight && actualHeight > (targetHeight * 0.7)) {
                    // Se sobrar um pequeno espaço em branco no rodapé, o robô expande levissimamente
                    const ratio = targetHeight / actualHeight;
                    if (ratio <= 1.05) {
                      p.style.zoom = ratio;
                      p.style.minHeight = (61 / ratio) + 'cm';
                      adjustments++;
                    }
                  }
                });
                
                return { adjustments };
              });
              
              console.log(`[Robô de Diagramação] Escala corrigida em ${layoutMetrics.adjustments} páginas para evitar quebras.`);

              // Define o diretório de destino public/pdfs/
              const pdfsDir = path.resolve(__dirname, 'public/pdfs');
              if (!fs.existsSync(pdfsDir)) {
                fs.mkdirSync(pdfsDir, { recursive: true });
              }
              const filePath = path.join(pdfsDir, `edition-${ano}-${id}.pdf`);
              
              // "Imprime" no formato Broadsheet Esguio Clássico
              await page.pdf({
                path: filePath,
                width: '40cm',
                height: '65cm',
                printBackground: true,
                margin: { top: '0', bottom: '0', left: '0', right: '0' }
              });
              
              await browser.close();
              res.end(JSON.stringify({ success: true, url: `/pdfs/edition-${ano}-${id}.pdf` }));
            } catch (err) {
              console.error("PDF Gen Error:", err);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Erro ao gerar PDF pelo Puppeteer', details: err.message }));
            }
          })();
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), localCMSPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
