"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChatThread, type ChatMessage } from "@/components/chat-thread";
import { MenuDrawer } from "@/components/menu-drawer";

export function StartScreen() {
  const [isChatActive, setIsChatActive] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const onSend = () => {
    if (message.trim().length < 2) return;
    
    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message,
    };
    
    setMessages([newUserMsg]);
    setIsChatActive(true);
    setMessage("");
  };

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      <MenuDrawer open={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Верхняя панель */}
      <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-4 pt-4">
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl transition-active active:scale-90"
        >
          <img src="/icons/menu.PNG" alt="Menu" className="h-6 w-6 opacity-80" />
        </button>
      </div>

      {!isChatActive ? (
        <div className="flex h-full flex-col items-center justify-center px-6">
          {/* Лого и приветствие */}
          <div className="mb-10 flex flex-col items-center">
            <img src="/icons/applogo.PNG" alt="Logo" className="mb-6 h-16 w-16" />
            <h1 className="text-center text-3xl font-serif font-medium tracking-tight">
              О чем думаешь, хм?
            </h1>
          </div>

          {/* Контейнер ввода */}
          <div className="w-full max-w-[500px]">
            <div className="relative flex flex-col gap-3 rounded-[24px] border border-[#171717]/5 bg-[#171717]/[0.02] p-2 shadow-sm">
              
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Спроси о чем угодно..."
                className="w-full resize-none bg-transparent px-4 py-3 text-[16px] outline-none placeholder:text-[#171717]/30"
                rows={2}
              />

              <div className="flex items-center justify-between px-2 pb-1">
                {/* Новая плашка "Думай дольше" */}
                <button className="flex items-center gap-2 rounded-lg border border-[#171717]/10 bg-white px-3 py-1.5 transition-active active:scale-95">
                  <img src="/icons/bulb.svg" alt="" className="h-4 w-4 opacity-60" />
                  <span className="text-[13px] font-medium text-[#171717]/60">Думай дольше</span>
                </button>

                {/* Квадратная кнопка отправки */}
                <button
                  onClick={onSend}
                  disabled={message.trim().length < 2}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent)] text-white shadow-sm transition-all hover:opacity-90 disabled:opacity-20 active:scale-90"
                >
                  <img src="/icons/send.svg" alt="Send" className="h-5 w-5 invert" />
                </button>
              </div>
            </div>

            {/* Быстрые подсказки в стиле Claude */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {["Анализ ростера", "Совет по Гранд-арене", "Лучшие модули"].map((hint) => (
                <button 
                  key={hint}
                  onClick={() => setMessage(hint)}
                  className="rounded-full border border-[#171717]/5 bg-[#171717]/[0.03] px-4 py-2 text-[13px] text-[#171717]/50 hover:bg-[#171717]/[0.06]"
                >
                  {hint}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-full flex-col pt-16">
          <ChatThread messages={messages} />
          {/* Здесь будет компактный Input для режима чата */}
        </div>
      )}
    </main>
  );
}
