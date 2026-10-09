import React, { useState } from 'react';
import { X, Send, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function StoryModal({ onClose, onSubmitStory }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('건강 일상');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    onSubmitStory({
      id: Date.now(),
      author: "김순자 어르신 (74세)",
      location: "서울 종로구 혜화동",
      title,
      content,
      hearts: 1,
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
      category
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 border-4 border-rose-400 shadow-2xl relative space-y-6 animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-rose-600 font-extrabold text-sm">
            <Heart className="w-5 h-5 fill-rose-500" />
            <span>어르신 마음 라디오</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">
            따뜻한 사연 나누기 📻
          </h3>
          <p className="text-xs text-slate-600 font-medium">
            전국 대한노인회 친구분들께 오늘 있었던 소소한 일상이나 감동 이야기를 들려주세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-800 block">
              🏷️ 사연 주제 선택:
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-amber-50 border-2 border-amber-300 focus:border-rose-500 rounded-2xl px-4 py-3 text-base font-bold text-slate-900 outline-none"
            >
              <option value="가족 사랑">가족 사랑 (손주, 자녀 자랑)</option>
              <option value="건강 일상">건강 일상 (운동, 경로당 생활)</option>
              <option value="청춘 일자리">청춘 일자리 (일하는 보람)</option>
              <option value="옛날 추억">옛날 추억 (젊은 날의 추억)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-800 block">
              ✏️ 사연 제목:
            </label>
            <input
              type="text"
              required
              placeholder="예: 오늘 아침 손주가 보내온 선물 자랑합니다"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-amber-50 border-2 border-amber-300 focus:border-rose-500 rounded-2xl px-4 py-3 text-base font-bold text-slate-900 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-800 block">
              📝 내 사연 내용:
            </label>
            <textarea
              required
              rows={4}
              placeholder="솔직하고 정겨운 어르신의 사연을 자유롭게 적어주세요..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-amber-50 border-2 border-amber-300 focus:border-rose-500 rounded-2xl p-4 text-base font-medium text-slate-900 outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-black text-lg shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            <span>사연 등록하고 온기 나누기</span>
          </button>
        </form>
      </div>
    </div>
  );
}
