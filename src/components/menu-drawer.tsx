"use client";

import { motion, AnimatePresence } from "framer-motion";

// Определяем тип пользователя внутри файла для автономности
type TMAUser = {
  first_name: string;
  username?: string;
  photo_url?: string;
};

type MenuDrawerProps = {
  open: boolean;
  onClose: () => void;
  user: TMAUser; // Теперь пропс user обязателен
};

export function MenuDrawer({ open, onClose, user }: MenuDrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop (затемнение фона) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={onClose}
            className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm"
          />

          {/* Sidebar (само меню) */}
          <motion.aside
            initial={{ clipPath: "inset(0 100% 0 0)" }} 
            animate={{ clipPath: "inset(0 0% 0 0)" }}
            exit={{ clipPath: "inset(0 100% 0 0)" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-0 top-0 z-[120] h-dvh w-[80%] max-w-[320px] bg-[#252422] flex flex-col shadow-2xl border-r border-white/5"
          >
            {/* Header меню */}
            <div className="flex items-center justify-between px-6 pt-8 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-[20px] font-serif font-medium tracking-tight text-[#F2F1ED]">
                  swgoh<span className="text-[#5FA86D]">.ai</span>
                </span>
              </div>
              <button onClick={onClose} className="p-2 -mr-2 active:scale-90 transition-transform">
                <img src="/icons/cross.svg" alt="Close" className="w-5 h-5 opacity-40 hover:opacity-80 invert" />
              </button>
            </div>

            {/* Центральная часть: список чатов (пока пусто) */}
            <div className="flex-1 flex items-center justify-center px-6 text-center">
              <span className="text-[#6A6965] text-[14px] font-sans opacity-60">
                История чатов пока пуста
              </span>
            </div>

            {/* Нижний блок пользователя */}
            <div className="w-full bg-[#2D2C2A] px-5 py-4 flex items-center justify-between border-t border-white/[0.02]">
              <div className="flex items-center gap-3">
                {/* Аватарка: либо из Telegram, либо стильная заглушка */}
                {user.photo_url ? (
                  <img 
                    src={user.photo_url} 
                    alt="Avatar" 
                    className="w-10 h-10 rounded-xl object-cover border border-white/10"
                  />
                ) : (
                  <div className="w-10 h-10 bg-[#3E3D3A] rounded-xl flex items-center justify-center border border-white/5">
                    <span className="text-[#F2F1ED]/40 text-xs font-bold uppercase">
                      {user.first_name.slice(0, 2)}
                    </span>
                  </div>
                )}
                
                <div className="flex flex-col leading-tight overflow-hidden">
                  <span className="text-[15px] text-[#F2F1ED] font-medium truncate max-w-[140px]">
                    {user.first_name}
                  </span>
                  {user.username && (
                    <span className="text-[12px] text-[#F2F1ED]/40 mt-0.5 font-sans truncate max-w-[140px]">
                      @{user.username}
                    </span>
                  )}
                </div>
              </div>

              {/* Кнопка настроек или дополнительных опций */}
              <button className="p-2 -mr-1 active:scale-90 transition-transform opacity-40 hover:opacity-100">
                <img src="/icons/dots.svg" alt="Options" className="w-5 h-5 invert" />
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
