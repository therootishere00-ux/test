"use client";

import { useEffect, useRef, useState } from "react";
import { ChatThread, type ChatMessage } from "@/components/chat-thread";

const promptLibrary = [
  "Кого выбрать первой легендой?",
  "Как улучшить мой GAC рейтинг",
  "Что качать в первую очередь",
  "Подскажи по моему составу",
  "Как подготовиться к войне"
];

function pickPrompts(amount: number) {
  return [...promptLibrary].sort(() => 0.5 - Math.random()).slice(0, amount);
}

export function StartScreen() {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [message, setMessage] = useState("");
  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [prompts, setPrompts] = useState(() => pickPrompts(3));

  // Фиксация зума и скролла через метатеги (дополнительно к CSS)
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0';
    document.getElementsByTagName('head')[0].appendChild(meta);
  }, []);

  useEffect(() => {
    const t = textareaRef.current;
    if (!t) return;
    t.style.height = "24px";
    t.style.height = `${Math.min(t.scrollHeight, 120)}px`;
  }, [message]);

  const send = async (text?: string) => {
    const val = text || message;
    if (val.trim().length < 2) return;

    const uId = `u-${Date.now()}`;
    const aId = `a-${Date.now()}`;
    
    setChatStarted(true);
    setMessages(prev => [...prev, { id: uId, role: "user", content: val }, { id: aId, role: "assistant", content: "", status: "loading" }]);
    setMessage("");

    // Имитация задержки "раздумий"
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === aId ? { 
        ...m, 
        status: "error", 
        header: "Йода занят сейчас", 
        content: "К сожалению, сейчас не могу ответить. Позже загляни.",
      } : m));
    }, 2000);
  };

  return (
    <main className="relative flex h-dvh flex-col bg-[#F5F3EE] select-none overflow-hidden">
      <div className="relative mx-auto flex h-full w-full max-w-md flex-col px-4 pt-6 pb-4">
        
        {/* Флексовое пятно: выше заголовка и ярче */}
        <div className="absolute top-[20%] left-1/2 h-[300px] w-[300px] -translate-x-1/2 bg-blob-optimized -z-10" />

        <header className="mb-8 flex items-center justify-between z-20">
          <button className="active:scale-95 transition-transform"><img src="/icons/menu.PNG" alt="" className="h-5 w-5" /></button>
          <div className="flex items-center gap-2">
            <img src="/icons/applogo.PNG" alt="" className="h-5 w-5" />
            <span className="text-[18px] font-black text-[#39704E]">swgoh.ai</span>
          </div>
          <button className="active:scale-95 transition-transform"><img src="/icons/profile.PNG" alt="" className="h-5 w-5" /></button>
        </header>

        <section className="relative flex-1 flex flex-col overflow-hidden">
          {/* Стартовый экран */}
          {!chatStarted && (
            <div className="flex flex-1 flex-col justify-center animate-fade-quick">
              <h2 className="text-[38px] font-semibold leading-tight mb-8">Чем помочь тебе, хм?</h2>
              <div className="space-y-3">
                <p className="text-sm font-medium text-[#8C867D]">Начать можно так</p>
                {prompts.map(p => (
                  <button key={p} onClick={() => send(p)} className="flex w-full items-center justify-between rounded-2xl bg-white px-4 py-4 text-left text-[14px] active:scale-[0.98] transition-transform">
                    {p}
                    <img src="/icons/right.PNG" alt="" className="h-3 w-3 opacity-30" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Чат */}
          {chatStarted && <ChatThread messages={messages} onRetry={() => send(messages[messages.length - 2].content)} />}

          {/* Инпут: всегда внизу, растет вверх */}
          <div className="mt-auto pt-4 bg-[#F5F3EE]">
            <div className="rounded-[24px] border border-[#E6E0D7] bg-white p-3 shadow-sm">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Спроси Йоду..."
                rows={1}
                className="w-full resize-none bg-transparent px-2 py-1 text-[15px] outline-none hide-scrollbar"
              />
              <div className="mt-2 flex justify-end">
                <button 
                  onClick={() => send()}
                  disabled={message.length < 2}
                  className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${message.length >= 2 ? 'bg-[#39704E] active:scale-90' : 'bg-gray-200 opacity-50'}`}
                >
                  <img src="/icons/send.PNG" alt="" className="h-4 w-4 brightness-0 invert" />
                </button>
              </div>
            </div>
            <p className="mt-2 text-center text-[10px] text-[#9A948A]">Йода может ошибаться, Силу чувствуй ты</p>
          </div>
        </section>
      </div>
    </main>
  );
}
