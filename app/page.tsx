'use client';

import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Redirect to matokeo page
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    
    if (token) {
      window.location.href = `/matokeo?token=${token}`;
    } else {
      window.location.href = '/matokeo';
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Inakagua...</p>
      </div>
    </div>
  );
}
