import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Page1_Capa from './Page1_Capa';
import Page2_MundoSociedade from './Page2_MundoSociedade';
import Page3_Lazer from './Page3_Lazer';
import Page4_Cultura from './Page4_Cultura';

export default function PrintEdition() {
  const { ano, numero } = useParams();
  const navigate = useNavigate();
  const [editionData, setEditionData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/editions/edition-${ano}-${numero}.json`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => {
        setEditionData(data);
      })
      .catch(err => {
        console.error(err);
        setError(true);
      });
  }, [ano, numero]);

  if (error) return <div className="text-center mt-32 font-display text-2xl">Edição não encontrada para impressão.</div>;
  if (!editionData) return <div className="text-center mt-32 font-display text-2xl">Preparando as matrizes tipográficas...</div>;

  return (
    <>
      <div className="paper-overlay absolute inset-0 w-full h-full" style={{ position: 'fixed', zIndex: -1 }}></div>
      
      <div className="min-h-screen font-text max-w-full w-full mx-auto flex flex-col relative z-10 print-layout bg-[#E6DFC8]">
        <main className="flex-grow w-full">
          
          <div className="print-page w-full p-[2cm] page-break-after">
            <Page1_Capa data={editionData} />
          </div>

          <div className="print-page w-full p-[2cm] page-break-after">
            <Page2_MundoSociedade data={editionData} />
          </div>

          <div className="print-page w-full p-[2cm] page-break-after">
            <Page3_Lazer data={editionData} />
          </div>

          <div className="print-page w-full p-[2cm]">
            <Page4_Cultura data={editionData} onOpenArchive={() => {}} />
          </div>
          
        </main>
      </div>
    </>
  );
}
