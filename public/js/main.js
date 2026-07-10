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

    async function loadIndex() {
        try {
            const response = await fetch('/data/editions/index.json');
            if (response.ok) {
                availableEditions = await response.json();
            }
        } catch (error) {
            console.error('Erro ao carregar o índice de edições:', error);
        }
    }

    // Carrega o índice silenciosamente em background para o caso de o usuário abrir o acervo
    loadIndex();
});
