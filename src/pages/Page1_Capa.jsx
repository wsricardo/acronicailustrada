import React from 'react';
import Header from '../components/Header';
import LeadArticle from '../components/LeadArticle';

import ChamadasCapa from '../components/ChamadasCapa';

export default function Page1_Capa({ data }) {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <Header data={data.header} editionId={data.id} />
      <LeadArticle data={data.leadArticle} />
      {data.chamadas && <ChamadasCapa chamadas={data.chamadas} />}
    </div>
  );
}
