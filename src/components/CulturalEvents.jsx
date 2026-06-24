import React from 'react';

export default function CulturalEvents({ data }) {
  if (!data) return null;
  return (
    <section className="mt-8 border-[3px] border-black p-6 bg-[#e6dfcf]">
      <h3 className="font-display text-3xl font-black text-center uppercase tracking-widest border-b-[3px] border-black pb-2 mb-6">
        {data.title}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {data.events.map((event, idx) => (
          <div key={idx} className="flex flex-col gap-2">
            <h4 className="font-display font-bold text-xl uppercase tracking-tight">❖ {event.title}</h4>
            <p className="font-text text-sm text-justify leading-relaxed">
              {event.description}
            </p>
            <p className="font-text text-xs italic text-gray-800 font-semibold border-t border-dashed border-gray-500 pt-2 mt-1">
              {event.details}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
