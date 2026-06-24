import React from 'react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex justify-between items-center mt-12 mb-4 px-2 select-none z-50 relative">
      <div 
        className={`page-fold-left cursor-pointer flex flex-col justify-end p-2 transition-opacity duration-300 ${currentPage === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:opacity-80'}`}
        onClick={handlePrev}
      >
        <span className="font-display italic text-sm text-gray-800 drop-shadow-sm">Voltar para a Pág. {currentPage - 1}</span>
      </div>
      
      <div className="font-display font-bold text-lg text-gray-500 uppercase tracking-widest px-4 border-b border-gray-400">
        {currentPage} - {totalPages}
      </div>

      <div 
        className={`page-fold-right cursor-pointer flex flex-col justify-end items-end p-2 transition-opacity duration-300 ${currentPage === totalPages ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:opacity-80'}`}
        onClick={handleNext}
      >
        <span className="font-display italic text-sm text-gray-800 drop-shadow-sm">Continuar na Pág. {currentPage + 1}</span>
      </div>
    </div>
  );
}
