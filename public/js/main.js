document.addEventListener('DOMContentLoaded', () => {
    const archiveModal = document.getElementById('archive-modal');
    const btnArchive = document.getElementById('btn-archive');
    const editionsList = document.getElementById('editions-list');
    
    // Elementos do Modal de Privacidade
    const privacyModal = document.getElementById('privacy-modal');
    const btnPrivacy = document.getElementById('btn-privacy');

    // Botões de Fechar
    const closeButtons = document.querySelectorAll('.close-modal');

    // Available editions. Get lis editions.
    let availableEditions = [];

    btnArchive.addEventListener('click', () => {
        archiveModal.classList.remove('hidden');
        renderArchiveList();
    });

    if (btnPrivacy) {
        btnPrivacy.addEventListener('click', (e) => {
            e.preventDefault();
            privacyModal.classList.remove('hidden');
        });
    }

    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            archiveModal.classList.add('hidden');
            if (privacyModal) privacyModal.classList.add('hidden');
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target === archiveModal) {
            archiveModal.classList.add('hidden');
        }
        if (e.target === privacyModal) {
            privacyModal.classList.add('hidden');
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
            
            // Extract folder path from the JSON path. e.g. "2026/312/edition-312.json" -> "/data/editions/2026/312/index.html"
            const jsonPathParts = ed.file.split('/');
            jsonPathParts.pop(); // remove json file name
            const folderPath = jsonPathParts.join('/');
            
            const link = document.createElement('a');
            link.href = `/data/editions/${folderPath}/index.html`;
            link.className = 'archive-link';
            link.innerHTML = `<span class="ed-title">${ed.title}</span><span class="ed-date">${ed.date}</span>`;
            
            li.appendChild(link);
            editionsList.appendChild(li);
        });
    }

    async function checkForUpdates() {
        // Se estiver offline, ainda precisamos carregar as edições salvas no cache
        if (!navigator.onLine) {
            try {
                const response = await fetch('/data/editions/index.json');
                if (response.ok) {
                    availableEditions = await response.json();
                }
            } catch (err) {
                console.error('Erro ao ler do cache offline:', err);
            }
            return;
        }

        try {
            // Timestamp prevent cache
            const response = await fetch('/data/editions/index.json?t=' + new Date().getTime());
            if (response.ok) {
                const freshEditions = await response.json();
                
                // Se o availableEditions já estava carregado antes
                if (availableEditions.length > 0 && freshEditions.length > 0) {
                    const localLatest = availableEditions[0].id;
                    const remoteLatest = freshEditions[0].id;
                    
                    if (localLatest !== remoteLatest) {
                        showUpdateToast();
                    }
                }
                
                availableEditions = freshEditions;
            }
        } catch (err) {
            console.error('Erro na checagem de atualização PWA:', err);
        }
    }

    function showUpdateToast() {
        let toast = document.getElementById('pwa-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'pwa-toast';
            toast.className = 'pwa-toast border-double-thick';
            toast.innerHTML = `
                <div class="toast-content">
                    <span>📰 <b>Nova edição disponível!</b> O jornaleiro acaba de entregar notícias frescas.</span>
                    <button id="pwa-refresh-btn" class="archive-btn" style="margin-top: 10px; font-size: 0.8rem; display: block; margin-left: auto; margin-right: auto; padding: 5px 15px;">Ler Agora</button>
                </div>
            `;
            document.body.appendChild(toast);
            
            document.getElementById('pwa-refresh-btn').addEventListener('click', () => {
                window.location.href = '/';
            });
        }
        // Force reflow and show
        setTimeout(() => toast.classList.add('show'), 100);
    }

    // PWA Service Worker Registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('Service Worker registrado com escopo:', registration.scope);
            }).catch(err => {
                console.log('Falha ao registrar Service Worker:', err);
            });
        });
    }

    // Checar por atualizações periodicamente (a cada 5 min se a janela estiver aberta) e quando voltar a internet
    setInterval(checkForUpdates, 300000);
    window.addEventListener('online', checkForUpdates);

    // Carrega o índice silenciosamente em background para o caso de o usuário abrir o acervo
    checkForUpdates();
});
