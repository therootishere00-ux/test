"use client";

import { startTransition, useEffect, useMemo, useState } from "react";

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

const sidebarItems = ["История", "Настройки", "Профиль", "Выход"];

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
  const [name, setName] = useState("Артем");
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [analysisEnabled, setAnalysisEnabled] = useState(false);
  const [prompts, setPrompts] = useState(() => promptLibrary.slice(0, 5));

  useEffect(() => {
    setName(getTelegramName());
  }, []);

  const greeting = useMemo(() => `Ну привет, ${name}`, [name]);

  const handleShuffle = () => {
    startTransition(() => {
      setPrompts(pickFivePrompts(promptLibrary));
    });
  };

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#F5F3EE] text-[#171717] select-none">
      <button
        type="button"
        aria-label="Открыть меню"
        onClick={() => setSidebarOpen(true)}
        className="absolute left-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-[12px] border border-[#E5E2DA] bg-[#FFFFFF]"
      >
        <img src="/icons/menu.PNG" alt="" aria-hidden="true" className="h-[18px] w-[18px]" />
      </button>

      <button
        type="button"
        aria-label="Закрыть меню"
        onClick={() => setSidebarOpen(false)}
        className={`absolute inset-0 z-30 bg-[#111111]/8 ${sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />

      <aside
        className={`absolute left-0 top-0 z-40 h-dvh w-4/5 max-w-[320px] border-r border-[#E3DED5] bg-[#FBFAF7] ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col gap-3 px-4 pb-5 pt-6">
          <div className="rounded-[18px] border border-[#E7E1D8] bg-[#FFFFFF] px-4 py-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8F877A]">
              swgoh.ai
            </div>
            <div className="mt-2 text-lg font-semibold text-[#171717]">Голографический терминал</div>
          </div>

          <div className="grid gap-3">
            {sidebarItems.map((item) => (
              <button
                key={item}
                type="button"
                className="flex h-14 items-center rounded-[14px] border border-[#E7E1D8] bg-[#FFFFFF] px-4 text-left text-sm font-medium text-[#242424]"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <div className="flex min-h-dvh flex-col px-4 pb-5 pt-20">
        <section className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
          <div className="space-y-6">
            <div className="space-y-1 text-left">
              <h1 className="text-[38px] font-semibold leading-[0.98] tracking-[-0.05em] text-[#171717]">
                {greeting}
              </h1>
              <p className="text-[38px] font-semibold leading-[0.98] tracking-[-0.05em] text-[#171717]">
                С чем тебе помочь?
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-[#8C867D]">Быстрые промпты</p>

              <div className="prompt-strip flex gap-3 overflow-x-auto pb-1 pr-2">
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

            <form
              className="rounded-[18px] border border-[#E6E0D7] bg-[#FFFFFF] px-4 pb-3 pt-4"
              onSubmit={(event) => event.preventDefault()}
            >
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Спроси про состав, моды или план развития"
                aria-label="Ввести сообщение"
                rows={3}
                className="min-h-[92px] w-full resize-none bg-transparent text-[15px] leading-6 text-[#171717] outline-none placeholder:text-[#A09A90]"
              />

              <div className="mt-3 flex items-end justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setAnalysisEnabled((value) => !value)}
                  className={`inline-flex h-10 items-center gap-2 rounded-[12px] border px-3 ${
                    analysisEnabled
                      ? "border-[#171717] bg-[#171717] text-[#FFFFFF]"
                      : "border-[#E3DED5] bg-[#F7F4EE] text-[#6F6A61]"
                  }`}
                >
                  <span
                    className={`grid h-6 w-6 place-items-center rounded-[7px] ${
                      analysisEnabled ? "bg-[#FFFFFF]/14" : "bg-[#FFFFFF]"
                    }`}
                  >
                    <img src="/icons/firemode.PNG" alt="" aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium">Анализ</span>
                </button>

                <button
                  type="submit"
                  aria-label="Отправить сообщение"
                  className="grid h-10 w-10 place-items-center rounded-[12px] border border-[#171717] bg-[#171717] text-[#FFFFFF]"
                >
                  <img src="/icons/send.PNG" alt="" aria-hidden="true" className="h-[17px] w-[17px]" />
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
