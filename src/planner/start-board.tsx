"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type StartBoardProps = {
  onClose: () => void;
};

// Компонент плашки "Новая пачка"
const NewSquadPlate = ({ x, y }: { x: number; y: number }) => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.15, ease: "easeOut" }}
    style={{ left: x, top: y }}
    className="absolute z-50 w-[240px] bg-[#2D2C2A]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl"
  >
    <h3 className="text-[13px] font-medium text-[#F2F1ED]/50 mb-4 uppercase tracking-wider">Новая пачка</h3>
    <div className="flex flex-col gap-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 active:opacity-50 transition-opacity cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-[#3E3D3A] border border-white/5 flex items-center justify-center text-[#F2F1ED]/30 text-xl font-light">
            ?
          </div>
          <span className="text-[15px] text-[#F2F1ED] font-sans">Добавить юнита</span>
        </div>
      ))}
    </div>
  </motion.div>
);

export default function StartBoard({ onClose }: StartBoardProps) {
  const [squadPos, setSquadPos] = useState<{ x: number; y: number } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  // 1. Управление кнопкой Back в Telegram
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.BackButton) {
      tg.BackButton.show();
      tg.BackButton.onClick(onClose);
    }
    return () => {
      tg?.BackButton.hide();
      tg?.BackButton.offClick(onClose);
    };
  }, [onClose]);

  // 2. Логика Long Press (удержание)
  const handlePointerDown = (e: React.PointerEvent) => {
    const { clientX, clientY } = e;
    longPressTimer.current = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(50); // Легкая вибрация
      
      // Вычисляем позицию, чтобы не вылезало за края (упрощенно)
      const posX = Math.min(clientX, window.innerWidth - 260);
      const posY = Math.min(clientY, window.innerHeight - 300);
      
      setSquadPos({ x: posX, y: posY });
    }, 600); // Время удержания
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  return (
    <div 
      className="fixed inset-0 z-[200] bg-[#1A1917] overflow-hidden touch-none"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerUp} // Отмена, если начали двигать
    >
      {/* Кастомный крестик поверх контента (если нужен помимо кнопки Back) */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 z-[210] p-2 bg-black/20 backdrop-blur-md rounded-full border border-white/10 active:scale-90 transition-transform"
      >
        <img src="/icons/cross.svg" alt="Close" className="w-5 h-5 invert" />
      </button>

      {/* Доска (Board) с возможностью перемещения */}
      <motion.div
        drag
        dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }} // Ограничение перемещения
        className="relative w-full h-full cursor-grab active:cursor-grabbing"
      >
        {/* Фоновая сетка */}
        <div 
          className="absolute inset-[-1000px] z-0 opacity-[0.03]"
          style={{ 
            backgroundImage: `radial-gradient(#F2F1ED 1px, transparent 1px)`,
            backgroundSize: '40px 40px' 
          }}
        />

        {/* Контент доски (твоя текущая сетка/картинки здесь) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           {/* Пример центрального контента */}
           <div className="relative group pointer-events-auto">
              <div className="w-[300px] h-[400px] bg-[#2D2C2A] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                <img src="/api/placeholder/300/400" alt="Card" className="w-full h-full object-cover opacity-50" />
              </div>
           </div>
        </div>

        {/* Плашка "Новая пачка" */}
        {squadPos && (
          <div className="absolute inset-0 z-50 pointer-events-none">
            <div className="pointer-events-auto">
              <NewSquadPlate x={squadPos.x} y={squadPos.y} />
            </div>
            {/* Клик в любое другое место закроет плашку */}
            <div 
              className="absolute inset-0 pointer-events-auto" 
              onClick={(e) => { e.stopPropagation(); setSquadPos(null); }} 
            />
          </div>
        )}
      </motion.div>
    </div>
  );
}
