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
          {/* Overlay — просто затемнение без блюра, чтобы не дергался фон */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[150] bg-black/60"
          />

          <motion.aside
            // Анимация появления снизу вверх через clipPath, как в меню
            initial={{ clipPath: "inset(100% 0 0 0)" }} 
            animate={{ clipPath: "inset(0% 0 0 0)" }}
            exit={{ clipPath: "inset(100% 0 0 0)" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[160] flex flex-col bg-[#252422] w-full h-dvh overflow-hidden"
          >
            {/* Header: Заголовок 14px и крестик из меню */}
            <div className="flex items-center justify-between px-6 pt-8 pb-4 border-b border-white/[0.04] shrink-0">
              <div className="w-9" /> {/* Балансир для центровки */}
              <span className="text-[14px] text-[#F2F1ED] font-sans">
                Читать больше
              </span>
              <button 
                onClick={onClose} 
                className="p-2 -mr-2 active:scale-90 transition-transform"
              >
                <img 
                  src="/icons/cross.svg" 
                  alt="Close" 
                  className="w-5 h-5 opacity-40 hover:opacity-80 invert" 
                />
              </button>
            </div>

            {/* Контент: Центрирован по сетке 600px, текст обычный (слева) */}
            <div className="flex-1 overflow-y-auto px-8 py-6 hide-scrollbar">
              <div className="max-w-[600px] mx-auto w-full">
                <p className="text-[16px] leading-relaxed font-serif text-[#F2F1ED] opacity-90 whitespace-pre-wrap">
                  {content}
                </p>
              </div>
            </div>

            {/* Bottom Block: Цвет как в футере меню (#2D2C2A) */}
            <div className="w-full bg-[#2D2C2A] shrink-0">
              <div className="max-w-[600px] mx-auto flex items-center justify-end gap-5 px-8 py-4 pb-10">
                <button className="p-2 active:scale-90 transition-transform opacity-40 hover:opacity-100">
                  <img src="/icons/edit.svg" alt="Edit" className="w-5 h-5 invert" />
                </button>
                <button 
                  onClick={handleCopy} 
                  className="p-2 active:scale-90 transition-transform opacity-40 hover:opacity-100"
                >
                  <img 
                    src={copied ? "/icons/tick.svg" : "/icons/copy.svg"} 
                    alt="Copy" 
                    className="w-5 h-5 invert" 
                  />
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
