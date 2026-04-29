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
  "Как правильно расходовать ресурсы"
];

export function StartScreen() {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [message, setMessage] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [prompts, setPrompts] = useState(() => promptLibrary.sort(() => 0.5 - Math.random()).slice(0, 3));
  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "24px"; 
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, [message]);

  const submitMessage = async (overrideMessage?: string) => {
    const text = (overrideMessage ?? message).trim();
    if (text.length < 2) return;

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", content: text };
    const assistantId = `a-${Date.now()}`;
    
    setChatStarted(true);
    setMessages(prev => [...prev, userMsg, { id: assistantId, role: "assistant", content: "", status: "loading" }]);
    setMessage("");

    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === assistantId 
          ? { 
              ...msg, 
              status: "error", 
              header: "Йода занят сейчас", 
              subHeader: "Много запросов к Силе поступает. Позже попробуй.",
              content: "" 
            } 
          : msg
      ));
    }, 2000);
  };

  return (
    <main className="relative flex h-dvh flex-col bg-[#F5F3EE] text-[#171717] overflow-hidden">
      <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="relative mx-auto flex h-full w-full max-w-md flex-col px-4 pt-6 pb-4">
        {/* Хедер всегда сверху */}
        <div className="mb-4 flex items-center justify-between z-30">
          <button onClick={() => setMenuOpen(true)} className="active:scale-90 transition-transform">
            <img src="/icons/menu.PNG" alt="" className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/icons/applogo.PNG" alt="" className="h-5 w-5" />
            <h1 className="text-[18px] font-black text-[#39704E]">swgoh.ai</h1>
          </div>
          <div className="w-5" /> 
        </div>

        <section className="relative flex flex-1 flex-col overflow-hidden">
          {/* Пустой экран — СТРОГО ПО ЦЕНТРУ */}
          {!chatStarted && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              {/* Пятно тоже по центру */}
              <div className="absolute top-1/2 left-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#39704E]/15 blur-[70px] pointer-events-none" />
              
              <div className="w-full space-y-8 px-2">
                <h2 className="text-[38px] font-semibold tracking-tight leading-[1.05] text-center">
                  Чем помочь тебе, хм?
                </h2>
                
                <div className="space-y-2.5">
                  <p className="text-center text-sm font-medium text-[#8C867D] mb-4">Начни с готового</p>
                  {prompts.map((p) => (
                    <button 
                      key={p} 
                      onClick={() => submitMessage(p)}
                      className="w-full flex items-center justify-between rounded-2xl bg-white px-4 py-4 text-left text-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] active:scale-[0.98] transition-transform"
                    >
                      <span>{p}</span>
                      <img src="/icons/right.PNG" alt="" className="h-3 w-3 opacity-30" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Чат */}
          <div className={`flex-1 flex flex-col transition-all duration-500 ${chatStarted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"}`}>
            {chatStarted && <ChatThread messages={messages} onRetry={() => submitMessage(messages.filter(m => m.role === 'user').pop()?.content)} />}
          </div>

          {/* Инпут — всегда внизу */}
          <div className="mt-4 z-20">
            <form
              className="rounded-[24px] border border-[#E6E0D7] bg-white px-4 py-3 shadow-sm focus-within:border-[#39704E]/30 transition-colors"
              onSubmit={(e) => { e.preventDefault(); submitMessage(); }}
            >
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Спроси Йоду…"
                rows={1}
                className="hide-scrollbar w-full resize-none bg-transparent py-1 text-[15px] outline-none"
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={message.trim().length < 2}
                  className={`h-9 w-9 grid place-items-center rounded-xl transition-all ${
                    message.trim().length >= 2 ? "bg-[#39704E]" : "bg-[#171717]/10"
                  }`}
                >
                  <img src="/icons/send.PNG" alt="" className="h-4 w-4 brightness-0 invert" />
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
