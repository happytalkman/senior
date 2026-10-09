import React, { useState } from 'react';
import { MapPin, Utensils, Calendar, Phone, Heart, Shield, Award, Volume2, CheckCircle2 } from 'lucide-react';
import { SENIOR_CENTERS } from '../data/mockData';
import { speakText } from '../utils/speech';

export default function SeniorCenterHub() {
  const [selectedCenterId, setSelectedCenterId] = useState(1);

  const selectedCenter = SENIOR_CENTERS.find(c => c.id === selectedCenterId) || SENIOR_CENTERS[0];

  const welfareBenefits = [
    { title: "기초연금 신청 및 수령 안내", desc: "만 65세 이상 어르신 단독가구 최대 33만원 지급", tag: "연금혜택" },
    { title: "어르신 우대 무임 교통카드", desc: "지하철 및 지자체 어르신 버스 무료 이용", tag: "교통혜택" },
    { title: "무료 치과/안과/건강검진 지원", desc: "대한노인회 지정 병원 인공관절 및 돋보기 검진 지원", tag: "의료혜택" },
    { title: "경로당 점심 식사 & 건강음료 지원", desc: "전국 지정 경로당 영양 식단 무료 제공", tag: "식사혜택" }
  ];

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 md:p-8 text-white shadow-lg">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold mb-3">
            <Award className="w-4 h-4 text-yellow-300" />
            <span>대한노인회 스마트 경로당 & 복지 가이드</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black mb-2">
            우리동네 대한노인회 경로당 소식 & 맞춤 혜택 🏛️
          </h2>
          <p className="text-blue-100 text-sm md:text-base leading-relaxed">
            오늘 우리 경로당의 영양 식단 메뉴, 신나는 건강 프로그램, 그리고 어르신이 챙기셔야 할 정부/지자체 복지 혜택을 한눈에 확인하세요.
          </p>
        </div>
      </div>

      {/* Select Senior Center Branch */}
      <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm space-y-4">
        <label className="text-sm font-bold text-amber-950 block">
          📍 원하시는 대한노인회 지회 또는 경로당을 선택하세요:
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SENIOR_CENTERS.map(center => (
            <button
              key={center.id}
              onClick={() => setSelectedCenterId(center.id)}
              className={`p-4 rounded-2xl border-2 text-left font-bold transition flex items-start gap-3 ${
                selectedCenterId === center.id
                  ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 shadow-sm ring-2 ring-indigo-200'
                  : 'border-amber-200 bg-white hover:bg-amber-50 text-slate-800'
              }`}
            >
              <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-base font-extrabold">{center.name}</div>
                <div className="text-xs text-slate-500 font-medium mt-1">{center.address}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Center Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Lunch Menu */}
        <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-rose-600 font-extrabold text-lg">
                <Utensils className="w-6 h-6" />
                <span>오늘의 정성 점심 식단 🍱</span>
              </div>
              <button
                onClick={() => speakText(`오늘의 점심 식단은 ${selectedCenter.todayLunch}입니다. 맛있는 점심 드세요!`)}
                className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                title="식단 음성 듣기"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-5 rounded-2xl border border-amber-200 text-center space-y-2">
              <div className="text-xs font-bold text-amber-800">대한노인회 영양사 맞춤 식단</div>
              <div className="text-xl md:text-2xl font-black text-amber-950 leading-snug">
                {selectedCenter.todayLunch}
              </div>
              <p className="text-xs text-amber-700 font-medium pt-1">
                ※ 경로당 회원 누구나 11시 30분부터 따뜻한 식사가 제공됩니다.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between text-xs md:text-sm font-medium">
            <span className="text-slate-600">경로당 문의 및 안내:</span>
            <a href={`tel:${selectedCenter.phone}`} className="font-extrabold text-indigo-600 flex items-center gap-1">
              <Phone className="w-4 h-4" />
              <span>{selectedCenter.phone}</span>
            </a>
          </div>
        </div>

        {/* Today's Program Timetable */}
        <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-600 font-extrabold text-lg">
              <Calendar className="w-6 h-6" />
              <span>오늘의 여가 & 건강 배움터 🏃‍♂️</span>
            </div>
            <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-lg">
              무료 참여
            </span>
          </div>

          <div className="space-y-3">
            {selectedCenter.program.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100"
              >
                <div className="bg-indigo-600 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-xs">
                  {item.time}
                </div>
                <div className="text-base font-bold text-slate-900">
                  {item.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Welfare Benefits Directory */}
      <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-black text-xl">
          <Shield className="w-6 h-6 text-emerald-600" />
          <span>어르신을 위한 4대 필 수 복 지 혜 택 안내 🎁</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {welfareBenefits.map((b, idx) => (
            <div key={idx} className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200 flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base font-bold text-slate-900">{b.title}</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                    {b.tag}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-slate-600 font-medium">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
