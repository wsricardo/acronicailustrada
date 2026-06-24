import React from 'react';
import FolhetimSection from '../components/FolhetimSection';
import CulturalEvents from '../components/CulturalEvents';
import Footer from '../components/Footer';
import AdSensePlaceholder from '../components/AdSensePlaceholder';

export default function Page4_Cultura({ data, onOpenArchive }) {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="text-center border-b-[4px] border-double border-black pb-2 mb-4">
        <h2 className="font-display font-black text-4xl uppercase tracking-widest">Cultura & Artes</h2>
        <span className="font-display italic text-sm text-gray-800">Seção 4 - A Crônica Ilustrada</span>
      </div>
      <FolhetimSection data={data.folhetim} />
      <CulturalEvents data={data.culturalEvents} />
      <Footer onOpenArchive={onOpenArchive} />
      <div className="mt-8 border-t-2 border-black pt-4">
        <AdSensePlaceholder slotId="0987654321" format="horizontal" />
      </div>
    </div>
  );
}
