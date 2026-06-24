import React, { useState } from 'react';

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.addPreventDefault ? e.preventDefault() : null;
    e.preventDefault();
    if (password === '1926') {
      onLogin();
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] font-text px-4 relative">
      <div className="absolute inset-0 bg-stripes opacity-20 pointer-events-none"></div>
      
      <div className="bg-[#e6dfcf] p-8 md:p-12 border-4 border-double border-black shadow-2xl max-w-md w-full relative z-10">
        <h1 className="font-display font-black text-4xl text-center uppercase tracking-widest border-b-2 border-black pb-2 mb-6">
          Redação
        </h1>
        
        <p className="text-center italic text-sm mb-8 text-gray-800">
          Acesso restrito aos editores da Crônica Ilustrada. Insira a senha de acesso à máquina.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha..."
            className="border-2 border-black p-3 font-display text-center text-xl bg-transparent outline-none focus:bg-white transition-colors"
            autoFocus
          />
          {error && <p className="text-red-700 text-xs text-center font-bold uppercase">Acesso negado. Tente novamente.</p>}
          
          <button 
            type="submit"
            className="bg-[#1a1a1a] text-[#eee9dd] font-display font-bold uppercase tracking-widest p-3 mt-4 hover:bg-gray-800 transition-colors border-2 border-black hover:shadow-[4px_4px_0px_#eee9dd] active:translate-y-1 active:shadow-none"
          >
            Destravar Máquina
          </button>
        </form>
      </div>
    </div>
  );
}
