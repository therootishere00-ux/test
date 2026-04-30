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
  "Приоритеты в магазине осколков"
];

export function StartScreen() {
  const [message, setMessage] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [visiblePrompts, setVisiblePrompts] = useState(promptLibrary);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Авто-высота
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 84)}px`;
    }
  }, [message]);

  // Эффект печати по словам (flow effect)
  const typeText = (text: string) => {
    const words = text.split(" ");
    let currentText = "";
    words.forEach((word, index) => {
      setTimeout(() => {
        currentText += (index === 0 ? "" : " ") + word;
        setMessage(currentText);
      }, index * 80); // Скорость появления слов
    });
  };

  const handlePromptClick = (text: string, fullId: string) => {
    setRemovingId(fullId);
    // Начинаем печатать текст почти сразу
    setTimeout(() => typeText(text), 100);
    // Удаляем из массива после завершения анимации сжатия
    setTimeout(() => {
      setVisiblePrompts(prev => prev.filter((_, i) => `${i}-${_}` !== fullId));
      setRemovingId(null);
    }, 400); 
  };

  const onSend = () => {
    if (message.trim().length < 2) return;
    setMessages([{ id: Date.now().toString(), role: "user", content: message.trim() }]);
    setChatStarted(true);
    setMessage("");
  };

  const PromptRow = ({ range, direction, speed, offset }: any) => {
    const items = visiblePrompts.slice(range[0], range[1]);
    const scrollClass = direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right';
    
    return (
      <div className="flex overflow-hidden py-1.5 select-none">
        <div className={`flex min-w-full shrink-0 items-center justify-around gap-3 ${scrollClass}`} style={{ animationDuration: speed }}>
          {items.map((item, idx) => {
            const fullId = `${idx + range[0]}-${item}`;
            const isRemoving = removingId === fullId;
            const isEven = (idx + offset) % 2 === 0;
            
            return (
              <button
                key={fullId}
                onClick={() => handlePromptClick(item, fullId)}
                className={`whitespace-nowrap rounded-full px-6 py-2.5 text-[14px] font-medium transition-all duration-400 ease-in-out ${
                  isRemoving ? "max-w-0 opacity-0 px-0 mx-[-6px] overflow-hidden scale-95" : "max-w-[400px] opacity-100"
                } ${isEven ? "bg-[#39704E]/10 text-[#39704E]" : "border border-[#E5E5DF] text-[#171717]/60"}`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <main className="relative h-dvh w-full bg-[#F5F5F0] font-sans antialiased overflow-hidden text-[#171717]">
      <style jsx global>{`
        @keyframes marquee-left { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes marquee-right { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .animate-marquee-left { animation: marquee-left linear infinite; }
        .animate-marquee-right { animation: marquee-right linear infinite; }
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
            <PromptRow range={[0, 4]} direction="left" speed="40s" offset={0} />
            <PromptRow range={[4, 8]} direction="right" speed="35s" offset={1} />
            <PromptRow range={[8, 12]} direction="left" speed="45s" offset={0} />
          </div>

          <div className="mt-10 w-full px-[25px]">
            <form 
              className="relative flex w-full items-center bg-[#262626] rounded-[30px] min-h-[56px] px-2 py-1.5"
              onSubmit={(e) => { e.preventDefault(); onSend(); }}
            >
              <textarea
                ref={textareaRef}
                rows={1}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Спросить что-нибудь…"
                className="hide-scrollbar flex-1 bg-transparent py-3 pl-4 pr-12 text-[16px] leading-[1.4] text-white outline-none placeholder:text-white/30 resize-none"
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
              />
              <div className="absolute right-2 top-0 bottom-0 flex items-center">
                <button
                  type="submit"
                  disabled={message.trim().length < 2}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F0] transition-all active:scale-90 disabled:opacity-20"
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
