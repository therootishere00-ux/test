"use client";

import { useEffect, useState } from "react";

type MenuDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function MenuDrawer({ open, onClose }: MenuDrawerProps) {
  const [userData, setUserData] = useState<{
    name: string;
    username: string;
    photo?: string;
  }>({
    name: "Юзер",
    username: "user",
  });

  useEffect(() => {
    // Проверяем наличие объекта Telegram
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      const user = tg.initDataUnsafe?.user;

      if (user) {
        setUserData({
          name: user.first_name + (user.last_name ? ` ${user.last_name}` : ""),
          username: user.username || "user",
          photo: user.photo_url,
        });
      }
    }
  }, [open]); // Обновляем при открытии меню

  return (
    <>
      <button
        type="button"
        onClick={onClose}
        className={`fixed inset-0 z-[60] bg-[#171717]/10 backdrop-blur-[6px] transition-all duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed left-0 top-0 z-[70] h-dvh w-[84%] max-w-[340px] bg-[#F5F5F0] transition-transform duration-300 ease-[0.23,1,0.32,1] flex flex-col ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Шапка */}
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <img src="/icons/applogo.PNG" alt="" className="h-7 w-7 object-contain" />
            <span className="text-[22px] font-black tracking-[-0.04em] text-[#305327]">
              swgoh<span className="opacity-70">.ai</span>
            </span>
          </div>
          <button onClick={onClose} className="transition-transform active:scale-90">
            <img src="/icons/cross.PNG" alt="" className="h-5 w-5 object-contain" />
          </button>
        </div>

        {/* Контент: Чатов нет */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <img src="/icons/empty.PNG" alt="" className="h-32 w-32 object-contain mb-5 opacity-[0.65]" />
          <p className="text-[15px] font-medium text-[#171717]/80">Чатов нет</p>
          <p className="mt-1.5 text-[13px] text-[#171717]/50 font-medium">Самое время начать болтать!</p>
        </div>

        {/* Низ: Реклама и Профиль */}
        <div className="mt-auto flex flex-col">
          <div className="mx-4 mb-5 flex items-center justify-between bg-[#E9EDE7] rounded-[20px] p-4 pr-5 cursor-pointer active:scale-[0.98] transition-transform">
            <div className="flex flex-col flex-1">
              <span className="text-[15px] font-bold text-[#171717] leading-tight mb-1">Не знаешь с чего начать?</span>
              <span className="text-[12px] font-medium text-[#171717]/60 leading-snug">Вот несколько популярных тем...</span>
            </div>
            <img src="/icons/right.PNG" alt="" className="h-3 w-3 object-contain opacity-30" />
          </div>

          {/* Блок Юзера с реальными данными */}
          <div className="bg-[#E5E5DF] px-6 py-5 flex items-center justify-between transition-colors active:bg-black/5 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#F5F5F0] overflow-hidden flex-shrink-0 border border-black/5">
                {userData.photo ? (
                  <img src={userData.photo} alt={userData.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-[14px] font-bold text-[#171717]/20">
                    {userData.name[0]}
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-bold text-[#171717]/85 leading-tight">
                  {userData.name}
                </span>
                <span className="text-[12px] font-medium text-[#171717]/40">
                  @{userData.username}
                </span>
              </div>
            </div>
            <img src="/icons/dots.PNG" alt="" className="h-5 w-5 object-contain opacity-40" />
          </div>
        </div>
      </aside>
    </>
  );
}
