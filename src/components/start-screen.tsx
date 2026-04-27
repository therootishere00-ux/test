"use client";

import { startTransition, useEffect, useMemo, useState } from "react";

const promptLibrary = [
  "Собери план прокачки аккаунта на 30 дней",
  "Подбери контр-пики под текущий GAC",
  "С чего начать путь к Galactic Legend",
  "Разбери мои слабые места по модам",
  "Кого качать следующим из текущего ростера",
  "Собери эффективный флот для ранней игры",
  "Какие омеги и зеты сейчас важнее всего",
  "Как ускорить фарм ключевых команд",
  "Какие герои лучше для Conquest",
  "Как выжать максимум из текущего инвентаря",
  "Проведи аудит ресурсов и узких мест",
  "Подбери составы под Territory War"
];

const sidebarItems = ["История", "Настройки", "Профиль", "Выход"];

function getTelegramName() {
  const webApp = typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
  const firstName = webApp?.initDataUnsafe?.user?.first_name?.trim();
  return firstName || "друг";
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
    const telegramName = getTelegramName();

    if (telegramName) {
      setName(telegramName);
    }
  }, []);

  const greeting = useMemo(() => `Ну привет, ${name}`, [name]);

  const handleShuffle = () => {
    startTransition(() => {
      setPrompts(pickFivePrompts(promptLibrary));
    });
  };

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#0B0E14] text-[#F3F7FB] select-none">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_40%)]" />

      <button
        type="button"
        aria-label="Открыть меню"
        onClick={() => setSidebarOpen(true)}
        className="absolute left-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full border border-[#1E2632] bg-[#121722] text-[#F3F7FB]"
      >
        <img src="/icons/menu.PNG" alt="" aria-hidden="true" className="h-[18px] w-[18px]" />
      </button>

      <button
        type="button"
        aria-label="Закрыть меню"
        onClick={() => setSidebarOpen(false)}
        className={`absolute inset-0 z-30 bg-[#02050A]/70 transition-opacity duration-200 ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`absolute left-0 top-0 z-40 h-dvh w-4/5 border-r border-[#1F2733] bg-[#11161F] transition-transform duration-300 ease-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col gap-3 px-4 pb-5 pt-6">
          <div className="rounded-[20px] border border-[#1F2733] bg-[#0E131B] px-4 py-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#7D8A9D]">
              swgoh.ai
            </div>
            <div className="mt-2 text-lg font-semibold text-[#F3F7FB]">Голографический терминал</div>
          </div>

          <div className="grid gap-3">
            {sidebarItems.map((item) => (
              <button
                key={item}
                type="button"
                className="flex h-14 items-center rounded-[16px] border border-[#202A38] bg-[#151B25] px-4 text-left text-sm font-medium text-[#F3F7FB]"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <div className="flex min-h-dvh flex-col px-4 pb-5 pt-16">
        <section className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
          <div className="rounded-[28px] border border-[#1B2330] bg-[#10151D] px-5 py-6">
            <div className="space-y-6">
              <div className="space-y-1 text-center">
                <h1 className="text-[32px] font-semibold leading-[1.05] tracking-[-0.04em] text-[#F7FAFD]">
                  {greeting}
                </h1>
                <p className="text-[32px] font-semibold leading-[1.05] tracking-[-0.04em] text-[#F7FAFD]">
                  С чем тебе помочь?
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-[#98A5B7]">Быстрые промпты</p>

                <div className="prompt-strip flex gap-2 overflow-x-auto pb-1 pr-2">
                  {prompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      className="shrink-0 rounded-[18px] border border-[#1E2836] bg-[#0B0E14] px-4 py-3 text-left text-sm leading-snug text-[#D7DFEA]"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleShuffle}
                    className="inline-flex items-center gap-2 rounded-full border border-[#1E2836] bg-[#0B0E14] px-3 py-2 text-sm font-medium text-[#98A5B7]"
                  >
                    <img
                      src="/icons/refresh.PNG"
                      alt=""
                      aria-hidden="true"
                      className="h-[15px] w-[15px]"
                    />
                    Перемешать
                  </button>
                </div>
              </div>

              <form
                className="rounded-[22px] border border-[#1C2532] bg-[#0B0E14] p-3"
                onSubmit={(event) => event.preventDefault()}
              >
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Спроси про состав, моды или план развития"
                  aria-label="Ввести сообщение"
                  rows={3}
                  className="min-h-[96px] w-full resize-none bg-transparent text-[15px] leading-6 text-[#F3F7FB] outline-none placeholder:text-[#657489]"
                />

                <div className="mt-3 flex items-end justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setAnalysisEnabled((value) => !value)}
                    className={`inline-flex h-11 items-center gap-3 rounded-[14px] border px-3 ${
                      analysisEnabled
                        ? "border-[#00D1FF] bg-[#102333] text-[#F4FBFF]"
                        : "border-[#1E2836] bg-[#111722] text-[#A1AFBF]"
                    }`}
                  >
                    <span
                      className={`grid h-7 w-7 place-items-center rounded-[8px] border ${
                        analysisEnabled
                          ? "border-[#00D1FF] bg-[#00D1FF]/10"
                          : "border-[#293444] bg-[#0B0E14]"
                      }`}
                    >
                      <img
                        src="/icons/firemode.PNG"
                        alt=""
                        aria-hidden="true"
                        className="h-4 w-4"
                      />
                    </span>
                    <span className="text-sm font-medium">Анализ</span>
                  </button>

                  <button
                    type="submit"
                    aria-label="Отправить сообщение"
                    className="grid h-11 w-11 place-items-center rounded-full border border-[#00D1FF] bg-[#00D1FF] text-[#08111A]"
                  >
                    <img src="/icons/send.PNG" alt="" aria-hidden="true" className="h-[18px] w-[18px]" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
