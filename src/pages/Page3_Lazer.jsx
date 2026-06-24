import React from 'react';
import SportsSection from '../components/SportsSection';
import CartoonSection from '../components/CartoonSection';
import WordSearch from '../components/WordSearch';

export default function Page3_Lazer({ data }) {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="text-center border-b-[4px] border-double border-black pb-2 mb-4">
        <h2 className="font-display font-black text-4xl uppercase tracking-widest">Lazer & Desportos</h2>
        <span className="font-display italic text-sm text-gray-800">Seção 3 - A Crônica Ilustrada</span>
      </div>
      <SportsSection data={data.sports} />
      <CartoonSection data={data.cartoon} />
      <WordSearch data={data.puzzle} />
    </div>
  );
}
