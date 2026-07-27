import os

css_path = "public/css/style.css"
with open(css_path, "r", encoding="utf-8") as f:
    css_content = f.read()

template = f"""<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE html>
<html b:css='false' b:defaultwidgetversion='2' b:layoutsVersion='3' b:responsive='true' b:templateUrl='indie.xml' b:templateVersion='1.3.0' expr:dir='data:blog.languageDirection' xmlns='http://www.w3.org/1999/xhtml' xmlns:b='http://www.google.com/2005/gml/b' xmlns:data='http://www.google.com/2005/gml/data' xmlns:expr='http://www.google.com/2005/gml/expr'>
<head>
  <meta content='width=device-width, initial-scale=1.0' name='viewport'/>
  <b:include data='blog' name='all-head-content'/>
  <title><data:view.title.escaped/></title>

  <!-- Google Fonts (Preconnect & Loading) -->
  <link rel='preconnect' href='https://fonts.googleapis.com'/>
  <link rel='preconnect' href='https://fonts.gstatic.com' crossorigin='anonymous'/>
  <link href='https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&amp;family=Lora:ital,wght@0,400;0,500;0,600;1,400&amp;family=UnifrakturMaguntia&amp;family=Cinzel:wght@700&amp;display=swap' rel='stylesheet'/>

  <b:skin><![CDATA[
{css_content}

/* --- Resets e Ajustes para Blogger --- */
a {{
    text-decoration: none;
    color: inherit;
}}

.main-title a {{
    color: var(--text-primary);
}}

.article-title a {{
    color: var(--text-primary);
    transition: color 0.2s;
}}

.article-title a:hover {{
    color: var(--text-secondary);
}}

.blog-pager {{
    display: flex;
    justify-content: space-between;
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
}}

.widget-content {{
    font-size: 0.95rem;
    text-align: justify;
}}

.widget h2.section-heading {{
    font-family: var(--font-roman);
    font-size: 1.5rem;
    text-transform: uppercase;
    text-align: center;
    border-bottom: 3px double var(--border-color);
    border-top: 3px double var(--border-color);
    padding: 0.5rem 0;
    margin-bottom: 1.5rem;
}}

.widget {{
    margin-bottom: 2rem;
}}

/* Forçar imagens dos posts a seguirem o estilo noir quando possivel */
.article-body img {{
    max-width: 100%;
    height: auto;
    filter: grayscale(100%) contrast(150%) brightness(85%) sepia(40%);
    mix-blend-mode: multiply;
    border: 4px solid var(--bg-color);
    outline: 2px solid var(--border-color);
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 0.8rem;
    transition: transform 0.4s ease, filter 0.4s ease, box-shadow 0.4s ease;
}}

.article-body img:hover {{
    transform: scale(1.015);
    filter: grayscale(80%) contrast(160%) brightness(90%) sepia(30%);
    box-shadow: 4px 4px 15px rgba(0, 0, 0, 0.15);
}}
  ]]></b:skin>
</head>

<body>
  <div class='newspaper-texture'></div>

  <!-- Navegação / Menu Superior -->
  <nav class='top-nav'>
      <div class='nav-container'>
          <span class='nav-date' id='nav-date'>Edição Digital</span>
          <span class='nav-jornal-title'><data:blog.title/></span>
      </div>
  </nav>

  <!-- Container Principal do Jornal -->
  <div class='newspaper-container'>
      <!-- Cabeçalho Principal -->
      <header class='newspaper-header border-double-thick'>
          <div class='header-top'>
              <span class='edition-number' id='header-edition-num'>Ed. Web</span>
              <span class='edition-price' id='header-price'>Gratuito</span>
          </div>
          <h1 class='newspaper-title main-title'>
              <a expr:href='data:blog.homepageUrl'><data:blog.title/></a>
          </h1>
          <div class='header-bottom'>
              <p class='slogan' id='header-slogan'>A Sentinella das Liberdades e o Espelho do Progresso Nacional</p>
              <p class='date' id='header-date'>Acervo Diário</p>
          </div>
      </header>

      <main class='newspaper-content' id='newspaper-content'>
          <div class='col-left'>
              <b:section class='main' id='main' showaddelement='yes'>
                  <b:widget id='Blog1' locked='true' title='Postagens no blog' type='Blog'>
                      <b:includable id='main' var='top'>
                          <b:loop values='data:posts' var='post'>
                              <!-- Excluir posts com a tag "Telegrama" ou "Cartum" da coluna principal -->
                              <b:if cond='not (data:post.labels any (label =&gt; label.name == &quot;Telegrama&quot; or label.name == &quot;Cartum&quot;))'>
                                  <b:include data='post' name='post'/>
                              </b:if>
                          </b:loop>
                          <b:include name='nextprev'/>
                      </b:includable>
                      <b:includable id='post' var='post'>
                          <article class='article'>
                              <h2 class='article-title'>
                                  <a expr:href='data:post.url'><data:post.title/></a>
                              </h2>
                              <div class='article-meta'>
                                  Por <data:post.author/> - <data:post.dateHeader/>
                              </div>
                              <div class='article-body columns-2'>
                                  <data:post.body/>
                              </div>
                          </article>
                      </b:includable>
                      <b:includable id='nextprev'>
                          <div class='blog-pager'>
                              <b:if cond='data:newerPageUrl'>
                                  <a class='archive-btn' expr:href='data:newerPageUrl'>Mais recentes</a>
                              </b:if>
                              <b:if cond='data:olderPageUrl'>
                                  <a class='archive-btn' expr:href='data:olderPageUrl'>Mais antigas</a>
                              </b:if>
                          </div>
                      </b:includable>
                  </b:widget>
              </b:section>
          </div>
          <div class='col-right'>
              <b:section class='side-section news-section' id='sidebar' showaddelement='yes'>
                  <b:widget id='HTML1' locked='false' title='Últimas Notícias (Telegramas)' type='HTML'>
                      <b:widget-settings>
                          <b:widget-setting name='content'>
&lt;div id=&quot;telegramas-widget&quot;&gt;Carregando...&lt;/div&gt;
&lt;script&gt;
  function renderTelegramas(json) {{
    var html = '';
    var posts = json.feed.entry;
    if (posts) {{
      for (var i = 0; i &lt; posts.length; i++) {{
        var post = posts[i];
        var title = post.title.$t;
        
        var content = post.content ? post.content.$t : (post.summary ? post.summary.$t : &quot;&quot;);
        
        var tempDiv = document.createElement(&quot;div&quot;);
        tempDiv.innerHTML = content;
        var snippet = tempDiv.textContent || tempDiv.innerText || &quot;&quot;;
        snippet = snippet.substring(0, 180) + '...';
        
        var scope = &quot;Notícia&quot;;
        if (post.category) {{
            for(var j=0; j&lt;post.category.length; j++){{
                if(post.category[j].term !== &quot;Telegrama&quot;) {{
                    scope = post.category[j].term;
                    break;
                }}
            }}
        }}
        
        var published = new Date(post.published.$t);
        var time = published.toLocaleTimeString('pt-BR', {{hour: '2-digit', minute:'2-digit'}});

        html += '&lt;div class=&quot;news-item&quot;&gt;';
        html += '&lt;span class=&quot;news-scope&quot;&gt;' + scope + ' - ' + time + '&lt;/span&gt;';
        html += '&lt;h4 class=&quot;news-title&quot;&gt;&lt;a href=&quot;' + getPostLink(post) + '&quot;&gt;' + title + '&lt;/a&gt;&lt;/h4&gt;';
        html += '&lt;p class=&quot;news-content&quot;&gt;' + snippet + '&lt;/p&gt;';
        html += '&lt;/div&gt;';
      }}
    }} else {{
       html = '&lt;p&gt;Nenhum telegrama recente.&lt;/p&gt;';
    }}
    document.getElementById('telegramas-widget').innerHTML = html;
  }}
  
  function getPostLink(post) {{
      for (var k = 0; k &lt; post.link.length; k++) {{
          if (post.link[k].rel == 'alternate') {{
              return post.link[k].href;
          }}
      }}
      return '#';
  }}
&lt;/script&gt;
&lt;script src=&quot;/feeds/posts/default/-/Telegrama?alt=json-in-script&amp;callback=renderTelegramas&amp;max-results=4&quot;&gt;&lt;/script&gt;
                          </b:widget-setting>
                      </b:widget-settings>
                      <b:includable id='main'>
                          <h2 class='section-heading'><data:title/></h2>
                          <div class='widget-content'>
                              <data:content/>
                          </div>
                      </b:includable>
                  </b:widget>
              </b:section>
          </div>
      </main>

      <!-- Cartuns Section -->
      <b:section class='cartoons' id='cartoons' showaddelement='yes'>
          <b:widget id='HTML2' locked='false' title='Cartuns' type='HTML'>
              <b:widget-settings>
                  <b:widget-setting name='content'>
&lt;div id=&quot;cartoons-widget&quot; class=&quot;cartoon-section&quot; style=&quot;display:none;&quot;&gt;&lt;/div&gt;
&lt;script&gt;
  function renderCartoons(json) {{
    var html = '';
    var posts = json.feed.entry;
    if (posts &amp;&amp; posts.length &gt; 0) {{
      document.getElementById('cartoons-widget').style.display = 'block';
      for (var i = 0; i &lt; posts.length; i++) {{
        var post = posts[i];
        var title = post.title.$t;
        
        var content = post.content ? post.content.$t : &quot;&quot;;
        var tempDiv = document.createElement(&quot;div&quot;);
        tempDiv.innerHTML = content;
        var img = tempDiv.querySelector(&quot;img&quot;);
        var imgSrc = img ? img.src : &quot;&quot;;
        
        var author = &quot;Artista Desconhecido&quot;;
        if (post.author &amp;&amp; post.author.length &gt; 0) {{
            author = post.author[0].name.$t;
        }}

        if (imgSrc) {{
            html += '&lt;div class=&quot;cartoon-item&quot;&gt;';
            html += '&lt;h3 class=&quot;cartoon-title&quot;&gt;' + title + '&lt;/h3&gt;';
            html += '&lt;a href=&quot;' + getCartoonLink(post) + '&quot;&gt;&lt;img src=&quot;' + imgSrc + '&quot; class=&quot;image-noir&quot; alt=&quot;Cartum&quot; style=&quot;max-width: 100%; height: auto;&quot; /&gt;&lt;/a&gt;';
            html += '&lt;p class=&quot;cartoon-artist&quot;&gt;Por ' + author + '&lt;/p&gt;';
            html += '&lt;/div&gt;';
        }}
      }}
      document.getElementById('cartoons-widget').innerHTML = html;
    }}
  }}
  
  function getCartoonLink(post) {{
      for (var k = 0; k &lt; post.link.length; k++) {{
          if (post.link[k].rel == 'alternate') {{
              return post.link[k].href;
          }}
      }}
      return '#';
  }}
&lt;/script&gt;
&lt;script src=&quot;/feeds/posts/default/-/Cartum?alt=json-in-script&amp;callback=renderCartoons&amp;max-results=3&quot;&gt;&lt;/script&gt;
                  </b:widget-setting>
              </b:widget-settings>
              <b:includable id='main'>
                  <div class='widget-content'>
                      <data:content/>
                  </div>
              </b:includable>
          </b:widget>
      </b:section>

      <!-- Footer Principal -->
      <footer class='newspaper-footer border-t-double'>
          <p><data:blog.title/> &amp;copy; 2026 - Todos os direitos reservados.</p>
          
          <section class='footer-links'>
              <a class='footer-link' href='#'>Politica de Privacidade e Termos de Uso</a>
          </section>

          <section class='footer-links'>
              <a class='footer-link' href='#'>Apoie o Jornalismo Independente</a>
              <span class='footer-separator'>✦</span>
              <a class='footer-link' href='https://whatsapp.com/channel/0029Vb8joVE002TBl7rNn41V' rel='noopener noreferrer' target='_blank'>Canal WhatsApp</a>
              <span class='footer-separator'>✦</span>
              <a class='footer-link' href='https://www.instagram.com/acronicailustrada/' rel='noopener noreferrer' target='_blank'>Instagram</a>
          </section>
      </footer>
  </div>
</body>
</html>
"""

os.makedirs("bloggerTemplate", exist_ok=True)
with open("bloggerTemplate/acronicailustrada-template.xml", "w", encoding="utf-8") as f:
    f.write(template)

print("Template written successfully.")
