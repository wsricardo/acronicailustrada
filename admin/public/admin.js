let articleCount = 0;
let cartoonCount = 0;
let newsCount = 0;
let classifiedCount = 0;
let obituaryCount = 0;
let originalYear = null;
let originalNumber = null;

// Navegação de Abas
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

    document.getElementById(`tab-${tabName}`).classList.add('active');
    document.getElementById(`btn-tab-${tabName}`).classList.add('active');

    if (tabName === 'manage') {
        loadEditionList();
    } else if (tabName === 'create') {
        clearForm();
        fetch('/api/next-edition-number')
            .then(res => res.json())
            .then(data => {
                document.getElementById('ed-number').value = data.nextNumber;
                const date = new Date();
                const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
                document.getElementById('ed-base-year').value = date.getFullYear();
                document.getElementById('ed-dateStr').value = `${months[date.getMonth()]} de ${date.getFullYear()}`;
            })
            .catch(err => console.error(err));
    }
}

// Carregar lista de edições
let allEditionsCache = [];

async function loadEditionList() {
    const container = document.getElementById('edition-list-container');
    container.innerHTML = 'Carregando edições...';
    try {
        const res = await fetch('/api/editions');
        allEditionsCache = await res.json();
        renderEditionList(allEditionsCache);
    } catch (err) {
        container.innerHTML = '<li class="error">Erro ao carregar acervo.</li>';
    }
}

function renderEditionList(files) {
    const container = document.getElementById('edition-list-container');
    container.innerHTML = '';

    if (files.length === 0) {
        container.innerHTML = '<li>Nenhuma edição encontrada.</li>';
        return;
    }

    files.forEach(item => {
        const filename = typeof item === 'string' ? item : item.file;
        const status = typeof item === 'string' ? 'published' : item.status;

        const statusBadge = status === 'published'
            ? '<span style="color: #28a745; font-size: 0.8em; font-weight: bold; margin-left: 10px;">[PUBLICADO]</span>'
            : '<span style="color: #666; font-size: 0.8em; font-weight: bold; margin-left: 10px;">[RASCUNHO]</span>';

        const li = document.createElement('li');
        li.className = 'edition-item';
        li.innerHTML = `
            <div class="ed-info">
                <strong>Arquivo: ${filename} ${statusBadge}</strong>
            </div>
            <div>
                <button class="btn btn-edit" onclick="editEdition('${filename}')">Editar</button>
                <button class="btn btn-danger" onclick="deleteEdition('${filename}')" style="margin-left: 10px;">Excluir</button>
            </div>
        `;
        container.appendChild(li);
    });
}

// Função para remover acentos para pesquisa
function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// Filtro de pesquisa
document.getElementById('search-editions').addEventListener('input', (e) => {
    const query = removeAccents(e.target.value);
    if (!query) {
        renderEditionList(allEditionsCache);
        return;
    }

    const filtered = allEditionsCache.filter(item => {
        const filename = typeof item === 'string' ? item : item.file;
        const title = item.title || '';
        const articles = item.articleTitles ? item.articleTitles.join(' ') : '';

        const searchableText = removeAccents(`${filename} ${title} ${articles}`);
        return searchableText.includes(query);
    });

    renderEditionList(filtered);
});

// Excluir Edição
let editionToDelete = null;

function deleteEdition(filename) {
    editionToDelete = filename;
    document.getElementById('delete-modal-text').innerText = `Tem certeza que deseja apagar a edição "${filename}" inteira? Isso irá remover o arquivo JSON e a pasta de imagens permanentemente.`;
    document.getElementById('delete-modal').style.display = 'flex';
}

document.getElementById('btn-delete-cancel').addEventListener('click', () => {
    document.getElementById('delete-modal').style.display = 'none';
    editionToDelete = null;
});

document.getElementById('btn-delete-confirm').addEventListener('click', async () => {
    if (!editionToDelete) return;
    const filename = editionToDelete;

    // Fechar modal
    document.getElementById('delete-modal').style.display = 'none';
    editionToDelete = null;

    // extrai ano e número: ano/numero/edition-numero.json
    const parts = filename.split('/');
    if (parts.length < 3) {
        alert("Erro ao identificar o ano e número da edição.");
        return;
    }
    const year = parts[0];
    const number = parts[1];

    try {
        const res = await fetch(`/api/editions/${year}/${number}`, { method: 'DELETE' });
        const data = await res.json();
        if (res.ok) {
            alert(data.message || 'Edição excluída com sucesso.');
            loadEditionList();
        } else {
            alert('Erro: ' + data.error);
        }
    } catch (err) {
        alert('Erro ao excluir edição: ' + err.message);
    }
});

// Editar Edição Existente
async function editEdition(filename) {
    try {
        const res = await fetch(`/api/editions/${filename}`);
        if (!res.ok) throw new Error('Falha ao carregar dados da edição.');
        const data = await res.json();

        clearForm();

        const currentStatus = data.status || 'published';
        const badgeColor = currentStatus === 'published' ? '#28a745' : '#666';
        const badgeText = currentStatus === 'published' ? 'PUBLICADO' : 'RASCUNHO';
        document.getElementById('form-title').innerHTML = `Editando: ${filename} <span id="form-status-badge" style="font-size: 0.6em; padding: 4px 8px; border-radius: 4px; background: ${badgeColor}; color: white; vertical-align: middle;">${badgeText}</span>`;

        const parts = filename.split('/');
        originalYear = parts.length >= 1 ? parts[0] : new Date().getFullYear();
        originalNumber = data.number || null;

        // Popular metadados
        document.getElementById('ed-id').value = data.id || '';
        document.getElementById('ed-number').value = data.number || '';
        document.getElementById('ed-base-year').value = originalYear;
        document.getElementById('ed-dateStr').value = data.dateStr || '';
        document.getElementById('ed-title').value = data.title || 'A CRÔNICA ILUSTRADA';
        document.getElementById('ed-slogan').value = data.slogan || 'A Sentinella das Liberdades...';
        document.getElementById('ed-price').value = data.price || '';

        // Popular artigos
        if (data.articles) {
            data.articles.forEach(art => {
                const id = addArticle();
                const box = document.getElementById(id);
                box.querySelector('.art-title').value = art.title || '';
                box.querySelector('.art-subtitle').value = art.subtitle || '';
                box.querySelector('.art-author').value = art.author || '';
                box.querySelector('.art-dropcap').value = art.dropcap || '';
                box.querySelector('.art-caption').value = art.illustrationCaption || '';
                box.querySelector('.art-content').value = Array.isArray(art.content) ? art.content.join('\n\n') : (art.content || '');
                if (art.illustrationUrl) {
                    // Nós não conseguimos preencher o <input type="file"> por segurança do navegador,
                    // mas podemos guardar a URL anterior em um input hidden para não perder se não enviar nova
                    const hiddenUrl = document.createElement('input');
                    hiddenUrl.type = 'hidden';
                    hiddenUrl.className = 'art-old-img';
                    hiddenUrl.value = art.illustrationUrl;
                    box.appendChild(hiddenUrl);

                    const preview = box.querySelector('.image-preview');
                    preview.src = '/' + art.illustrationUrl; // assumindo raiz do site
                    preview.style.display = 'block';
                }
            });
        }

        // Popular Cartuns
        if (data.cartoons) {
            data.cartoons.forEach(cart => {
                const id = addCartoon();
                const box = document.getElementById(id);
                box.querySelector('.cart-title').value = cart.title || '';
                box.querySelector('.cart-artist').value = cart.artist || '';
                box.querySelector('.cart-caption').value = cart.caption || '';
                if (cart.imageUrl) {
                    const hiddenUrl = document.createElement('input');
                    hiddenUrl.type = 'hidden';
                    hiddenUrl.className = 'cart-old-img';
                    hiddenUrl.value = cart.imageUrl;
                    box.appendChild(hiddenUrl);

                    const preview = box.querySelector('.image-preview');
                    preview.src = cart.imageUrl.startsWith('http') ? cart.imageUrl : '/' + cart.imageUrl;
                    preview.style.display = 'block';
                }
            });
        }

        // Popular Telegramas
        if (data.generalNews) {
            data.generalNews.forEach(news => {
                const id = addNews();
                const box = document.getElementById(id);
                box.querySelector('.news-title').value = news.title || '';
                box.querySelector('.news-scope').value = news.scope || '';
                box.querySelector('.news-time').value = news.time || '';
                box.querySelector('.news-content').value = news.content || '';
            });
        }

        // Popular Classificados
        if (data.classifieds) {
            data.classifieds.forEach(cls => {
                const id = addClassified();
                const box = document.getElementById(id);
                box.querySelector('.cls-cat').value = cls.category || '';
                box.querySelector('.cls-title').value = cls.title || '';
                box.querySelector('.cls-desc').value = cls.description || '';
                box.querySelector('.cls-contact').value = cls.contact || '';
                box.querySelector('.cls-price').value = cls.price || '';
            });
        }

        // Popular Obituários
        if (data.obituaries) {
            data.obituaries.forEach(obit => {
                const id = addObituary();
                const box = document.getElementById(id);
                box.querySelector('.obit-text').value = obit.text || '';
                box.querySelector('.obit-wake').value = obit.wake || '';
                box.querySelector('.obit-burial').value = obit.burial || '';

                if (obit.img) {
                    const hiddenUrl = document.createElement('input');
                    hiddenUrl.type = 'hidden';
                    hiddenUrl.className = 'obit-old-img';
                    hiddenUrl.value = obit.img;
                    box.appendChild(hiddenUrl);

                    const preview = box.querySelector('.image-preview');
                    preview.src = obit.img.startsWith('http') ? obit.img : '/' + obit.img;
                    preview.style.display = 'block';
                }
            });
        }

        // Trocar para aba do formulário
        document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
        document.getElementById('tab-create').classList.add('active');
        document.getElementById('btn-tab-create').classList.add('active');

    } catch (error) {
        alert("Erro ao carregar: " + error.message);
    }
}

function clearForm() {
    document.getElementById('edition-form').reset();
    document.getElementById('form-title').innerHTML = 'Criar Edição <span id="form-status-badge" style="display:none;"></span>';
    document.getElementById('articles-container').innerHTML = '';
    document.getElementById('cartoons-container').innerHTML = '';
    document.getElementById('news-container').innerHTML = '';
    document.getElementById('classifieds-container').innerHTML = '';
    document.getElementById('obituaries-container').innerHTML = '';
    document.getElementById('status-msg').style.display = 'none';
    articleCount = cartoonCount = newsCount = classifiedCount = obituaryCount = 0;
    originalYear = null;
    originalNumber = null;
}

function createRemoveButton(containerId) {
    return `<button type="button" class="btn btn-remove" onclick="document.getElementById('${containerId}').remove()">Remover</button>`;
}

async function uploadImage(fileInput) {
    const file = fileInput.files[0];
    if (!file) return null;

    let year = document.getElementById('ed-base-year').value;
    let number = document.getElementById('ed-number').value;

    if (!year || !number) {
        alert('Por favor, preencha o Ano Base e o Número da edição antes de adicionar imagens. Eles são necessários para organizar as pastas corretamente.');
        fileInput.value = '';
        return null;
    }

    const formData = new FormData();
    formData.append('year', year);
    formData.append('number', number);
    formData.append('image', file);

    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    return data.url;
}

function handleImagePreview(input, previewId) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById(previewId).src = e.target.result;
            document.getElementById(previewId).style.display = 'block';
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function addArticle() {
    const id = `article-${articleCount++}`;
    const html = `
        <div class="section-box section-article" id="${id}">
            <div class="section-header"><h3>Artigo</h3> ${createRemoveButton(id)}</div>
            <div class="form-group"><label>Título</label><input type="text" class="art-title" required></div>
            <div class="form-group"><label>Subtítulo</label><input type="text" class="art-subtitle"></div>
            <div class="form-group"><label>Autor</label><input type="text" class="art-author"></div>
            <div class="form-group"><label>Capitular</label><input type="text" class="art-dropcap" maxlength="1" style="width: 50px;"></div>
            <div class="form-group">
                <label>Imagem da Matéria</label>
                <input type="file" class="art-img" accept="image/*" onchange="handleImagePreview(this, 'preview-${id}')">
                <img id="preview-${id}" class="image-preview" style="display:none;">
            </div>
            <div class="form-group"><label>Legenda da Imagem</label><input type="text" class="art-caption"></div>
            <div class="form-group"><label>Corpo do Texto</label><textarea class="art-content" required></textarea></div>
        </div>
    `;
    document.getElementById('articles-container').insertAdjacentHTML('beforeend', html);
    return id;
}

function addCartoon() {
    const id = `cartoon-${cartoonCount++}`;
    const html = `
        <div class="section-box section-cartoon" id="${id}">
            <div class="section-header"><h3>Cartum</h3> ${createRemoveButton(id)}</div>
            <div class="form-group"><label>Título</label><input type="text" class="cart-title" required></div>
            <div class="form-group"><label>Artista</label><input type="text" class="cart-artist" required></div>
            <div class="form-group">
                <label>Imagem</label>
                <input type="file" class="cart-img" accept="image/*" onchange="handleImagePreview(this, 'cpreview-${id}')">
                <img id="cpreview-${id}" class="image-preview" style="display:none;">
            </div>
            <div class="form-group"><label>Legenda</label><textarea class="cart-caption" required></textarea></div>
        </div>
    `;
    document.getElementById('cartoons-container').insertAdjacentHTML('beforeend', html);
    return id;
}

function addNews() {
    const id = `news-${newsCount++}`;
    const html = `
        <div class="section-box section-news" id="${id}">
            <div class="section-header"><h3>Telegrama</h3> ${createRemoveButton(id)}</div>
            <div class="form-group"><label>Título</label><input type="text" class="news-title" required></div>
            <div class="form-group"><label>Escopo</label><input type="text" class="news-scope" required></div>
            <div class="form-group"><label>Horário</label><input type="text" class="news-time"></div>
            <div class="form-group"><label>Conteúdo</label><textarea class="news-content" required></textarea></div>
        </div>
    `;
    document.getElementById('news-container').insertAdjacentHTML('beforeend', html);
    return id;
}

function addClassified() {
    const id = `class-${classifiedCount++}`;
    const html = `
        <div class="section-box section-classified" id="${id}">
            <div class="section-header"><h3>Classificado</h3> ${createRemoveButton(id)}</div>
            <div class="form-group"><label>Categoria</label><input type="text" class="cls-cat" required></div>
            <div class="form-group"><label>Produto/Serviço</label><input type="text" class="cls-title" required></div>
            <div class="form-group"><label>Descrição</label><textarea class="cls-desc" required></textarea></div>
            <div class="form-group"><label>Contato</label><input type="text" class="cls-contact" required></div>
            <div class="form-group"><label>Preço</label><input type="text" class="cls-price" required></div>
        </div>
    `;
    document.getElementById('classifieds-container').insertAdjacentHTML('beforeend', html);
    return id;
}

function addObituary() {
    const id = `obit-${obituaryCount++}`;
    const html = `
        <div class="section-box section-obituary" id="${id}">
            <div class="section-header"><h3>Obituário</h3> ${createRemoveButton(id)}</div>
            <div class="form-group">
                <label>Foto do Falecido (Opcional)</label>
                <input type="file" class="obit-img" accept="image/*" onchange="handleImagePreview(this, 'obitpreview-${id}')">
                <img id="obitpreview-${id}" class="image-preview" style="display:none;">
            </div>
            <div class="form-group"><label>Texto (Nome, idade, história)</label><textarea class="obit-text" required></textarea></div>
            <div class="form-group"><label>Data/Local do Velório (Opcional)</label><input type="text" class="obit-wake"></div>
            <div class="form-group"><label>Data/Local do Sepultamento (Opcional)</label><input type="text" class="obit-burial"></div>
        </div>
    `;
    document.getElementById('obituaries-container').insertAdjacentHTML('beforeend', html);
    return id;
}

document.getElementById('edition-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.submitter;
    const isPublish = btn.id === 'btn-publish';

    btn.disabled = true;
    const originalText = btn.innerText;
    btn.innerText = "Salvando...";

    const statusMsg = document.getElementById('status-msg');

    try {
        const editionData = {
            id: document.getElementById('ed-id').value,
            status: isPublish ? 'published' : 'draft',
            number: parseInt(document.getElementById('ed-number').value),
            dateStr: document.getElementById('ed-dateStr').value,
            title: document.getElementById('ed-title').value,
            slogan: document.getElementById('ed-slogan').value,
            price: document.getElementById('ed-price').value,
            articles: [], cartoons: [], generalNews: [], classifieds: [], obituaries: []
        };

        // Artigos
        for (const box of document.querySelectorAll('#articles-container .section-box')) {
            const fileInput = box.querySelector('.art-img');
            const oldImg = box.querySelector('.art-old-img');
            let imgUrl = oldImg ? oldImg.value : "";
            if (fileInput.files.length > 0) imgUrl = await uploadImage(fileInput);

            editionData.articles.push({
                title: box.querySelector('.art-title').value,
                subtitle: box.querySelector('.art-subtitle').value,
                author: box.querySelector('.art-author').value,
                dropcap: box.querySelector('.art-dropcap').value.toUpperCase(),
                illustrationUrl: imgUrl,
                illustrationCaption: box.querySelector('.art-caption').value,
                content: box.querySelector('.art-content').value.split(/\n\s*\n/).map(p => p.trim()).filter(p => p)
            });
        }

        // Cartuns
        for (const box of document.querySelectorAll('#cartoons-container .section-box')) {
            const fileInput = box.querySelector('.cart-img');
            const oldImg = box.querySelector('.cart-old-img');
            let imgUrl = oldImg ? oldImg.value : "";
            if (fileInput.files.length > 0) imgUrl = await uploadImage(fileInput);

            editionData.cartoons.push({
                title: box.querySelector('.cart-title').value,
                artist: box.querySelector('.cart-artist').value,
                caption: box.querySelector('.cart-caption').value,
                imageUrl: imgUrl
            });
        }

        // Telegramas
        document.querySelectorAll('#news-container .section-box').forEach(box => {
            editionData.generalNews.push({
                title: box.querySelector('.news-title').value,
                scope: box.querySelector('.news-scope').value,
                time: box.querySelector('.news-time').value,
                content: box.querySelector('.news-content').value
            });
        });

        // Classificados
        document.querySelectorAll('#classifieds-container .section-box').forEach(box => {
            editionData.classifieds.push({
                category: box.querySelector('.cls-cat').value.toUpperCase(),
                title: box.querySelector('.cls-title').value,
                description: box.querySelector('.cls-desc').value,
                contact: box.querySelector('.cls-contact').value,
                price: box.querySelector('.cls-price').value
            });
        });

        // Obituários
        for (const box of document.querySelectorAll('#obituaries-container .section-box')) {
            const fileInput = box.querySelector('.obit-img');
            const oldImg = box.querySelector('.obit-old-img');
            let imgUrl = oldImg ? oldImg.value : "";
            if (fileInput && fileInput.files.length > 0) imgUrl = await uploadImage(fileInput);

            editionData.obituaries.push({
                img: imgUrl,
                text: box.querySelector('.obit-text').value,
                wake: box.querySelector('.obit-wake').value,
                burial: box.querySelector('.obit-burial').value
            });
        }

        // Verifica se é renomeação
        const newYear = document.getElementById('ed-base-year').value;
        const newNumber = editionData.number;

        if (originalYear && originalNumber) {
            if (String(originalYear) !== String(newYear) || String(originalNumber) !== String(newNumber)) {
                if (!confirm(`Você alterou o ano ou o número desta edição (De ${originalYear}/Nº ${originalNumber} para ${newYear}/Nº ${newNumber}). Isso fará com que as pastas sejam renomeadas e todos os links atualizados automaticamente. Deseja prosseguir com essa mudança?`)) {
                    btn.disabled = false;
                    btn.innerText = "Salvar no Acervo";
                    return;
                }
            }
        }

        const payload = {
            editionData: editionData,
            originalYear: originalYear,
            originalNumber: originalNumber,
            baseYear: newYear
        };

        const response = await fetch('/api/editions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const dataRes = await response.json();

            statusMsg.className = "success";
            statusMsg.innerText = "Edição salva com sucesso! " + (isPublish ? "(Publicada)" : "(Rascunho)");
            statusMsg.style.display = "block";

            const badgeColor = isPublish ? '#28a745' : '#666';
            const badgeText = isPublish ? 'PUBLICADO' : 'RASCUNHO';
            const badgeSpan = document.getElementById('form-status-badge');
            if (badgeSpan) {
                badgeSpan.style.background = badgeColor;
                badgeSpan.innerText = badgeText;
                badgeSpan.style.display = 'inline';
                badgeSpan.style.fontSize = '0.6em';
                badgeSpan.style.padding = '4px 8px';
                badgeSpan.style.borderRadius = '4px';
                badgeSpan.style.color = 'white';
                badgeSpan.style.verticalAlign = 'middle';
            }

            // Verificar arquivos órfãos
            if (dataRes.orphans && dataRes.orphans.length > 0) {
                if (confirm(`Foram encontrados ${dataRes.orphans.length} arquivos órfãos (imagens deletadas ou substituídas) nesta edição. Deseja limpá-los para economizar espaço?`)) {
                    await fetch('/api/cleanup', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            targetDir: dataRes.targetDir,
                            files: dataRes.orphans
                        })
                    });
                }
            }

            loadEditionList();
        } else {
            throw new Error('Falha ao salvar edição.');
        }

    } catch (error) {
        statusMsg.innerText = "Erro: " + error.message;
        statusMsg.className = "error";
        statusMsg.style.display = "block";
    } finally {
        btn.disabled = false;
        btn.innerText = originalText;
    }
});

// Inicia na aba Acervo
switchTab('manage');
