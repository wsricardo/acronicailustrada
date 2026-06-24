import React, { useState, useEffect } from 'react';

export default function WordSearch({ data }) {
  if (!data || !data.grid || data.grid.length === 0) return null;

  const [foundWords, setFoundWords] = useState([]);
  const [selection, setSelection] = useState({ isDragging: false, start: null, current: null });
  const [showToast, setShowToast] = useState(false);

  // Palavras originais limpas, usando a mesma lógica do gerador (removendo espaços e mantendo acentos)
  const wordsToFind = (data.words || "").split(',').map(w => w.replace(/[\s.,;:!?]/g, "").toUpperCase()).filter(w => w);

  // Checa se o puzzle foi concluído
  useEffect(() => {
    if (wordsToFind.length > 0 && foundWords.length === wordsToFind.length) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    }
  }, [foundWords, wordsToFind.length]);

  // Função para pegar a linha entre dois pontos
  const getLine = (p1, p2) => {
    if (!p1 || !p2) return [];
    const line = [];
    const dr = Math.sign(p2[0] - p1[0]);
    const dc = Math.sign(p2[1] - p1[1]);
    let r = p1[0];
    let c = p1[1];
    
    // Se não for reta/diagonal perfeita, apenas ignora
    const distR = Math.abs(p2[0] - p1[0]);
    const distC = Math.abs(p2[1] - p1[1]);
    if (distR !== 0 && distC !== 0 && distR !== distC) return [p1];

    const len = Math.max(distR, distC);
    for (let i = 0; i <= len; i++) {
      line.push([r, c]);
      r += dr;
      c += dc;
    }
    return line;
  };

  const handlePointerDown = (r, c) => {
    setSelection({ isDragging: true, start: [r, c], current: [r, c] });
  };

  const handlePointerEnter = (r, c) => {
    if (selection.isDragging) {
      setSelection(prev => ({ ...prev, current: [r, c] }));
    }
  };

  const handlePointerUp = () => {
    if (!selection.isDragging) return;
    
    const line = getLine(selection.start, selection.current);
    // Pega a string formada
    let selectedWord = "";
    let reverseWord = "";
    line.forEach(([r, c]) => {
      selectedWord += data.grid[r][c];
    });
    reverseWord = selectedWord.split('').reverse().join('');

    // Verifica se a palavra está na lista
    let found = null;
    if (wordsToFind.includes(selectedWord) && !foundWords.includes(selectedWord)) found = selectedWord;
    else if (wordsToFind.includes(reverseWord) && !foundWords.includes(reverseWord)) found = reverseWord;

    if (found) {
      setFoundWords(prev => [...prev, found]);
    }

    setSelection({ isDragging: false, start: null, current: null });
  };

  // Verifica se uma célula está na seleção atual
  const isCellInLine = (r, c, line) => {
    return line.some(p => p[0] === r && p[1] === c);
  };

  // Pega todas as células das palavras encontradas a partir da solution salva
  // Como simplificação, pegamos do state: recalculamos as linhas pra marcar
  const getFoundCells = () => {
    const cells = [];
    data.solution.forEach(sol => {
      if (foundWords.includes(sol.word)) {
        const line = getLine(sol.start, sol.end);
        cells.push(...line);
      }
    });
    return cells;
  };

  const foundCells = getFoundCells();
  const currentLine = selection.isDragging ? getLine(selection.start, selection.current) : [];

  return (
    <div className="border-[3px] border-[#1a1a1a] p-4 bg-[#f4ecd8] max-w-md mx-auto my-6 relative select-none print-compact-graphic">
      <h4 className="font-display font-black text-xl text-center uppercase border-b-2 border-black pb-1 mb-4 tracking-widest">
        Caça-Palavras
      </h4>
      <p className="font-text text-xs italic text-center mb-4 text-gray-800">
        Encontre as palavras: {wordsToFind.join(', ')}
      </p>
      
      <div 
        className="grid gap-1 font-mono text-center text-lg font-bold" 
        style={{ gridTemplateColumns: `repeat(${data.grid[0].length}, minmax(0, 1fr))` }}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchEnd={handlePointerUp}
      >
        {data.grid.map((row, rIndex) => (
          row.map((char, cIndex) => {
            const isFound = isCellInLine(rIndex, cIndex, foundCells);
            const isCurrent = isCellInLine(rIndex, cIndex, currentLine);
            
            let bgClass = "bg-transparent text-black border-transparent";
            if (isFound) bgClass = "bg-[#1a1a1a] text-white border-[#1a1a1a]";
            else if (isCurrent) bgClass = "bg-gray-400 text-white border-gray-400";
            else bgClass = "hover:border-black cursor-pointer";

            return (
              <span 
                key={`${rIndex}-${cIndex}`} 
                onMouseDown={() => handlePointerDown(rIndex, cIndex)}
                onMouseEnter={() => handlePointerEnter(rIndex, cIndex)}
                onTouchStart={() => handlePointerDown(rIndex, cIndex)}
                className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 transition-colors border ${bgClass}`}
              >
                {char}
              </span>
            );
          })
        ))}
      </div>
      
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {wordsToFind.map(w => (
          <span key={w} className={`text-xs font-bold px-2 py-1 border ${foundWords.includes(w) ? 'line-through text-gray-400 border-gray-300' : 'border-black text-black'}`}>
            {w}
          </span>
        ))}
      </div>

      <p className="font-text text-[10px] text-right mt-4 text-gray-600">
        Clique e arraste nas letras para marcar.
      </p>

      {/* Toast de Conclusão */}
      {showToast && (
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-2 rounded-sm shadow-xl animate-fade-in z-50 border-2 border-white">
          <span className="font-display font-black tracking-widest text-sm uppercase">Enigma Concluído!</span>
        </div>
      )}
    </div>
  );
}
