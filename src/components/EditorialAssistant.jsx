import React, { useState, useEffect, useRef } from 'react';

export default function EditorialAssistant({ currentManuscript }) {
  const [activeTab, setActiveTab] = useState('redacao');
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState('gemini');
  const [modelName, setModelName] = useState('gemini-2.5-flash');
  const [localEndpoint, setLocalEndpoint] = useState('http://localhost:11434/api/generate');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [crawledTexts, setCrawledTexts] = useState([]);

  // Chat state
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef(null);

  // News DB State
  const [savedNewsTitle, setSavedNewsTitle] = useState('');
  
  useEffect(() => {
    const savedKey = localStorage.getItem('ai_api_key');
    const savedProvider = localStorage.getItem('ai_provider');
    const savedModel = localStorage.getItem('ai_model_name');
    const savedLocal = localStorage.getItem('ai_local_endpoint');
    if (savedKey) setApiKey(savedKey);
    if (savedProvider) setProvider(savedProvider);
    if (savedModel) setModelName(savedModel);
    if (savedLocal) setLocalEndpoint(savedLocal);
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  const saveConfig = () => {
    localStorage.setItem('ai_api_key', apiKey);
    localStorage.setItem('ai_provider', provider);
    localStorage.setItem('ai_model_name', modelName);
    localStorage.setItem('ai_local_endpoint', localEndpoint);
    alert('Configurações salvas!');
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const res = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      alert("Erro na busca.");
    }
    setIsSearching(false);
  };

  const handleCrawl = async (url) => {
    try {
      const res = await fetch('/api/ai/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      setCrawledTexts(prev => [...prev, data]);
      alert(`Texto extraído: ${data.title}`);
    } catch (err) {
      alert("Erro ao extrair texto.");
    }
  };

  const callAI = async (promptText) => {
    const context = `Você é o "Fantasma de Assis", um redator sênior da Belle Époque carioca (1920). 
Use linguagem formal, poética e da época. 
Contexto extraído da Web: ${JSON.stringify(crawledTexts)}
Manuscrito atual do usuário: ${JSON.stringify(currentManuscript)}
Seja útil para ajudar a escrever notícias. Retorne as respostas de forma conversacional.`;

    if (provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: context }] },
          contents: [{ parts: [{ text: promptText }] }]
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      return data.candidates[0].content.parts[0].text;
    } else if (provider === 'ollama') {
      const res = await fetch(localEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelName,
          prompt: context + "\n\nUsuário: " + promptText,
          stream: false
        })
      });
      const data = await res.json();
      return data.response;
    } else {
      throw new Error("Provedor não implementado neste demo.");
    }
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatInput) return;
    
    const userMsg = { role: 'user', text: chatInput };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatting(true);

    try {
      const reply = await callAI(userMsg.text);
      setChatHistory(prev => [...prev, { role: 'assistant', text: reply }]);
      // auto-fill suggested title
      setSavedNewsTitle(`Notícia Gerada (${new Date().toLocaleTimeString()})`);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'assistant', text: `Erro: ${err.message}` }]);
    }
    setIsChatting(false);
  };

  const handleSaveNews = async () => {
    if (!chatHistory.length) return alert('Nenhum texto gerado para salvar.');
    const lastAssistantMessage = [...chatHistory].reverse().find(m => m.role === 'assistant');
    if (!lastAssistantMessage) return;

    try {
      const res = await fetch('/api/news-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: savedNewsTitle || 'Sem título',
          content: lastAssistantMessage.text,
          sources: crawledTexts.map(c => c.title)
        })
      });
      if (res.ok) {
        alert('Notícia salva no banco de dados isolado!');
        setSavedNewsTitle('');
      }
    } catch(err) {
      alert("Erro ao salvar.");
    }
  };

  return (
    <div className="w-96 bg-white border-l border-gray-300 flex flex-col h-full shadow-lg">
      <div className="bg-[#1a1a1a] text-[#eee9dd] p-4 text-center font-display border-b">
        <h2 className="text-xl font-bold tracking-widest uppercase">Fantasma de Assis</h2>
        <p className="text-xs italic text-gray-400">Seu assistente editorial IA</p>
      </div>

      <div className="flex border-b bg-gray-50 text-sm">
        <button onClick={() => setActiveTab('redacao')} className={`flex-1 p-2 font-bold ${activeTab === 'redacao' ? 'border-b-2 border-black' : 'text-gray-500'}`}>🖋️ Redação</button>
        <button onClick={() => setActiveTab('pautas')} className={`flex-1 p-2 font-bold ${activeTab === 'pautas' ? 'border-b-2 border-black' : 'text-gray-500'}`}>🔎 Pautas</button>
        <button onClick={() => setActiveTab('config')} className={`flex-1 p-2 font-bold ${activeTab === 'config' ? 'border-b-2 border-black' : 'text-gray-500'}`}>⚙️ Config</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
        
        {activeTab === 'config' && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">Provedor IA</label>
              <select value={provider} onChange={e => setProvider(e.target.value)} className="w-full border p-2 text-sm bg-white">
                <option value="gemini">Google Gemini</option>
                <option value="ollama">Ollama (Modelo Local)</option>
                <option value="chatgpt">OpenAI ChatGPT (Mock)</option>
                <option value="claude">Anthropic Claude (Mock)</option>
              </select>
            </div>
            
            {provider === 'gemini' && (
              <div>
                <label className="block text-xs font-bold mb-1">API Key</label>
                <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} className="w-full border p-2 text-sm" placeholder="AIzaSy..." />
              </div>
            )}
            
            {provider === 'ollama' && (
              <div>
                <label className="block text-xs font-bold mb-1">URL Endpoint Local</label>
                <input type="text" value={localEndpoint} onChange={e => setLocalEndpoint(e.target.value)} className="w-full border p-2 text-sm" />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold mb-1">Nome do Modelo</label>
              <input type="text" value={modelName} onChange={e => setModelName(e.target.value)} className="w-full border p-2 text-sm" placeholder="gemini-2.5-flash" />
            </div>

            <button onClick={saveConfig} className="bg-black text-white p-2 font-bold mt-2">Salvar Configurações</button>
          </div>
        )}

        {activeTab === 'pautas' && (
          <div className="flex flex-col h-full">
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <input type="text" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Pesquisar notícias..." className="flex-1 border p-2 text-sm" />
              <button type="submit" disabled={isSearching} className="bg-black text-white px-3 font-bold text-sm">{isSearching ? '...' : '🔍'}</button>
            </form>
            
            <div className="flex-1 overflow-y-auto space-y-3">
              {searchResults.map((res, i) => (
                <div key={i} className="border p-3 text-sm bg-gray-50 rounded">
                  <a href={res.url} target="_blank" rel="noreferrer" className="font-bold text-blue-800 hover:underline">{res.title}</a>
                  <p className="text-xs text-gray-600 mt-1 mb-2">{res.snippet}</p>
                  <button onClick={() => handleCrawl(res.url)} className="text-xs border border-black px-2 py-1 hover:bg-gray-200">📑 Extrair e Ler</button>
                </div>
              ))}
            </div>

            {crawledTexts.length > 0 && (
              <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 text-xs">
                <strong>Fontes em Memória ({crawledTexts.length}):</strong>
                <ul className="list-disc pl-4 mt-1">
                  {crawledTexts.map((c, i) => <li key={i} className="truncate">{c.title}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'redacao' && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto border p-3 mb-3 bg-[#fbf9f4] flex flex-col gap-3 font-serif rounded">
              {chatHistory.length === 0 && (
                <div className="text-center text-gray-400 text-sm mt-10 italic">
                  "Diga-me, meu caro editor, o que traremos nas páginas de hoje?"
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} className={`p-2 rounded text-sm ${msg.role === 'user' ? 'bg-blue-100 self-end max-w-[85%]' : 'bg-gray-200 self-start max-w-[95%] border border-gray-300'}`}>
                  {msg.role === 'assistant' && <div className="text-[10px] font-bold mb-1 uppercase tracking-wider text-gray-500">Fantasma:</div>}
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                </div>
              ))}
              {isChatting && <div className="text-xs text-gray-500 italic">O fantasma está redigindo...</div>}
              <div ref={chatEndRef} />
            </div>
            
            <form onSubmit={handleChat} className="flex gap-2">
              <input type="text" value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Instrua o redator..." className="flex-1 border p-2 text-sm" />
              <button type="submit" disabled={isChatting} className="bg-black text-white px-3 font-bold">Enviar</button>
            </form>

            {chatHistory.some(m => m.role === 'assistant') && (
              <div className="mt-4 pt-4 border-t flex flex-col gap-2">
                <input type="text" value={savedNewsTitle} onChange={e=>setSavedNewsTitle(e.target.value)} placeholder="Título da Notícia" className="border p-2 text-sm" />
                <button onClick={handleSaveNews} className="bg-green-700 text-white p-2 font-bold text-sm">💾 Salvar no Banco Isolado</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
