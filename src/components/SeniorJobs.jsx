import React, { useState } from 'react';
import { Briefcase, Search, MapPin, Clock, DollarSign, Award, Volume2, CheckCircle, PlusCircle, Sparkles, Filter } from 'lucide-react';
import { speakText } from '../utils/speech';

export default function SeniorJobs({
  jobs,
  appliedJobIds,
  onApplyClick,
  onOpenTalentModal
}) {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['전체', '공공일자리', '사회서비스형', '민간일자리', '재능나눔'];

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    const matchesCategory = selectedCategory === '전체' || job.type === selectedCategory;
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.org.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Intro Banner for Jobs */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold mb-3">
            <Award className="w-4 h-4 text-yellow-300" />
            <span>대한노인회 청춘 일자리 센터</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black mb-2">
            활기찬 일자리와 재능 나눔으로 삶의 보람을 찾아요 💼
          </h2>
          <p className="text-emerald-100 text-sm md:text-base leading-relaxed">
            복잡한 서류 절차 없이 어르신의 연세와 사시는 동네에 딱 맞는 든든한 일자리를 소개해드립니다. 1초 간편 신청으로 시작하세요!
          </p>
        </div>
      </div>

      {/* Action Header & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="동네 이름(종로, 수원, 해운대)이나 일자리 이름으로 찾기..."
            className="w-full bg-white border-2 border-amber-300 focus:border-emerald-500 rounded-2xl pl-12 pr-4 py-3 text-base md:text-lg font-medium outline-none shadow-xs"
          />
        </div>

        {/* Talent Register Button */}
        <button
          onClick={onOpenTalentModal}
          className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-sm text-sm md:text-base transition transform active:scale-95 border border-amber-300"
        >
          <PlusCircle className="w-5 h-5 text-amber-950" />
          <span>[어르신 전용] 내 재능 보물상자 등록</span>
        </button>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2.5 rounded-xl font-black text-sm transition ${
              selectedCategory === cat
                ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-300'
                : 'bg-amber-100/70 hover:bg-amber-200 text-amber-900 border border-amber-200'
            }`}
          >
            {cat === '전체' ? '🌟 전체 일자리' : cat}
          </button>
        ))}
      </div>

      {/* Jobs Listing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredJobs.map(job => {
          const isApplied = appliedJobIds.includes(job.id);

          return (
            <div
              key={job.id}
              className="bg-white rounded-3xl p-6 border-2 border-amber-200 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header info */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full border border-emerald-300">
                    {job.type}
                  </span>
                  <span className="text-xs font-extrabold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-lg">
                    신청 {job.applicants} / 모집 {job.capacity}명
                  </span>
                </div>

                {/* Job Title */}
                <h3 className="text-xl md:text-2xl font-black text-slate-900 leading-snug">
                  {job.title}
                </h3>

                <div className="text-xs md:text-sm font-bold text-slate-600">
                  🏛️ {job.org}
                </div>

                {/* Pay Highlight Box */}
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-emerald-600" />
                    <div>
                      <div className="text-xs text-slate-500 font-bold">급여 / 수당 안내</div>
                      <div className="text-base md:text-lg font-black text-emerald-700">{job.pay}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => speakText(`${job.title}. 급여: ${job.pay}. 근무시간: ${job.hours}. 위치: ${job.location}`)}
                    className="p-2 rounded-xl bg-white text-amber-900 hover:bg-amber-100 border border-amber-200 shadow-xs"
                    title="일자리 상세 내용 음성으로 듣기"
                  >
                    <Volume2 className="w-5 h-5 text-amber-600" />
                  </button>
                </div>

                {/* Meta list */}
                <div className="space-y-2 text-sm text-slate-700 font-medium pt-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>근무지:</strong> {job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>근무시간:</strong> {job.hours}</span>
                  </div>
                </div>

                {/* Job Description */}
                <p className="text-sm md:text-base text-slate-700 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl">
                  {job.description}
                </p>

                {/* Perks badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {job.perks.map((perk, idx) => (
                    <span key={idx} className="bg-emerald-50 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-200">
                      🎁 {perk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-amber-100 flex items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1">
                  {job.tags.map((t, i) => (
                    <span key={i} className="text-[11px] font-bold text-slate-500 bg-amber-50 px-2 py-0.5 rounded">
                      #{t}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => onApplyClick(job)}
                  disabled={isApplied}
                  className={`px-6 py-3 rounded-2xl font-black text-sm md:text-base shadow-md transition transform active:scale-95 flex items-center gap-2 ${
                    isApplied 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default' 
                      : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white'
                  }`}
                >
                  {isApplied ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <span>1초 간편 지원 완료</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-yellow-300" />
                      <span>1초 간편 지원하기</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredJobs.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-amber-200 space-y-3">
          <p className="text-lg font-bold text-slate-700">검색 조건에 맞는 일자리가 없습니다.</p>
          <p className="text-sm text-slate-500">다른 검색어나 카테고리를 선택해 보세요!</p>
        </div>
      )}
    </div>
  );
}
