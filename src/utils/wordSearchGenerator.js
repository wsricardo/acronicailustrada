export function generateWordSearch(wordList, rows = 10, cols = 10) {
  const grid = Array.from({ length: rows }, () => Array(cols).fill(null));
  
  // Directions: [row_increment, col_increment]
  // 0: Right, 1: Down, 2: Diagonal Down-Right
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1]
  ];

  const normalize = (str) => {
    // Remove apenas espaços e pontuação, mantendo letras com acento, e converte para maiúsculo
    return str.replace(/[\s.,;:!?]/g, "").toUpperCase();
  };

  const words = wordList.map(w => normalize(w)).filter(w => w.length > 0);
  const solution = [];

  for (const word of words) {
    if (word.length > Math.max(rows, cols)) continue; // Palavra grande demais

    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 200) {
      attempts++;
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const startRow = Math.floor(Math.random() * rows);
      const startCol = Math.floor(Math.random() * cols);

      // Checar se cabe
      const endRow = startRow + dir[0] * (word.length - 1);
      const endCol = startCol + dir[1] * (word.length - 1);

      if (endRow >= rows || endCol >= cols) continue;

      // Checar conflitos
      let conflict = false;
      for (let i = 0; i < word.length; i++) {
        const r = startRow + dir[0] * i;
        const c = startCol + dir[1] * i;
        if (grid[r][c] !== null && grid[r][c] !== word[i]) {
          conflict = true;
          break;
        }
      }

      if (!conflict) {
        // Colocar a palavra
        for (let i = 0; i < word.length; i++) {
          const r = startRow + dir[0] * i;
          const c = startCol + dir[1] * i;
          grid[r][c] = word[i];
        }
        solution.push({
          word,
          start: [startRow, startCol],
          end: [endRow, endCol]
        });
        placed = true;
      }
    }
  }

  // Preencher vazios
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === null) {
        grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
      }
    }
  }

  return { grid, solution, originalWords: words };
}
