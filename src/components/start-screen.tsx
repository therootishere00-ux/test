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

  const renderComposer = () => (
    <div className="fixed bottom-[15px] left-0 right-0 z-20 px-4 w-full max-w-md mx-auto">
      <div className="space-y-3">
        <form
          className="standard-rounded bg-white px-4 pb-3 pt-3 shadow-[0_4px_12px_rgba(0,0,0,0.03)]"
          onSubmit={(e) => { e.preventDefault(); submitMessage(message); }}
        >
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={analysisEnabled ? "Что проанализируем?" : "Спросите Yota..."}
            className="hide-scrollbar min-h-[24px] w-full resize-none bg-transparent py-1 text-[16px] text-[#171717] outline-none placeholder:text-[#A09A90]"
            rows={1}
          />
          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setAnalysisEnabled(!analysisEnabled)}
              className={`flex h-9 items-center gap-2 px-3 transition-colors standard-rounded ${
                analysisEnabled ? "bg-[#EDF5F0] text-[#39704E]" : "bg-[#F7F4EE] text-[#6F6A61]"
              }`}
            >
              <img src="/icons/firemode.PNG" className={`h-4 w-4 ${analysisEnabled ? 'brightness-75' : ''}`} alt="" />
              <span className="text-sm font-semibold">Анализ</span>
            </button>
            <button
              type="submit"
              disabled={message.trim().length < 2}
              className={`grid h-9 w-9 place-items-center standard-rounded transition-all ${
                message.trim().length < 2 ? "bg-[#171717]/10" : "bg-[#171717] active:scale-90"
              }`}
            >
              <img src="/icons/send.PNG" className="h-4 w-4 brightness-0 invert" alt="" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <main className="relative h-dvh w-full bg-[#F5F3EE]">
      <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="mx-auto flex h-full w-full max-w-md flex-col px-4 pt-6">
        {/* Header: Лого курсивом и акцентным цветом */}
        <header className="z-10 flex items-center justify-between">
          <button onClick={() => setMenuOpen(true)} className="p-2">
            <img src="/icons/menu.PNG" className="h-5 w-5" alt="" />
          </button>
          <h1 className="text-[22px] font-black italic text-[#39704E] tracking-tighter">
            swgoh.ai
          </h1>
          <button className="p-2">
            <img src="/icons/profile.PNG" className="h-5 w-5" alt="" />
          </button>
        </header>

        <section className="relative flex-1 flex flex-col overflow-hidden">
          {!chatStarted ? (
            <div className="flex flex-1 flex-col justify-center pb-32">
              {/* Приветствие: центрировано слева */}
              <div className="mb-10 px-2">
                <h2 className="text-[36px] font-bold leading-[1.1] tracking-tight">
                  С чем помочь тебе,<br />
                  <span className="opacity-30 text-[#171717]">хм?</span>
                </h2>
              </div>

              {/* Подсказки без контуров */}
              <div className="w-full space-y-2 px-2">
                {prompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => submitMessage(p)}
                    className="flex w-full items-center justify-between standard-rounded bg-white/60 px-5 py-4 text-left text-[15px] transition-all active:scale-[0.98] active:bg-white"
                  >
                    <span className="font-medium text-[#2A2A2A]">{p}</span>
                    <img src="/icons/right.PNG" className="h-3 w-3 opacity-20" alt="" />
                  </button>
                ))}
                
                {/* Перемешка слева под подсказками */}
                <div className="pt-3">
                  <button
                    onClick={handleShuffle}
                    className="flex items-center gap-2 px-2 text-[13px] font-bold uppercase tracking-widest text-[#8C867D] active:opacity-60"
                  >
                    <img src="/icons/refresh.PNG" className="h-4 w-4 opacity-70" alt="" />
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
