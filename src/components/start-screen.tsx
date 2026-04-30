"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ChatThread, type ChatMessage } from "@/components/chat-thread";
import { MenuDrawer } from "@/components/menu-drawer";

const promptLibrary = [
  "Собери план прокачки с нуля",
  "Кого выбрать первой легендой?",
  "Как улучшить мой GAC рейтинг",
  "В чём я явно отстаю от других",
  "Какие герои дадут мне больше всего",
  "Как правильно расходовать ресурсы",
  "Что качать в первую очередь",
  "Подскажи по моему составу",
  "Как подготовиться к ТВ",
  "Что мне не хватает для флота",
  "Лучшие модули для Рей",
  "Приоритеты в магазине осколков"
];

const PromptRow = ({ items, direction, speed = "45s" }: { items: string[], direction: 'left' | 'right', speed?: string }) => {
  const scrollClass = direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right';
  return (
    <div className="group flex overflow-hidden py-1.5 select-none">
      <div className={`flex min-w-full shrink-0 items-center gap-3 ${scrollClass}`} style={{ animationDuration: speed }}>
        {items.map((item, idx) => (
          <div key={idx} className="whitespace-nowrap rounded-full border border-[#DEDDDA] px-6 py-3 text-[14px] font-medium text-[#171717]/50 bg-white/10 backdrop-blur-[2px]">
            {item}
          </div>
        ))}
      </div>
      <div aria-hidden="true" className={`flex min-w-full shrink-0 items-center gap-3 ${scrollClass}`} style={{ animationDuration: speed }}>
        {items.map((item, idx) => (
          <div key={`dup-${idx}`} className="whitespace-nowrap rounded-full border border-[#DEDDDA] px-6 py-3 text-[14px] font-medium text-[#171717]/50 bg-white/10 backdrop-blur-[2px]">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export function StartScreen() {
  const [message, setMessage] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const onSend = (text: string) => {
    const normalized = text.trim();
    if (normalized.length < 2) return;
    setMessages([{ id: Date.now().toString(), role: "user", content: normalized }]);
    setChatStarted(true);
  };

  return (
    <main className="relative h-dvh w-full bg-[#F5F5F0] font-sans antialiased overflow-hidden text-[#171717]">
      <style jsx global>{`
        @keyframes marquee-left { from { transform: translateX(0); } to { transform: translateX(-100%); } }
        @keyframes marquee-right { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .animate-marquee-left { animation: marquee-left linear infinite; }
        .animate-marquee-right { animation: marquee-right linear infinite; }
      `}</style>

      {/* Живое градиентное пятно */}
      {!chatStarted && (
        <motion.div
          animate={{
            x: [0, 150, -100, 200, 0],
            y: [0, -100, 150, -50, 0],
            scale: [1, 1.2, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"
        >
          <div className="h-[400px] w-[400px] rounded-full bg-[#39704E] opacity-[0.08] blur-[100px]" />
        </motion.div>
      )}

      <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      <button onClick={() => setMenuOpen(true)} className="absolute left-6 top-6 z-20 p-2 opacity-30">
        <img src="/icons/menu.PNG" className="h-5 w-5" alt="" />
      </button>

      <div className="relative z-10 mx-auto flex h-full w-full max-w-4xl flex-col items-center justify-center px-6">
        {!chatStarted ? (
          <div className="flex w-full flex-col items-center">
            {/* Заголовок */}
            <div className="mb-10 flex items-center gap-3.5">
              <img src="/icons/applogo.PNG" className="h-9 w-9 object-contain" alt="" />
              <h1 className="text-[26px] font-medium tracking-tight">Чем помочь тебе, хм?</h1>
            </div>

            {/* Блок подсказок */}
            <div className="w-full flex flex-col items-center space-y-8">
              <span className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[#8C867D]/60">
                Начать можно так
              </span>
              
              <div className="w-screen max-w-full space-y-1.5 opacity-90">
                <PromptRow items={promptLibrary.slice(0, 4)} direction="left" speed="60s" />
                <PromptRow items={promptLibrary.slice(4, 8)} direction="right" speed="50s" />
                <PromptRow items={promptLibrary.slice(8, 12)} direction="left" speed="65s" />
              </div>
            </div>

            {/* Строка ввода (длиннее и аккуратнее) */}
            <div className="mt-16 w-full max-w-[520px]">
              <form 
                className="group relative flex items-center bg-[#262626] rounded-full p-2 transition-all focus-within:ring-4 focus-within:ring-[#39704E]/5"
                onSubmit={(e) => { e.preventDefault(); onSend(message); }}
              >
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Спросить что-нибудь…"
                  className="flex-1 bg-transparent pl-6 pr-14 py-3.5 text-[16px] text-white outline-none placeholder:text-white/25"
                />
                <button
                  type="submit"
                  disabled={message.trim().length < 2}
                  className="absolute right-2.5 grid h-11 w-11 place-items-center rounded-full bg-[#F5F5F0] transition-all active:scale-90 disabled:opacity-20"
                >
                  <img src="/icons/send.PNG" className="h-4 w-4 brightness-0 transition-transform group-focus-within:rotate-[-10deg]" alt="" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 w-full overflow-hidden pt-20">
            <ChatThread messages={messages} />
          </div>
        )}
      </div>
    </main>
  );
}
