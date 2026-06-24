import React from 'react';

export default function CartoonSection({ data }) {
  if (!data) return null;
  return (
    <section className="mt-8 border-t-[6px] border-b-[6px] border-double border-[#1a1a1a] py-6 bg-[#e2d8c3] px-4 print-adaptable-graphic">
      <h3 className="font-display text-4xl text-center font-black mb-6 uppercase tracking-widest border-b border-black pb-2 inline-block mx-auto w-full">O Cartum do Dia</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        <div className="md:col-span-6 border border-[#1a1a1a] p-1 bg-[#fff] transform -rotate-1 shadow-md hover:rotate-0 hover:scale-105 transition-all duration-500 cursor-pointer">
          <div className="border-2 border-black p-1">
            <img 
              src={data.image} 
              alt="Cartum ilustrado" 
              className="w-full h-auto image-noir"
              referrerPolicy="no-referrer"
            />
          </div>
          <p className="font-display font-medium italic text-center text-xs mt-2 text-gray-800 px-2 leading-tight">
            {data.caption}
          </p>
        </div>

        <div className="md:col-span-6 newspaper-text-column flex flex-col gap-4 text-sm leading-relaxed text-justify font-text">
          {data.paragraphs.map((p, index) => (
             <p key={index} className={index === 0 ? "drop-cap" : (index === data.paragraphs.length - 1 ? "italic text-gray-700" : "")}>
               {p}
             </p>
          ))}
        </div>

      </div>
    </section>
  );
}
