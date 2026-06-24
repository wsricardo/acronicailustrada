import React from 'react';

export default function InternationalNews({ data }) {
  if (!data) return null;
  return (
    <section className="mt-8 border-[3px] border-[#1a1a1a] p-4 bg-[#e8e2d2] relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-[#1a1a1a] bg-stripes opacity-20"></div>
      
      <div className="text-center mb-6">
        <h3 className="font-display text-3xl font-black uppercase tracking-[0.2em] border-b border-black pb-2 inline-block">{data.title}</h3>
        <p className="text-xs font-display italic mt-1 text-gray-700">{data.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-text text-sm leading-relaxed">
        {data.news.map((item, i) => (
        <div key={i} className="border-r border-dashed border-gray-500 pr-4 last:border-0 last:pr-0">
          <span className="font-bold uppercase text-xs tracking-widest block mb-1">{item.location}</span>
          <h4 className="font-display font-bold text-lg leading-tight mb-2">{item.headline}</h4>
          <p className="text-justify">
            {item.body}
          </p>
        </div>
        ))}
      </div>
    </section>
  );
}
