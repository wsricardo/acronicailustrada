import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function ArchiveModal({ isOpen, onClose }) {
  const [editions, setEditions] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/editions/list.json')
        .then(res => res.json())
        .then(data => {
          const published = data.filter(ed => ed.status === 'published');
          setEditions(published);
        })
        .catch(err => console.error("Erro ao carregar edições", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop com desfoque */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Conteúdo do Modal */}
      <div className="relative bg-[#e6dfcf] border-[4px] border-double border-[#1a1a1a] shadow-2xl p-6 md:p-10 max-w-lg w-full animate-fade-in">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 font-display font-bold text-2xl hover:text-gray-600 transition-colors focus:outline-none"
          aria-label="Fechar"
        >
          ✕
        </button>

        <h3 className="font-display font-black text-3xl text-center uppercase tracking-widest border-b-[3px] border-black pb-3 mb-6">
          Acervo Histórico
        </h3>
        
        <p className="font-text text-center italic text-sm text-gray-700 mb-6">
          Selecione uma edição anterior para revisitar os grandes acontecimentos.
        </p>

        <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
          {editions.length === 0 ? (
            <p className="text-center font-display italic text-gray-600">Buscando nos arquivos...</p>
          ) : (
            editions.map((edition) => (
              <Link 
                key={edition.id}
                to={`/edicao/${edition.ano}/${edition.id}`}
                onClick={onClose}
                className="group border border-[#1a1a1a] p-4 bg-[#e8e2d2] hover:bg-[#1a1a1a] hover:text-[#eee9dd] transition-all duration-300 flex flex-col items-center cursor-pointer"
              >
                <span className="font-text text-xs uppercase tracking-widest mb-1 group-hover:text-gray-300">
                  {edition.date}
                </span>
                <strong className="font-display text-xl font-bold uppercase tracking-tight text-center">
                  Edição Nº {edition.id}: {edition.title}
                </strong>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

