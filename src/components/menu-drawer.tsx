"use client";

import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";
import type { ChatMessage } from "./chat-thread";

// УДАЛЕНО: import PlanerIcon from "../../public/icons/planer"; 
// В Next.js нельзя импортировать файлы из public через JS-import

export type ChatSession = {
  id: string;
  title: string;
  messages: ChatMessage[];
};

type MenuDrawerProps = {
  open: boolean;
  onClose: () => void;
  chats: ChatSession[];
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onOpenPlanner: () => void;
};

function ChatItem({ chat, isActive, onSelect, onDelete }: { chat: ChatSession, isActive: boolean, onSelect: () => void, onDelete: () => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const controls = useAnimation();

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x < -40) {
      controls.start({ x: -60 });
    } else {
      controls.start({ x: 0 });
    }
    setTimeout(() => setIsDragging(false), 100);
  };

  return (
    <div className="relative w-full h-[44px] rounded-xl overflow-hidden bg-[#5FA86D] shrink-0">
      <div 
        className="absolute inset-y-0 right-0 w-[60px] flex items-center justify-center cursor-pointer"
        onClick={onDelete}
      >
        <img src="/icons/bin.svg" alt="Delete" className="w-5 h-5 invert" />
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -60, right: 0 }}
        dragElastic={0.1}
        animate={controls}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        onClick={() => !isDragging && onSelect()}
        className={`absolute inset-0 flex items-center px-4 rounded-xl cursor-pointer ${
          isActive ? 'bg-[#3E3D3A]' : 'bg-[#252422]'
        } transition-colors border border-white/5`}
      >
        <span className="text-[#F2F1ED] text-[14px] font-sans truncate pr-4 opacity-90">
          {chat.title}
        </span>
      </motion.div>
    </div>
  );
}

export function MenuDrawer({ open, onClose, chats, currentChatId, onSelectChat, onDeleteChat, onOpenPlanner }: MenuDrawerProps) {
  const [tgUser, setTgUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const user = (window as any).Telegram.WebApp.initDataUnsafe?.user;
      if (user) setTgUser(user);
    }
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
            <div className="flex items-center justify-between px-6 pt-8 pb-4 shrink-0">
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

            {/* БЛОК ПЛАНИРОВЩИКА С SVG ИЗ ПАПКИ PUBLIC */}
            <div className="px-4 mb-2 shrink-0">
              <button 
                onClick={onOpenPlanner}
                className="w-full bg-[#2D2C2A] rounded-xl px-4 py-3 flex items-center justify-between border border-white/5 active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 flex items-center justify-center">
                    {/* Используем путь /icons/planner.svg напрямую */}
                    <img 
                      src="/icons/planner.svg" 
                      alt="Planner" 
                      className="w-full h-full opacity-80 invert" 
                    />
                  </div>
                  <span className="text-[15px] text-[#F2F1ED] font-sans font-medium">Начать планировать</span>
                </div>
                <div className="px-2 py-0.5 rounded-md bg-[#5FA86D]/10 border border-[#5FA86D]/20">
                  <span className="text-[10px] text-[#5FA86D] font-bold uppercase tracking-wider">Новое</span>
                </div>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar py-2 flex flex-col gap-2 px-4">
              {chats.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <span className="text-[#6A6965] text-[15px] font-sans">Чатов пока нет</span>
                </div>
              ) : (
                chats.map(chat => (
                  <ChatItem 
                    key={chat.id} 
                    chat={chat} 
                    isActive={chat.id === currentChatId} 
                    onSelect={() => onSelectChat(chat.id)}
                    onDelete={() => onDeleteChat(chat.id)}
                  />
                ))
              )}
            </div>

            <div className="w-full bg-[#2D2C2A] px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                {tgUser?.photo_url ? (
                  <img src={tgUser.photo_url} alt="Avatar" className="w-10 h-10 rounded-xl flex-shrink-0 object-cover" />
                ) : (
                  <div className="w-10 h-10 bg-[#3E3D3A] rounded-xl flex-shrink-0" />
                )}
                <div className="flex flex-col leading-tight">
                  <span className="text-[15px] text-[#F2F1ED] font-medium">
                    {tgUser?.first_name || 'юзер'}
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
