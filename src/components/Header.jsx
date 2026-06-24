import React from 'react';

export default function Header({ data, editionId }) {
  if (!data) return null;
  return (
    <header className="flex flex-col items-center justify-center text-center mb-6 relative">
      <div className="w-full flex justify-between items-end border-b-2 border-black pb-1 mb-2 px-2 uppercase tracking-wide font-display font-bold text-xs md:text-sm">
        <span className="text-left leading-tight" dangerouslySetInnerHTML={{ __html: data.redacao }}></span>
        <span className="hidden md:inline font-black tracking-widest text-lg">{data.titulo_principal}</span>
        <span className="text-right leading-tight" dangerouslySetInnerHTML={{ __html: data.dados_direito }}></span>
      </div>
      
      <h1 className="newspaper-title text-7xl md:text-[8rem] lg:text-[10rem] mb-2 text-[#2c2825] leading-none tracking-tighter w-full pb-1 hover:opacity-80 transition-opacity cursor-default text-center">
        A Crônica Ilustrada
      </h1>

      {data.titulo_display && (
        <h2 className="font-header text-4xl md:text-6xl text-center text-[#2c2825] leading-tight tracking-tight w-full border-b-[6px] border-double border-[#2c2825] pb-3 mb-2 px-4 uppercase">
          {data.titulo_display}
        </h2>
      )}
      
      <div className="w-full border-b-[6px] border-double border-black py-1 uppercase tracking-widest text-sm md:text-base font-display font-bold flex justify-center items-center gap-4 relative">
        <span>ANNO BOM</span>
        <span className="hidden md:inline">✦</span>
        <span>{data.dateline}</span>
        <span className="hidden md:inline">✦</span>
        <span>{data.preco}</span>
        
        {/* PDF Download Button - Hidden in Print Mode */}
        {editionId && (
          <a 
            href={`/pdfs/edition-${editionId}.pdf`} 
            download={`A_Cronica_Ilustrada_Ed_${editionId}.pdf`}
            title="Levar Edição em PDF"
            className="absolute right-2 print:hidden no-print bg-[#2c2825] text-[#eee9dd] px-2 py-0.5 text-xs rounded hover:bg-gray-700 transition-colors flex items-center gap-1"
          >
            🖨️ PDF
          </a>
        )}
      </div>
    </header>
  );
}
