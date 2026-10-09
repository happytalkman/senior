import React, { useState } from 'react';
import { Volume2, VolumeX, Sun, PhoneCall, Heart, Sparkles, UserCheck, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Header({
  fontSize,
  setFontSize,
  isHighContrast,
  setIsHighContrast,
  isTtsEnabled,
  setIsTtsEnabled,
  onSendSafetyCheck
}) {
  const [safetySent, setSafetySent] = useState(false);

  const handleSafetyClick = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    setSafetySent(true);
    if (onSendSafetyCheck) onSendSafetyCheck();
    setTimeout(() => setSafetySent(false), 4000);
  };

  return (
    <header className={`w-full border-b transition-colors shadow-sm sticky top-0 z-40 ${
      isHighContrast ? 'bg-slate-900 text-yellow-300 border-yellow-500' : 'bg-amber-50 text-slate-900 border-amber-200/80'
    }`}>
      {/* Top Banner / Accessibility Bar */}
      <div className={`px-4 py-2 text-xs md:text-sm font-medium border-b flex flex-wrap items-center justify-between gap-2 ${
        isHighContrast ? 'bg-black text-yellow-300 border-yellow-600' : 'bg-amber-100/80 text-amber-900 border-amber-200'
      }`}>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white shadow-xs">
            대한노인회 공식 협력
          </span>
          <span className="hidden sm:inline">어르신 전용 쉬운 화면 모드 작동 중</span>
        </div>

        {/* Accessibility controls */}
        <div className="flex items-center gap-3 ml-auto">
          {/* TTS Button */}
          <button
            onClick={() => setIsTtsEnabled(!isTtsEnabled)}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs md:text-sm font-bold transition ${
              isTtsEnabled 
                ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-300' 
                : 'bg-amber-200/70 hover:bg-amber-300 text-amber-900'
            }`}
            title="화면 텍스트 음성 읽어주기"
          >
            {isTtsEnabled ? <Volume2 className="w-4 h-4 animate-bounce" /> : <VolumeX className="w-4 h-4" />}
            <span>음성 읽어주기 {isTtsEnabled ? '켜짐' : '꺼짐'}</span>
          </button>

          {/* Font Size Selector */}
          <div className="flex items-center bg-white/60 dark:bg-slate-800 rounded-lg p-0.5 border border-amber-300/50">
            <span className="text-xs font-bold px-1.5 text-amber-950 dark:text-yellow-300">글씨:</span>
            <button
              onClick={() => setFontSize('normal')}
              className={`px-2 py-0.5 rounded text-xs font-bold transition ${
                fontSize === 'normal' ? 'bg-amber-600 text-white' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              보통
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-2 py-0.5 rounded text-sm font-bold transition ${
                fontSize === 'large' ? 'bg-amber-600 text-white' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              크게
            </button>
            <button
              onClick={() => setFontSize('xlarge')}
              className={`px-2 py-0.5 rounded text-base font-extrabold transition ${
                fontSize === 'xlarge' ? 'bg-amber-600 text-white' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              매우크게
            </button>
          </div>

          {/* High Contrast Toggle */}
          <button
            onClick={() => setIsHighContrast(!isHighContrast)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs md:text-sm font-bold border transition ${
              isHighContrast 
                ? 'bg-yellow-400 text-black border-yellow-200' 
                : 'bg-white text-slate-800 border-amber-300 hover:bg-amber-100'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-600" />
            <span>{isHighContrast ? '밝은 화면' : '선명한 화면'}</span>
          </button>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-orange-400 flex items-center justify-center text-white shadow-md transform hover:scale-105 transition">
            <Heart className="w-7 h-7 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-yellow-300">
                대한노인회 <span className="text-rose-600 dark:text-rose-400">온기동행</span>
              </h1>
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded border border-amber-300">
                어르신 든든 메이트
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-600 dark:text-yellow-200/80 font-medium">
              외로움은 따뜻하게 달래고, 활기찬 내일과 일자리를 찾아드립니다
            </p>
          </div>
        </div>

        {/* Action Button: Today's Safety Check & Emergency Contact */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={handleSafetyClick}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm md:text-base shadow-sm transition transform active:scale-95 ${
              safetySent 
                ? 'bg-emerald-600 text-white' 
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white'
            }`}
          >
            {safetySent ? (
              <>
                <UserCheck className="w-5 h-5 animate-bounce" />
                <span>안부 도장 전송 완료! ❤️</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-yellow-200" />
                <span>오늘의 안부 도장 찍기</span>
              </>
            )}
          </button>

          <a
            href="tel:1661-2129"
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs md:text-sm border border-rose-300 transition"
            title="노인 상담 전화"
          >
            <PhoneCall className="w-4 h-4 text-rose-600" />
            <span className="hidden sm:inline">긴급상담</span> 1661-2129
          </a>
        </div>
      </div>
    </header>
  );
}
