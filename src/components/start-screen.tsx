"use client";

import { useEffect, useRef, useState } from "react";
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
  "Как пройти 7 уровень испытаний",
  "Приоритеты в магазине осколков",
  "Стоит ли качать инквизиторов?"
];

const PromptRow = ({ items, direction, speed = "40s" }: { items: string[], direction: 'left' | 'right', speed?: string }) => {
  const scrollClass = direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right';
  
  return (
    <div className="group flex overflow-hidden py-1.5 select-none">
      <div className={`flex min-w-full shrink-0 items-center gap-3 px-3 ${scrollClass}`} style={{ animationDuration: speed }}>
        {items.map((item, idx) => (
          <button 
            key={idx} 
            className="whitespace-nowrap rounded-full border border-[#DEDDDA] px-6 py-3 text-[14px] font-medium text-[#171717]/70 bg-white/10 backdrop-blur-sm transition-colors hover:bg-white/40 active:scale-95"
          >
            {item}
          </button>
        ))}
      </div>
      <div aria-hidden="true" className={`flex min-w-full shrink-0 items-center gap-3 px-3 ${scrollClass}`} style={{ animationDuration: speed }}>
        {items.map((item, idx) => (
          <button 
            key={`dup-${idx}`} 
            className="whitespace-nowrap rounded-full border border-[#DEDDDA] px-6 py-3 text-[14px] font-medium text-[#171717]/70 bg-white/10 backdrop-blur-sm transition-colors hover:bg-white/40 active:scale-95"
          >
            {item}
          </button>
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
    setMessage("");
  };

  return (
    <main className="relative h-dvh w-full bg-[#F5F5F0] font-sans antialiased overflow-hidden text-[#171717]">
      <style jsx global>{`
        @keyframes marquee-left {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
        @keyframes marquee-right {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes float-blob {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0, 0) scale(1); }
        }
        .animate-marquee-left { animation: marquee-left linear infinite; }
        .animate-marquee-right { animation: marquee-right linear infinite; }
        .animate-blob { animation: float-blob 20s ease-in-out infinite; }
      `}</style>

      {/* Летающее зеленое пятно (Blob) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="animate-blob absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[450px] rounded-full bg-[#39704E]/10 blur-[100px]" />
      </div>

      <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      <button 
        onClick={() => setMenuOpen(true)} 
        className="absolute left-6 top-6 z-20 p-2 opacity-40 hover:opacity-100 transition-opacity"
      >
        <img src="/icons/menu.PNG" className="h-5 w-5" alt="Menu" />
      </button>

      <div className="relative z-10 mx-auto flex h-full w-full max-w-4xl flex-col items-center justify-center px-6">
        
        {!chatStarted ? (
          <>
            {/* Заголовок */}
            <div className="mb-12 flex flex-col items-center gap-3">
              <img src="/icons/applogo.PNG" className="h-10 w-10 object-contain" alt="Logo" />
              <h1 className="text-[28px] font-medium tracking-tight text-[#171717]">
                Чем помочь тебе, хм?
              </h1>
            </div>

            {/* Блок с подсказками */}
            <div className="w-full space-y-1">
              <p className="mb-4 text-center text-[13px] font-semibold uppercase tracking-widest text-[#8C867D]/60">
                Начать можно так
              </p>
              <div className="w-screen max-w-full opacity-90">
                <PromptRow items={promptLibrary.slice(0, 6)} direction="left" speed="60s" />
                <PromptRow items={promptLibrary.slice(6, 11)} direction="right" speed="55s" />
                <PromptRow items={promptLibrary.slice(11, 15)} direction="left" speed="65s" />
              </div>
            </div>

            {/* Удлиненная строка ввода */}
            <div className="mt-16 w-full max-w-[500px]">
              <form 
                className="relative flex items-center bg-[#262626] rounded-full p-2 shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
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
                  className="absolute right-2 flex h-11 w-11 items-center justify-center rounded-full bg-[#F5F5F0] transition-all hover:scale-105 active:scale-95 disabled:opacity-20"
                >
                  <img src="/icons/send.PNG" className="h-4 w-4 brightness-0" alt="Send" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 w-full overflow-hidden pt-20">
            <ChatThread messages={messages} />
          </div>
        )}
      </div>
    </main>
  );
}
