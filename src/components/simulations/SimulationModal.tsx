import React from 'react';
import { X } from 'lucide-react';

type SimulationModalProps = {
  open: boolean;
  onClose: () => void;
  src: string;            // e.g. "/simulations/gcd-lcm.html"
  title?: string;
};

const SimulationModal: React.FC<SimulationModalProps> = ({ open, onClose, src, title = 'Симуляция' }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl h-[85vh] bg-white rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()} // prevent close on inner clicks
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 h-12 bg-white/90 border-b border-gray-200 flex items-center justify-between px-4 z-10">
          <div className="font-semibold text-gray-800">{title}</div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Iframe */}
        <iframe
          src={src}
          title={title}
          className="absolute top-12 left-0 w-full h-[calc(85vh-3rem)] border-0"
          allow="fullscreen"
        />
      </div>
    </div>
  );
};

export default SimulationModal;
