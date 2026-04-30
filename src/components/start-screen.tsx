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
  "Подскажи по моему текущему составу",
  "Как подготовиться к войне за территорию",
  "Что мне не хватает для флота"
];

function pickPrompts(source: string[], amount: number) {
  const items = [...source];
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items.slice(0, amount);
}

export function StartScreen() {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [message, setMessage] = useState("");
  const [analysisEnabled, setAnalysisEnabled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [prompts, setPrompts] = useState(() => pickPrompts(promptLibrary, 3));
  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, [message]);

  const handleShuffle = () => {
    startTransition(() => setPrompts(pickPrompts(promptLibrary, 3)));
  };

  const onSend = (text: string) => {
    const normalized = text.trim();
    if (normalized.length < 2) return;
    setMessages([{ id: Date.now().toString(), role: "user", content: normalized }]);
    setChatStarted(true);
    setMessage("");
  };

  const renderComposer = () => (
    <div className="fixed bottom-4 left-0 right-0 z-20 px-5 w-full max-w-md mx-auto">
      <div className="flex flex-col gap-3">
        <form
          className="rounded-[24px] bg-white p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all"
          onSubmit={(e) => { e.preventDefault(); onSend(message); }}
        >
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={analysisEnabled ? "Анализируем..." : "Спросите Yota..."}
            className="w-full resize-none bg-transparent px-2 py-1 text-[16px] leading-relaxed text-[#171717] outline-none placeholder:text-[#ADAAA4] hide-scrollbar"
            rows={1}
          />
          
          <div className="mt-2 flex items-center justify-between px-1">
            <button
              type="button"
              onClick={() => setAnalysisEnabled(!analysisEnabled)}
              className={`flex h-9 items-center gap-2 rounded-full px-4 transition-all ${
                analysisEnabled ? "bg-[#EDF5F0] text-[#39704E]" : "bg-[#F7F4EE] text-[#6F6A61]"
              }`}
            >
              <img 
                src="/icons/firemode.PNG" 
                className="h-4 w-4" 
                style={analysisEnabled ? { filter: "invert(33%) sepia(21%) saturate(1005%) hue-rotate(94deg) brightness(96%) contrast(87%)" } : {}}
                alt="" 
              />
              <span className="text-[13px] font-medium">Анализ</span>
            </button>

            <button
              type="submit"
              disabled={message.trim().length < 2}
              className={`grid h-9 w-9 place-items-center rounded-[12px] transition-all ${
                message.trim().length < 2 ? "bg-[#171717]/5" : "bg-[#39704E] shadow-sm active:scale-95"
              }`}
            >
              <img src="/icons/send.PNG" className="h-4 w-4 brightness-0 invert" alt="" />
            </button>
          </div>
        </form>
        {!chatStarted && (
          <p className="text-center text-[11px] text-[#A3A099]">
            Это ИИ, он может допускать ошибки
          </p>
        )}
      </div>
    </div>
  );

  return (
    <main className="relative h-dvh w-full bg-[#F5F3EE] font-sans antialiased select-none">
      <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="mx-auto flex h-full w-full max-w-md flex-col px-6">
        {/* Header - Тонкий и изящный */}
        <header className="flex h-16 items-center justify-between">
          <button onClick={() => setMenuOpen(true)} className="p-1">
            <img src="/icons/menu.PNG" className="h-5 w-5 opacity-80" alt="" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/icons/applogo.PNG" className="h-5 w-5 object-contain" alt="" />
            <span className="text-[17px] font-bold italic tracking-tight text-[#39704E]">swgoh.ai</span>
          </div>
          <button className="p-1">
            <img src="/icons/profile.PNG" className="h-5 w-5 opacity-80" alt="" />
          </button>
        </header>

        <section className="relative flex-1 flex flex-col">
          {!chatStarted ? (
            <div className="flex flex-1 flex-col justify-center pb-40">
              {/* Приветствие в стиле Apple референсов */}
              <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h2 className="text-[32px] font-normal leading-tight tracking-tight text-[#171717]">
                  С чем помочь тебе,<br />
                  <span className="font-medium">хм?</span>
                </h2>
                <p className="mt-3 text-[15px] text-[#8C867D]">Начать можно так</p>
              </div>

              {/* Подсказки: Без границ, на мягком фоне */}
              <div className="flex flex-col gap-2.5">
                {prompts.map((p, i) => (
                  <button
                    key={p}
                    onClick={() => onSend(p)}
                    style={{ animationDelay: `${i * 100}ms` }}
                    className="group flex w-full items-center justify-between rounded-[22px] bg-white/40 p-4 text-left transition-all hover:bg-white active:scale-[0.98] animate-in fade-in slide-in-from-bottom-2"
                  >
                    <span className="text-[15px] font-medium text-[#2A2A2A]">{p}</span>
                    <img src="/icons/right.PNG" className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-20" alt="" />
                  </button>
                ))}
                
                <div className="mt-2 flex justify-start">
                  <button
                    onClick={handleShuffle}
                    className="flex items-center gap-2 rounded-full px-2 py-1 text-[13px] font-semibold text-[#8C867D] transition-opacity active:opacity-50"
                  >
                    <img src="/icons/refresh.PNG" className="h-4 w-4 opacity-50" alt="" />
                    <span>Перемешать</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden pt-4 chat-message-in">
              <ChatThread messages={messages} />
            </div>
          )}
        </section>

        {renderComposer()}
      </div>
    </main>
  );
}
