"use client";

import { useEffect, useRef, useState } from "react";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ChatThreadProps = {
  messages: ChatMessage[];
};

function splitWords(content: string) {
  return content.split(/\s+/).filter(Boolean);
}

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
      .find((entry) => entry.role === "assistant");

    if (!pendingAssistant) return;

    const words = splitWords(pendingAssistant.content);
    const revealedCount = revealedWords[pendingAssistant.id] ?? 0;

    if (revealedCount >= words.length) return;

    const timeoutId = window.setTimeout(() => {
      setRevealedWords((current) => ({
        ...current,
        [pendingAssistant.id]: Math.min((current[pendingAssistant.id] ?? 0) + 1, words.length)
      }));
    }, 16); // Ускорили печать (было 28)

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

          return (
            <div key={entry.id} className="flex flex-col gap-3">
              {/* Хедер ответа */}
              <div className="flex items-center gap-2.5 px-1">
                <img src="/icons/applogo.PNG" alt="" className="h-[18px] w-[18px] object-contain" />
                <span className="text-[15px] font-bold tracking-tight text-[#171717]">Yota 2.5</span>
              </div>

              {/* Тело ответа - теперь симметричное */}
              <div className="w-full px-1">
                <div className="text-[15px] leading-7 text-[#2E2E2E] w-full">
                  {words.slice(0, visibleCount).map((word, index) => (
                    <span key={`${entry.id}-${index}`} className="chat-word">
                      {index < visibleCount - 1 ? `${word}\u00A0` : word}
                    </span>
                  ))}
                </div>

                {/* Иконки под ответом - появляются плавно после завершения текста */}
                <div className={`mt-5 flex items-center gap-6 transition-all duration-300 ${isDone ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'}`}>
                  <button 
                    onClick={() => {
                      setSpinningId(entry.id);
                      setTimeout(() => setSpinningId(null), 600);
                    }}
                    className="active:scale-90 transition-transform"
                  >
                    <img 
                      src="/icons/refresh.PNG" 
                      alt="" 
                      className={`h-4 w-4 opacity-40 ${spinningId === entry.id ? 'animate-spin-smooth' : ''}`} 
                    />
                  </button>
                  <button 
                    onClick={() => toggleRating(entry.id, 'like')}
                    className="active:scale-90 transition-transform"
                  >
                    <img 
                      src="/icons/like.PNG" 
                      alt="" 
                      className={`h-4 w-4 transition-all ${ratings[entry.id] === 'like' ? 'opacity-100' : 'opacity-40 grayscale'}`}
                      style={ratings[entry.id] === 'like' ? { filter: 'invert(39%) sepia(18%) saturate(892%) hue-rotate(94deg)' } : {}}
                    />
                  </button>
                  <button 
                    onClick={() => toggleRating(entry.id, 'dislike')}
                    className="active:scale-90 transition-transform"
                  >
                    <img 
                      src="/icons/dislike.PNG" 
                      alt="" 
                      className={`h-4 w-4 transition-all ${ratings[entry.id] === 'dislike' ? 'opacity-100' : 'opacity-40 grayscale'}`}
                      style={ratings[entry.id] === 'dislike' ? { filter: 'invert(39%) sepia(18%) saturate(892%) hue-rotate(94deg)' } : {}}
                    />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
