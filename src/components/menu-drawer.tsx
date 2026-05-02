"use client";
import { motion, AnimatePresence } from "framer-motion";

type MenuDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function MenuDrawer({ open, onClose }: MenuDrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-[#171717]/40 backdrop-blur-sm"
          />

          {/* Drawing Menu */}
          <motion.aside
            initial={{ clipPath: "inset(0 100% 0 0)" }} // "Скрыто" справа налево
            animate={{ clipPath: "inset(0 0% 0 0)" }}   // "Рисуется" раскрытием
            exit={{ clipPath: "inset(0 100% 0 0)" }}
            transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
            className="fixed left-0 top-0 z-[70] h-dvh w-[80%] max-w-[320px] bg-[#2D2C2A] border-r border-white/5 flex flex-col"
          >
            {/* Контент внутри НЕ двигается, он просто становится видимым */}
            <div className="w-[320px] h-full flex flex-col p-6">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-8 h-8 bg-[#5FA86D] rounded-lg" />
                <span className="text-[#F2F1ED] font-serif text-xl">История</span>
              </div>
              
              <nav className="space-y-4">
                {["Сегодняшний чат", "Архив тактик", "Настройки"].map((item, i) => (
                  <motion.div 
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="text-[#6A6965] hover:text-[#5FA86D] cursor-pointer transition-colors"
                  >
                    {item}
                  </motion.div>
                ))}
              </nav>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
