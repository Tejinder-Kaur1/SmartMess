import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/50 dark:bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transition-colors">
        <div className="flex items-center justify-between p-5 border-b border-stone-100 dark:border-stone-800">
          <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">{title}</h3>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 text-stone-800 dark:text-stone-200">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
