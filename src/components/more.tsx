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
    setTimeout(() => setCopied(false), 1700);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60"
          />

          <motion.aside
            initial={{ y: "100%" }} 
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex flex-col bg-[#252422] w-full h-[100dvh] overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 h-[72px] border-b border-white/[0.04] shrink-0">
              <div className="w-9" /> 
              <span className="text-[14px] text-[#F2F1ED] font-sans font-medium uppercase tracking-wider">
                Читать больше
              </span>
              <button 
                onClick={onClose} 
                className="p-2 -mr-2 active:scale-90 transition-transform opacity-40"
              >
                <img 
                  src="/icons/cross.svg" 
                  alt="Close" 
                  className="w-5 h-5 invert" 
                />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-10 hide-scrollbar">
              <div className="max-w-[600px] mx-auto w-full">
                <p className="text-[16px] leading-relaxed font-serif text-[#F2F1ED] opacity-90 whitespace-pre-wrap">
                  {content}
                </p>
              </div>
            </div>

            <div className="w-full bg-[#2D2C2A] shrink-0 border-t border-white/[0.02]">
              <div className="max-w-[600px] mx-auto flex items-center justify-end gap-6 px-8 py-6 pb-12">
                <button className="p-2 active:scale-90 transition-transform opacity-40">
                  <img src="/icons/edit.svg" alt="Edit" className="w-5 h-5 invert" />
                </button>
                <button 
                  onClick={handleCopy} 
                  className="p-2 active:scale-90 transition-transform opacity-40"
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
        </div>
      )}
    </AnimatePresence>
  );
}
