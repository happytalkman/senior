import React, { useState } from 'react';
import { User, Award, Heart, Briefcase, FileText, CheckCircle, Sparkles, Printer, Edit3 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MyProfile({
  appliedJobs,
  onOpenResumeBuilder
}) {
  const [profile, setProfile] = useState({
    name: "김순자",
    age: 74,
    location: "서울 종로구 혜화동",
    phone: "010-3456-7890",
    strengths: ["아이들과 대화 잘함", "손맛 비법 가득", "아침 시간 가능", "친절한 인사"],
    warmStamps: 7,
    bio: "평생 가정을 가꾸며 살아온 따뜻한 어르신입니다. 손주 보듯 아이들을 아끼고, 이웃들과 웃으며 어울리는 것을 좋아합니다."
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Profile Banner */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 rounded-3xl p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/20 backdrop-blur-md p-1 border-2 border-white/50 shrink-0">
            <div className="w-full h-full rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-black text-2xl md:text-3xl shadow-inner">
              {profile.name[0]}
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl md:text-3xl font-black">{profile.name} 어르신</h2>
              <span className="bg-white/20 backdrop-blur-md text-white text-xs font-extrabold px-3 py-1 rounded-full">
                만 {profile.age}세
              </span>
            </div>
            <p className="text-rose-100 text-sm font-medium">📍 사시는 곳: {profile.location}</p>
            <p className="text-rose-100 text-xs font-medium">📞 연락처: {profile.phone}</p>
          </div>
        </div>

        {/* Stamp Counter */}
        <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/30 text-center space-y-1 min-w-[160px]">
          <div className="text-xs font-extrabold text-amber-200">나의 획득 온기 도장 ❤️</div>
          <div className="text-3xl font-black text-white flex items-center justify-center gap-1">
            <Heart className="w-7 h-7 fill-rose-300 text-rose-300" />
            <span>{profile.warmStamps}개</span>
          </div>
          <div className="text-[11px] text-amber-100 font-bold">대한노인회 으뜸 회원</div>
        </div>
      </div>

      {/* Applied Jobs Status */}
      <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-black text-xl">
          <Briefcase className="w-6 h-6 text-emerald-600" />
          <span>내가 간편 지원한 청춘 일자리 내역 ({appliedJobs.length}건)</span>
        </div>

        {appliedJobs.length === 0 ? (
          <div className="bg-amber-50/50 p-6 rounded-2xl text-center text-slate-600 font-medium border border-amber-100">
            아직 지원하신 일자리가 없습니다. '청춘 일자리' 탭에서 1초 간편 지원해보세요!
          </div>
        ) : (
          <div className="space-y-3">
            {appliedJobs.map(job => (
              <div
                key={job.id}
                className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="text-xs font-bold text-emerald-700">{job.org}</div>
                  <h4 className="text-lg font-bold text-slate-900">{job.title}</h4>
                  <div className="text-xs text-slate-600 font-medium mt-0.5">
                    📍 {job.location} | 💰 {job.pay}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1.5 rounded-xl border border-emerald-300">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>지원 완료 (서류 접수됨)</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Easy Resume Display & Action */}
      <div className="bg-white rounded-3xl p-6 border-2 border-amber-300 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-amber-950 font-black text-xl">
              <FileText className="w-6 h-6 text-rose-500" />
              <span>어르신 전용 쉬운 청춘 이력서 📄</span>
            </div>
            <p className="text-xs md:text-sm text-slate-600 font-medium mt-1">
              어려운 서류 대신, 한눈에 잘 보이는 예쁜 이력서 카드입니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenResumeBuilder}
              className="bg-amber-500 hover:bg-amber-600 text-amber-950 font-extrabold px-4 py-2 rounded-xl flex items-center gap-1.5 text-sm transition"
            >
              <Edit3 className="w-4 h-4" />
              <span>이력서 수정하기</span>
            </button>
            <button
              onClick={handlePrint}
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 text-sm transition"
            >
              <Printer className="w-4 h-4" />
              <span>인쇄하기</span>
            </button>
          </div>
        </div>

        {/* Printable Resume Card */}
        <div className="bg-gradient-to-br from-amber-50 via-orange-50/30 to-amber-100/40 p-6 md:p-8 rounded-3xl border-2 border-amber-200 space-y-6">
          <div className="border-b border-amber-300 pb-4 flex justify-between items-center">
            <div>
              <span className="text-xs font-extrabold text-rose-600 bg-rose-100 px-3 py-1 rounded-full">
                대한노인회 인증 청춘 이력서
              </span>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 mt-2">
                {profile.name} (만 {profile.age}세)
              </h3>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-amber-200 border-2 border-amber-400 flex items-center justify-center font-black text-2xl text-amber-900">
              {profile.name[0]}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm md:text-base font-medium text-slate-800">
            <div>
              <strong className="text-amber-950">사시는 동네:</strong> {profile.location}
            </div>
            <div>
              <strong className="text-amber-950">연락 가능한 번호:</strong> {profile.phone}
            </div>
          </div>

          <div className="space-y-2">
            <strong className="text-amber-950 block text-base font-extrabold">
              ⭐ 내가 가장 잘하는 일 & 장점:
            </strong>
            <div className="flex flex-wrap gap-2">
              {profile.strengths.map((str, idx) => (
                <span
                  key={idx}
                  className="bg-white text-amber-900 font-bold px-3.5 py-1.5 rounded-xl border border-amber-300 shadow-xs text-sm"
                >
                  ✓ {str}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <strong className="text-amber-950 block text-base font-extrabold">
              📝 어르신의 한마디 소망:
            </strong>
            <p className="bg-white p-4 rounded-2xl text-slate-700 font-medium leading-relaxed border border-amber-200">
              "{profile.bio}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
