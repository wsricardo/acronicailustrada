import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("=========================================");
console.log("🗞️  A Crônica Ilustrada - Prensa Estática");
console.log("=========================================\n");

// Diretório de onde vamos ler os dados brutos (O Banco de Dados Local)
const sourceDir = path.resolve(__dirname, '../src/data/editions');

// Diretório onde a API estática será gerada (O Site Final)
const targetDir = path.resolve(__dirname, '../dist/api/editions');

console.log(`[1/3] Lendo matrizes de conteúdo em: ${sourceDir}`);

// Garante que a pasta dist/api/editions existe
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Lendo todos os arquivos .json das edições
const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.json'));
const list = [];

console.log(`[2/3] Processando e clonando ${files.length} edições...`);

files.forEach(file => {
  const filePath = path.join(sourceDir, file);
  const contentStr = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  const content = JSON.parse(contentStr);
  
  // Clonando o arquivo de edição para a pasta estática
  const destPath = path.join(targetDir, file);
  fs.writeFileSync(destPath, JSON.stringify(content, null, 2));
  console.log(`  -> Clonada: ${file}`);

  // Coletando metadados para o índice de listagem
  list.push({
    id: content.id,
    ano: content.ano || 2026,
    title: content.header?.titulo_principal || 'Edição sem Título',
    date: content.header?.dateline || '',
    status: content.status || 'published'
  });
});

// Ordenar do mais novo para o mais velho
list.sort((a, b) => b.id - a.id);

// Gerando o arquivo "banco de dados" falso (list.json)
console.log(`\n[3/5] Gerando catálogo mestre estático (list.json) com ${list.length} registros...`);
fs.writeFileSync(path.join(targetDir, 'list.json'), JSON.stringify(list, null, 2));

console.log(`\n[4/5] Gerando sitemap.xml para SEO...`);
let sitemapXML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.acronicailustrada.com.br/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

list.filter(item => item.status === 'published').forEach(item => {
  sitemapXML += `
  <url>
    <loc>https://www.acronicailustrada.com.br/edicao/${item.ano}/${item.id}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
});
sitemapXML += `\n</urlset>`;
fs.writeFileSync(path.resolve(__dirname, '../dist/sitemap.xml'), sitemapXML, 'utf8');

console.log(`\n[5/5] Gerando robots.txt...`);
const robotsTxt = `User-agent: *
Allow: /edicao/
Disallow: /admin
Disallow: /*/imprimir
Sitemap: https://www.acronicailustrada.com.br/sitemap.xml
`;
fs.writeFileSync(path.resolve(__dirname, '../dist/robots.txt'), robotsTxt, 'utf8');

console.log("\n=========================================");
console.log("✅ Compilação Finalizada com Sucesso!");
console.log("A pasta 'dist' agora contém a aplicação web, sitemap, robots.txt e o banco de dados estático!");
console.log("Você pode publicar o conteúdo de 'dist' no Cloudflare Pages.");
console.log("=========================================\n");
