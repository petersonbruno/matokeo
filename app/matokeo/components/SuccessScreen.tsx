'use client';

import { useState } from 'react';

interface SuccessScreenProps {
  token: string;
}

export function SuccessScreen({ token }: SuccessScreenProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadExcel = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/download-excel?token=${token}`);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `matokeo_${token}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      alert('Kupatikana tatizo wakati wa kupakua faili.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBackToWhatsApp = () => {
    window.location.href = 'https://wa.me';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-6 animate-bounce">✅</div>
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          Matokeo yametumwa kikamilifu!
        </h1>
        <p className="text-gray-600 mb-8">
          Taarifa imejaza vizuri na Excel imepakua.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleDownloadExcel}
            disabled={isDownloading}
            className="w-full py-4 px-4 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-400 transition flex items-center justify-center gap-2"
          >
            {isDownloading ? '⏳' : '⬇'} {isDownloading ? 'Inakupakua...' : 'Pakua Excel'}
          </button>
          <button
            onClick={handleBackToWhatsApp}
            className="w-full py-4 px-4 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2"
          >
            🔙 Rudi WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
