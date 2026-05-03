"use client";

import { motion, AnimatePresence } from "framer-motion";

type MoreModalProps = {
  isOpen: boolean;
  onClose: () => void;
  content: string;
};

export function MoreModal({ isOpen, onClose, content }: MoreModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          // z-index: 200, чтобы точно перекрыть всё
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()} // чтобы клик по окну не закрывал его
            className="flex flex-col w-[85%] h-[85%] bg-[#252422] rounded-[24px] border border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Шапка модалки */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.04] shrink-0">
              <h3 className="text-[16px] font-sans text-[#F2F1ED]">Читать больше</h3>
              <button 
                onClick={onClose} 
                className="p-1 active:scale-90 transition-transform opacity-40 hover:opacity-80"
              >
                <img src="/icons/cross.svg" alt="Close" className="w-5 h-5 invert" />
              </button>
            </div>

            {/* Контент */}
            <div className="flex-1 overflow-y-auto p-6 hide-scrollbar">
              <p className="text-[16px] leading-relaxed whitespace-pre-wrap font-serif text-[#F2F1ED] opacity-90">
                {content}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
