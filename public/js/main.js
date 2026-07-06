document.addEventListener('DOMContentLoaded', () => {
    const archiveModal = document.getElementById('archive-modal');
    const btnArchive = document.getElementById('btn-archive');
    const closeModal = document.querySelector('.close-modal');
    const editionsList = document.getElementById('editions-list');
    const newspaperContent = document.getElementById('newspaper-content');

    // Available editions. Get lis editions.
    let availableEditions = [];

    btnArchive.addEventListener('click', () => {
        archiveModal.classList.remove('hidden');
        renderArchiveList();
    });

    closeModal.addEventListener('click', () => {
        archiveModal.classList.add('hidden');
    });

    window.addEventListener('click', (e) => {
        if (e.target === archiveModal) {
            archiveModal.classList.add('hidden');
        }
    });

    // Lógica para esconder o menu no scroll
    let lastScrollTop = 0;
    const topNav = document.querySelector('.top-nav');
    window.addEventListener('scroll', () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > 100) { // Só ativa depois de descer 100px
            if (scrollTop > lastScrollTop) {
                // Scroll Down
                topNav.classList.add('nav-hidden');
            } else {
                // Scroll Up
                topNav.classList.remove('nav-hidden');
            }
        } else {
            topNav.classList.remove('nav-hidden');
        }
        lastScrollTop = scrollTop;
    });

    function renderArchiveList() {
        editionsList.innerHTML = '';
        availableEditions.forEach(ed => {
            const li = document.createElement('li');
            li.innerHTML = `<span class="ed-title">${ed.title}</span><span class="ed-date">${ed.date}</span>`;
            li.addEventListener('click', () => {
                loadEdition(ed.file);
                archiveModal.classList.add('hidden');
            });
            editionsList.appendChild(li);
        });
    }

    async function loadEdition(filename) {
        newspaperContent.innerHTML = '<div class="loading">Buscando nos arquivos da época...</div>';
        try {
            const response = await fetch(`data/editions/${filename}`);
            if (!response.ok) throw new Error('Edição não encontrada');
            const data = await response.json();
            renderEdition(data);
        } catch (error) {
            console.error('Erro ao carregar edição:', error);
            newspaperContent.innerHTML = '<div class="error">Lamentamos, mas os rolos de microfilmagem desta edição encontram-se extraviados.</div>';
        }
    }

    function renderEdition(data) {
        document.getElementById('header-edition-num').textContent = `Num. ${data.number}`;
        document.getElementById('header-price').textContent = data.price;
        document.getElementById('header-date').textContent = data.dateStr;
        document.getElementById('nav-date').textContent = data.dateStr;
        document.title = `${data.title} - Edição ${data.number}`;

        // Atualização Dinâmica de Metatags para SEO
        const updateMeta = (selector, content) => {
            const meta = document.querySelector(selector);
            if (meta) meta.setAttribute('content', content);
        };

        let seoDescription = data.slogan || "Jornal Retrô Clássico com as últimas notícias da capital.";
        if (data.articles && data.articles.length > 0) {
            const mainArticle = data.articles[0];
            seoDescription = `Destaques da edição de ${data.dateStr}: ${mainArticle.title}. ${mainArticle.subtitle || ''}`.trim();
        }

        updateMeta('meta[name="description"]', seoDescription);
        updateMeta('meta[property="og:title"]', document.title);
        updateMeta('meta[property="og:description"]', seoDescription);
        updateMeta('meta[name="twitter:title"]', document.title);
        updateMeta('meta[name="twitter:description"]', seoDescription);

        newspaperContent.innerHTML = '';

        // Container Esquerdo (Artigos e Cartuns) -> 8 colunas
        const leftCol = document.createElement('div');
        leftCol.className = 'col-left';

        // Container Direito (Telegramas e Classificados) -> 4 colunas
        const rightCol = document.createElement('div');
        rightCol.className = 'col-right';

        // 1. Artigos
        if (data.articles && data.articles.length > 0) {
            data.articles.forEach((art, index) => {
                const articleEl = document.createElement('article');
                articleEl.className = 'article';

                let imgHtml = '';
                if (art.illustrationUrl) {
                    imgHtml = `
                        <img src="${art.illustrationUrl}" alt="Ilustração" class="image-noir" onerror="this.style.display='none'">
                        ${art.illustrationCaption ? `<p class="image-caption">${art.illustrationCaption}</p>` : ''}
                    `;
                }

                let paragraphsHtml = '';
                if (art.content && Array.isArray(art.content)) {
                    paragraphsHtml = art.content.map((p, i) => {
                        if (i === 0 && art.dropcap) {
                            let pText = p;
                            if (pText.startsWith(art.dropcap)) {
                                pText = pText.substring(art.dropcap.length);
                            }
                            return `<p class="drop-cap"><span style="display:none">${art.dropcap}</span>${art.dropcap}${pText}</p>`;
                        }
                        return `<p>${p}</p>`;
                    }).join('');
                }

                articleEl.innerHTML = `
                    <h2 class="article-title">${art.title}</h2>
                    ${art.subtitle ? `<h3 class="article-subtitle">${art.subtitle}</h3>` : ''}
                    <div class="article-meta">${art.author ? `Por ${art.author} - ` : ''}${data.dateStr}</div>
                    ${imgHtml}
                    <div class="article-body ${index === 0 ? 'columns-2' : ''}">
                        ${paragraphsHtml}
                    </div>
                `;
                leftCol.appendChild(articleEl);
            });
        }

        // 2. Cartuns
        if (data.cartoons && data.cartoons.length > 0) {
            const cartoonSection = document.createElement('div');
            cartoonSection.className = 'cartoon-section';
            cartoonSection.innerHTML = `<h2 class="section-heading">Cartuns & Humor</h2>`;

            data.cartoons.forEach(cart => {
                const cartEl = document.createElement('div');
                cartEl.className = 'cartoon-item';
                cartEl.innerHTML = `
                    <h3 class="cartoon-title">${cart.title}</h3>
                    <img src="${cart.imageUrl}" class="image-noir" alt="${cart.title}">
                    <p class="image-caption">${cart.caption}</p>
                    <p class="cartoon-artist">Traço de: ${cart.artist}</p>
                `;
                cartoonSection.appendChild(cartEl);
            });
            leftCol.appendChild(cartoonSection);
        }

        // 3. Telegramas (General News)
        if (data.generalNews && data.generalNews.length > 0) {
            const newsSection = document.createElement('div');
            newsSection.className = 'side-section news-section';
            newsSection.innerHTML = `<h2 class="section-heading">Ultimas Notícias (Telegramas)</h2>`;

            data.generalNews.forEach(news => {
                const newsEl = document.createElement('div');
                newsEl.className = 'news-item';
                newsEl.innerHTML = `
                    <span class="news-scope">${news.scope} - ${news.time}</span>
                    <h4 class="news-title">${news.title}</h4>
                    <p class="news-content">${news.content}</p>
                `;
                newsSection.appendChild(newsEl);
            });
            rightCol.appendChild(newsSection);
        }

        // 4. Classificados
        if (data.classifieds && data.classifieds.length > 0) {
            const classSection = document.createElement('div');
            classSection.className = 'side-section classified-section';
            classSection.innerHTML = `<h2 class="section-heading">Almanaque & Classificados</h2>`;

            data.classifieds.forEach(cls => {
                const clsEl = document.createElement('div');
                clsEl.className = 'classified-item';
                clsEl.innerHTML = `
                    <div class="class-cat">${cls.category}</div>
                    <h4 class="class-title">${cls.title}</h4>
                    <p class="class-desc">${cls.description}</p>
                    <p class="class-contact"><strong>Tratar:</strong> ${cls.contact}</p>
                    <p class="class-price">${cls.price}</p>
                `;
                classSection.appendChild(clsEl);
            });
            rightCol.appendChild(classSection);
        }

        // 5. Obituários
        if (data.obituaries && data.obituaries.length > 0) {
            const obitSection = document.createElement('div');
            obitSection.className = 'side-section obituaries';
            obitSection.innerHTML = `<h2 class="section-heading">Obituário</h2>`;

            data.obituaries.forEach(obit => {
                const obitEl = document.createElement('div');
                obitEl.className = 'obituary-item';
                
                let imgHtml = '';
                if (obit.img) {
                    imgHtml = `<img src="${obit.img}" alt="Foto do falecido" class="obituary-photo">`;
                }

                obitEl.innerHTML = `
                    ${imgHtml}
                    <div class="obituary-text">${obit.text.replace(/\n/g, '<br>')}</div>
                    ${obit.wake || obit.burial ? `
                    <div class="obituary-details">
                        ${obit.wake ? `<p><strong>Velório:</strong> ${obit.wake}</p>` : ''}
                        ${obit.burial ? `<p><strong>Sepultamento:</strong> ${obit.burial}</p>` : ''}
                    </div>` : ''}
                `;
                obitSection.appendChild(obitEl);
            });
            rightCol.appendChild(obitSection);
        }

        newspaperContent.appendChild(leftCol);
        newspaperContent.appendChild(rightCol);
    }

    async function loadIndex() {
        try {
            // Tenta buscar o índice gerado pelo admin
            const response = await fetch('data/editions/index.json');
            if (response.ok) {
                availableEditions = await response.json();
            }
        } catch (error) {
            console.error('Erro ao carregar o índice de edições:', error);
        }
        
        // Se conseguiu carregar e tem edições, carrega a primeira (mais recente)
        if (availableEditions.length > 0) {
            loadEdition(availableEditions[0].file);
        } else {
            newspaperContent.innerHTML = '<div class="error">Lamentamos, mas nenhuma edição foi encontrada nos arquivos.</div>';
        }
    }

    loadIndex();
});
