"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ChatThreadProps = {
  messages: ChatMessage[];
  onNewChat: () => void;
  onOpenMenu: () => void;
};

// Компонент для ускоренной анимации текста «на месте»
function AnimatedAIResponse({ text, onComplete }: { text: string; onComplete: () => void }) {
  // Разбиваем текст на группы по 4-5 слов для эффекта быстрого заполнения
  const words = text.split(" ");
  const groups: string[][] = [];
  for (let i = 0; i < words.length; i += 5) {
    groups.push(words.slice(i, i + 5));
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      onAnimationComplete={onComplete}
      className="text-[#E8E6E3] text-[16px] leading-[1.6] font-serif"
    >
      {groups.map((group, groupIdx) => (
        <motion.span
          key={groupIdx}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 }
          }}
          transition={{
            duration: 0.1,
            delay: groupIdx * 0.15, // Скорость появления групп
            ease: "linear"
          }}
          className="inline-block mr-1.5"
        >
          {group.join(" ")}
        </motion.span>
      ))}
    </motion.div>
  );
}

export function ChatThread({ messages, onNewChat, onOpenMenu }: ChatThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Автоматический скролл вниз при добавлении сообщений
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full w-full max-w-[600px] mx-auto relative bg-[#252422]">
      {/* Шапка: невысокая, без блюра, шрифт без закорючек */}
      <div className="flex items-center justify-between px-0 py-3 z-20 bg-[#252422]">
        <button onClick={onOpenMenu} className="p-1 active:scale-90 transition-transform">
          <img src="/icons/menu.svg" alt="Menu" className="w-6 h-6 opacity-40 hover:opacity-100 invert" />
        </button>
        
        <h2 className="text-[15px] font-sans font-medium text-[#F2F1ED] tracking-wide">
          Новый чат
        </h2>
        
        <button onClick={onNewChat} className="p-1 active:scale-90 transition-transform">
          <img src="/icons/newchat.svg" alt="New Chat" className="w-6 h-6 opacity-40 hover:opacity-100 invert" />
        </button>
      </div>

      {/* Контейнер сообщений */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto hide-scrollbar space-y-12 pb-10 pt-4 px-1"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => (
            <MessageBlock 
              key={msg.id} 
              message={msg} 
              isLatest={index === messages.length - 1} 
            />
          ))}
        </AnimatePresence>
        
        {/* Заранее подготовленный пустой блок, если ждем ответ (Placeholder) */}
        {messages.length > 0 && messages[messages.length - 1].role === 'user' && (
          <div className="h-32 opacity-0">Загрузка...</div>
        )}
      </div>
    </div>
  );
}

function MessageBlock({ message, isLatest }: { message: ChatMessage; isLatest: boolean }) {
  const isUser = message.role === "user";
  const [isDone, setIsDone] = useState(!isLatest); // Если не последнее, значит уже нарисовано
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`flex flex-col ${isUser ? "items-end max-w-[90%]" : "items-start w-full"}`}>
        {isUser ? (
          <div className="px-1">
            <p className="text-[17px] leading-relaxed font-serif text-[#F2F1ED] opacity-95">
              {message.content}
            </p>
          </div>
        ) : (
          <div className="flex flex-col w-full space-y-4">
            {/* Иконка-логотип: GIF меняется на PNG */}
            <div className="relative w-7 h-7">
              <AnimatePresence mode="wait">
                {!isDone ? (
                  <motion.img
                    key="gif"
                    src="/icons/logo.GIF"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 w-full h-full object-contain"
                    alt="Generating..."
                  />
                ) : (
                  <motion.img
                    key="png"
                    src="/icons/logo.PNG"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 w-full h-full object-contain"
                    alt="AI"
                  />
                )}
              </AnimatePresence>
            </div>
            
            {/* Текст ответа */}
            <div className="min-h-[20px] w-full">
              {isLatest && !isDone ? (
                <AnimatedAIResponse 
                  text={message.content} 
                  onComplete={() => setIsDone(true)} 
                />
              ) : (
                <p className="text-[#E8E6E3] text-[16px] leading-[1.6] font-serif">
                  {message.content}
                </p>
              )}
            </div>
            
            {/* Футер сообщения (кнопки) появляется только когда текст готов */}
            <AnimatePresence>
              {isDone && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-5 ml-0.5 pt-2"
                >
                  <button className="active:scale-90 transition-all opacity-30 hover:opacity-80">
                    <img src="/icons/redo.svg" alt="Redo" className="w-[17px] h-[17px] invert" />
                  </button>
                  
                  <div className="flex items-center gap-4">
                    <button onClick={() => setFeedback(feedback === 'like' ? null : 'like')}>
                      <img 
                        src="/icons/like.svg" 
                        alt="Like" 
                        className={`w-[17px] h-[17px] transition-all ${feedback === 'like' ? 'opacity-100' : 'opacity-30 hover:opacity-80 invert'}`}
                        style={feedback === 'like' ? { filter: 'invert(58%) sepia(13%) saturate(1067%) hue-rotate(82deg) brightness(96%) contrast(87%)' } : {}}
                      />
                    </button>
                    <button onClick={() => setFeedback(feedback === 'dislike' ? null : 'dislike')}>
                      <img 
                        src="/icons/dislike.svg" 
                        alt="Dislike" 
                        className={`w-[17px] h-[17px] transition-all ${feedback === 'dislike' ? 'opacity-100' : 'opacity-30 hover:opacity-80 invert'}`}
                        style={feedback === 'dislike' ? { filter: 'invert(58%) sepia(13%) saturate(1067%) hue-rotate(82deg) brightness(96%) contrast(87%)' } : {}}
                      />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
