import React from 'react';

export default function LeadArticle({ data }) {
  if (!data) return null;
  return (
    <section className="w-full">
      <article className="newspaper-text-column-4 text-[15px] leading-snug text-justify font-text">
        {data.paragraphs.map((p, index) => (
          <p key={index} className={index === 0 ? "drop-cap" : "mt-4"}>{p}</p>
        ))}
        
        <div className="my-4 border border-[#1a1a1a] p-1 break-inside-avoid">
           <img 
             src={data.image.src} 
             alt={data.image.alt}
             className="w-full h-auto image-noir object-cover hover:sepia-[.3] transition-all duration-700"
             referrerPolicy="no-referrer"
           />
           <p className="text-center font-display italic text-[10px] leading-tight mt-1 text-gray-800">
             {data.image.caption}
           </p>
        </div>
        
        {data.paragraphs_after_image.map((p, index) => (
          <p key={index} className="mt-4">{p}</p>
        ))}
        
        <h4 className="font-display font-bold text-lg uppercase text-center mt-6 mb-2 border-y border-black py-1">
          {data.sub_article.title}
        </h4>
        {data.sub_article.paragraphs.map((p, index) => (
          <p key={index} className="mt-2">{p}</p>
        ))}
      </article>
    </section>
  );
}
