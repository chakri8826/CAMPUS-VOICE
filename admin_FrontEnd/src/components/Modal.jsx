import { useEffect } from 'react';

export default function Modal({ open, onClose, children }) {
  useEffect(() => {
    if (!open) return;
    const handleEsc = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative" onClick={e => e.stopPropagation()}>
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl" onClick={onClose}>&times;</button>
        {children}
      </div>
    </div>
  );
} 