"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { ChatThread, type ChatMessage } from "@/components/chat-thread";
import { MenuDrawer } from "@/components/menu-drawer";
import { motion, AnimatePresence } from "framer-motion";

export type TMAUser = {
  first_name: string;
  username?: string;
  photo_url?: string;
};

const PromptRow = ({ items, direction, speed, onPick }: any) => {
  const scrollClass = direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right';
  return (
    <div className="flex overflow-hidden py-1 select-none w-full">
      <div className={`flex shrink-0 items-center gap-2 ${scrollClass}`} style={{ animationDuration: speed }}>
        {[...items, ...items].map((item: string, idx: number) => (
          <button 
            key={idx} 
            onClick={() => onPick(item)}
            className="whitespace-nowrap rounded-lg border border-white/5 bg-transparent px-3 py-1.5 text-[13px] text-[#9A9894] transition-all duration-200 hover:bg-white/5 hover:text-[#C5C4C0] active:scale-95"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
};

export function StartScreen() {
  const [message, setMessage] = useState("");
  const [chatStarted, setChatStarted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [allPrompts, setAllPrompts] = useState<string[]>([]);
  const [tmaUser, setTmaUser] = useState<TMAUser>({ first_name: "юзер" });
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Инициализация TMA пользователя
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const user = window.Telegram.WebApp.initDataUnsafe?.user;
      if (user) {
        setTmaUser({
          first_name: user.first_name,
          username: user.username,
          photo_url: user.photo_url
        });
      }
    }
  }, []);

  useEffect(() => {
    fetch('/slovar.txt')
      .then(res => res.text())
      .then(data => {
        const lines = data.split(/\r?\n/).filter(line => line.trim().length > 0);
        setAllPrompts(lines.sort(() => Math.random() - 0.5));
      })
      .catch(() => setAllPrompts(["Гайд на Гранд-мастера Йоду", "Лучшие модули для Вейдера", "Как пройти 7 уровень"]));
  }, []);

  const rows = useMemo(() => {
    if (allPrompts.length === 0) return [];
    return [
      { items: allPrompts.slice(0, 10), dir: 'left', speed: '100s' },
      { items: allPrompts.slice(10, 20), dir: 'right', speed: '90s' },
    ];
  }, [allPrompts]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = '24px';
    ta.style.height = `${Math.max(Math.min(ta.scrollHeight, 52), 24)}px`;
  }, [message]);

  const fetchAIResponse = async (chatHistory: ChatMessage[], aiMsgId: string) => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: chatHistory.filter(m => !m.isPlaceholder).map(m => ({ role: m.role, content: m.content })) 
        })
      });

      const data = await res.json();
      
      setMessages(prev => prev.map(msg => 
        msg.id === aiMsgId 
          ? { ...msg, content: data.text || data.error, isPlaceholder: false }
          : msg
      ));
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === aiMsgId 
          ? { ...msg, content: "Прости, но сейчас сервера загружены (fetch error)", isPlaceholder: false }
          : msg
      ));
    }
  };

  const onSend = (text?: string) => {
    const content = text || message;
    if (content.trim().length < 2) return;
    
    const userMsgId = Date.now().toString();
    const assistantMsgId = (Date.now() + 1).toString();

    const newMessages: ChatMessage[] = [
      ...messages, 
      { id: userMsgId, role: "user", content: content.trim() },
      { id: assistantMsgId, role: "assistant", content: "", isPlaceholder: true }
    ];

    setMessages(newMessages);
    setChatStarted(true);
    setMessage("");

    if (textareaRef.current) textareaRef.current.style.height = '24px';

    fetchAIResponse(newMessages, assistantMsgId);
  };

  const handleEditSubmit = (msgId: string, newContent: string) => {
    const msgIndex = messages.findIndex(m => m.id === msgId);
    if (msgIndex === -1) return;

    // Обрезаем массив до редактируемого сообщения включительно
    const newHistory = messages.slice(0, msgIndex);
    const updatedUserMsg: ChatMessage = { id: msgId, role: "user", content: newContent };
    const assistantMsgId = Date.now().toString();

    const newMessages: ChatMessage[] = [
      ...newHistory,
      updatedUserMsg,
      { id: assistantMsgId, role: "assistant", content: "", isPlaceholder: true }
    ];

    setMessages(newMessages);
    fetchAIResponse(newMessages, assistantMsgId);
  };

  const handleRedo = (aiMsgId: string) => {
    const aiIndex = messages.findIndex(m => m.id === aiMsgId);
    if (aiIndex <= 0) return;

    // Обрезаем массив истории до сообщения пользователя, предшествующего этому ответу ИИ
    const newHistory = messages.slice(0, aiIndex);
    const newAssistantMsgId = Date.now().toString();

    const newMessages: ChatMessage[] = [
      ...newHistory,
      { id: newAssistantMsgId, role: "assistant", content: "", isPlaceholder: true }
    ];

    setMessages(newMessages);
    fetchAIResponse(newMessages, newAssistantMsgId);
  };

  const inputAreaContent = (
    <div className={`w-full max-w-[600px] mx-auto px-8 flex flex-col items-center ${chatStarted ? 'pb-4 pt-2' : ''}`}>
      <div className="relative flex w-full flex-col bg-[#2D2C2A] rounded-[20px] border border-white/[0.05] transition-all shadow-sm">
        <div className="flex items-end p-3 gap-2"> 
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Спросить что-нибудь..."
            className="hide-scrollbar w-full bg-transparent text-[15px] text-[#E8E6E3] outline-none placeholder:text-[#6A6965] resize-none pb-1.5"
            style={{ 
              lineHeight: '24px', 
              minHeight: '24px'
            }}
          />
          {chatStarted && (
            <button className="flex-shrink-0 active:scale-95 transition-transform mb-1 opacity-40 hover:opacity-80">
              <img src="/icons/arrows.svg" alt="Expand" className="w-[18px] h-[18px] invert" />
            </button>
          )}
          <button
            onClick={() => onSend()}
            disabled={message.trim().length < 2}
            className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-[12px] bg-[#5FA86D] disabled:opacity-20 active:scale-95 transition-transform"
          >
            <img 
              src="/icons/send.svg" 
              className="w-[18px] h-[18px]" 
              style={{ filter: 'brightness(0) saturate(100%) invert(11%) sepia(4%) saturate(842%) hue-rotate(3deg) brightness(96%) contrast(89%)' }} 
              alt="Send" 
            />
          </button>
        </div>
      </div>
      {!chatStarted && (
        <p className="mt-3 text-center text-[11px] leading-normal text-[#6A6965] px-4 w-full">
          Хотя мы стараемся сделать ваш опыт общения лучше, это ИИ и он может ошибаться
        </p>
      )}
    </div>
  );

  return (
    <main className="relative h-dvh w-full bg-[#252422] font-sans antialiased overflow-hidden text-[#E8E6E3]">
      <style jsx global>{`
        @keyframes marquee-left { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes marquee-right { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .animate-marquee-left { animation: marquee-left linear infinite; }
        .animate-marquee-right { animation: marquee-right linear infinite; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>

      <MenuDrawer open={isMenuOpen} onClose={() => setIsMenuOpen(false)} user={tmaUser} />

      <AnimatePresence mode="popLayout">
        {!chatStarted ? (
          <motion.div 
            key="start-screen"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-[#252422] z-40"
          >
             <div className="absolute top-8 left-8 z-[100]">
              <button onClick={() => setIsMenuOpen(true)} className="p-1 active:scale-90 transition-transform">
                <img src="/icons/menu.svg" alt="Menu" className="w-6 h-6 opacity-40 hover:opacity-80 invert" />
              </button>
            </div>

            <div className="w-full max-w-[600px] mx-auto flex flex-col relative -mt-[4vh]">
              <div className="w-full px-8 mb-8 flex flex-col items-start">
                <img src="/icons/logo.PNG" alt="Logo" className="w-10 h-10 mb-6 opacity-90" />
                <div className="space-y-0.5">
                  <h2 className="text-[28px] leading-tight font-serif text-[#F2F1ED] tracking-tight">
                    Привет, <span className="text-[#5FA86D]">{tmaUser.first_name}</span>
                  </h2>
                  <h1 className="text-[28px] leading-tight font-serif text-[#6A6965] tracking-tight">
                    Как помочь тебе сегодня?
                  </h1>
                </div>
              </div>

              <div className="w-full space-y-1 mb-8 opacity-60">
                {rows.map((row, i) => (
                  <PromptRow key={i} items={row.items} direction={row.dir} speed={row.speed} onPick={(t:string) => setMessage(t)} />
                ))}
              </div>

              {inputAreaContent}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="chat-screen"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex flex-col z-50 bg-[#252422]"
          >
            <div className="flex-1 overflow-hidden flex flex-col relative">
              <ChatThread 
                messages={messages} 
                onNewChat={() => { setChatStarted(false); setMessages([]); }} 
                onOpenMenu={() => setIsMenuOpen(true)}
                onEditSubmit={handleEditSubmit}
                onRedo={handleRedo}
              />
            </div>
            
            <div className="w-full bg-[#252422] shrink-0 border-t border-white/[0.04]">
              {inputAreaContent}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
