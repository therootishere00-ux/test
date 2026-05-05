"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function StartBoard({ onClose }: { onClose: () => void }) {
  const [showWarn, setShowWarn] = useState(true);

  return (
    <div className="fixed inset-0 z-[60] bg-[#1A1917] flex flex-col animate-in fade-in duration-300">
      {/* Шапка планировщика */}
      <div className="w-full flex items-center justify-between px-8 py-6 bg-[#252422]">
        <div className="w-6" /> {/* Заглушка для центровки */}
        <h1 className="text-[17px] text-[#F2F1ED] font-sans font-medium tracking-tight">
          Планировщик
        </h1>
        <button onClick={onClose} className="p-1 active:scale-90 transition-transform opacity-40">
          <img src="/icons/cross.svg" alt="Close" className="w-5 h-5 invert" />
        </button>
      </div>

      {/* Доска с сеткой */}
      <div className="flex-1 relative overflow-hidden bg-[#151413]">
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: `linear-gradient(#F2F1ED 1px, transparent 1px), linear-gradient(90deg, #F2F1ED 1px, transparent 1px)`,
            backgroundSize: '40px 40px' 
          }} 
        />
        
        {/* Слой для будущих блоков планирования */}
        <div className="absolute inset-0 z-10" onContextMenu={(e) => e.preventDefault()} />

        {/* Окно приветствия (Warn) */}
        <AnimatePresence>
          {showWarn && (
            <div className="absolute inset-0 z-50 flex items-end justify-center pb-10 px-4 bg-black/20 backdrop-blur-[2px]">
              <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="w-full max-w-[360px] bg-[#252422] rounded-[32px] overflow-hidden border border-white/5 shadow-2xl"
              >
                <div className="relative h-32 w-full overflow-hidden border-b border-white/5">
                  <img 
                    src="/pictures/warn.PNG" 
                    className="w-full h-full object-cover opacity-60 scale-105"
                    alt="Warning"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#252422] to-transparent" />
                </div>
                
                <div className="p-8 space-y-3">
                  <h2 className="text-[22px] text-[#F2F1ED] font-serif font-bold leading-tight">
                    Начните планировать
                  </h2>
                  <p className="text-[14px] text-[#F2F1ED]/60 font-sans leading-relaxed">
                    Здесь можно планировать и отслеживать прогресс пачек, которые ты хочешь получить! 
                    Это удобно, когда все мысли в одном месте. Чтобы начать, удержи где-нибудь на плоскости и создай первый блок!
                  </p>
                  
                  <button 
                    onClick={() => setShowWarn(false)}
                    className="w-full mt-4 bg-[#F2F1ED] text-[#1A1917] py-3.5 rounded-[18px] font-sans font-semibold text-[15px] active:scale-[0.97] transition-transform"
                  >
                    Понятно
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
