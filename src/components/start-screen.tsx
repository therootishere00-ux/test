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
  for (let index = items.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[nextIndex]] = [items[nextIndex], items[index]];
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

  // Единый радиус скругления для всего интерфейса
  const baseRounding = "rounded-[18px]";

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, [message]);

  const handleShuffle = () => {
    startTransition(() => setPrompts(pickPrompts(promptLibrary, 3)));
  };

  const submitMessage = (content: string) => {
    const text = content.trim();
    if (text.length < 2) return;
    setMessages([{ id: Date.now().toString(), role: "user", content: text }]);
    setChatStarted(true);
    setMessage("");
  };

  const isMessageValid = message.trim().length >= 2;

  const renderComposer = () => (
    <div className="fixed bottom-[15px] left-0 right-0 z-20 px-4 w-full max-w-md mx-auto">
      <div className="space-y-2.5">
        <form
          className={`${baseRounding} bg-white px-4 pb-3 pt-3 shadow-[0_4px_12px_rgba(0,0,0,0.03)]`}
          onSubmit={(e) => { e.preventDefault(); submitMessage(message); }}
        >
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={analysisEnabled ? "Что проанализируем?" : "Спросите Yota..."}
            className="hide-scrollbar min-h-[24px] w-full resize-none bg-transparent py-1 text-[15px] text-[#171717] outline-none placeholder:text-[#A09A90]"
            rows={1}
          />
          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setAnalysisEnabled(!analysisEnabled)}
              className={`flex h-8 items-center gap-2 px-3 transition-colors ${baseRounding} ${
                analysisEnabled ? "bg-[#EDF5F0] text-[#39704E]" : "bg-[#F7F4EE] text-[#6F6A61]"
              }`}
            >
              <img 
                src="/icons/firemode.PNG" 
                className="h-3.5 w-3.5" 
                style={analysisEnabled ? { filter: "invert(33%) sepia(21%) saturate(1005%) hue-rotate(94deg) brightness(96%) contrast(87%)" } : {}}
                alt="" 
              />
              <span className="text-xs font-medium">Анализ</span>
            </button>
            <button
              type="submit"
              disabled={!isMessageValid}
              className={`grid h-8 w-8 place-items-center rounded-[10px] transition-all ${
                !isMessageValid 
                  ? "bg-[#171717]/10" 
                  : "bg-[#39704E] active:scale-90" // Акцентный зеленый в активе
              }`}
            >
              <img src="/icons/send.PNG" className="h-3.5 w-3.5 brightness-0 invert" alt="" />
            </button>
          </div>
        </form>
        {!chatStarted && (
          <p className="text-center text-[10px] font-medium text-[#9A948A]">
            Это ИИ, он может допускать ошибки
          </p>
        )}
      </div>
    </div>
  );

  return (
    <main className="relative h-dvh w-full bg-[#F5F3EE] select-none">
      <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="mx-auto flex h-full w-full max-w-md flex-col px-4 pt-5">
        {/* Header */}
        <header className="z-10 flex items-center justify-between">
          <button onClick={() => setMenuOpen(true)} className="p-2 -ml-2">
            <img src="/icons/menu.PNG" className="h-5 w-5" alt="" />
          </button>
          <div className="flex items-center gap-1.5">
            <img src="/icons/applogo.PNG" className="h-5 w-5 object-contain" alt="" />
            <h1 className="text-[18px] font-black italic text-[#39704E] tracking-tighter">
              swgoh.ai
            </h1>
          </div>
          <button className="p-2 -mr-2">
            <img src="/icons/profile.PNG" className="h-5 w-5" alt="" />
          </button>
        </header>

        <section className="relative flex-1 flex flex-col overflow-hidden">
          {!chatStarted ? (
            <div className="flex flex-1 flex-col justify-center pb-32">
              {/* Приветствие */}
              <div className="mb-6 px-2">
                <h2 className="text-[28px] font-medium leading-[1.15] tracking-tight text-[#171717]">
                  С чем помочь тебе,<br />
                  <span>хм?</span>
                </h2>
                <p className="mt-2 text-[14px] text-[#8C867D]">Начать можно так</p>
              </div>

              {/* Подсказки */}
              <div className="w-full space-y-2 px-1">
                {prompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => submitMessage(p)}
                    className={`flex w-full items-center justify-between ${baseRounding} bg-white/60 px-5 py-3.5 text-left text-[14px] transition-all active:scale-[0.98] active:bg-white`}
                  >
                    <span className="font-medium text-[#2A2A2A]">{p}</span>
                    <img src="/icons/right.PNG" className="h-2.5 w-2.5 opacity-20" alt="" />
                  </button>
                ))}
                
                {/* Перемешка */}
                <div className="pt-2">
                  <button
                    onClick={handleShuffle}
                    className="flex items-center gap-2 px-2 text-[12px] font-semibold text-[#8C867D] active:opacity-60"
                  >
                    <img src="/icons/refresh.PNG" className="h-3.5 w-3.5 opacity-60" alt="" />
                    Перемешать
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
