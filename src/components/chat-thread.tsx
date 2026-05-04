"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreModal } from "@/components/more";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isPlaceholder?: boolean;
};

type ChatThreadProps = {
  messages: ChatMessage[];
  onNewChat: () => void;
  onOpenMenu: () => void;
  onEditSubmit: (id: string, content: string) => void;
  onRedo: (id: string) => void;
};

// ВОЗВРАЩЕНА ОРИГИНАЛЬНАЯ АНИМАЦИЯ С BLUR
function AnimatedAIResponse({ text, onComplete }: { text: string; onComplete: () => void }) {
  const words = useMemo(() => text.split(" "), [text]);
  
  const wordAnim = {
    hidden: { opacity: 0, filter: "blur(4px)" },
    visible: (i: number) => ({
      opacity: 1, 
      filter: "blur(0px)",
      transition: { delay: Math.floor(i / 4) * 0.08, duration: 0.3, ease: "easeOut" }
    })
  };

  return (
    <motion.div 
      initial="hidden" 
      animate="visible"
      onAnimationComplete={onComplete}
      className="text-[#E8E6E3] text-[16px] leading-[1.65] font-serif"
    >
      {words.map((word, index) => (
        <motion.span 
          key={index} 
          custom={index}
          variants={wordAnim} 
          className="inline-block mr-[0.3em]"
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}

export function ChatThread({ messages, onNewChat, onOpenMenu, onEditSubmit, onRedo }: ChatThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [activeContent, setActiveContent] = useState("");
  const [completedMessages, setCompletedMessages] = useState<Record<string, boolean>>({});
  
  // Состояния для редактирования
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  
  // Состояние для лайков/дизлайков
  const [feedbacks, setFeedbacks] = useState<Record<string, 'like' | 'dislike' | null>>({});

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, editingId]);

  const handleMarkComplete = (id: string) => {
    setCompletedMessages(prev => ({ ...prev, [id]: true }));
  };

  const handleFeedback = (id: string, type: 'like' | 'dislike') => {
    setFeedbacks(prev => ({ ...prev, [id]: type }));
    if (type === 'dislike') {
      window.open('https://t.me/swgohbugbot', '_blank');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#252422]">
      {/* Шапка чата */}
      <header className="flex items-center justify-between px-6 h-[60px] shrink-0 z-10">
        <button onClick={onOpenMenu} className="p-2 -ml-2 active:scale-90 transition-transform">
          <img src="/icons/menu.svg" alt="Menu" className="w-6 h-6 invert opacity-60" />
        </button>
        <span className="text-[15px] font-sans font-medium text-[#F2F1ED] tracking-wide">
          Новый чат
        </span>
        <button onClick={onNewChat} className="p-2 -mr-2 active:scale-90 transition-transform">
          <img src="/icons/newchat.svg" alt="New" className="w-6 h-6 invert opacity-60" />
        </button>
      </header>

      {/* Список сообщений */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-8 hide-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col w-full max-w-[600px] mx-auto">
            
            {/* СООБЩЕНИЕ ПОЛЬЗОВАТЕЛЯ */}
            {msg.role === "user" && (
              // ВЕРНУЛ ОРИГИНАЛЬНЫЕ ОТСТУПЫ И ШИРИНУ
              <div className="group relative ml-auto max-w-[85%] lg:max-w-[75%]">
                {editingId === msg.id ? (
                  <div className="flex flex-col gap-2 w-full min-w-[280px]">
                    <textarea
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      // ОРИГИНАЛЬНЫЕ СТИЛИ (rounded-24px, ring-1)
                      className="w-full bg-[#2D2C2A] text-[#F2F1ED] rounded-[24px] px-5 py-3.5 ring-1 ring-[#5FA86D]/30 outline-none resize-none text-[16px] leading-[1.4] tracking-[-0.01em]"
                      rows={3}
                    />
                    <div className="flex gap-2 h-10 mt-1">
                      <button 
                        onClick={() => setEditingId(null)}
                        className="flex-1 bg-[#2D2C2A] text-[#6A6965] rounded-xl text-sm font-medium active:scale-95 transition-transform ring-1 ring-white/5"
                      >
                        Отмена
                      </button>
                      <button 
                        onClick={() => {
                          onEditSubmit(msg.id, editValue);
                          setEditingId(null);
                        }}
                        className="flex-1 bg-[#5FA86D] text-[#1A1A18] rounded-xl text-sm font-bold active:scale-95 transition-transform"
                      >
                        Отправить
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* ОРИГИНАЛЬНЫЙ ДИЗАЙН БАББЛА */}
                    <div className="bg-[#2D2C2A] rounded-[24px] px-5 py-3.5 text-[#F2F1ED] text-[16px] leading-[1.4] tracking-[-0.01em] shadow-sm ring-1 ring-white/[0.04]">
                      {msg.content}
                    </div>
                    {/* Кнопка Edit вынесена вниз/сбоку, чтобы не ломать баббл */}
                    <div className="absolute -bottom-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setEditingId(msg.id);
                          setEditValue(msg.content);
                        }}
                        className="p-2 active:scale-90 transition-transform opacity-40 hover:opacity-100"
                      >
                        <img src="/icons/edit.svg" alt="Edit" className="w-4 h-4 invert" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* СООБЩЕНИЕ АССИСТЕНТА */}
            {msg.role === "assistant" && (
              <div className="flex items-start gap-4 mr-auto w-full group">
                {/* Динамическое лого */}
                <div className="w-8 h-8 rounded-lg shrink-0 overflow-hidden mt-1 bg-[#2D2C2A] border border-white/5 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {!completedMessages[msg.id] && !msg.content ? (
                      <motion.img 
                        key="gif"
                        src="/icons/logo.gif" 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="w-5 h-5 opacity-80"
                      />
                    ) : (
                      <motion.img 
                        key="png"
                        src="/icons/logo.PNG" 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="w-6 h-6"
                      />
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex-1 space-y-3 pt-1">
                  {msg.isPlaceholder ? (
                    <div className="flex gap-1.5 py-3">
                      <span className="w-1.5 h-1.5 bg-[#5FA86D] rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-[#5FA86D] rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-[#5FA86D] rounded-full animate-bounce" />
                    </div>
                  ) : (
                    <>
                      <AnimatedAIResponse 
                        text={msg.content} 
                        onComplete={() => handleMarkComplete(msg.id)} 
                      />
                      
                      {/* ВОЗВРАЩЕН ОРИГИНАЛЬНЫЙ БЛОК С ЛАЙКАМИ И КНОПКАМИ */}
                      {completedMessages[msg.id] && (
                        <motion.div 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }} 
                          className="flex items-center gap-6 pt-2"
                        >
                          <button 
                            onClick={() => {
                              setActiveContent(msg.content);
                              setIsMoreOpen(true);
                            }}
                            className="flex items-center gap-1.5 text-[12px] text-[#6A6965] hover:text-[#9A9894] transition-colors"
                          >
                            <img src="/icons/more.svg" className="w-4 h-4 invert opacity-40" />
                            <span>Подробнее</span>
                          </button>
                          
                          <div className="flex items-center gap-2">
                            {/* Новая кнопка Redo */}
                            <button 
                              onClick={() => onRedo(msg.id)}
                              className="active:scale-95 transition-transform p-1 opacity-40 hover:opacity-100"
                              title="Перегенерировать ответ"
                            >
                              <img src="/icons/redo.svg" alt="Redo" className="w-[17px] h-[17px] invert" />
                            </button>
                            
                            {/* Старые кнопки Like/Dislike с фильтрами */}
                            <button 
                              onClick={() => handleFeedback(msg.id, 'like')} 
                              className="active:scale-95 transition-transform p-1"
                              style={{ opacity: feedbacks[msg.id] === 'like' ? 1 : 0.4 }}
                            >
                              <img 
                                src="/icons/like.svg" 
                                className="w-[18px] h-[18px]"
                                style={{ filter: feedbacks[msg.id] === 'like' ? 'invert(58%) sepia(13%) saturate(1067%) hue-rotate(82deg) brightness(96%) contrast(87%)' : 'invert(1)' }}
                              />
                            </button>
                            <button 
                              onClick={() => handleFeedback(msg.id, 'dislike')} 
                              className="active:scale-95 transition-transform p-1"
                              style={{ opacity: feedbacks[msg.id] === 'dislike' ? 1 : 0.4 }}
                            >
                              <img 
                                src="/icons/dislike.svg" 
                                className="w-[18px] h-[18px]"
                                style={{ filter: feedbacks[msg.id] === 'dislike' ? 'invert(58%) sepia(13%) saturate(1067%) hue-rotate(82deg) brightness(96%) contrast(87%)' : 'invert(1)' }}
                              />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {/* Распорка для скролла */}
        <div className="h-10 w-full shrink-0" />
      </div>

      <MoreModal 
        isOpen={isMoreOpen} 
        onClose={() => setIsMoreOpen(false)} 
        content={activeContent} 
      />
    </div>
  );
}
