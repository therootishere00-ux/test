"use client";

import { startTransition, useEffect, useRef, useState } from "react";

const promptLibrary = [
  "Собери план прокачки аккаунта на 30 дней",
  "Подбери контр-пики под текущий GAC",
  "С чего начать путь к Galactic Legend",
  "Разбери мои слабые места по модам",
  "Кого качать следующим из текущего ростера",
  "Собери эффективный флот для ранней игры",
  "Какие омеги и зеты важнее всего сейчас",
  "Как ускорить фарм ключевых команд",
  "Какие герои сильнее для Conquest",
  "Как выжать максимум из текущего инвентаря",
  "Проведи аудит ресурсов и узких мест",
  "Подбери составы под Territory War"
];

function getTelegramName() {
  const webApp = typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
  const firstName = webApp?.initDataUnsafe?.user?.first_name?.trim();
  return firstName || "Артем";
}

function pickFivePrompts(source: string[]) {
  const items = [...source];

  for (let index = items.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[nextIndex]] = [items[nextIndex], items[index]];
  }

  return items.slice(0, 5);
}

export function StartScreen() {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [name, setName] = useState("Артем");
  const [message, setMessage] = useState("");
  const [analysisEnabled, setAnalysisEnabled] = useState(false);
  const [prompts, setPrompts] = useState(() => promptLibrary.slice(0, 5));

  useEffect(() => {
    setName(getTelegramName());
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "0px";

    const nextHeight = Math.min(textarea.scrollHeight, 120);

    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > 120 ? "auto" : "hidden";
  }, [message]);

  const handleShuffle = () => {
    startTransition(() => {
      setPrompts(pickFivePrompts(promptLibrary));
    });
  };

  const analysisIconStyle = analysisEnabled
    ? {
        filter:
          "brightness(0) saturate(100%) invert(39%) sepia(18%) saturate(892%) hue-rotate(94deg) brightness(94%) contrast(88%)"
      }
    : undefined;

  return (
    <main className="min-h-dvh overflow-hidden bg-[#F5F3EE] text-[#171717] select-none">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-6 pt-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Меню"
            className="inline-flex h-11 items-center gap-2 rounded-[14px] border border-[#E4DED4] bg-[#FFFFFF] px-4 text-sm font-medium text-[#171717]"
          >
            <img src="/icons/menu.PNG" alt="" aria-hidden="true" className="h-[18px] w-[18px]" />
            <span>Меню</span>
          </button>

          <button
            type="button"
            aria-label="Профиль"
            className="grid h-11 w-11 place-items-center rounded-[14px] border border-[#E4DED4] bg-[#FFFFFF]"
          >
            <span className="h-5 w-5 rounded-[8px] border border-[#D9D2C8] bg-[#F3EFE8]" />
          </button>
        </div>

        <section className="flex flex-1 flex-col justify-center">
          <div className="space-y-6">
            <div className="space-y-1 text-left">
              <h1 className="text-[38px] font-semibold leading-[0.98] tracking-[-0.05em] text-[#171717]">
                Ну привет, {name}
              </h1>
              <p className="text-[38px] font-semibold leading-[0.98] tracking-[-0.05em] text-[#171717]">
                С чем тебе помочь?
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-[#8C867D]">Быстрые промпты</p>

              <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-1 pr-2">
                {prompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className="shrink-0 rounded-[14px] border border-[#E6E0D7] bg-[#FBFAF7] px-4 py-3 text-left text-sm leading-snug text-[#2A2A2A]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleShuffle}
                className="inline-flex items-center gap-2 text-sm font-medium text-[#8C867D]"
              >
                <img src="/icons/refresh.PNG" alt="" aria-hidden="true" className="h-[15px] w-[15px]" />
                Перемешать
              </button>
            </div>

            <div className="space-y-3">
              <form
                className="rounded-[18px] border border-[#E6E0D7] bg-[#FFFFFF] px-4 pb-3 pt-3"
                onSubmit={(event) => event.preventDefault()}
              >
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Спроси про состав, моды или план развития..."
                  aria-label="Ввести сообщение"
                  rows={1}
                  className="hide-scrollbar min-h-[24px] w-full resize-none bg-transparent py-1 text-[15px] leading-6 text-[#171717] outline-none placeholder:text-[#A09A90]"
                />

                <div className="mt-3 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setAnalysisEnabled((value) => !value)}
                    className={`inline-flex h-9 items-center gap-2 rounded-[12px] border px-3 ${
                      analysisEnabled
                        ? "border-[#CFE1D6] bg-[#EDF5F0] text-[#39704E]"
                        : "border-[#E3DED5] bg-[#F7F4EE] text-[#6F6A61]"
                    }`}
                  >
                    <img
                      src="/icons/firemode.PNG"
                      alt=""
                      aria-hidden="true"
                      className="h-4 w-4"
                      style={analysisIconStyle}
                    />
                    <span className="text-sm font-medium">Анализ</span>
                  </button>

                  <button
                    type="submit"
                    aria-label="Отправить сообщение"
                    className="grid h-9 w-9 place-items-center rounded-[12px] border border-[#171717] bg-[#171717]"
                  >
                    <img
                      src="/icons/send.PNG"
                      alt=""
                      aria-hidden="true"
                      className="h-[16px] w-[16px] brightness-0 invert"
                    />
                  </button>
                </div>
              </form>

              <p className="text-center text-xs text-[#9A948A]">Это ИИ, он может допускать ошибки</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
