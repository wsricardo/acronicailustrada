import React from 'react';

export default function ChamadasCapa({ chamadas }) {
  if (!chamadas || chamadas.length === 0) return null;

  return (
    <section className="w-full mt-8 mb-4 border-[3px] border-double border-[#2c2825] p-4 bg-[#eee9dd] shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
      <h3 className="font-display font-black uppercase text-xl md:text-2xl text-center mb-4 border-b border-[#2c2825] pb-2 tracking-widest text-[#2c2825]">
        Nesta Edição
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chamadas.map((chamada, index) => (
          <article key={index} className="flex flex-col gap-1">
            <h4 className="font-header font-bold text-lg leading-tight text-[#1a1816]">
              {chamada.headline}
            </h4>
            {chamada.summary && (
              <p className="font-text text-sm leading-snug text-gray-800 text-justify">
                {chamada.summary}
              </p>
            )}
            {chamada.page && (
              <p className="font-display text-xs font-bold uppercase text-right mt-1 italic tracking-widest text-[#2c2825]">
                — Vide pág. {chamada.page}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
