"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type MoreModalProps = {
  isOpen: boolean;
  onClose: () => void;
  content: string;
};

export function MoreModal({ isOpen, onClose, content }: MoreModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay - один в один как в меню */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={onClose}
            className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm"
          />

          <motion.aside
            // Анимация раскрытия снизу вверх через clipPath
            initial={{ clipPath: "inset(100% 0 0 0)" }} 
            animate={{ clipPath: "inset(0% 0 0 0)" }}
            exit={{ clipPath: "inset(100% 0 0 0)" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[120] h-dvh w-full bg-[#252422] flex flex-col shadow-2xl"
          >
            {/* Header - без разделительной полоски */}
            <div className="flex items-center justify-between px-6 pt-8 pb-4 shrink-0">
              <div className="w-10" /> {/* Заглушка для центровки заголовка */}
              <h3 className="text-[17px] font-sans text-[#F2F1ED] font-medium">Читать больше</h3>
              <button 
                onClick={onClose} 
                className="p-2 -mr-2 active:scale-90 transition-transform"
              >
                <img src="/icons/cross.svg" alt="Close" className="w-6 h-6 opacity-40 hover:opacity-80 invert" />
              </button>
            </div>

            {/* Контент */}
            <div className="flex-1 overflow-y-auto px-6 py-4 hide-scrollbar">
              <p className="text-[17px] leading-relaxed whitespace-pre-wrap font-serif text-[#F2F1ED] opacity-90 text-right">
                {content}
              </p>
            </div>

            {/* Bottom Actions - "Сейф зона" */}
            <div className="w-full bg-[#2D2C2A] px-6 py-5 flex items-center justify-end gap-5 pb-10">
              <button className="active:scale-90 transition-transform opacity-40 hover:opacity-100">
                <img src="/icons/edit.svg" alt="Edit" className="w-5 h-5 invert" />
              </button>
              <button 
                onClick={handleCopy} 
                className="active:scale-90 transition-transform opacity-40 hover:opacity-100"
              >
                <img 
                  src={copied ? "/icons/tick.svg" : "/icons/copy.svg"} 
                  alt="Copy" 
                  className="w-5 h-5 invert" 
                />
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
