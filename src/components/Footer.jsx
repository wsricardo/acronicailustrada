import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer({ onOpenArchive }) {
  return (
    <footer className="mt-16 pt-10 flex flex-col items-center justify-center text-center gap-6 pb-12">
      <h4 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-widest text-[#1a1a1a] border-b-2 border-[#1a1a1a] pb-2">
        Editado por: Redação da Crônica Ilustrada
      </h4>

      <p className="font-display italic text-xl md:text-2xl text-gray-800 max-w-3xl mx-auto leading-relaxed px-4 mt-4">
        "Aos nossos distintos e gentis leitores, o nosso mais sincero agradecimento por acompanharem, edição após edição, as letras e devaneios de nossa amada urbe. Que estas finas páginas continuem lhes servindo de íntimo abrigo e constante inspiração."
      </p>

      <nav className="mt-8 flex justify-center w-full border-t border-b border-[#1a1a1a] py-6 uppercase tracking-[0.3em] font-text font-bold text-sm md:text-base">
        <button 
          onClick={onOpenArchive}
          className="hover:text-gray-600 transition-colors duration-300 focus:outline-none hover:underline underline-offset-4 decoration-2"
        >
          Pesquisar no Arquivo do Jornal
        </button>
      </nav>

      <div className="font-text text-xs mt-4 text-gray-700 uppercase tracking-widest font-semibold">
        Anno Domini 1926 — Impresso com zelo nas ofícinas da capital
      </div>
    </footer>
  );
}
