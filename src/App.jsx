import React, { useState, useEffect } from 'react';
import { Routes, Route, useParams, useNavigate, Navigate } from 'react-router-dom';
import Page1_Capa from './pages/Page1_Capa';
import Page2_MundoSociedade from './pages/Page2_MundoSociedade';
import Page3_Lazer from './pages/Page3_Lazer';
import Page4_Cultura from './pages/Page4_Cultura';
import Pagination from './components/Pagination';
import ArchiveModal from './components/ArchiveModal';
import AdminPanel from './pages/AdminPanel';

import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';

function EditionReader() {
  const { ano, numero } = useParams();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [direction, setDirection] = useState(1);
  const totalPages = 4;
  const [editionData, setEditionData] = useState(null);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
    setEditionData(null);
    setError(false);

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
        setTimeout(() => navigate('/', { replace: true }), 2000);
      });
  }, [ano, numero, navigate]);

  if (error) return <div className="text-center mt-32 font-display text-2xl">Edição não encontrada. Redirecionando...</div>;
  if (!editionData) return <div className="text-center mt-32 font-display text-2xl">Buscando nos arquivos...</div>;

  const title = `${editionData.header?.titulo_display || 'A Crônica Ilustrada'} - Edição ${numero}/${ano}`;
  const description = editionData.leadArticle?.paragraphs?.[0]?.substring(0, 150) + "..." || "Leia as últimas notícias de nossa época.";

  const handlePageChange = (newPage) => {
    setDirection(newPage > currentPage ? 1 : -1);
    setCurrentPage(newPage);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 1:
        return <Page1_Capa data={editionData} />;
      case 2:
        return <Page2_MundoSociedade data={editionData} />;
      case 3:
        return <Page3_Lazer data={editionData} />;
      case 4:
        return <Page4_Cultura data={editionData} onOpenArchive={() => setIsArchiveOpen(true)} />;
      default:
        return <Page1_Capa data={editionData} />;
    }
  };

  const pageVariants = {
    initial: (dir) => ({
      opacity: 0,
      x: dir > 0 ? 50 : -50,
      rotateY: dir > 0 ? 10 : -10,
    }),
    in: {
      opacity: 1,
      x: 0,
      rotateY: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    out: (dir) => ({
      opacity: 0,
      x: dir < 0 ? 50 : -50,
      rotateY: dir < 0 ? -10 : 10,
      transition: { duration: 0.4, ease: "easeIn" }
    })
  };

  return (
    <>
      <div className="paper-overlay"></div>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={editionData.leadArticle?.image?.src || editionData.secondarySection?.boemia_image?.src || 'https://www.acronicailustrada.com.br/og-image.png'} />
        <meta property="og:url" content={`https://www.acronicailustrada.com.br/edicao/${ano}/${numero}`} />
        <meta property="og:type" content="article" />
      </Helmet>
      <div className="min-h-screen p-4 md:p-8 font-text max-w-6xl mx-auto flex flex-col pt-8 pb-8 relative z-10 overflow-hidden" style={{ perspective: "1000px" }}>
        <main className="flex-grow relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentPage}
              custom={direction}
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              className="w-full"
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={handlePageChange} 
        />
      </div>
      <ArchiveModal isOpen={isArchiveOpen} onClose={() => setIsArchiveOpen(false)} />
    </>
  );
}

import LatestEditionRedirect from './components/LatestEditionRedirect';
import PrintEdition from './pages/PrintEdition';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LatestEditionRedirect />} />
      <Route path="/edicao/:ano/:numero" element={<EditionReader />} />
      <Route path="/edicao/:ano/:numero/imprimir" element={<PrintEdition />} />
      {import.meta.env.DEV && <Route path="/admin" element={<AdminPanel />} />}
    </Routes>
  );
}
