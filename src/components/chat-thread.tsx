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

type ChatThreadProps = {
  messages: ChatMessage[];
};

function splitWords(content: string) {
  return content.split(/\s+/).filter(Boolean);
}

// Новый лоадер: тонкие контуры и маленькие точки
const YodaLoader = () => (
  <div className="relative h-4 w-4 flex-shrink-0">
    {/* Внешний контур */}
    <div className="absolute inset-0 rounded-full border-[1px] border-[#39704E]/30 animate-[spin_2s_linear_infinite]">
      <div className="absolute -top-[1.5px] left-1/2 h-[3px] w-[3px] -translate-x-1/2 rounded-full bg-[#39704E]" />
    </div>
    {/* Средний контур */}
    <div className="absolute inset-[3px] rounded-full border-[1px] border-[#39704E]/30 animate-[spin_1.5s_linear_reverse_infinite]">
      <div className="absolute top-1/2 -right-[1.5px] h-[2.5px] w-[2.5px] -translate-y-1/2 rounded-full bg-[#39704E]" />
    </div>
    {/* Внутренний контур */}
    <div className="absolute inset-[6px] rounded-full border-[1px] border-[#39704E]/30 animate-[spin_1s_linear_infinite]">
      <div className="absolute -bottom-[1px] left-1/2 h-[2px] w-[2px] -translate-x-1/2 rounded-full bg-[#39704E]" />
    </div>
  </div>
);

export function ChatThread({ messages }: ChatThreadProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [revealedWords, setRevealedWords] = useState<Record<string, number>>({});
  const [ratings, setRatings] = useState<Record<string, "like" | "dislike" | null>>({});
  const [spinningId, setSpinningId] = useState<string | null>(null);

  useEffect(() => {
    if (!viewportRef.current) return;
    viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
  }, [messages, revealedWords]);

  useEffect(() => {
    const pendingAssistant = [...messages]
      .reverse()
      .find((entry) => entry.role === "assistant" && entry.status !== "loading");

    if (!pendingAssistant) return;

    const words = splitWords(pendingAssistant.content);
    const revealedCount = revealedWords[pendingAssistant.id] ?? 0;

    if (revealedCount >= words.length) return;

    const timeoutId = window.setTimeout(() => {
      setRevealedWords((current) => ({
        ...current,
        [pendingAssistant.id]: Math.min((current[pendingAssistant.id] ?? 0) + 1, words.length)
      }));
    }, 16);

    return () => window.clearTimeout(timeoutId);
  }, [messages, revealedWords]);

  const toggleRating = (msgId: string, type: "like" | "dislike") => {
    setRatings(prev => ({
      ...prev,
      [msgId]: prev[msgId] === type ? null : type
    }));
  };

  return (
    <div ref={viewportRef} className="visible-scrollbar flex-1 overflow-y-auto pr-1">
      <div className="space-y-8 pb-4 pt-2">
        {messages.map((entry) => {
          if (entry.role === "user") {
            const isLongUserText = entry.content.length > 180;
            return (
              <div key={entry.id} className="flex flex-col items-end gap-2">
                <div className="max-w-[85%] rounded-[20px] bg-[#39704E]/15 px-4 py-3 text-[15px] leading-6 text-[#274333]">
                  {entry.content}
                </div>
                {isLongUserText && (
                  <div className="flex items-center gap-1.5 px-1 opacity-60">
                    <span className="text-[12px] font-medium">Больше</span>
                    <img src="/icons/more.PNG" alt="" className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            );
          }

          const words = splitWords(entry.content);
          const visibleCount = revealedWords[entry.id] ?? 0;
          const isDone = visibleCount === words.length;
          const isLoading = entry.status === "loading";

          return (
            <div key={entry.id} className="flex flex-col gap-3">
              {/* Плавная смена шапки (Crossfade) */}
              <div className="flex items-center gap-2.5 px-1">
                {/* Анимация иконки */}
                <div className="relative h-[18px] w-[18px] flex-shrink-0">
                  <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out ${isLoading ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'}`}>
                    <YodaLoader />
                  </div>
                  <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out ${isLoading ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100 scale-100'}`}>
                    <img src="/icons/applogo.PNG" alt="" className="h-[18px] w-[18px] object-contain" />
                  </div>
                </div>

                {/* Анимация текста */}
                <div className="relative flex-1 h-[20px] overflow-hidden">
                  <span className={`absolute left-0 top-0 flex h-full items-center text-[15px] font-bold tracking-tight text-[#171717] transition-all duration-500 ease-out ${isLoading ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
                    Подумать Йоде нужно…
                  </span>
                  <span className={`absolute left-0 top-0 flex h-full items-center text-[15px] font-bold tracking-tight text-[#171717] transition-all duration-500 ease-out ${isLoading ? 'opacity-0 translate-y-2 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
                    {entry.header || "Yota 2.5"}
                  </span>
                </div>
              </div>

              {/* Тело ответа */}
              <div className={`w-full px-1 transition-all duration-500 ${isLoading ? 'opacity-0 max-h-0 overflow-hidden' : 'opacity-100 max-h-[2000px]'}`}>
                {entry.content && (
                  <div className="text-[15px] leading-7 text-[#2E2E2E] w-full">
                    {words.slice(0, visibleCount).map((word, index) => (
                      <span key={`${entry.id}-${index}`} className="chat-word">
                        {index < visibleCount - 1 ? `${word}\u00A0` : word}
                      </span>
                    ))}
                  </div>
                )}

                {/* Кнопки оценки */}
                {!entry.hideActions && (
                  <div className={`mt-5 flex items-center gap-6 transition-all duration-300 ${isDone ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'}`}>
                    <button 
                      onClick={() => {
                        setSpinningId(entry.id);
                        setTimeout(() => setSpinningId(null), 600);
                      }}
                      className="active:scale-90 transition-transform"
                    >
                      <img src="/icons/refresh.PNG" alt="" className={`h-4 w-4 opacity-40 ${spinningId === entry.id ? 'animate-spin-smooth' : ''}`} />
                    </button>
                    <button 
                      onClick={() => toggleRating(entry.id, 'like')}
                      className="active:scale-90 transition-transform"
                    >
                      <img 
                        src="/icons/like.PNG" alt="" 
                        className={`h-4 w-4 transition-all ${ratings[entry.id] === 'like' ? 'opacity-100' : 'opacity-40 grayscale'}`}
                        style={ratings[entry.id] === 'like' ? { filter: 'invert(39%) sepia(18%) saturate(892%) hue-rotate(94deg)' } : {}}
                      />
                    </button>
                    <button 
                      onClick={() => toggleRating(entry.id, 'dislike')}
                      className="active:scale-90 transition-transform"
                    >
                      <img 
                        src="/icons/dislike.PNG" alt="" 
                        className={`h-4 w-4 transition-all ${ratings[entry.id] === 'dislike' ? 'opacity-100' : 'opacity-40 grayscale'}`}
                        style={ratings[entry.id] === 'dislike' ? { filter: 'invert(39%) sepia(18%) saturate(892%) hue-rotate(94deg)' } : {}}
                      />
                    </button>
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
