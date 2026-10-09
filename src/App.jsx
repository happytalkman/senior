import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import WarmDabang from './components/WarmDabang';
import SeniorJobs from './components/SeniorJobs';
import SeniorCenterHub from './components/SeniorCenterHub';
import MyProfile from './components/MyProfile';

import JobApplyModal from './components/JobApplyModal';
import StoryModal from './components/StoryModal';
import TalentModal from './components/TalentModal';
import ResumeBuilderModal from './components/ResumeBuilderModal';
import PipecatVoiceModal from './components/PipecatVoiceModal';

import { INITIAL_JOBS, INITIAL_STORIES, INITIAL_CLUBS } from './data/mockData';
import { Coffee, Briefcase, Building2, User, Heart, Sparkles, PhoneCall } from 'lucide-react';
import { speakText, stopSpeech } from './utils/speech';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState('dabang'); // 'dabang' | 'jobs' | 'centers' | 'profile'

  // Senior Accessibility State
  const [fontSize, setFontSize] = useState('large'); // 'normal' | 'large' | 'xlarge'
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(false);

  // App Data States
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [appliedJobIds, setAppliedJobIds] = useState([1]); // default applied job #1
  const [stories, setStories] = useState(INITIAL_STORIES);
  const [clubs, setClubs] = useState(INITIAL_CLUBS);

  // Modals
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isTalentModalOpen, setIsTalentModalOpen] = useState(false);
  const [isResumeBuilderOpen, setIsResumeBuilderOpen] = useState(false);
  const [isPipecatModalOpen, setIsPipecatModalOpen] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Font size class mapping
  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'normal': return 'text-base';
      case 'large': return 'text-lg';
      case 'xlarge': return 'text-xl';
      default: return 'text-lg';
    }
  };

  // Handle job application submission
  const handleApplySuccess = (jobId) => {
    if (!appliedJobIds.includes(jobId)) {
      setAppliedJobIds(prev => [...prev, jobId]);
    }
    setSelectedJobForApply(null);
    showToast("🎉 1초 간편 신청이 완료되었습니다! 대한노인회 담당자가 곧 연락을 드립니다.");
    if (isTtsEnabled) {
      speakText("간편 신청이 성공적으로 제출되었습니다. 대한노인회 담당자가 안내 전화를 드립니다.");
    }
  };

  // Handle new story submission
  const handleSubmitStory = (newStory) => {
    setStories(prev => [newStory, ...prev]);
    showToast("❤️ 사연이 성공적으로 등록되었습니다. 다른 어르신들의 온기가 전해집니다.");
  };

  // Handle new talent submission
  const handleSubmitTalent = (newTalentJob) => {
    setJobs(prev => [newTalentJob, ...prev]);
    showToast("🎁 내 재능 보물상자가 일자리 목록에 등록되었습니다!");
  };

  // Applied job details array for profile
  const appliedJobsList = jobs.filter(j => appliedJobIds.includes(j.id));

  return (
    <div className={`min-h-screen transition-colors duration-200 ${getFontSizeClass()} ${
      isHighContrast ? 'bg-slate-950 text-yellow-300' : 'bg-amber-50/50 text-slate-800'
    }`}>
      {/* Accessibility Header */}
      <Header
        fontSize={fontSize}
        setFontSize={setFontSize}
        isHighContrast={isHighContrast}
        setIsHighContrast={setIsHighContrast}
        isTtsEnabled={isTtsEnabled}
        setIsTtsEnabled={setIsTtsEnabled}
        onSendSafetyCheck={() => showToast("❤️ 오늘 안전 안부 도장이 자녀와 노인회 지회에 전송되었습니다!")}
      />

      {/* Main Tab Navigation Bar */}
      <nav className={`w-full border-b sticky top-[95px] md:top-[105px] z-30 transition-colors shadow-xs ${
        isHighContrast ? 'bg-slate-900 border-yellow-600' : 'bg-white border-amber-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-1 overflow-x-auto py-2">
          <button
            onClick={() => {
              setActiveTab('dabang');
              if (isTtsEnabled) speakText("온기 다방 탭을 선택하셨습니다. AI 말벗이와 소모임을 이용하실 수 있습니다.");
            }}
            className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-3 px-3 rounded-2xl font-black transition transform active:scale-95 text-center ${
              activeTab === 'dabang'
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-slate-700 hover:bg-amber-100/60'
            }`}
          >
            <Coffee className="w-5 h-5 shrink-0" />
            <span className="whitespace-nowrap">온기 다방 (소통)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('jobs');
              if (isTtsEnabled) speakText("청춘 일자리 탭을 선택하셨습니다. 맞춤 일자리와 재능 나눔을 이용하실 수 있습니다.");
            }}
            className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-3 px-3 rounded-2xl font-black transition transform active:scale-95 text-center ${
              activeTab === 'jobs'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-700 hover:bg-amber-100/60'
            }`}
          >
            <Briefcase className="w-5 h-5 shrink-0" />
            <span className="whitespace-nowrap">청춘 일자리</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('centers');
              if (isTtsEnabled) speakText("스마트 경로당 탭을 선택하셨습니다. 오늘 식단과 건강 프로그램 안내입니다.");
            }}
            className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-3 px-3 rounded-2xl font-black transition transform active:scale-95 text-center ${
              activeTab === 'centers'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-700 hover:bg-amber-100/60'
            }`}
          >
            <Building2 className="w-5 h-5 shrink-0" />
            <span className="whitespace-nowrap">스마트 경로당</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('profile');
              if (isTtsEnabled) speakText("나의 청춘 공간 탭을 선택하셨습니다. 이력서 확인 및 지원 내역입니다.");
            }}
            className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-3 px-3 rounded-2xl font-black transition transform active:scale-95 text-center ${
              activeTab === 'profile'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-700 hover:bg-amber-100/60'
            }`}
          >
            <User className="w-5 h-5 shrink-0" />
            <span className="whitespace-nowrap">나의 공간 (이력서)</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8 pb-24">
        {activeTab === 'dabang' && (
          <WarmDabang
            stories={stories}
            setStories={setStories}
            clubs={clubs}
            setClubs={setClubs}
            isTtsEnabled={isTtsEnabled}
            onOpenStoryModal={() => setIsStoryModalOpen(true)}
            onOpenPipecatVoice={() => setIsPipecatModalOpen(true)}
          />
        )}

        {activeTab === 'jobs' && (
          <SeniorJobs
            jobs={jobs}
            appliedJobIds={appliedJobIds}
            onApplyClick={(job) => setSelectedJobForApply(job)}
            onOpenTalentModal={() => setIsTalentModalOpen(true)}
          />
        )}

        {activeTab === 'centers' && (
          <SeniorCenterHub />
        )}

        {activeTab === 'profile' && (
          <MyProfile
            appliedJobs={appliedJobsList}
            onOpenResumeBuilder={() => setIsResumeBuilderOpen(true)}
          />
        )}
      </main>

      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white font-extrabold px-6 py-4 rounded-2xl shadow-2xl border-2 border-amber-400 flex items-center gap-3 animate-bounce">
          <Sparkles className="w-6 h-6 text-yellow-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      {selectedJobForApply && (
        <JobApplyModal
          job={selectedJobForApply}
          onClose={() => setSelectedJobForApply(null)}
          onSubmitSuccess={handleApplySuccess}
        />
      )}

      {isStoryModalOpen && (
        <StoryModal
          onClose={() => setIsStoryModalOpen(false)}
          onSubmitStory={handleSubmitStory}
        />
      )}

      {isTalentModalOpen && (
        <TalentModal
          onClose={() => setIsTalentModalOpen(false)}
          onSubmitTalent={handleSubmitTalent}
        />
      )}

      {isResumeBuilderOpen && (
        <ResumeBuilderModal
          onClose={() => setIsResumeBuilderOpen(false)}
          onSaveResume={(data) => showToast("📄 이력서 정보가 성공적으로 업데이트되었습니다!")}
        />
      )}

      {isPipecatModalOpen && (
        <PipecatVoiceModal
          onClose={() => setIsPipecatModalOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="w-full bg-amber-100/80 border-t border-amber-200 py-8 px-4 text-center text-xs md:text-sm text-amber-900 font-medium space-y-2">
        <div className="flex items-center justify-center gap-2 font-black text-base text-slate-800">
          <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
          <span>대한노인회 어르신 따뜻한 온기·일자리 메이트 동행 서비스</span>
        </div>
        <p>전국 대한노인회 연계 · 24시간 어르신 안부 확인 서비스 · 1661-2129 노인상담전화</p>
        <p className="text-[11px] text-amber-700">© 2026 Korean Senior Citizens Association Warmth & Job Service. All rights reserved.</p>
      </footer>
    </div>
  );
}
