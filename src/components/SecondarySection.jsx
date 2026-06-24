import React from 'react';
import AdSensePlaceholder from './AdSensePlaceholder';

export default function SecondarySection({ data }) {
  if (!data) return null;
  return (
    <section className="grid grid-cols-1 md:grid-cols-12 gap-8">
      <div className="md:col-span-8">
        <article className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-display text-2xl font-bold mb-3 uppercase tracking-tight border-b-2 border-black pb-1 hover:bg-[#1a1a1a] hover:text-[#eee9dd] transition-colors duration-300">
              {data.main_article.title}
            </h4>
            <p className="text-base text-justify leading-relaxed">
              {data.main_article.body}
            </p>
            <blockquote className="my-6 px-4 py-4 border-y-4 border-double border-[#1a1a1a] bg-[#e4dcce] font-display text-lg text-center shadow-sm text-gray-900">
              <span className="text-3xl leading-none font-bold text-gray-500 block mb-1 font-serif">“</span>
              <p className="italic leading-tight">
                {data.main_article.quote.text}
              </p>
              <footer className="text-xs font-text not-italic mt-2 text-right font-semibold text-gray-800 uppercase tracking-widest">
                — {data.main_article.quote.author}
              </footer>
            </blockquote>
          </div>
          <div className="border-[3px] border-black p-1 h-full overflow-hidden flex flex-col group cursor-pointer">
             <img 
               src={data.boemia_image.src} 
               alt={data.boemia_image.alt}
               className="w-full flex-grow object-cover image-noir group-hover:scale-105 transition-transform duration-700 ease-in-out"
               referrerPolicy="no-referrer"
             />
             <span className="font-display font-bold text-center text-xs uppercase pt-1 tracking-widest border-t border-black mt-1 group-hover:bg-[#1a1a1a] group-hover:text-white transition-colors duration-500">
               {data.boemia_image.caption}
             </span>
          </div>
        </article>
      </div>
      
      <aside className="md:col-span-4 border-t-[4px] md:border-t-0 md:border-l-[4px] border-double border-[#1a1a1a] md:pl-6 pt-6 md:pt-0 flex flex-col gap-6">
        
        {data.ads[0] && (
        <div className="border border-[#1a1a1a] p-3 text-center flex flex-col gap-2 bg-[#e6dfcf] shadow-[2px_2px_0px_#1a1a1a] mb-6">
          <h5 className="font-display font-black text-xl uppercase tracking-widest border-b border-black pb-1 mb-1">Secção de Annúncios</h5>
          {data.ads[0].image && (
          <img 
            src={data.ads[0].image} 
            alt="Annúncio"
            className="w-full h-28 object-cover image-noir mb-1 border border-black"
            referrerPolicy="no-referrer"
          />
          )}
          <strong className="font-display text-lg leading-tight" dangerouslySetInnerHTML={{ __html: data.ads[0].title }}></strong>
          <span className="italic text-xs text-gray-700 leading-tight" dangerouslySetInnerHTML={{ __html: data.ads[0].body }}></span>
        </div>
        )}
        
        {/* Bloco Dinâmico do Google AdSense */}
        <AdSensePlaceholder slotId="1234567890" />
      </aside>
    </section>
  );
}
