"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MenuDrawer } from "@/components/menu-drawer";

// Иконка-звездочка для фона (статичная)
const SparkleIcon = () => (
  <svg 
    width="36" 
    height="36" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className="text-[#5FA86D]"
  >
    <path d="M12 2L12.8 8.5L19 7L14.5 11.5L20 16L13.5 14.5L12 21L10.5 14.5L4 16L9.5 11.5L5 7L11.2 8.5L12 2Z" fill="currentColor"/>
  </svg>
);

export function StartScreen() {
  const [message, setMessage] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Автоматическая высота текстового поля (макс 2 строки)
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "24px";
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = Math.min(scrollHeight, 48) + "px";
    }
  }, [message]);

  return (
    <main className="relative h-dvh w-full bg-[#252422] flex flex-col items-center justify-center overflow-hidden">
      
      {/* Кнопка вызова меню (левый верхний угол) */}
      <button 
        onClick={() => setIsMenuOpen(true)}
        className="absolute top-6 left-6 z-50 p-2 active:scale-90 transition-transform"
      >
        <img src="/icons/menu.svg" alt="Menu" className="w-6 h-6" />
      </button>

      {/* Компонент меню (Drawer) */}
      <MenuDrawer open={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Фоновая иконка-звездочка */}
      <div className="mb-8 opacity-80">
        <SparkleIcon />
      </div>

      {/* Блок приветствия */}
      <div className="w-full max-w-[600px] px-8 mb-12 flex flex-col items-start">
        <div className="space-y-0.5">
          <h2 className="text-[28px] leading-tight font-serif text-[#F2F1ED] tracking-tight">
            Привет, <span className="text-[#5FA86D]">юзер</span>
          </h2>
          {/* Вторая строка: глубокий серый (#6A6965) */}
          <h1 className="text-[28px] leading-tight font-serif text-[#6A6965] tracking-tight">
            Как помочь тебе сегодня?
          </h1>
        </div>
      </div>

      {/* Контейнер ввода */}
      <div className="w-full max-w-[600px] px-6">
        <div className="relative flex flex-col w-full bg-[#2D2C2A] rounded-[24px] border border-white/5 p-4 transition-all focus-within:border-white/10">
          
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Спроси о тактике или персонажах..."
            className="w-full bg-transparent text-[#F2F1ED] text-[16px] leading-6 placeholder-[#6A6965] resize-none outline-none overflow-hidden min-h-[24px]"
            rows={1}
          />

          <div className="flex items-center justify-between mt-4">
            {/* Левые инструменты (заглушки) */}
            <div className="flex items-center gap-2">
              <button className="h-8 w-8 flex items-center justify-center rounded-xl border border-white/5 text-[#6A6965] hover:bg-white/5 transition-colors">
                <span className="text-xl leading-none">+</span>
              </button>
            </div>

            {/* Кнопка отправки */}
            <button
              disabled={!message.trim()}
              className="flex h-8 w-10 items-center justify-center rounded-xl bg-[#5FA86D] text-[#252422] transition-all active:scale-90 disabled:opacity-20 disabled:grayscale"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 20V4M12 4L6 10M12 4L18 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Подпись внизу (опционально) */}
      <div className="absolute bottom-6 text-[11px] text-[#6A6965] tracking-widest uppercase opacity-40">
        SWGOH Intelligence
      </div>
    </main>
  );
}
