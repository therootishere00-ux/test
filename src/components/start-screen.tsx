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
  "Как правильно расходовать ресурсы",
  "Что качать в первую очередь",
  "Подскажи по моему текущему составу",
  "Как подготовиться к войне за территорию",
  "Что мне не хватает для флота",
  "Расскажи про мои узкие места",
  "Как получить первую легенду быстрее"
];

const demoReply = "Анализ завершен. Для оптимального прогресса в GAC сейчас стоит сфокусироваться на улучшении ваших имперских штурмовиков во главе с Иденом Версио. Это бюджетная, но крайне эффективная команда.";

function getTelegramName() {
  const webApp = typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
  return webApp?.initDataUnsafe?.user?.first_name?.trim() || "Артем";
}

function pickPrompts(source: string[], amount: number) {
  const items = [...source].sort(() => 0.5 - Math.random());
  return items.slice(0, amount);
}

function isEmojiOnly(value: string) {
  const withoutEmoji = value.trim()
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\uFE0F]/gu, "")
    .replace(/\s/gu, "");
  return value.trim().length > 0 && withoutEmoji.length === 0;
}

export function StartScreen() {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [name, setName] = useState("Артем");
  const [message, setMessage] = useState("");
  const [analysisEnabled, setAnalysisEnabled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [prompts, setPrompts] = useState(() => pickPrompts(promptLibrary, 5));
  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => { setName(getTelegramName()); }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    const nextHeight = Math.min(textarea.scrollHeight, 120);
    textarea.style.height = `${nextHeight}px`;
  }, [message]);

  const handleShuffle = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      startTransition(() => {
        setPrompts(pickPrompts(promptLibrary, 5));
        setIsRefreshing(false);
      });
    }, 200);
  };

  const submitMessage = () => {
    const normalized = message.trim();
    if (normalized.length < 2 || isEmojiOnly(normalized)) return;

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", content: normalized };
    setChatStarted(true);
    setMessages(prev => [...prev, userMsg]);
    setMessage("");

    setTimeout(() => {
      setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: "assistant", content: demoReply }]);
    }, 400);
  };

  const renderComposer = () => (
    <div className="flex flex-col gap-3">
      <form
        className="rounded-[22px] border border-[#E6E0D7] bg-[#FFFFFF] px-4 pb-3 pt-3 shadow-sm"
        onSubmit={(e) => { e.preventDefault(); submitMessage(); }}
      >
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={analysisEnabled ? "Что стоит анализировать.." : "Спросите Yota..."}
          rows={1}
          className="hide-scrollbar min-h-[24px] w-full resize-none bg-transparent py-1 text-[15px] outline-none placeholder:text-[#A09A90]"
        />
        <div className="mt-2.5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setAnalysisEnabled(!analysisEnabled)}
            className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 transition-all ${
              analysisEnabled ? "border-[#CFE1D6] bg-[#EDF5F0] text-[#39704E]" : "border-[#E3DED5] bg-[#F7F4EE] text-[#6F6A61]"
            }`}
          >
            <img src="/icons/firemode.PNG" alt="" className="h-4 w-4" style={analysisEnabled ? { filter: "invert(39%) sepia(18%) saturate(892%) hue-rotate(94deg)" } : {}} />
            <span className="text-sm font-medium">Анализ</span>
          </button>
          <button
            type="submit"
            disabled={message.trim().length < 2}
            className={`grid h-9 w-9 place-items-center rounded-xl transition-all ${
              message.trim().length >= 2 ? "bg-[#39704E] shadow-lg shadow-[#39704E]/20" : "bg-[#171717]/30"
            }`}
          >
            <img src="/icons/send.PNG" alt="" className="h-4 w-4 brightness-0 invert" />
          </button>
        </div>
      </form>
      <p className="text-center text-[11px] font-medium text-[#9A948A]">Это ИИ, он может допускать ошибки</p>
    </div>
  );

  return (
    <main className="relative flex h-dvh flex-col bg-[#F5F3EE] text-[#171717] select-none overflow-hidden">
      <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Контент с фиксированным pb-[15px] для прижатия к низу */}
      <div className="relative mx-auto flex h-full w-full max-w-md flex-col px-4 pt-6 pb-[15px]">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <button onClick={() => setMenuOpen(true)} className="p-1">
            <img src="/icons/menu.PNG" alt="" className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/icons/applogo.PNG" alt="" className="h-5 w-5" />
            <h1 className="text-[18px] font-black text-[#39704E]">swgoh<span className="opacity-60">.ai</span></h1>
          </div>
          <button className="p-1">
            <img src="/icons/profile.PNG" alt="" className="h-5 w-5" />
          </button>
        </div>

        <section className="relative flex flex-1 flex-col overflow-hidden">
          {/* Start Screen Center */}
          {!chatStarted && (
            <div className="flex flex-1 flex-col justify-center">
              <div className="space-y-7">
                <div className="space-y-1">
                  <h2 className="text-[38px] font-semibold tracking-tight leading-[1.05]">Ну привет, {name}</h2>
                  <p className="text-[38px] font-semibold tracking-tight leading-[1.05]">С чем тебе помочь?</p>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-medium text-[#8C867D]">Начать можно так</p>
                  <div className={`flex flex-col gap-2 transition-opacity duration-200 ${isRefreshing ? "opacity-0" : "opacity-100"}`}>
                    {prompts.map((p) => (
                      <button key={p} onClick={() => setMessage(p)} className="flex items-center justify-between rounded-2xl border border-[#E6E0D7] bg-[#FBFAF7] px-4 py-3.5 text-left text-[14px]">
                        <span>{p}</span>
                        <img src="/icons/right.PNG" alt="" className="h-3 w-3 opacity-50" />
                      </button>
                    ))}
                  </div>
                  <button onClick={handleShuffle} className="flex items-center gap-2 text-sm font-medium text-[#8C867D]">
                    <img src="/icons/refresh.PNG" alt="" className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                    Перемешать
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Chat area */}
          {chatStarted && (
            <div className="flex-1 overflow-hidden flex flex-col mb-4">
              <ChatThread messages={messages} />
            </div>
          )}

          {/* Bottom Composer - Always pinned to bottom with 15px margin */}
          <div className="mt-auto">
            {renderComposer()}
          </div>
        </section>
      </div>
    </main>
  );
}
