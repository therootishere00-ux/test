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

const PromptRow = ({ items, direction, speed = "40s", offset = 0, onPick }: { items: string[], direction: 'left' | 'right', speed?: string, offset?: number, onPick: (text: string) => void }) => {
  const scrollClass = direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right';
  return (
    <div className="flex overflow-hidden py-1.5 select-none">
      <div className={`flex min-w-full shrink-0 items-center justify-around gap-3 ${scrollClass}`} style={{ animationDuration: speed }}>
        {items.map((item, idx) => {
          const isEven = (idx + offset) % 2 === 0;
          return (
            <button 
              key={idx} 
              onClick={() => onPick(item)}
              className={`whitespace-nowrap rounded-full px-6 py-2.5 text-[14px] font-medium transition-all active:scale-95 ${
                isEven 
                  ? "bg-[#39704E]/10 text-[#39704E]" 
                  : "border border-[#E5E5DF] text-[#171717]/60"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>
      <div aria-hidden="true" className={`flex min-w-full shrink-0 items-center justify-around gap-3 ${scrollClass}`} style={{ animationDuration: speed }}>
        {items.map((item, idx) => {
          const isEven = (idx + offset) % 2 === 0;
          return (
            <button 
              key={`dup-${idx}`} 
              onClick={() => onPick(item)}
              className={`whitespace-nowrap rounded-full px-6 py-2.5 text-[14px] font-medium ${
                isEven 
                  ? "bg-[#39704E]/10 text-[#39704E]" 
                  : "border border-[#E5E5DF] text-[#171717]/60"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export function StartScreen() {
  const [message, setMessage] = useState("");
  const [isAnimatingText, setIsAnimatingText] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 84);
      textarea.style.height = `${newHeight}px`;
    }
  }, [message]);

  const handlePickPrompt = (text: string) => {
    setMessage("");
    setIsAnimatingText(true);
    // Симуляция быстрой "прорисовки" текста
    setMessage(text);
    setTimeout(() => setIsAnimatingText(false), 300);
  };

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
        @keyframes word-fade { from { opacity: 0; transform: translateY(2px); } to { opacity: 1; transform: translateY(0); } }
        .animate-marquee-left { animation: marquee-left linear infinite; }
        .animate-marquee-right { animation: marquee-right linear infinite; }
        .animate-word { animation: word-fade 0.15s ease-out forwards; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      {!chatStarted ? (
        <div className="flex h-full flex-col items-center justify-center">
          <div className="mb-8 flex items-center gap-4">
            <img src="/icons/applogo.PNG" className="h-9 w-9 object-contain" alt="" />
            <h1 className="text-[26px] font-medium tracking-tight">Чем помочь тебе, хм?</h1>
          </div>

          <div className="w-full space-y-0.5 opacity-90">
            <PromptRow items={promptLibrary.slice(0, 4)} direction="left" speed="60s" offset={0} onPick={handlePickPrompt} />
            <PromptRow items={promptLibrary.slice(4, 8)} direction="right" speed="50s" offset={1} onPick={handlePickPrompt} />
            <PromptRow items={promptLibrary.slice(8, 12)} direction="left" speed="70s" offset={0} onPick={handlePickPrompt} />
          </div>

          <div className="mt-10 w-full px-[25px]">
            <form 
              className="relative flex w-full items-center bg-[#262626] rounded-[30px] min-h-[52px] p-1.5"
              onSubmit={(e) => { e.preventDefault(); onSend(); }}
            >
              <div className="relative flex-1 flex items-center">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Спросить что-нибудь…"
                  className={`hide-scrollbar w-full bg-transparent py-2.5 pl-4 pr-12 text-[16px] leading-[1.4] text-white outline-none placeholder:text-white/30 resize-none overflow-y-auto transition-opacity ${isAnimatingText ? 'opacity-0' : 'opacity-100'}`}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
                />
                {/* Слой для анимации текста */}
                {isAnimatingText && (
                  <div className="absolute inset-0 py-2.5 pl-4 pr-12 text-[16px] leading-[1.4] text-white/80 pointer-events-none flex flex-wrap gap-x-1">
                    {message.split(' ').map((word, i) => (
                      <span key={i} className="animate-word" style={{ animationDelay: `${i * 0.03}s` }}>{word}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Кнопка: уменьшена и выровнена с равными отступами */}
              <div className="absolute right-1.5 top-1.5 bottom-1.5 flex items-center">
                <button
                  type="submit"
                  disabled={message.trim().length < 2}
                  className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#F5F5F0] transition-all active:scale-90 disabled:opacity-20 shadow-sm"
                >
                  <img src="/icons/send.PNG" className="h-4 w-4 brightness-0" alt="" />
                </button>
              </div>
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
