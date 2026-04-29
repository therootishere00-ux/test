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
  "Что мне не хватает для флота",
  "Расскажи про мои узкие места",
  "Как получить первую легенду быстрее"
];

function pickPrompts(source: string[], amount: number) {
  return [...source].sort(() => 0.5 - Math.random()).slice(0, amount);
}

function isEmojiOnly(value: string) {
  const withoutEmoji = value.trim().replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\uFE0F]/gu, "").replace(/\s/gu, "");
  return value.trim().length > 0 && withoutEmoji.length === 0;
}

export function StartScreen() {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [message, setMessage] = useState("");
  const [analysisEnabled, setAnalysisEnabled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [prompts, setPrompts] = useState(() => pickPrompts(promptLibrary, 5));
  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Состояние загрузки запроса
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, [message]);

  const handleShuffle = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      startTransition(() => {
        setPrompts(pickPrompts(promptLibrary, 5));
        setIsRefreshing(false);
      });
    }, 400);
  };

  const submitMessage = async () => {
    const normalized = message.trim();
    if (normalized.length < 2 || isEmojiOnly(normalized)) return;

    setChatStarted(true);
    setMessages(prev => [...prev, { id: `u-${Date.now()}`, role: "user", content: normalized }]);
    setMessage("");
    setIsLoading(true); // Запускаем лоадер "Подумать Йоде нужно..."

    // Секрет для будущего подключения
    const GROQ_KEY = process.env.NEXT_PUBLIC_GROQ_KEY || "dummy_key";

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 секунд таймаут

      // Имитация отправки запроса в никуда (закомментируй fetch, когда добавишь реальный URL)
      await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_KEY}`
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [{ role: "user", content: normalized }]
        }),
        signal: controller.signal
      }).catch(() => {
        // Ловим ошибку сети, чтобы скрипт не падал в демо-режиме
        throw new Error("Demo trigger");
      });

      clearTimeout(timeoutId);

      // В демо всегда выводим эту заглушку через ошибку
      throw new Error("Demo trigger");

    } catch (error) {
      // Искусственная задержка для демо (чтобы показать красивый лоадер)
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          id: `a-${Date.now()}`, 
          role: "assistant", 
          content: "Йода занят сейчас. Позже приходи, хм",
          isError: true // Флаг, скрывающий хедер и кнопки
        }]);
        setIsLoading(false);
      }, 1500); 
    }
  };

  const renderComposer = () => (
    <div className="flex flex-col gap-3 w-full">
      <form
        className="rounded-[22px] border border-[#E6E0D7] bg-[#FFFFFF] px-4 py-3"
        onSubmit={(e) => { e.preventDefault(); submitMessage(); }}
      >
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={analysisEnabled ? "Над чем подумать…" : "Спроси Йоду…"}
          rows={1}
          className="hide-scrollbar w-full resize-none bg-transparent py-1 text-[15px] outline-none placeholder:text-[#A09A90]"
        />
        <div className="mt-2.5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setAnalysisEnabled(!analysisEnabled)}
            className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 active:scale-95 transition-transform ${
              analysisEnabled ? "border-[#CFE1D6] bg-[#EDF5F0] text-[#39704E]" : "border-[#E3DED5] bg-[#F7F4EE] text-[#6F6A61]"
            }`}
          >
            <img src="/icons/firemode.PNG" alt="" className="h-4 w-4" style={analysisEnabled ? { filter: "invert(39%) sepia(18%) saturate(892%) hue-rotate(94deg)" } : {}} />
            <span className="text-sm font-medium">Анализ</span>
          </button>
          <button
            type="submit"
            disabled={message.trim().length < 2 || isLoading}
            className={`grid h-9 w-9 place-items-center rounded-xl transition-all ${
              message.trim().length >= 2 && !isLoading ? "bg-[#39704E] opacity-100 active:scale-90" : "bg-[#171717]/30 opacity-100"
            }`}
          >
            <img src="/icons/send.PNG" alt="" className="h-4 w-4 brightness-0 invert" />
          </button>
        </div>
      </form>
      <p className="text-center text-[11px] font-medium text-[#9A948A]">Это ИИ, он может допускать ошибки</p>
    </div>
  );

  return (
    <main className="relative flex h-dvh flex-col bg-[#F5F3EE] text-[#171717] select-none overflow-hidden">
      <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Плавное фоновое пятно в центре (видно только на старте) */}
      {!chatStarted && (
        <div className="pointer-events-none absolute left-1/2 top-[40%] h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#39704E]/15 blur-[70px] animate-blob mix-blend-multiply" />
      )}

      <div className="relative z-10 mx-auto flex h-full w-full max-w-md flex-col px-4 pt-6 pb-[15px]">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between flex-shrink-0">
          {/* Обновленная кнопка меню: круг без текста и без контура */}
          <button onClick={() => setMenuOpen(true)} className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#E6E0D7]/60 active:scale-95 transition-transform">
            <img src="/icons/menu.PNG" alt="" className="h-4 w-4 opacity-80" />
          </button>
          
          <div className="flex items-center gap-2">
            <img src="/icons/applogo.PNG" alt="" className="h-5 w-5" />
            <h1 className="text-[18px] font-black text-[#39704E]">swgoh<span className="opacity-65">.ai</span></h1>
          </div>
          
          <button className="flex h-[38px] w-[38px] items-center justify-center rounded-full active:scale-95 transition-transform">
            <img src="/icons/profile.PNG" alt="" className="h-5 w-5 opacity-90" />
          </button>
        </div>

        <section className="relative flex flex-1 flex-col overflow-hidden">
          {/* Стартовый экран */}
          <div className={`flex flex-1 flex-col justify-center transition-all duration-500 ${chatStarted ? "pointer-events-none opacity-0 scale-95 absolute inset-0" : "opacity-100 scale-100"}`}>
            <div className="space-y-7">
              {/* Новый заголовок без подзаголовка */}
              <div className="space-y-1">
                <h2 className="text-[38px] font-semibold tracking-tight leading-none">Чем помочь тебе, хм?</h2>
              </div>

              <div className="space-y-3 pt-2">
                <div className={`flex flex-col gap-2 transition-opacity duration-150 ${isRefreshing ? "opacity-0" : "opacity-100"}`}>
                  {prompts.map((p) => (
                    // Убрали border и border-[#E6E0D7]
                    <button key={p} onClick={() => setMessage(p)} className="flex items-center justify-between rounded-[18px] bg-[#FBFAF7] px-4 py-3.5 text-left text-[14px] active:scale-[0.98] transition-transform">
                      <span>{p}</span>
                      <img src="/icons/right.PNG" alt="" className="h-3 w-3 opacity-30" />
                    </button>
                  ))}
                </div>
                <button onClick={handleShuffle} className="flex items-center gap-2 text-sm font-medium text-[#8C867D] active:opacity-60 transition-opacity">
                  <img src="/icons/refresh.PNG" alt="" className={`h-4 w-4 ${isRefreshing ? "animate-spin-smooth" : ""}`} />
                  Перемешать
                </button>
              </div>
            </div>
          </div>

          {/* Чат */}
          <div className={`flex-1 overflow-hidden flex flex-col transition-all duration-500 ${chatStarted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
            {chatStarted && <ChatThread messages={messages} isLoading={isLoading} />}
          </div>

          {/* Инпут */}
          <div className="mt-auto flex-shrink-0 pt-4">
            {renderComposer()}
          </div>
        </section>
      </div>
    </main>
  );
}
