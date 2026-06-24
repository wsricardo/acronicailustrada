import React, { useState, useEffect } from 'react';
import AdminLogin from '../components/AdminLogin';
import ImageUpload from '../components/ImageUpload';
import EditorialAssistant from '../components/EditorialAssistant';
import { generateWordSearch } from '../utils/wordSearchGenerator';

const blankEditionTemplate = {
  status: "draft",
  header: {
    redacao: "Redacção e Administração <br/> Praça Dr. Antonio Prado",
    titulo_principal: "A CRÔNICA ILUSTRADA",
    dados_direito: "FUNDADO EM 1854",
    titulo_display: "A Crônica Ilustrada",
    dateline: "Capital Federal - Data",
    preco: "PREÇO $200 RÉIS"
  },
  leadArticle: {
    paragraphs: ["Parágrafo inicial.", "Segundo parágrafo."],
    image: { src: "", alt: "", caption: "" },
    paragraphs_after_image: ["Mais detalhes..."],
    sub_article: { title: "Notícia Menor", paragraphs: ["Texto menor."] }
  },
  chamadas: [],
  internationalNews: {
    title: "Telegramas do Exterior",
    subtitle: "Via Cabo Submarino",
    news: [
      { location: "PARIS", headline: "Título", body: "Texto" }
    ]
  },
  secondarySection: {
    main_article: {
      title: "Artigo da Sociedade",
      body: "Texto descritivo.",
      quote: { text: "Citação", author: "Autor" }
    },
    boemia_image: { src: "", alt: "", caption: "" },
    ads: [{ title: "Anúncio", body: "Texto do anúncio" }]
  },
  sports: {
    title: "Página dos Desportos",
    article1: { title: "Esporte 1", body: "Texto 1" },
    article2: { title: "Esporte 2", body: "Texto 2", image: "" }
  },
  cartoon: {
    image: "", caption: "Legenda",    paragraphs: [
      "Texto do cartum"
    ]
  },
  puzzle: {
    words: "CIGARRO, BOEMIA, ARTE",
    grid: [],
    solution: []
  },
  folhetim: {
    author: "Machado de Assis",
    title: "Memórias Póstumas de Brás Cubas",
    translator: "",
    chapter: "CAPÍTULO I",
    paragraphs: ["(Insira o texto do capítulo aqui)"],
    ending: "Continúa na próxima edição..."
  },
  culturalEvents: {
    title: "Guia Cultural",
    events: [{ title: "Teatro", description: "Peça", details: "Preço" }]
  }
};

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('admin_auth') === 'true';
  });
  const [editions, setEditions] = useState([]);
  const [selectedEdition, setSelectedEdition] = useState(null);
  const [formData, setFormData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [activeTab, setActiveTab] = useState('capa');

  const loadEditions = () => {
    fetch('/api/editions/list.json')
      .then(res => res.json())
      .then(data => setEditions(data))
      .catch(err => console.error("Erro:", err));
  };

  useEffect(() => {
    if (isAuthenticated) loadEditions();
  }, [isAuthenticated]);

  const handleSelectEdition = (ed) => {
    fetch(`/api/editions/edition-${ed.ano}-${ed.id}.json`)
      .then(res => res.json())
      .then(data => {
        setSelectedEdition(ed);
        setFormData(data);
        setActiveTab('capa');
      });
  };

  const handleCreateEdition = async () => {
    setCreating(true);
    const currentYear = new Date().getFullYear();
    const nextId = editions.length > 0 ? Math.max(...editions.map(ed => ed.id)) + 1 : 1;
    const newPayload = { ...blankEditionTemplate, id: nextId, ano: currentYear };
    newPayload.header.titulo_display = `Manchete Edição ${nextId}`;

    try {
      const res = await fetch(`/api/editions/${currentYear}/${nextId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPayload)
      });
      if (res.ok) {
        alert("Edição criada!");
        await loadEditions();
        handleSelectEdition({ id: nextId, ano: currentYear });
      }
    } catch (err) { alert("Erro de rede."); }
    setCreating(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/editions/${selectedEdition.ano}/${selectedEdition.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert("Salvo com sucesso!");
        loadEditions();
      }
    } catch (err) { alert("Erro ao salvar."); }
    setSaving(false);
  };

  const handleDeleteEdition = async () => {
    if (!window.confirm(`Tem certeza que deseja DELETAR a edição ${selectedEdition.id}? Esta ação não pode ser desfeita.`)) return;
    try {
      const res = await fetch(`/api/editions/${selectedEdition.ano}/${selectedEdition.id}`, { method: 'DELETE' });
      if (res.ok) {
        alert("Edição deletada com sucesso!");
        setFormData(null);
        setSelectedEdition(null);
        loadEditions();
      } else {
        alert("Erro ao deletar edição.");
      }
    } catch (err) {
      alert("Erro na requisição.");
    }
  };

  const handleGeneratePdf = async () => {
    if (!selectedEdition) return;
    setGeneratingPdf(true);
    try {
      const res = await fetch(`/api/generate-pdf/${selectedEdition.ano}/${selectedEdition.id}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert("✅ Matrizes impressas! PDF gerado com sucesso.\nO botão na Capa do jornal agora fará o download da nova versão.");
      } else {
        alert("❌ Falha ao gerar PDF: " + data.error);
      }
    } catch (err) {
      alert("❌ Erro ao tentar contatar a rotativa (servidor).");
    } finally {
      setGeneratingPdf(false);
    }
  };

  const updateField = (path, value) => {
    const newData = JSON.parse(JSON.stringify(formData));
    let current = newData;
    const parts = path.split('.');
    for (let i = 0; i < parts.length - 1; i++) {
      if (current[parts[i]] === undefined) current[parts[i]] = {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
    setFormData(newData);
  };

  // Funções de Array (Adicionar/Remover itens dinâmicos)
  const addArrayItem = (path, blankItem) => {
    const newData = JSON.parse(JSON.stringify(formData));
    let current = newData;
    const parts = path.split('.');
    for (let i = 0; i < parts.length; i++) {
      if (current[parts[i]] === undefined) current[parts[i]] = (i === parts.length - 1 ? [] : {});
      current = current[parts[i]];
    }
    current.push(blankItem);
    setFormData(newData);
  };

  const removeArrayItem = (path, index) => {
    const newData = JSON.parse(JSON.stringify(formData));
    let current = newData;
    const parts = path.split('.');
    for (let i = 0; i < parts.length; i++) {
      if (current[parts[i]] === undefined) return; // Nada a remover
      current = current[parts[i]];
    }
    current.splice(index, 1);
    setFormData(newData);
  };

  const updateArrayItem = (path, index, field, value) => {
    const newData = JSON.parse(JSON.stringify(formData));
    let current = newData;
    const parts = path.split('.');
    for (let i = 0; i < parts.length; i++) {
      if (current[parts[i]] === undefined) current[parts[i]] = (i === parts.length - 1 ? [] : {});
      current = current[parts[i]];
    }
    
    if (current[index] === undefined) return;

    if (field) {
      current[index][field] = value;
    } else {
      current[index] = value;
    }
    setFormData(newData);
  };

  if (!isAuthenticated) return <AdminLogin onLogin={() => {
    sessionStorage.setItem('admin_auth', 'true');
    setIsAuthenticated(true);
  }} />;

  const tabs = [
    { id: 'capa', label: 'Capa' },
    { id: 'mundo', label: 'Mundo' },
    { id: 'sociedade', label: 'Sociedade' },
    { id: 'lazer', label: 'Lazer & Desportos' },
    { id: 'folhetim', label: 'Folhetim' },
    { id: 'cultura', label: 'Guia Cultural' }
  ];

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <header className="bg-[#1a1a1a] text-[#eee9dd] p-4 shadow-md flex justify-between items-center z-10">
        <h1 className="font-display font-bold text-2xl uppercase tracking-widest">Painel Administrativo</h1>
        <a href="/" className="text-sm underline hover:text-gray-400">Voltar ao Jornal</a>
      </header>

      <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
        
        <aside className="w-full md:w-64 bg-white border-r border-gray-300 flex flex-col">
          <div className="p-4 border-b bg-gray-50">
            <button onClick={handleCreateEdition} disabled={creating} className="w-full bg-[#1a1a1a] text-[#eee9dd] p-2 rounded hover:bg-gray-800 font-bold">
              + Nova Edição
            </button>
          </div>
          <ul className="flex flex-col overflow-y-auto p-4 gap-2 flex-grow">
            {editions.map(ed => (
              <li key={ed.id}>
                <button onClick={() => handleSelectEdition(ed)} className={`w-full text-left p-3 border rounded ${selectedEdition?.id === ed.id ? 'bg-[#1a1a1a] text-white' : 'bg-white hover:bg-gray-50'}`}>
                  Edição {ed.id}/{ed.ano} 
                  {ed.status === 'draft' && <span className="ml-2 bg-yellow-100 text-yellow-800 text-[10px] px-1 font-bold rounded">RASCUNHO</span>}
                  <strong className="block truncate">{ed.title}</strong>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="flex-1 overflow-y-auto bg-gray-100 p-6 relative">
          {!formData ? (
            <div className="flex h-full items-center justify-center text-gray-500">
              <p>Selecione ou crie uma edição para editar.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-4xl mx-auto flex flex-col h-full w-full">
              
              <div className="flex justify-between items-center p-4 border-b bg-white">
                <h2 className="text-xl font-bold">Editando Edição {selectedEdition.id}/{selectedEdition.ano}</h2>
                <div className="flex items-center gap-4">
                  <a 
                    href={`/edicao/${selectedEdition.ano}/${selectedEdition.id}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-gray-600 hover:text-black flex items-center gap-1 border px-3 py-1 rounded"
                  >
                    👁️ Ver Preview
                  </a>
                  <button 
                    onClick={handleDeleteEdition}
                    className="text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-1 border border-red-200 px-3 py-1 rounded transition-colors"
                    type="button"
                  >
                    🗑️ Deletar
                  </button>
                  <button 
                    onClick={handleGeneratePdf}
                    disabled={generatingPdf}
                    className={`text-sm font-bold flex items-center gap-1 border border-black px-3 py-1 rounded transition-colors ${generatingPdf ? 'bg-gray-400 text-gray-700 cursor-wait' : 'text-[#eee9dd] bg-[#1a1a1a] hover:bg-gray-800'}`}
                    type="button"
                  >
                    {generatingPdf ? '⚙️ Imprimindo...' : '🖨️ Gerar PDF'}
                  </button>
                  <select 
                    value={formData.status || 'published'}
                    onChange={(e) => updateField('status', e.target.value)}
                    className={`text-sm font-bold p-1 rounded border outline-none ${formData.status === 'draft' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 'bg-green-100 text-green-800 border-green-300'}`}
                  >
                    <option value="draft">Em Rascunho</option>
                    <option value="published">Publicado</option>
                  </select>
                </div>
              </div>

              {/* Navegação de Tabs */}
              <div className="flex border-b overflow-x-auto bg-gray-50 rounded-t-lg">
                {tabs.map(tab => (
                  <button 
                    key={tab.id}
                    onClick={(e) => { e.preventDefault(); setActiveTab(tab.id); }}
                    className={`px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSave} className="p-6 flex-grow overflow-y-auto">
                
                {/* 1. CAPA */}
                {activeTab === 'capa' && (
                  <div className="flex flex-col gap-6 animate-fade-in">
                    <div className="bg-gray-50 p-4 border rounded">
                      <h3 className="font-bold mb-4">Cabeçalho</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-xs mb-1">Título da Manchete (Subtítulo do Jornal)</label>
                          <input type="text" value={formData.header.titulo_display || ''} onChange={(e) => updateField('header.titulo_display', e.target.value)} className="w-full border p-2 rounded" placeholder="Ex: NOVO ESCÂNDALO NA CAPITAL" />
                        </div>
                        <div><label className="block text-xs mb-1">Data (Dateline)</label>
                          <input type="text" value={formData.header.dateline || ''} onChange={(e) => updateField('header.dateline', e.target.value)} className="w-full border p-2 rounded" />
                        </div>
                        <div><label className="block text-xs mb-1">Informação Topo Direito (Ex: Nº da Edição)</label>
                          <input type="text" value={formData.header.dados_direito || ''} onChange={(e) => updateField('header.dados_direito', e.target.value)} className="w-full border p-2 rounded" placeholder="Ex: ANNO I - Nº 5" />
                        </div>
                        <div><label className="block text-xs mb-1">Preço</label>
                          <input type="text" value={formData.header.preco || ''} onChange={(e) => updateField('header.preco', e.target.value)} className="w-full border p-2 rounded" placeholder="Ex: $200 REIS" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 border rounded">
                      <h3 className="font-bold mb-4">Artigo Principal</h3>
                      <label className="block text-xs mb-1">Conteúdo Textual do Artigo (separe os parágrafos com a tecla Enter)</label>
                      <textarea 
                        rows="8" 
                        value={(formData.leadArticle.paragraphs || []).join('\n')} 
                        onChange={(e) => updateField('leadArticle.paragraphs', e.target.value.split('\n'))} 
                        className="w-full border p-2 rounded mb-4" 
                        placeholder="Escreva a matéria principal aqui..."
                      />
                      
                      <div className="grid grid-cols-1 gap-4 mb-4">
                        <ImageUpload 
                          label="Imagem da Capa (Upload)" 
                          currentUrl={formData.leadArticle.image.src} 
                          onUploadSuccess={(url) => updateField('leadArticle.image.src', url)} 
                        />
                        <div><label className="block text-xs mb-1">Legenda da Imagem</label>
                          <input type="text" value={formData.leadArticle.image.caption} onChange={(e) => updateField('leadArticle.image.caption', e.target.value)} className="w-full border p-2 rounded" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 border rounded">
                      <h3 className="font-bold mb-4">Chamadas de Outras Notícias (Nesta Edição)</h3>
                      {(formData.chamadas || []).map((chamada, idx) => (
                        <div key={idx} className="border bg-white p-4 mb-4 rounded relative">
                          <button type="button" onClick={() => removeArrayItem('chamadas', idx)} className="absolute top-2 right-2 text-red-500 text-xs font-bold">X Remover</button>
                          <div className="grid grid-cols-2 gap-4 mb-2">
                            <div><label className="block text-xs">Título da Chamada</label><input type="text" value={chamada.headline} onChange={(e)=>updateArrayItem('chamadas', idx, 'headline', e.target.value)} className="w-full border p-1" /></div>
                            <div><label className="block text-xs">Página (Ex: 2)</label><input type="text" value={chamada.page} onChange={(e)=>updateArrayItem('chamadas', idx, 'page', e.target.value)} className="w-full border p-1" /></div>
                          </div>
                          <label className="block text-xs">Resumo (opcional)</label>
                          <textarea rows="2" value={chamada.summary} onChange={(e)=>updateArrayItem('chamadas', idx, 'summary', e.target.value)} className="w-full border p-1" />
                        </div>
                      ))}
                      <button type="button" onClick={() => updateField('chamadas', [...(formData.chamadas || []), { headline: "Nova Chamada", summary: "Resumo da notícia.", page: "2" }])} className="bg-black text-white px-4 py-2 rounded text-sm font-bold hover:bg-gray-800">
                        + Adicionar Chamada
                      </button>
                    </div>

                  </div>
                )}

                {/* 2. MUNDO (TELEGRAMAS) */}
                {activeTab === 'mundo' && (
                  <div className="flex flex-col gap-6 animate-fade-in">
                    <div className="bg-gray-50 p-4 border rounded">
                      <h3 className="font-bold mb-4">Telegramas Internacionais</h3>
                      {formData.internationalNews.news.map((item, idx) => (
                        <div key={idx} className="border bg-white p-4 mb-4 rounded relative">
                          <button type="button" onClick={() => removeArrayItem('internationalNews.news', idx)} className="absolute top-2 right-2 text-red-500 text-xs font-bold">X Remover</button>
                          <div className="grid grid-cols-2 gap-4 mb-2">
                            <div><label className="block text-xs">Local</label><input type="text" value={item.location} onChange={(e)=>updateArrayItem('internationalNews.news', idx, 'location', e.target.value)} className="w-full border p-1" /></div>
                            <div><label className="block text-xs">Título</label><input type="text" value={item.headline} onChange={(e)=>updateArrayItem('internationalNews.news', idx, 'headline', e.target.value)} className="w-full border p-1" /></div>
                          </div>
                          <label className="block text-xs">Corpo da Notícia</label>
                          <textarea rows="3" value={item.body} onChange={(e)=>updateArrayItem('internationalNews.news', idx, 'body', e.target.value)} className="w-full border p-1" />
                        </div>
                      ))}
                      <button type="button" onClick={() => addArrayItem('internationalNews.news', {location: "NOVO LOCAL", headline: "Nova Manchete", body: ""})} className="bg-gray-200 p-2 rounded text-sm w-full font-bold">+ Adicionar Telegrama</button>
                    </div>
                  </div>
                )}

                {/* 3. SOCIEDADE & ANÚNCIOS */}
                {activeTab === 'sociedade' && (
                  <div className="flex flex-col gap-6 animate-fade-in">
                    <div className="bg-gray-50 p-4 border rounded">
                      <h3 className="font-bold mb-4">Artigo da Sociedade</h3>
                      <label className="block text-xs">Título</label>
                      <input type="text" value={formData.secondarySection.main_article.title} onChange={(e) => updateField('secondarySection.main_article.title', e.target.value)} className="w-full border p-2 mb-2" />
                      <label className="block text-xs">Texto</label>
                      <textarea rows="4" value={formData.secondarySection.main_article.body} onChange={(e) => updateField('secondarySection.main_article.body', e.target.value)} className="w-full border p-2 mb-4" />
                      
                      <h3 className="font-bold mt-4 mb-2">Imagem de Boêmia</h3>
                      <ImageUpload 
                        label="Fotografia (Upload)" 
                        currentUrl={formData.secondarySection.boemia_image.src} 
                        onUploadSuccess={(url) => updateField('secondarySection.boemia_image.src', url)} 
                      />
                      <input type="text" placeholder="Legenda" value={formData.secondarySection.boemia_image.caption} onChange={(e) => updateField('secondarySection.boemia_image.caption', e.target.value)} className="w-full border p-2 mt-2" />
                    </div>

                    <div className="bg-gray-50 p-4 border rounded">
                      <h3 className="font-bold mb-4">Anúncios (Classificados)</h3>
                      {formData.secondarySection.ads.map((ad, idx) => (
                        <div key={idx} className="flex gap-2 mb-2">
                          <input type="text" value={ad.title} onChange={(e)=>updateArrayItem('secondarySection.ads', idx, 'title', e.target.value)} className="w-1/3 border p-2" placeholder="Título do Anúncio" />
                          <input type="text" value={ad.body} onChange={(e)=>updateArrayItem('secondarySection.ads', idx, 'body', e.target.value)} className="flex-1 border p-2" placeholder="Texto do anúncio" />
                          <button type="button" onClick={() => removeArrayItem('secondarySection.ads', idx)} className="bg-red-500 text-white px-2 rounded">X</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => addArrayItem('secondarySection.ads', {title: "Novo Anúncio", body: "Texto..."})} className="bg-gray-200 p-2 rounded text-sm w-full font-bold mt-2">+ Adicionar Anúncio</button>
                    </div>
                  </div>
                )}

                {/* 4. LAZER & CARTUM */}
                {activeTab === 'lazer' && (
                  <div className="flex flex-col gap-6 animate-fade-in">
                    <div className="bg-gray-50 p-4 border rounded">
                      <h3 className="font-bold mb-4">Cartum do Dia</h3>
                      <ImageUpload 
                        label="Imagem do Cartum (Upload)" 
                        currentUrl={formData.cartoon.image} 
                        onUploadSuccess={(url) => updateField('cartoon.image', url)} 
                      />
                      <input type="text" placeholder="Legenda do Cartum" value={formData.cartoon.caption} onChange={(e) => updateField('cartoon.caption', e.target.value)} className="w-full border p-2 mt-2" />
                    </div>
                    <div className="bg-gray-50 p-4 border rounded">
                      <h3 className="font-bold mb-4">Esporte & Saúde</h3>
                      <label className="block text-xs">Esporte Principal ou Saúde (Título)</label>
                      <input type="text" value={formData.sports.article1.title} onChange={(e) => updateField('sports.article1.title', e.target.value)} className="w-full border p-2 mb-2" />
                      <label className="block text-xs">Texto (Notícias, esportes, novidades em saúde)</label>
                      <textarea rows="3" value={formData.sports.article1.body} onChange={(e) => updateField('sports.article1.body', e.target.value)} className="w-full border p-2" />
                    </div>

                    <div className="bg-[#f4ecd8] p-4 border-2 border-black rounded">
                      <h3 className="font-bold mb-4 uppercase text-lg tracking-widest border-b border-black pb-1">🧩 Caça-Palavras Automático</h3>
                      <div className="mb-4">
                        <label className="block text-xs font-bold uppercase mb-1">Palavras (separadas por vírgula)</label>
                        <input 
                          type="text" 
                          value={formData.puzzle?.words || ""} 
                          onChange={(e) => updateField('puzzle.words', e.target.value)} 
                          className="w-full border p-2 mb-3 bg-white outline-none" 
                          placeholder="Ex: CINEMA, JORNAL, RADIO" 
                        />
                        <button 
                          onClick={() => {
                            const wList = (formData.puzzle?.words || "").split(',');
                            const result = generateWordSearch(wList);
                            const newData = JSON.parse(JSON.stringify(formData));
                            if (!newData.puzzle) newData.puzzle = {};
                            newData.puzzle.grid = result.grid;
                            newData.puzzle.solution = result.solution;
                            setFormData(newData);
                          }} 
                          className="bg-black text-white px-4 py-2 text-sm font-bold hover:bg-gray-800 uppercase tracking-wide"
                        >
                          ⚡ Gerar Nova Grade
                        </button>
                      </div>

                      {formData.puzzle?.grid && formData.puzzle.grid.length > 0 && (
                        <div className="bg-white p-3 border-2 border-black inline-block mt-2">
                          <div className="grid gap-1 font-mono text-center text-sm font-bold" style={{ gridTemplateColumns: `repeat(${formData.puzzle.grid[0].length}, minmax(0, 1fr))` }}>
                            {formData.puzzle.grid.flat().map((char, index) => (
                              <span key={index} className="flex items-center justify-center w-6 h-6 border bg-gray-50">
                                {char}
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-3 text-center italic">Grade gerada com sucesso.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 5. FOLHETIM */}
                {activeTab === 'folhetim' && (
                  <div className="flex flex-col gap-6 animate-fade-in">
                    <div className="bg-gray-50 p-4 border rounded">
                      <h3 className="font-bold mb-4">Folhetim (A Novela Serial)</h3>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div><label className="block text-xs">Autor</label><input type="text" value={formData.folhetim.author} onChange={(e) => updateField('folhetim.author', e.target.value)} className="w-full border p-2" /></div>
                        <div><label className="block text-xs">Título da Obra</label><input type="text" value={formData.folhetim.title} onChange={(e) => updateField('folhetim.title', e.target.value)} className="w-full border p-2" /></div>
                        <div><label className="block text-xs">Capítulo (Ex: CAPÍTULO X)</label><input type="text" value={formData.folhetim.chapter} onChange={(e) => updateField('folhetim.chapter', e.target.value)} className="w-full border p-2" /></div>
                        <div><label className="block text-xs">Encerramento (Ex: Continúa)</label><input type="text" value={formData.folhetim.ending} onChange={(e) => updateField('folhetim.ending', e.target.value)} className="w-full border p-2" /></div>
                      </div>
                      <label className="block text-xs">Corpo do Capítulo</label>
                      <textarea rows="10" value={formData.folhetim.paragraphs.join('\n\n')} onChange={(e) => updateField('folhetim.paragraphs', e.target.value.split('\n\n'))} className="w-full border p-2" placeholder="Digite os parágrafos separados por dupla quebra de linha (Enter Enter)." />
                    </div>
                  </div>
                )}

                {/* 6. CULTURA */}
                {activeTab === 'cultura' && (
                  <div className="flex flex-col gap-6 animate-fade-in">
                    <div className="bg-gray-50 p-4 border rounded">
                      <h3 className="font-bold mb-4">Guia Cultural da Semana</h3>
                      {formData.culturalEvents.events.map((ev, idx) => (
                        <div key={idx} className="border bg-white p-4 mb-4 rounded relative">
                          <button type="button" onClick={() => removeArrayItem('culturalEvents.events', idx)} className="absolute top-2 right-2 text-red-500 text-xs font-bold">X</button>
                          <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-xs">Gênero/Local</label><input type="text" value={ev.title} onChange={(e)=>updateArrayItem('culturalEvents.events', idx, 'title', e.target.value)} className="w-full border p-1" /></div>
                            <div><label className="block text-xs">Preços/Horário</label><input type="text" value={ev.details} onChange={(e)=>updateArrayItem('culturalEvents.events', idx, 'details', e.target.value)} className="w-full border p-1" /></div>
                          </div>
                          <label className="block text-xs mt-2">Descrição (Peça ou Filme)</label>
                          <input type="text" value={ev.description} onChange={(e)=>updateArrayItem('culturalEvents.events', idx, 'description', e.target.value)} className="w-full border p-1" />
                        </div>
                      ))}
                      <button type="button" onClick={() => addArrayItem('culturalEvents.events', {title: "Novo", description: "Descrição", details: "Detalhes"})} className="bg-gray-200 p-2 rounded text-sm w-full font-bold">+ Adicionar Evento Cultural</button>
                    </div>
                  </div>
                )}

                <div className="flex justify-end mt-4 sticky bottom-0 bg-white py-4 border-t">
                  <button type="submit" disabled={saving} className="bg-[#1a1a1a] text-white px-8 py-3 rounded font-bold hover:bg-gray-800 shadow-lg">
                    {saving ? 'Salvando...' : 'Salvar Alterações no Acervo'}
                  </button>
                </div>

              </form>
            </div>
          )}
        </main>
        {isAuthenticated && <EditorialAssistant currentManuscript={formData} />}
      </div>
    </div>
  );
}
