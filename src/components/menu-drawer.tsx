"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

type MenuDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function MenuDrawer({ open, onClose }: MenuDrawerProps) {
  const [tgUser, setTgUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const user = (window as any).Telegram.WebApp.initDataUnsafe?.user;
      if (user) {
        setTgUser(user);
      }
    }
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={onClose}
            className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm"
          />

          <motion.aside
            initial={{ clipPath: "inset(0 100% 0 0)" }} 
            animate={{ clipPath: "inset(0 0% 0 0)" }}
            exit={{ clipPath: "inset(0 100% 0 0)" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-0 top-0 z-[120] h-dvh w-[80%] max-w-[320px] bg-[#252422] flex flex-col shadow-2xl border-r border-white/5"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-8 pb-4">
              <div className="flex items-center gap-2.5">
                <img src="/icons/logo.PNG" alt="Logo" className="w-6 h-6 opacity-90" />
                <span className="font-serif text-[20px] tracking-tight text-[#F2F1ED]">
                  swgoh<span className="text-[#5FA86D]">.ai</span>
                </span>
              </div>
              <button onClick={onClose} className="p-2 -mr-2 active:scale-90 transition-transform">
                <img src="/icons/cross.svg" alt="Close" className="w-5 h-5 opacity-40 hover:opacity-80 invert" />
              </button>
            </div>

            {/* Center Content */}
            <div className="flex-1 flex items-center justify-center">
              <span className="text-[#6A6965] text-[15px] font-sans">Чатов пока нет</span>
            </div>

            {/* Bottom User Block */}
            <div className="w-full bg-[#2D2C2A] px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {tgUser?.photo_url ? (
                  <img src={tgUser.photo_url} alt="Avatar" className="w-10 h-10 rounded-xl flex-shrink-0 object-cover" />
                ) : (
                  <div className="w-10 h-10 bg-[#3E3D3A] rounded-xl flex-shrink-0" />
                )}
                <div className="flex flex-col leading-tight">
                  <span className="text-[15px] text-[#F2F1ED] font-medium">
                    {tgUser?.first_name || 'const-name'}
                  </span>
                  {tgUser?.username && (
                    <span className="text-[13px] text-[#F2F1ED]/40 mt-0.5 font-sans">
                      @{tgUser.username}
                    </span>
                  )}
                </div>
              </div>
              <button className="p-2 -mr-2 active:scale-90 transition-transform">
                <img src="/icons/dots.svg" alt="Options" className="w-5 h-5 opacity-40 hover:opacity-80 invert" />
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
