import React, { useEffect } from 'react';

export default function AdSensePlaceholder({ slotId, format = 'auto', responsive = 'true' }) {
  useEffect(() => {
    // Inicializa o Google AdSense apenas se o script global (no index.html) já carregou 
    // e o anúncio ainda não foi preenchido.
    try {
      if (window && window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch (e) {
      console.error("AdSense Error: ", e);
    }
  }, []);

  return (
    <div className="w-full my-4 flex flex-col items-center justify-center bg-[#eaddca] border-[3px] border-double border-[#1a1a1a] p-2 print:hidden group overflow-hidden">
      {/* Título Vintage para justificar a presença do anúncio */}
      <div className="text-[10px] font-display uppercase tracking-widest text-[#2c2825] mb-1 opacity-70 group-hover:opacity-100 transition-opacity">
        — Espaço Publicitário —
      </div>

      {/* Container real do Google AdSense */}
      <div className="w-full flex justify-center bg-[#e4dcce] min-h-[100px] items-center relative">
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%' }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXX" // Substituir pelo Client ID real
          data-ad-slot={slotId || "0000000000"}  // Substituir pelo Slot ID real
          data-ad-format={format}
          data-full-width-responsive={responsive}
        />
        
        {/* Fallback visual para o ambiente de desenvolvimento local (Mock) */}
        {process.env.NODE_ENV === 'development' && (
           <div className="absolute inset-0 flex flex-col items-center justify-center border border-dashed border-[#1a1a1a] opacity-50 pointer-events-none">
             <span className="font-display font-bold text-lg text-[#1a1a1a]">Anúncio (Dev Mode)</span>
             <span className="font-text text-xs text-[#2c2825] italic">{slotId ? `Slot: ${slotId}` : 'Slot Dinâmico'}</span>
           </div>
        )}
      </div>
    </div>
  );
}
