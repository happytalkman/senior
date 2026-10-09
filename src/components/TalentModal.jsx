import React, { useState } from 'react';
import { X, Sparkles, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TalentModal({ onClose, onSubmitTalent }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pay, setPay] = useState('회당 50,000원');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    onSubmitTalent({
      id: Date.now(),
      title: `[재능나눔] ${title}`,
      org: "내 재능 보물상자",
      type: "재능나눔",
      location: "서울 종로구",
      pay,
      hours: "협의 가능",
      applicants: 0,
      capacity: 5,
      description,
      perks: ["활동비 지급", "감사 수료증"],
      tags: ["어르신재능", "손맛노하우", "청년교류"]
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 border-4 border-amber-400 shadow-2xl relative space-y-6 animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-600 font-extrabold text-sm">
            <Award className="w-5 h-5 text-amber-500" />
            <span>어르신 전용 보물상자</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">
            내 인생 재능 등록하기 🎁
          </h3>
          <p className="text-xs text-slate-600 font-medium">
            김치 손맛, 목공, 한자 지도, 수공예, 서예 등 평생의 노하우를 나누고 활동비를 받아보세요!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-800 block">
              💡 내 자랑하고 싶은 재능 제목:
            </label>
            <input
              type="text"
              required
              placeholder="예: 40년 종가집 내림 김치 비법 수강 교실"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-amber-50 border-2 border-amber-300 focus:border-amber-500 rounded-2xl px-4 py-3 text-base font-bold text-slate-900 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-800 block">
              💵 원하시는 회당 강사 수당:
            </label>
            <input
              type="text"
              value={pay}
              onChange={(e) => setPay(e.target.value)}
              className="w-full bg-amber-50 border-2 border-amber-300 focus:border-amber-500 rounded-2xl px-4 py-3 text-base font-bold text-slate-900 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-800 block">
              📝 어떤 내용으로 가르쳐주시나요?:
            </label>
            <textarea
              required
              rows={3}
              placeholder="젊은이나 이웃들에게 친절히 가르쳐주실 내용을 정성껏 적어보세요..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-amber-50 border-2 border-amber-300 focus:border-amber-500 rounded-2xl p-4 text-base font-medium text-slate-900 outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-amber-950 font-black text-lg shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5 text-amber-950" />
            <span>재능 보물상자에 등록하기</span>
          </button>
        </form>
      </div>
    </div>
  );
}
