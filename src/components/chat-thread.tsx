"use client";

import { useEffect, useRef, useState } from "react";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  status?: "loading" | "done" | "error";
  header?: string;
  hideActions?: boolean;
};

// Новый лоадер: точки одного размера, вращаются по-разному
const YodaLoader = () => (
  <div className="relative h-5 w-5 animate-grow-center">
    <div className="absolute inset-0 spin-fast">
      <div className="h-1 w-1 rounded-full bg-[#39704E]" />
    </div>
    <div className="absolute inset-[3px] spin-medium">
      <div className="h-1 w-1 rounded-full bg-[#39704E]/60" />
    </div>
    <div className="absolute inset-[6px] spin-slow">
      <div className="h-1 w-1 rounded-full bg-[#39704E]/30" />
    </div>
  </div>
);

export function ChatThread({ messages, onRetry }: { messages: ChatMessage[], onRetry?: () => void }) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [revealedWords, setRevealedWords] = useState<Record<string, number>>({});
  
  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages, revealedWords]);

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === "assistant" && lastMsg.status === "done") {
      const words = lastMsg.content.split(/\s+/);
      const revealedCount = revealedWords[lastMsg.id] ?? 0;
      if (revealedCount < words.length) {
        const t = setTimeout(() => {
          setRevealedWords(prev => ({ ...prev, [lastMsg.id]: revealedCount + 1 }));
        }, 20);
        return () => clearTimeout(t);
      }
    }
  }, [messages, revealedWords]);

  return (
    <div ref={viewportRef} className="flex-1 overflow-y-auto hide-scrollbar pr-1">
      <div className="space-y-8 pb-4 pt-2">
        {messages.map((entry) => {
          const isLoading = entry.status === "loading";
          const isError = entry.status === "error";

          if (entry.role === "user") {
            return (
              <div key={entry.id} className="flex flex-col items-end animate-message-appear">
                <div className="max-w-[85%] rounded-[20px] bg-[#39704E]/15 px-4 py-3 text-[15px] leading-6 text-[#274333]">
                  {entry.content}
                </div>
              </div>
            );
          }

          return (
            <div key={entry.id} className="flex flex-col gap-3">
              {/* Шапка с анимацией перехода */}
              <div className="flex items-center gap-3 px-1">
                <div className="relative h-5 w-5 flex-shrink-0">
                  {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <YodaLoader />
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center animate-grow-center">
                      <img src="/icons/applogo.PNG" alt="" className="h-5 w-5" />
                    </div>
                  )}
                </div>

                <div className="relative h-[22px] flex-1 overflow-hidden">
                   <span className={`absolute inset-0 text-[16px] font-bold text-[#171717] flex items-center ${isLoading ? 'header-text-enter' : 'header-text-exit pointer-events-none'}`}>
                      Подумать Йоде нужно…
                   </span>
                   {!isLoading && (
                     <span className="absolute inset-0 text-[16px] font-bold text-[#171717] flex items-center header-text-enter">
                       {entry.header || "Yota 2.5"}
                     </span>
                   )}
                </div>
              </div>

              {/* Тело и кнопки */}
              <div className={`transition-all duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                <div className="text-[15px] leading-7 text-[#2E2E2E] px-1">
                  {entry.content.split(/\s+/).slice(0, revealedWords[entry.id] || 999).join(" ")}
                </div>

                {/* Подвал ответа */}
                {!isLoading && (
                  <div className="mt-4 flex items-center gap-5 animate-fade-quick">
                    {isError ? (
                      <button 
                        onClick={onRetry}
                        className="flex items-center gap-2 rounded-full py-1 active:scale-95 transition-transform"
                      >
                        <img src="/icons/refresh.PNG" alt="" className="h-4 w-4 opacity-60" />
                        <span className="text-[14px] font-medium text-[#39704E]">Попробовать снова</span>
                      </button>
                    ) : (
                      <>
                        <button className="active:scale-90 transition-transform"><img src="/icons/refresh.PNG" alt="" className="h-4 w-4 opacity-40" /></button>
                        <button className="active:scale-90 transition-transform"><img src="/icons/like.PNG" alt="" className="h-4 w-4 opacity-40" /></button>
                        <button className="active:scale-90 transition-transform"><img src="/icons/dislike.PNG" alt="" className="h-4 w-4 opacity-40" /></button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
