import React, { useState } from 'react';
import { X, Sparkles, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ResumeBuilderModal({ onClose, onSaveResume }) {
  const [name, setName] = useState('김순자');
  const [age, setAge] = useState(74);
  const [location, setLocation] = useState('서울 종로구 혜화동');
  const [selectedStrengths, setSelectedStrengths] = useState([
    '아이들과 대화 잘함',
    '손맛 비법 가득',
    '아침 시간 가능'
  ]);
  const [bio, setBio] = useState('성실하게 일하며 건강과 보람을 찾고 싶습니다.');

  const strengthOptions = [
    '아이들과 대화 잘함',
    '손맛 비법 가득',
    '아침 시간 가능',
    '친절한 인사',
    '정리정돈 깔끔',
    '청소 및 환경관리',
    '텃밭 화초 가꾸기',
    '옛날 이야기 잘함'
  ];

  const toggleStrength = (option) => {
    if (selectedStrengths.includes(option)) {
      setSelectedStrengths(selectedStrengths.filter(s => s !== option));
    } else {
      setSelectedStrengths([...selectedStrengths, option]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.5 } });
    if (onSaveResume) {
      onSaveResume({ name, age, location, strengths: selectedStrengths, bio });
    }
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
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>어르신 쉬운 이력서 작성기</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">
            내 정보 수정 및 내 장점 고르기 ✏️
          </h3>
          <p className="text-xs text-slate-600 font-medium">
            어려운 서류 대신, 성함과 사시는 동네, 잘하시는 장점만 눌러 선택해주세요!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 block">👤 성함:</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-amber-50 border-2 border-amber-300 focus:border-amber-500 rounded-xl px-3 py-2 text-base font-bold outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 block">🎂 연세(만 나이):</label>
              <input
                type="number"
                required
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full bg-amber-50 border-2 border-amber-300 focus:border-amber-500 rounded-xl px-3 py-2 text-base font-bold outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 block">📍 사시는 동네:</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-amber-50 border-2 border-amber-300 focus:border-amber-500 rounded-xl px-3 py-2 text-base font-bold outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 block">
              ⭐ 내가 잘하는 장점 선택하기 (누르시면 선택돼요):
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {strengthOptions.map((opt) => {
                const isSelected = selectedStrengths.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleStrength(opt)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 border transition ${
                      isSelected
                        ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                        : 'bg-amber-50 text-slate-700 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 block">📝 한마디 다짐/소망:</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-amber-50 border-2 border-amber-300 focus:border-amber-500 rounded-xl p-3 text-sm font-medium outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-amber-950 font-black text-base shadow-lg transition transform active:scale-95"
          >
            이력서 정보 저장하기
          </button>
        </form>
      </div>
    </div>
  );
}
