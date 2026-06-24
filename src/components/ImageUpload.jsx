import React, { useState } from 'react';

export default function ImageUpload({ currentUrl, onUploadSuccess, label }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Converte para Base64 no próprio navegador
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64 = reader.result;
      
      setUploading(true);
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            base64: base64
          })
        });
        
        if (res.ok) {
          const data = await res.json();
          onUploadSuccess(data.url); // Envia a URL local gerada de volta pro formulário
        } else {
          alert('Falha ao fazer upload da imagem.');
        }
      } catch (err) {
        alert('Erro de conexão ao fazer upload.');
      }
      setUploading(false);
    };
  };

  return (
    <div className="flex flex-col gap-2 p-4 border rounded bg-white shadow-sm">
      <span className="font-bold text-xs uppercase text-gray-600">{label || "Upload de Imagem"}</span>
      
      {currentUrl && (
        <div className="mb-2 w-full max-h-32 overflow-hidden flex items-center justify-center bg-gray-100 rounded border">
          <img src={currentUrl} alt="Preview" className="object-contain h-full" />
        </div>
      )}

      <div className="flex items-center gap-4">
        <label className={`cursor-pointer bg-[#1a1a1a] text-white px-4 py-2 rounded text-sm font-bold hover:bg-gray-800 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
          {uploading ? 'Enviando...' : 'Escolher do Computador'}
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileChange} 
            disabled={uploading}
          />
        </label>
        
        <input 
          type="text" 
          value={currentUrl || ''} 
          readOnly 
          placeholder="A URL aparecerá aqui"
          className="flex-1 border p-2 text-sm bg-gray-50 text-gray-500 rounded outline-none" 
        />
      </div>
    </div>
  );
}
