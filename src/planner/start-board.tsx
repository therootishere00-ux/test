"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlannerWarn } from "./planner-warn";

export default function StartBoard({ onClose }: { onClose: () => void }) {
  const [showWarn, setShowWarn] = useState(true);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="fixed inset-0 z-[200] bg-[#1A1917] flex flex-col overflow-hidden"
    >
      {/* Шапка */}
      <div className="w-full h-[64px] flex items-center justify-between px-6 shrink-0 z-10 bg-[#1A1917]/80 backdrop-blur-md border-b border-white/5">
        <div className="w-10" /> {/* Spacer */}
        <span className="text-[16px] font-sans font-medium text-[#F2F1ED]">Планировщик</span>
        <button onClick={onClose} className="p-2 -mr-2 active:scale-90 transition-transform">
          <img src="/icons/cross.svg" alt="Close" className="w-6 h-6 opacity-40 invert" />
        </button>
      </div>

      {/* Доска */}
      <div className="flex-1 relative bg-[#151412] overflow-hidden">
        {/* Сетка */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: `linear-gradient(#F2F1ED 1px, transparent 1px), linear-gradient(90deg, #F2F1ED 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
          }}
        />

        {/* Интерактивная область */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Здесь будут блоки */}
        </div>

        {/* Окошко предупреждения */}
        <AnimatePresence>
          {showWarn && (
            <PlannerWarn onClose={() => setShowWarn(false)} />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
