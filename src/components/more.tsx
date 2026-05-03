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
          {/* Фон без размытия, просто затемнение */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[150] bg-black/60"
          />

          <motion.aside
            initial={{ clipPath: "inset(100% 0 0 0)" }} 
            animate={{ clipPath: "inset(0% 0 0 0)" }}
            exit={{ clipPath: "inset(100% 0 0 0)" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[160] flex flex-col bg-[#252422] w-full h-full"
          >
            {/* Header: Центрированный текст и разделительная полоска */}
            <div className="relative flex items-center justify-center px-6 h-[70px] border-b border-white/[0.06] shrink-0">
              <h3 className="text-[17px] font-sans text-[#F2F1ED] font-medium">
                Читать больше
              </h3>
              <button 
                onClick={onClose} 
                className="absolute right-4 p-2 active:scale-90 transition-transform"
              >
                <img src="/icons/cross.svg" alt="Close" className="w-6 h-6 opacity-40 hover:opacity-80 invert" />
              </button>
            </div>

            {/* Контент: Нормальное центрирование (слева) и ровные отступы */}
            <div className="flex-1 overflow-y-auto px-8 py-8 hide-scrollbar">
              <div className="max-w-[600px] mx-auto w-full">
                <p className="text-[17px] leading-[1.6] font-serif text-[#F2F1ED] opacity-90 whitespace-pre-wrap">
                  {content}
                </p>
              </div>
            </div>

            {/* Bottom Actions: Фиксированный футер, чтобы объекты не "улетали" */}
            <div className="w-full bg-[#2D2C2A] border-t border-white/[0.04] shrink-0">
              <div className="max-w-[600px] mx-auto flex items-center justify-end gap-6 px-8 py-6 pb-10">
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
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
