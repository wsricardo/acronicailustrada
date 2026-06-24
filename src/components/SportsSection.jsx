import React from 'react';

export default function SportsSection({ data }) {
  if (!data) return null;
  return (
    <section className="mt-8 border-t-[4px] border-b-[4px] border-black py-4">
      <h3 className="font-display text-2xl font-black uppercase tracking-widest border-b-2 border-black pb-1 mb-4">{data.title}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h4 className="font-display font-bold text-xl leading-tight mb-2 uppercase">{data.article1.title}</h4>
          <p className="font-text text-sm text-justify leading-relaxed">
            {data.article1.body}
          </p>
        </div>
        
        <div className="flex gap-4 items-start">
          {data.article2.image && (
          <div className="w-1/3 border-2 border-black p-1">
            <img 
              src={data.article2.image} 
              alt="Imagem esporte" 
              className="w-full h-auto image-noir"
              referrerPolicy="no-referrer"
            />
          </div>
          )}
          <div className="w-2/3 font-text text-sm text-justify leading-relaxed">
            <h4 className="font-display font-bold text-lg mb-1 uppercase">{data.article2.title}</h4>
            <p>
              {data.article2.body}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
