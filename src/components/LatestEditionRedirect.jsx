import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

export default function LatestEditionRedirect() {
  const [latestEdition, setLatestEdition] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/editions/list.json')
      .then(res => res.json())
      .then(data => {
        // As edições já vêm ordenadas da mais nova (maior ID) para a mais antiga.
        // Pegar a primeira que esteja "published".
        const publishedEditions = data.filter(ed => ed.status === 'published');
        if (publishedEditions.length > 0) {
          setLatestEdition({ ano: publishedEditions[0].ano || 2026, id: publishedEditions[0].id });
        } else {
          // Se não tiver nenhuma publicada, vai pra 1 por fallback
          setLatestEdition({ ano: 2026, id: 1 });
        }
      })
      .catch(err => {
        console.error("Erro ao buscar a última edição", err);
        setError(true);
      });
  }, []);

  if (error) return <div className="min-h-screen flex items-center justify-center font-display text-2xl text-red-800">Erro ao carregar os arquivos do jornal.</div>;
  if (latestEdition === null) return <div className="min-h-screen flex items-center justify-center font-display text-2xl">Carregando a Crônica Ilustrada...</div>;

  return <Navigate to={`/edicao/${latestEdition.ano}/${latestEdition.id}`} replace />;
}
