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

  const onSend = (text: string) => {
    const normalized = text.trim();
    if (normalized.length < 2) return;
    setMessages([{ id: Date.now().toString(), role: "user", content: normalized }]);
    setChatStarted(true);
    setMessage("");
  };

  return (
    <main className="relative h-dvh w-full bg-[#F5F3EE] font-sans antialiased select-none overflow-hidden text-[#171717]">
      <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="mx-auto flex h-full w-full max-w-md flex-col px-7">
        {/* Шапка: Тонкая, иконка лого слева от текста */}
        <header className="flex h-16 items-center justify-between">
          <button onClick={() => setMenuOpen(true)} className="p-1 -ml-1">
            <img src="/icons/menu.PNG" className="h-5 w-5 opacity-40" alt="" />
          </button>
          <div className="flex items-center gap-1.5 translate-x-[-10px]">
            <img src="/icons/applogo.PNG" className="h-4 w-4 object-contain" alt="" />
            <span className="text-[15px] font-bold italic tracking-tight text-[#39704E]">swgoh.ai</span>
          </div>
          <button className="p-1 -mr-1">
            <img src="/icons/profile.PNG" className="h-5 w-5 opacity-40" alt="" />
          </button>
        </header>

        <section className="relative flex-1 flex flex-col">
          {!chatStarted ? (
            <div className="flex flex-1 flex-col justify-start pt-[12vh]">
              {/* Приветствие: Большой шрифт, тонкое начертание */}
              <div className="mb-12">
                <h2 className="text-[38px] font-light leading-[1.05] tracking-tight text-[#171717]">
                  С чем помочь тебе, <br />
                  <span className="font-normal italic text-[#39704E]">хм?</span>
                </h2>
                <p className="mt-5 text-[15px] font-medium text-[#8C867D]/50">Начать можно так</p>
              </div>

              {/* Подсказки: Тонкие плашки, без границ */}
              <div className="flex flex-col gap-2">
                {prompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => onSend(p)}
                    className="flex w-full items-center justify-between rounded-[22px] bg-white/40 px-5 py-[18px] text-left transition-all active:scale-[0.98] active:bg-white/80"
                  >
                    <span className="text-[15px] font-medium text-[#171717]/70">{p}</span>
                    <img src="/icons/right.PNG" className="h-2.5 w-2.5 opacity-10" alt="" />
                  </button>
                ))}
                
                {/* Перемешать: Текст без капса, слева */}
                <div className="mt-4 px-1">
                  <button
                    onClick={() => setPrompts(pickPrompts(promptLibrary, 3))}
                    className="flex items-center gap-2.5 text-[14px] font-semibold text-[#8C867D]/60 active:opacity-40"
                  >
                    <img src="/icons/refresh.PNG" className="h-4 w-4 opacity-30" alt="" />
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

        {/* Инпут: Парящая плашка внизу */}
        <div className="pb-8 pt-4">
          <div className="flex flex-col gap-3">
            <form
              className="rounded-[24px] bg-white p-3 shadow-[0_12px_40px_rgba(0,0,0,0.03)] transition-shadow focus-within:shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
              onSubmit={(e) => { e.preventDefault(); onSend(message); }}
            >
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={analysisEnabled ? "Анализ активен..." : "Спросите Yota..."}
                className="w-full resize-none bg-transparent px-3 py-2 text-[16px] text-[#171717] outline-none placeholder:text-[#ADAAA4] hide-scrollbar"
                rows={1}
              />
              
              <div className="mt-2 flex items-center justify-between">
                {/* Кнопка Анализа: Не жирный текст, мягкие цвета */}
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

                {/* Кнопка Отправки: Квадратная с радиусом 12px, акцентная при вводе */}
                <button
                  type="submit"
                  disabled={message.trim().length < 2}
                  className={`grid h-9 w-9 place-items-center rounded-[12px] transition-all ${
                    message.trim().length < 2 
                      ? "bg-[#171717]/5 opacity-30" 
                      : "bg-[#39704E] shadow-sm active:scale-95"
                  }`}
                >
                  <img src="/icons/send.PNG" className="h-4 w-4 brightness-0 invert" alt="" />
                </button>
              </div>
            </form>
            
            {!chatStarted && (
              <p className="text-center text-[10px] font-medium text-[#A3A099] tracking-tight">
                Это ИИ, он может допускать ошибки
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
