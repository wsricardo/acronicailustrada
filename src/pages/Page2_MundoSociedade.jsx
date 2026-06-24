import React from 'react';
import InternationalNews from '../components/InternationalNews';
import SecondarySection from '../components/SecondarySection';

export default function Page2_MundoSociedade({ data }) {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="text-center border-b-[4px] border-double border-black pb-2 mb-4">
        <h2 className="font-display font-black text-4xl uppercase tracking-widest">Mundo & Sociedade</h2>
        <span className="font-display italic text-sm text-gray-800">Seção 2 - A Crônica Ilustrada</span>
      </div>
      <InternationalNews data={data.internationalNews} />
      <hr className="border-t-[3px] border-black my-4" />
      <SecondarySection data={data.secondarySection} />
    </div>
  );
}
