import React, { useState } from 'react';
import { X, CheckCircle, Sparkles, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function JobApplyModal({ job, onClose, onSubmitSuccess }) {
  const [name, setName] = useState('김순자');
  const [phone, setPhone] = useState('010-3456-7890');
  const [memo, setMemo] = useState('열심히 정성을 다해 일하겠습니다!');

  const handleSubmit = (e) => {
    e.preventDefault();
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 }
    });
    onSubmitSuccess(job.id);
  };

  if (!job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 border-4 border-emerald-400 shadow-2xl relative space-y-6 animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="space-y-2">
          <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full">
            1초 간편 입사지원
          </span>
          <h3 className="text-2xl font-black text-slate-900 leading-snug">
            {job.title}
          </h3>
          <p className="text-sm font-bold text-emerald-700">🏛️ {job.org} | {job.pay}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-800 block">
              👤 신청자 성함:
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-amber-50 border-2 border-amber-300 focus:border-emerald-500 rounded-2xl px-4 py-3 text-lg font-bold text-slate-900 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-800 block">
              📞 연락 받으실 휴대폰 번호:
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-amber-50 border-2 border-amber-300 focus:border-emerald-500 rounded-2xl px-4 py-3 text-lg font-bold text-slate-900 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-800 block">
              💬 노인회에 전하실 다짐 메시지:
            </label>
            <textarea
              rows={2}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full bg-amber-50 border-2 border-amber-300 focus:border-emerald-500 rounded-2xl p-4 text-base font-medium text-slate-900 outline-none resize-none"
            />
          </div>

          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-xs text-emerald-800 font-bold space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-900 font-extrabold text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>서류 준비 걱정 마세요!</span>
            </div>
            <p>신청을 완료하시면 대한노인회 담당 선생님께서 안내 전화를 드립니다.</p>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-lg shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-6 h-6 text-yellow-300" />
            <span>지원서 제출하기 (완료)</span>
          </button>
        </form>
      </div>
    </div>
  );
}
