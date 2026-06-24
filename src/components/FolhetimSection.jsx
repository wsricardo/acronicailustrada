import React from 'react';

export default function FolhetimSection({ data }) {
  if (!data) return null;
  return (
    <section className="border-t-[8px] border-double border-black pt-4">
      <div className="flex flex-col items-center justify-center mb-4">
        <h4 className="font-display font-black text-2xl uppercase tracking-[0.3em] border-b-2 border-black pb-1 mb-1">Folhetim</h4>
        <span className="font-display italic text-sm text-gray-800">{data.author}</span>
        <h5 className="font-display font-bold text-3xl uppercase tracking-widest mt-2 hover:tracking-[0.4em] transition-all duration-500 cursor-default">{data.title}</h5>
        <span className="text-xs uppercase tracking-widest text-gray-600 mt-1">{data.translator}</span>
      </div>
      
      <div className="newspaper-text-column-4 text-sm leading-snug text-justify font-text">
        <h6 className="font-display font-bold text-center text-lg mb-2" dangerouslySetInnerHTML={{ __html: data.chapter }}></h6>
        <p className="italic text-center text-xs mb-4">{data.note}</p>
        
        {data.paragraphs.map((p, idx) => (
           <p key={idx} className="mb-2">{p}</p>
        ))}
        
        <p className="mb-2 text-center italic mt-4">
          {data.ending}
        </p>
      </div>
    </section>
  );
}
