const express = require('express');
const cors = require('cors');
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const multer = require('multer');
const ssg = require('./ssg');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/data', express.static(path.join(__dirname, '..', 'public', 'data')));

const SITE_PUBLIC_DIR = path.join(__dirname, '..', 'public');
const EDITIONS_DIR = path.join(SITE_PUBLIC_DIR, 'data', 'editions');

if (!fs.existsSync(EDITIONS_DIR)) {
    fs.mkdirSync(EDITIONS_DIR, { recursive: true });
}

// Helper para listar todas as edições recursivamente
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

// Configuração do Multer dinâmica
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // req.body fields might be undefined if not placed before file in FormData, 
        // so frontend must append year and number BEFORE the file!
        let year = req.body.year || new Date().getFullYear();
        let number = req.body.number || '000';

        // Sanitização básica contra path traversal
        year = String(year).replace(/[^a-zA-Z0-9_-]/g, '');
        number = String(number).replace(/[^a-zA-Z0-9_-]/g, '');

        const targetDir = path.join(EDITIONS_DIR, year, number, 'assets');
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        cb(null, targetDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'img-' + uniqueSuffix + ext);
    }
});
const upload = multer({ storage: storage });

app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
    }
    let year = req.body.year || new Date().getFullYear();
    let number = req.body.number || '000';

    year = String(year).replace(/[^a-zA-Z0-9_-]/g, '');
    number = String(number).replace(/[^a-zA-Z0-9_-]/g, '');

    // Retorna o caminho relativo: data/editions/[year]/[number]/assets/...
    const relativePath = `data/editions/${year}/${number}/assets/${req.file.filename}`;
    res.json({ url: relativePath });
});

// Endpoint para pegar a próxima edição
app.get('/api/next-edition-number', async (req, res) => {
    try {
        const files = await getEditionsFiles(EDITIONS_DIR);
        let maxNumber = 0;
        files.forEach(f => {
            // arquivo padrão: year/number/edition-number.json
            const parts = f.split('/');
            if (parts.length >= 2) {
                const num = parseInt(parts[parts.length - 2], 10);
                if (!isNaN(num) && num > maxNumber) {
                    maxNumber = num;
                }
            }
        });
        res.json({ nextNumber: maxNumber + 1 });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao calcular próxima edição.' });
    }
});

let adminEditionsCache = null;

app.get('/api/editions', async (req, res) => {
    try {
        if (adminEditionsCache) {
            return res.json(adminEditionsCache);
        }

        const files = await getEditionsFiles(EDITIONS_DIR);
        const editionsList = await Promise.all(files.map(async (file) => {
            const filepath = path.join(EDITIONS_DIR, file);
            let status = 'published';
            let title = '';
            let articleTitles = [];

            if (fs.existsSync(filepath)) {
                try {
                    const data = JSON.parse(await fsp.readFile(filepath, 'utf8'));
                    status = data.status || 'published';
                    title = data.title || '';
                    if (data.articles && Array.isArray(data.articles)) {
                        articleTitles = data.articles.map(a => a.title).filter(Boolean);
                    }
                } catch (e) { }
            }
            return { file, status, title, articleTitles };
        }));

        adminEditionsCache = editionsList; // Salvar no cache em memória
        res.json(editionsList);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao ler diretório de edições.' });
    }
});

// O frontend vai mandar a rota completa ex: 1926/312/edition-312.json
app.get('/api/editions/*', (req, res) => {
    const filename = req.params[0];

    const filepath = path.join(EDITIONS_DIR, filename);
    const resolvedPath = path.resolve(filepath);
    const resolvedEditionsDir = path.resolve(EDITIONS_DIR);

    // Proteção contra Path Traversal
    if (!resolvedPath.startsWith(resolvedEditionsDir)) {
        return res.status(403).json({ error: 'Acesso negado.' });
    }

    if (!fs.existsSync(filepath)) {
        return res.status(404).json({ error: 'Edição não encontrada.' });
    }
    fs.readFile(filepath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Erro ao ler arquivo.' });
        res.json(JSON.parse(data));
    });
});

async function updateEditionsIndex() {
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

        const indexPath = path.join(EDITIONS_DIR, 'index.json');
        await fsp.writeFile(indexPath, JSON.stringify(indexData, null, 2), 'utf8');

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
            } catch (err) {
                console.error(`Erro ao gerar HTML SSG para ${entry.file}:`, err);
            }
        }
        // ==== FIM DO SSG ====

        // Invalida o cache do admin para ser recriado no próximo GET
        adminEditionsCache = null;
        console.log('Índice de edições atualizado e páginas estáticas (SSG) geradas.');
    } catch (err) {
        console.error('Erro ao atualizar o índice de edições:', err);
    }
}

function updateImageUrls(obj, oldPrefix, newPrefix) {
    if (typeof obj === 'string') {
        if (obj.startsWith(oldPrefix)) {
            return obj.replace(oldPrefix, newPrefix);
        }
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(item => updateImageUrls(item, oldPrefix, newPrefix));
    }
    if (typeof obj === 'object' && obj !== null) {
        for (const key in obj) {
            obj[key] = updateImageUrls(obj[key], oldPrefix, newPrefix);
        }
    }
    return obj;
}

app.post('/api/editions', async (req, res) => {
    const data = req.body.editionData;
    const originalYear = req.body.originalYear; // Para renomear pasta
    const originalNumber = req.body.originalNumber;
    let baseYear = req.body.baseYear;

    if (!data.number || !data.dateStr || !baseYear) {
        return res.status(400).json({ error: 'Ano Base, Data e Número da edição são obrigatórios.' });
    }

    baseYear = String(baseYear).replace(/[^a-zA-Z0-9_-]/g, '');
    const number = String(data.number).replace(/[^a-zA-Z0-9_-]/g, '');

    const oldDir = originalYear && originalNumber ? path.join(EDITIONS_DIR, String(originalYear), String(originalNumber)) : null;
    const targetDir = path.join(EDITIONS_DIR, baseYear, number);

    // Se mudou ano ou número e o diretorio original existia, precisamos renomear
    let urlsUpdated = false;
    if (oldDir && oldDir !== targetDir && fs.existsSync(oldDir)) {
        fs.mkdirSync(path.dirname(targetDir), { recursive: true });

        try {
            fs.renameSync(oldDir, targetDir);

            // Renomear o arquivo json antigo
            const oldJsonFile = path.join(targetDir, `edition-${originalNumber}.json`);
            if (fs.existsSync(oldJsonFile)) {
                fs.renameSync(oldJsonFile, path.join(targetDir, `edition-${number}.json`));
            }

            // Atualizar rotas
            const oldPrefix = `data/editions/${originalYear}/${originalNumber}/assets/`;
            const newPrefix = `data/editions/${baseYear}/${number}/assets/`;
            updateImageUrls(data, oldPrefix, newPrefix);
            urlsUpdated = true;

        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Falha ao renomear pastas. Feche os arquivos abertos e tente novamente.' });
        }
    } else {
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
    }

    const filename = `edition-${number}.json`;
    const filepath = path.join(targetDir, filename);
    const relativeSavedPath = `${baseYear}/${number}/${filename}`;

    data.id = `${baseYear}-${number}`;

    try {
        await fsp.writeFile(filepath, JSON.stringify(data, null, 2), 'utf8');
        updateEditionsIndex(); // Não usamos await para não prender o retorno

        // Identificar arquivos órfãos (arquivos na pasta assets que não constam no JSON da edição)
        const assetsDir = path.join(targetDir, 'assets');
        let orphans = [];
        if (fs.existsSync(assetsDir)) {
            const dataStr = JSON.stringify(data);
            const assetFiles = await fsp.readdir(assetsDir);
            for (const assetFile of assetFiles) {
                // Se o nome do arquivo não aparece em lugar nenhum do json stringificado, ele é órfão
                if (!dataStr.includes(assetFile)) {
                    orphans.push(assetFile);
                }
            }
        }

        res.json({
            message: 'Edição salva com sucesso!',
            filename: relativeSavedPath,
            urlsUpdated,
            newData: data,
            orphans,
            targetDir: `${baseYear}/${number}`
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Falha ao salvar a edição.' });
    }
});

// Limpeza de arquivos órfãos
app.post('/api/cleanup', async (req, res) => {
    const { targetDir, files } = req.body;
    if (!targetDir || !files || !Array.isArray(files)) {
        return res.status(400).json({ error: 'Parâmetros inválidos.' });
    }

    // Segurança
    const resolvedPath = path.resolve(path.join(EDITIONS_DIR, targetDir, 'assets'));
    const resolvedEditionsDir = path.resolve(EDITIONS_DIR);
    if (!resolvedPath.startsWith(resolvedEditionsDir)) {
        return res.status(403).json({ error: 'Acesso negado.' });
    }

    let deletedCount = 0;
    for (const file of files) {
        try {
            const filePath = path.join(resolvedPath, path.basename(file));
            if (fs.existsSync(filePath)) {
                await fsp.unlink(filePath);
                deletedCount++;
            }
        } catch (e) {
            console.error('Erro ao deletar orfão:', e);
        }
    }
    res.json({ message: `${deletedCount} arquivo(s) órfão(s) limpos.` });
});

// Excluir uma edição completamente
app.delete('/api/editions/:year/:number', async (req, res) => {
    let year = req.params.year;
    let number = req.params.number;

    year = String(year).replace(/[^a-zA-Z0-9_-]/g, '');
    number = String(number).replace(/[^a-zA-Z0-9_-]/g, '');

    const targetDir = path.join(EDITIONS_DIR, year, number);
    const resolvedPath = path.resolve(targetDir);
    const resolvedEditionsDir = path.resolve(EDITIONS_DIR);

    if (!resolvedPath.startsWith(resolvedEditionsDir)) {
        return res.status(403).json({ error: 'Acesso negado.' });
    }

    if (!fs.existsSync(targetDir)) {
        return res.status(404).json({ error: 'Edição não encontrada.' });
    }

    try {
        await fsp.rm(targetDir, { recursive: true, force: true });
        updateEditionsIndex();
        res.json({ message: 'Edição excluída com sucesso!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Falha ao excluir edição.' });
    }
});

updateEditionsIndex();

app.listen(PORT, () => {
    console.log(`Painel Admin rodando em http://localhost:${PORT}`);
    console.log(`Salvando edições em: ${EDITIONS_DIR}`);
});
