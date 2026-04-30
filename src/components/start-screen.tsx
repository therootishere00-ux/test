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
  "Приоритеты в магазине осколков"
];

const PromptRow = ({ items, direction, speed = "40s" }: { items: string[], direction: 'left' | 'right', speed?: string }) => {
  const scrollClass = direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right';
  return (
    <div className="flex overflow-hidden py-2 select-none">
      <div className={`flex min-w-full shrink-0 items-center justify-around gap-4 ${scrollClass}`} style={{ animationDuration: speed }}>
        {items.map((item, idx) => (
          <div key={idx} className="whitespace-nowrap rounded-full border border-[#E5E5DF] px-6 py-2.5 text-[14px] font-medium text-[#171717]/60">
            {item}
          </div>
        ))}
      </div>
      <div aria-hidden="true" className={`flex min-w-full shrink-0 items-center justify-around gap-4 ${scrollClass}`} style={{ animationDuration: speed }}>
        {items.map((item, idx) => (
          <div key={`dup-${idx}`} className="whitespace-nowrap rounded-full border border-[#E5E5DF] px-6 py-2.5 text-[14px] font-medium text-[#171717]/60">
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Автоматическое изменение высоты (до 3 строк)
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 84); // ~3 строки по 28px
      textarea.style.height = `${newHeight}px`;
    }
  }, [message]);

  const onSend = () => {
    const normalized = message.trim();
    if (normalized.length < 2) return;
    setMessages([{ id: Date.now().toString(), role: "user", content: normalized }]);
    setChatStarted(true);
    setMessage("");
  };

  return (
    <main className="relative h-dvh w-full bg-[#F5F5F0] font-sans antialiased overflow-hidden text-[#171717]">
      <style jsx global>{`
        @keyframes marquee-left { from { transform: translateX(0); } to { transform: translateX(-100%); } }
        @keyframes marquee-right { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .animate-marquee-left { animation: marquee-left linear infinite; }
        .animate-marquee-right { animation: marquee-right linear infinite; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      {!chatStarted ? (
        <div className="flex h-full flex-col items-center justify-center">
          {/* Header */}
          <div className="mb-12 flex items-center gap-4">
            <img src="/icons/applogo.PNG" className="h-9 w-9 object-contain" alt="" />
            <h1 className="text-[26px] font-medium tracking-tight">Чем помочь тебе, хм?</h1>
          </div>

          {/* Conveyor */}
          <div className="w-full space-y-1 opacity-70">
            <PromptRow items={promptLibrary.slice(0, 4)} direction="left" speed="60s" />
            <PromptRow items={promptLibrary.slice(4, 8)} direction="right" speed="50s" />
            <PromptRow items={promptLibrary.slice(8, 12)} direction="left" speed="70s" />
          </div>

          {/* Input Area: 25px padding from screen edges */}
          <div className="mt-14 w-full px-[25px]">
            <form 
              className="relative flex w-full items-end bg-[#262626] rounded-[28px] p-1.5 transition-all duration-200"
              onSubmit={(e) => { e.preventDefault(); onSend(); }}
            >
              <textarea
                ref={textareaRef}
                rows={1}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Спросить что-нибудь…"
                className="hide-scrollbar flex-1 bg-transparent py-3 pl-5 pr-14 text-[16px] leading-[1.4] text-white outline-none placeholder:text-white/30 resize-none overflow-y-auto"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onSend();
                  }
                }}
              />
              <button
                type="submit"
                disabled={message.trim().length < 2}
                className="absolute bottom-1.5 right-1.5 flex h-11 w-11 items-center justify-center rounded-full bg-[#F5F5F0] transition-transform active:scale-90 disabled:opacity-20"
              >
                <img src="/icons/send.PNG" className="h-5 w-5 brightness-0" alt="" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="h-full w-full pt-12">
          <ChatThread messages={messages} />
        </div>
      )}
    </main>
  );
}
