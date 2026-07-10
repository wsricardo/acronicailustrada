const fs = require('fs');
const path = require('path');

function getAbsoluteUrl(url) {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return url.startsWith('/') ? url : '/' + url;
}

function generateStaticHTML(editionData) {
    const templatePath = path.join(__dirname, 'templates', 'layout.html');
    let template = fs.readFileSync(templatePath, 'utf8');

    // SEO Info
    let seoDescription = editionData.slogan || "Jornal Retrô Clássico com as últimas notícias da capital.";
    if (editionData.articles && editionData.articles.length > 0) {
        const mainArticle = editionData.articles[0];
        seoDescription = `Destaques da edição de ${editionData.dateStr}: ${mainArticle.title}. ${mainArticle.subtitle || ''}`.trim();
    }
    const pageTitle = `${editionData.title} - Edição ${editionData.number}`;
    const pageUrl = `/data/editions/${editionData.baseYear}/${editionData.number}/index.html`;

    // Metadados do Cabeçalho da Data
    const now = new Date();
    const dayOfWeek = now.toLocaleDateString('pt-BR', { weekday: 'long' });
    const day = now.toLocaleDateString('pt-BR', { day: 'numeric' });
    const month = now.toLocaleDateString('pt-BR', { month: 'long' });
    const year = now.toLocaleDateString('pt-BR', { year: 'numeric' });
    const headerDateToday = `${dayOfWeek}, ${day} de ${month} de ${year}`;

    // Substituições principais
    template = template.replace(/\{\{PAGE_TITLE\}\}/g, pageTitle);
    template = template.replace(/\{\{SEO_DESC\}\}/g, seoDescription);
    template = template.replace(/\{\{OG_TITLE\}\}/g, pageTitle);
    template = template.replace(/\{\{PAGE_URL\}\}/g, pageUrl);
    template = template.replace(/\{\{HEADER_DATE_TODAY\}\}/g, headerDateToday);
    template = template.replace(/\{\{EDITION_NUMBER\}\}/g, editionData.number || '');
    template = template.replace(/\{\{EDITION_PRICE\}\}/g, editionData.price || '');
    template = template.replace(/\{\{EDITION_SLOGAN\}\}/g, editionData.slogan || '');
    template = template.replace(/\{\{EDITION_DATE\}\}/g, editionData.dateStr || '');

    // Construção do HTML do conteúdo
    let leftColHtml = '<div class="col-left">\n';
    let rightColHtml = '<div class="col-right">\n';

    // 1. Artigos
    if (editionData.articles && editionData.articles.length > 0) {
        editionData.articles.forEach((art, index) => {
            let imgHtml = '';
            if (art.illustrationUrl) {
                const imgAttributes = index === 0
                    ? 'fetchpriority="high" decoding="sync"'
                    : 'loading="lazy" decoding="async"';
                
                imgHtml = `
                    <img src="${getAbsoluteUrl(art.illustrationUrl)}" alt="Ilustração" class="image-noir" ${imgAttributes} onerror="this.style.display='none'">
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
                }).join('\n');
            }

            leftColHtml += `
                <article class="article">
                    <h2 class="article-title">${art.title}</h2>
                    ${art.subtitle ? `<h3 class="article-subtitle">${art.subtitle}</h3>` : ''}
                    <div class="article-meta">${art.author ? `Por ${art.author} - ` : ''}${editionData.dateStr}</div>
                    ${imgHtml}
                    <div class="article-body ${index === 0 ? 'columns-2' : ''}">
                        ${paragraphsHtml}
                    </div>
                </article>
            `;
        });
    }

    // 2. Cartuns
    if (editionData.cartoons && editionData.cartoons.length > 0) {
        leftColHtml += `<div class="cartoon-section">
            <h2 class="section-heading">Cartuns & Humor</h2>`;
        
        editionData.cartoons.forEach(cart => {
            leftColHtml += `
                <div class="cartoon-item">
                    <h3 class="cartoon-title">${cart.title}</h3>
                    <img src="${getAbsoluteUrl(cart.imageUrl)}" class="image-noir" alt="${cart.title}" loading="lazy" decoding="async">
                    <p class="image-caption">${cart.caption}</p>
                    <p class="cartoon-artist">Traço de: ${cart.artist}</p>
                </div>
            `;
        });
        leftColHtml += `</div>`;
    }

    // 3. Telegramas (General News)
    if (editionData.generalNews && editionData.generalNews.length > 0) {
        rightColHtml += `<div class="side-section news-section">
            <h2 class="section-heading">Ultimas Notícias (Telegramas)</h2>`;
        
        editionData.generalNews.forEach(news => {
            rightColHtml += `
                <div class="news-item">
                    <span class="news-scope">${news.scope} - ${news.time}</span>
                    <h4 class="news-title">${news.title}</h4>
                    <p class="news-content">${news.content}</p>
                </div>
            `;
        });
        rightColHtml += `</div>`;
    }

    // 4. Classificados
    if (editionData.classifieds && editionData.classifieds.length > 0) {
        rightColHtml += `<div class="side-section classified-section">
            <h2 class="section-heading">Almanaque & Classificados</h2>`;
        
        editionData.classifieds.forEach(cls => {
            rightColHtml += `
                <div class="classified-item">
                    <div class="class-cat">${cls.category}</div>
                    <h4 class="class-title">${cls.title}</h4>
                    <p class="class-desc">${cls.description}</p>
                    <p class="class-contact"><strong>Tratar:</strong> ${cls.contact}</p>
                    <p class="class-price">${cls.price}</p>
                </div>
            `;
        });
        rightColHtml += `</div>`;
    }

    // 5. Obituários
    if (editionData.obituaries && editionData.obituaries.length > 0) {
        rightColHtml += `<div class="side-section obituaries">
            <h2 class="section-heading">Obituário</h2>`;
        
        editionData.obituaries.forEach(obit => {
            let imgHtml = '';
            if (obit.img) {
                imgHtml = `<img src="${getAbsoluteUrl(obit.img)}" alt="Foto do falecido" class="obituary-photo" loading="lazy" decoding="async">`;
            }
            
            const wakeStr = obit.wake ? `<p><strong>Velório:</strong> ${obit.wake}</p>` : '';
            const burialStr = obit.burial ? `<p><strong>Sepultamento:</strong> ${obit.burial}</p>` : '';
            const detailsHtml = (wakeStr || burialStr) ? `<div class="obituary-details">${wakeStr}${burialStr}</div>` : '';
            
            rightColHtml += `
                <div class="obituary-item">
                    ${imgHtml}
                    <div class="obituary-text">${obit.text.replace(/\n/g, '<br>')}</div>
                    ${detailsHtml}
                </div>
            `;
        });
        rightColHtml += `</div>`;
    }

    leftColHtml += '</div>\n';
    rightColHtml += '</div>\n';

    const finalContent = leftColHtml + rightColHtml;
    template = template.replace('{{CONTENT}}', finalContent);

    return template;
}

module.exports = { generateStaticHTML };
