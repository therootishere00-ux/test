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
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200, mass: 0.8 }}
            className="fixed left-0 top-0 z-[60] h-full w-[80%] max-w-[320px] bg-[#252422] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-8 pb-4">
              <div className="flex items-center gap-3">
                <img src="/icons/logo.svg" alt="Logo" className="w-6 h-6" />
                <span className="font-serif text-[20px] tracking-tight text-[#F2F1ED]">
                  swgoh<span className="text-[#5FA86D]">.ai</span>
                </span>
              </div>
              <button onClick={onClose} className="p-1 active:scale-90 transition-transform">
                <img src="/icons/cross.svg" alt="Close" className="w-5 h-5 opacity-40" />
              </button>
            </div>

            {/* Center content */}
            <div className="flex-1 flex items-center justify-center">
              <span className="text-[#6A6965] text-[15px] font-sans">Чатов пока нет</span>
            </div>

            {/* Bottom User Block */}
            <div className="w-full bg-[#2D2C2A] px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#3E3D3A] rounded-xl flex-shrink-0" />
                <div className="flex flex-col leading-tight">
                  <span className="text-[15px] text-[#F2F1ED] font-medium">const-name</span>
                  <span className="text-[13px] text-[#F2F1ED]/40 mt-0.5">@const=user</span>
                </div>
              </div>
              <button className="p-1 active:scale-90 transition-transform">
                <img src="/icons/dots.svg" alt="Options" className="w-5 h-5 opacity-40" />
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
