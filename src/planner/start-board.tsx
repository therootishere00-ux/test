"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

type UnitRow = {
  id: number;
};

type TeamCard = {
  id: string;
  x: number;
  y: number;
};

export default function StartBoard({ onClose }: { onClose: () => void }) {
  const [teams, setTeams] = useState<TeamCard[]>([]);
  const boardRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  // 1. Интеграция с Telegram: Кнопка "Back" вместо "Close"
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.BackButton) {
      tg.BackButton.show();
      tg.BackButton.onClick(onClose);
    }

    return () => {
      if (tg?.BackButton) {
        tg.BackButton.hide();
        tg.BackButton.offClick(onClose);
      }
    };
  }, [onClose]);

  // 2. Логика Long Press и вибрации
  const handlePointerDown = (e: React.PointerEvent) => {
    const { clientX, clientY } = e;
    
    longPressTimer.current = setTimeout(() => {
      // Вибрация через Telegram Haptic или стандартный API
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
      } else if (navigator.vibrate) {
        navigator.vibrate(50);
      }

      // Создаем новую пачку в месте нажатия
      const newTeam: TeamCard = {
        id: Date.now().toString(),
        x: clientX - 100, // Центрируем немного относительно пальца
        y: clientY - 50,
      };
      setTeams(prev => [...prev, newTeam]);
    }, 600); // Задержка для долгого нажатия
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-[#1A1917] overflow-hidden select-none touch-none"
    >
      {/* 3. Доска, по которой можно перемещаться (Drag) */}
      <motion.div
        ref={boardRef}
        drag
        dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
        dragElastic={0.1}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative w-[2000px] h-[2000px] bg-[url('/grid.png')] bg-repeat" // Можно добавить фоновую сетку
        style={{ 
          cursor: 'grab',
          x: -850, // Стартовая позиция по центру
          y: -850 
        }}
      >
        <AnimatePresence>
          {teams.map((team) => (
            <motion.div
              key={team.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              style={{ left: team.x, top: team.y }}
              className="absolute w-[240px] bg-[#2D2C2A]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl"
            >
              {/* Заголовок пачки */}
              <div className="flex items-start justify-between mb-4">
                <span className="text-[13px] font-medium text-[#F2F1ED] opacity-50">Новая пачка</span>
                
                {/* Вместо "Понятно" — крестик поверх условной картинки */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setTeams(prev => prev.filter(t => t.id !== team.id));
                  }}
                  className="p-1 -mt-1 -mr-1 active:scale-90 transition-transform"
                >
                  <img src="/icons/cross.svg" alt="Remove" className="w-4 h-4 opacity-40 invert" />
                </button>
              </div>

              {/* Список юнитов (5 раз) */}
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 group active:opacity-60 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-[#3E3D3A] border border-white/5 flex items-center justify-center text-[#6A6965] font-serif text-lg">
                      ?
                    </div>
                    <span className="text-[14px] text-[#F2F1ED]/80 font-sans">Добавить юнита</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Подсказка, если доска пустая */}
        {teams.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-[#6A6965] text-sm font-sans opacity-40">Удерживай в любом месте, чтобы создать пачку</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
