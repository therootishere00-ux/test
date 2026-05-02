"use client";

import { motion, AnimatePresence } from "framer-motion";

export function MenuDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md"
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-0 top-0 z-[120] h-dvh w-[280px] bg-[#1A1918] flex flex-col border-r border-white/[0.05] shadow-2xl"
          >
            <div className="flex items-center justify-between px-6 py-8">
              <div className="flex items-center gap-3">
                <img src="/icons/logo.png" alt="Logo" className="w-6 h-6 opacity-80" />
                <span className="font-serif text-[20px] text-[#F2F1ED]">swgoh.ai</span>
              </div>
              <button onClick={onClose} className="p-1 active:scale-90 opacity-40 hover:opacity-100 transition-opacity">
                <img src="/icons/cross.png" alt="Close" className="w-5 h-5 invert" />
              </button>
            </div>

            <div className="flex-1 px-4 flex flex-col justify-center items-center text-center">
              <p className="text-[#6A6965] font-serif text-[14px]">Тут будет ваша история...</p>
            </div>

            <div className="p-4 bg-white/[0.02] flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10" />
                  <span className="text-[14px] font-serif text-[#E8E6E3]">Player One</span>
               </div>
               <button className="opacity-40 hover:opacity-100 transition-opacity">
                 <img src="/icons/dots.png" alt="Dots" className="w-5 h-5 invert" />
               </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
