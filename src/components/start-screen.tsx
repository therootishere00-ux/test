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

function getTelegramName() {
  const webApp = typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
  return webApp?.initDataUnsafe?.user?.first_name?.trim() || "Артем";
}

function pickPrompts(source: string[], amount: number) {
  return [...source].sort(() => 0.5 - Math.random()).slice(0, amount);
}

export function StartScreen() {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [message, setMessage] = useState("");
  const [analysisEnabled, setAnalysisEnabled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [prompts, setPrompts] = useState(() => pickPrompts(promptLibrary, 3));
  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // getTelegramName()
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "24px"; 
    const nextHeight = Math.min(textarea.scrollHeight, 120);
    textarea.style.height = `${nextHeight}px`;
  }, [message]);

  const handleShuffle = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      startTransition(() => {
        setPrompts(pickPrompts(promptLibrary, 3));
        setIsRefreshing(false);
      });
    }, 400);
  };

  const submitMessage = async (overrideMessage?: string) => {
    const textToSend = overrideMessage !== undefined ? overrideMessage : message;
    const normalized = textToSend.trim();
    if (normalized.length < 2) return;

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", content: normalized };
    const assistantId = `a-${Date.now()}`;
    const loadingMsg: ChatMessage = { 
      id: assistantId, 
      role: "assistant", 
      content: "", 
      status: "loading" 
    };

    setChatStarted(true);
    setMessages(prev => [...prev, userMsg, loadingMsg]);
    
    // Очищаем ввод только если это новая отправка, а не повтор
    if (overrideMessage === undefined) {
      setMessage("");
    }

    const GROQ_KEY = process.env.NEXT_PUBLIC_GROQ_KEY || "dummy_key";

    try {
      await Promise.race([
        new Promise(resolve => setTimeout(resolve, 2500)),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 60000))
      ]);

      setMessages(prev => prev.map(msg => 
        msg.id === assistantId 
          ? { 
              ...msg, 
              content: "", 
              status: "done", 
              header: "Йода занят сейчас. Позже приходи, хм", 
              hideActions: false // Чтобы кнопка "попробовать снова" показалась
            } 
          : msg
      ));
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === assistantId 
          ? { 
              ...msg, 
              content: "", 
              status: "error", 
              header: "Связь с Силой потеряна (Ошибка)", 
              hideActions: false 
            } 
          : msg
      ));
    }
  };

  // Повторная отправка последнего сообщения пользователя
  const handleRetry = () => {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      submitMessage(lastUserMsg.content);
    }
  };

  return (
    <main className="relative flex h-dvh flex-col bg-[#F5F3EE] text-[#171717] select-none overflow-hidden">
      <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="relative mx-auto flex h-full w-full max-w-md flex-col px-4 pt-6 pb-[15px]">
        {/* Хедер */}
        <div className="mb-8 flex items-center justify-between z-20">
          <button onClick={() => setMenuOpen(true)} className="active:scale-95 transition-transform">
            <img src="/icons/menu.PNG" alt="" className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/icons/applogo.PNG" alt="" className="h-5 w-5" />
            <h1 className="text-[18px] font-black text-[#39704E]">swgoh<span className="opacity-[0.65]">.ai</span></h1>
          </div>
          <button className="active:scale-95 transition-transform">
            <img src="/icons/profile.PNG" alt="" className="h-5 w-5" />
          </button>
        </div>

        <section className="relative flex flex-1 flex-col overflow-hidden z-10">
          {/* Пустой экран */}
          <div className={`flex flex-1 flex-col justify-center transition-all duration-500 ${chatStarted ? "pointer-events-none opacity-0 scale-95 absolute inset-0" : "opacity-100 scale-100"}`}>
            
            {/* Пятнышко поднято выше (top-[40%]) и виднее (bg-[#39704E]/22) */}
            <div className="absolute top-[40%] left-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#39704E]/22 blur-[65px] animate-blob pointer-events-none -z-10" />

            <div className="space-y-7 relative z-10">
              <div className="space-y-1">
                <h2 className="text-[38px] font-semibold tracking-tight leading-[1.05]">Чем помочь тебе, хм?</h2>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium text-[#8C867D]">Начать можно так</p>
                <div className={`flex flex-col gap-2 transition-opacity duration-150 ${isRefreshing ? "opacity-0" : "opacity-100"}`}>
                  {prompts.map((p) => (
                    <button key={p} onClick={() => setMessage(p)} className="flex items-center justify-between rounded-2xl bg-[#FBFAF7] px-4 py-3.5 text-left text-[14px] active:scale-[0.98] transition-transform">
                      <span>{p}</span>
                      <img src="/icons/right.PNG" alt="" className="h-3 w-3 opacity-40" />
                    </button>
                  ))}
                </div>
                <button onClick={handleShuffle} className="flex items-center gap-2 text-sm font-medium text-[#8C867D] active:opacity-60 transition-opacity mt-1">
                  <img src="/icons/refresh.PNG" alt="" className={`h-4 w-4 ${isRefreshing ? "animate-spin-smooth" : ""}`} />
                  Перемешать
                </button>
              </div>
            </div>
          </div>

          {/* Чат */}
          <div className={`flex-1 overflow-hidden flex flex-col transition-all duration-500 ${chatStarted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
            {chatStarted && <ChatThread messages={messages} onRetry={handleRetry} />}
          </div>

          {/* Инпут ввода */}
          <div className="mt-auto relative z-20">
            <div className="flex flex-col gap-3">
              <form
                className="rounded-[22px] border border-[#E6E0D7] bg-[#FFFFFF] px-4 py-3 shadow-sm"
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
                    disabled={message.trim().length < 2}
                    className={`grid h-9 w-9 place-items-center rounded-xl transition-all ${
                      message.trim().length >= 2 ? "bg-[#39704E] opacity-100 active:scale-90" : "bg-[#171717]/30 opacity-100"
                    }`}
                  >
                    <img src="/icons/send.PNG" alt="" className="h-4 w-4 brightness-0 invert" />
                  </button>
                </div>
              </form>
              <p className="text-center text-[11px] font-medium text-[#9A948A]">Это ИИ, он может допускать ошибки</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
