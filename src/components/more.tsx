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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          // Внешний контейнер растянут на весь экран и выравнивает контент по нижнему краю
          className="fixed inset-0 z-[200] flex flex-col justify-end bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            // Сама модалка вписана в 600px для центрирования на десктопах, но занимает всю ширину на мобилках
            className="w-full max-w-[600px] mx-auto h-[85vh] bg-[#252422] rounded-t-[24px] border-t border-x border-white/10 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Шапка */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.04] shrink-0">
              <h3 className="text-[16px] font-sans text-[#F2F1ED] flex-1 text-center pl-6">Читать больше</h3>
              <button onClick={onClose} className="p-1 active:scale-90 transition-transform opacity-40 hover:opacity-80">
                <img src="/icons/cross.svg" alt="Close" className="w-5 h-5 invert" />
              </button>
            </div>

            {/* Контент */}
            <div className="flex-1 overflow-y-auto p-6 hide-scrollbar">
              <p className="text-[16px] leading-relaxed whitespace-pre-wrap font-serif text-[#F2F1ED] opacity-90 text-right">
                {content}
              </p>
            </div>

            {/* Сейф зона внизу с иконками */}
            <div className="flex justify-end gap-4 px-6 py-4 bg-[#252422] border-t border-white/[0.04] pb-8 shrink-0">
              <button className="active:scale-90 transition-transform opacity-40 hover:opacity-100">
                <img src="/icons/edit.svg" alt="Edit" className="w-[18px] h-[18px] invert" />
              </button>
              <button onClick={handleCopy} className="active:scale-90 transition-transform opacity-40 hover:opacity-100">
                <img src={copied ? "/icons/tick.svg" : "/icons/copy.svg"} alt="Copy" className="w-[18px] h-[18px] invert" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
