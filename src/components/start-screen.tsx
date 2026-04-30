"use client";

import { startTransition, useEffect, useRef, useState } from "react";
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

// Утилита для создания зацикленного ряда
const PromptRow = ({ items, direction, speed = "40s" }: { items: string[], direction: 'left' | 'right', speed?: string }) => {
  const scrollClass = direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right';
  
  return (
    <div className="group flex overflow-hidden py-2 select-none">
      <div className={`flex min-w-full shrink-0 items-center justify-around gap-4 ${scrollClass}`} style={{ animationDuration: speed }}>
        {items.map((item, idx) => (
          <div 
            key={idx} 
            className="whitespace-nowrap rounded-full border border-[#E5E5DF] px-6 py-2.5 text-[14px] font-medium text-[#171717]/60 bg-transparent"
          >
            {item}
          </div>
        ))}
      </div>
      {/* Дубликат для бесшовности */}
      <div aria-hidden="true" className={`flex min-w-full shrink-0 items-center justify-around gap-4 ${scrollClass}`} style={{ animationDuration: speed }}>
        {items.map((item, idx) => (
          <div 
            key={`dup-${idx}`} 
            className="whitespace-nowrap rounded-full border border-[#E5E5DF] px-6 py-2.5 text-[14px] font-medium text-[#171717]/60 bg-transparent"
          >
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
    setMessage("");
  };

  return (
    <main className="relative h-dvh w-full bg-[#F5F5F0] font-sans antialiased overflow-hidden text-[#171717]">
      {/* CSS Анимации для конвейера */}
      <style jsx global>{`
        @keyframes marquee-left {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
        @keyframes marquee-right {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-marquee-left { animation: marquee-left linear infinite; }
        .animate-marquee-right { animation: marquee-right linear infinite; }
      `}</style>

      <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Кнопка меню остается функциональной, но деликатной */}
      <button 
        onClick={() => setMenuOpen(true)} 
        className="absolute left-6 top-6 z-10 p-2 opacity-30 hover:opacity-100 transition-opacity"
      >
        <img src="/icons/menu.PNG" className="h-5 w-5" alt="Menu" />
      </button>

      <div className="mx-auto flex h-full w-full max-w-2xl flex-col items-center justify-center px-6">
        
        {!chatStarted ? (
          <>
            {/* Заголовок с логотипом */}
            <div className="mb-10 flex items-center gap-4">
              <img src="/icons/applogo.PNG" className="h-8 w-8 object-contain" alt="Logo" />
              <h1 className="text-[24px] font-medium tracking-tight text-[#171717]">
                Чем помочь тебе, хм?
              </h1>
            </div>

            {/* Конвейеры подсказок */}
            <div className="w-screen max-w-[100vw] space-y-2 opacity-80">
              <PromptRow 
                items={promptLibrary.slice(0, 5)} 
                direction="left" 
                speed="50s" 
              />
              <PromptRow 
                items={promptLibrary.slice(5, 10)} 
                direction="right" 
                speed="45s" 
              />
              <PromptRow 
                items={promptLibrary.slice(10, 15)} 
                direction="left" 
                speed="55s" 
              />
            </div>

            {/* Строка ввода */}
            <div className="mt-12 w-full max-w-[340px]">
              <form 
                className="relative flex items-center bg-[#262626] rounded-full p-1.5 shadow-xl"
                onSubmit={(e) => { e.preventDefault(); onSend(message); }}
              >
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Спросить что-нибудь…"
                  className="flex-1 bg-transparent pl-5 pr-12 py-3 text-[15px] text-white outline-none placeholder:text-white/30"
                />
                <button
                  type="submit"
                  disabled={message.trim().length < 2}
                  className="absolute right-1.5 flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F0] transition-transform active:scale-90 disabled:opacity-50"
                >
                  <img src="/icons/send.PNG" className="h-4 w-4 brightness-0" alt="Send" />
                </button>
              </form>
            </div>
          </>
        ) : (
          /* Контейнер чата, если диалог начат */
          <div className="flex-1 w-full overflow-hidden pt-20 pb-10">
            <ChatThread messages={messages} />
            {/* Маленький инпут для продолжения чата можно добавить сюда позже */}
          </div>
        )}
      </div>
    </main>
  );
}
