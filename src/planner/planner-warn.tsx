"use client";

import { motion } from "framer-motion";

export function PlannerWarn({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-x-0 bottom-0 top-0 flex items-end justify-center px-5 pb-10 pointer-events-none">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="w-full max-w-[380px] bg-[#2D2C2A] rounded-[24px] border border-white/10 shadow-2xl overflow-hidden pointer-events-auto"
      >
        {/* Изображение с контуром */}
        <div className="w-full h-[120px] relative border-b border-white/5 overflow-hidden">
          <img 
            src="/pictures/warn.PNG" 
            alt="Warning" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 border-[0.5px] border-white/20 rounded-t-[24px]" />
        </div>

        <div className="p-6">
          <h2 className="font-serif text-[20px] font-bold text-[#F2F1ED] leading-tight mb-2">
            Начните планировать
          </h2>
          <p className="font-sans text-[14px] text-[#F2F1ED]/60 leading-relaxed">
            Здесь можно планировать и отслеживать прогресс пачек, которые ты хочешь получить! 
            Это удобно, когда все мысли в одном месте. Чтобы начать, удержи где-нибудь на плоскости и создай первый блок!
          </p>
          
          <button 
            onClick={onClose}
            className="mt-6 w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[14px] font-sans text-[#F2F1ED] transition-colors"
          >
            Понятно
          </button>
        </div>
      </motion.div>
    </div>
  );
}
