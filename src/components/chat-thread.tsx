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
    }, 28);

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
      <div className="space-y-8 pb-6 pt-2">
        {messages.map((entry) => {
          const isAssistant = entry.role === "assistant";
          
          if (entry.role === "user") {
            return (
              <div key={entry.id} className="flex justify-end">
                {/* Убран контур (border), оставлен только фон */}
                <div className="chat-message-in max-w-[80%] rounded-[18px] bg-[#39704E]/15 px-4 py-3 text-[15px] leading-6 text-[#274333]">
                  {entry.content}
                </div>
              </div>
            );
          }

          const words = splitWords(entry.content);
          const visibleCount = revealedWords[entry.id] ?? 0;
          const isLongText = entry.content.length > 200; // Порог для иконки More

          return (
            <div key={entry.id} className="flex flex-col gap-2">
              {/* Заголовок над ответом ИИ с лого */}
              <div className="flex items-center gap-2 px-1">
                <img src="/icons/applogo.PNG" alt="" className="h-[14px] w-[14px] object-contain" />
                <span className="text-[14px] font-bold text-[#171717]">Yota 2.5</span>
              </div>

              <div className="flex justify-start">
                <div className="flex max-w-[90%] flex-col gap-3">
                  {/* Блок сообщения: растет в высоту, ограничен по длине */}
                  <div className="px-1 text-[15px] leading-7 text-[#2E2E2E]">
                    {words.slice(0, visibleCount).map((word, index) => (
                      <span key={`${entry.id}-${index}-${word}`} className="chat-word">
                        {index < visibleCount - 1 ? `${word}\u00A0` : word}
                      </span>
                    ))}
                    
                    {isLongText && visibleCount === words.length && (
                      <div className="mt-2 flex items-center gap-1.5 text-[#39704E] cursor-pointer">
                        <img src="/icons/more.PNG" alt="" className="h-4 w-4" />
                        <span className="text-[13px] font-medium">Больше</span>
                      </div>
                    )}
                  </div>

                  {/* Иконки под ответом: Перегенерация, Лайк, Дизлайк */}
                  <div className="flex items-center gap-4 px-1 pt-1">
                    <button className="opacity-45 hover:opacity-100 transition-opacity">
                      <img src="/icons/roll.PNG" alt="Roll" className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => toggleRating(entry.id, 'like')}
                      className={`transition-all ${ratings[entry.id] === 'like' ? 'brightness-100' : 'opacity-45 grayscale'}`}
                      style={ratings[entry.id] === 'like' ? { filter: 'invert(39%) sepia(18%) saturate(892%) hue-rotate(94deg) brightness(94%) contrast(88%)' } : {}}
                    >
                      <img src="/icons/like.PNG" alt="Like" className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => toggleRating(entry.id, 'dislike')}
                      className={`transition-all ${ratings[entry.id] === 'dislike' ? 'brightness-100' : 'opacity-45 grayscale'}`}
                      style={ratings[entry.id] === 'dislike' ? { filter: 'invert(39%) sepia(18%) saturate(892%) hue-rotate(94deg) brightness(94%) contrast(88%)' } : {}}
                    >
                      <img src="/icons/dislike.PNG" alt="Dislike" className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
