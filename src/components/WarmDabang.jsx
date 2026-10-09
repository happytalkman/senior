import React, { useState } from 'react';
import { MessageSquare, Radio, Users, Send, Mic, Volume2, Heart, Sparkles, Plus, Coffee, Calendar, MapPin, CheckCircle2, ThumbsUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CHAT_PRESETS } from '../data/mockData';
import { speakText, stopSpeech, startVoiceRecognition } from '../utils/speech';

export default function WarmDabang({
  stories,
  setStories,
  clubs,
  setClubs,
  isTtsEnabled,
  onOpenStoryModal,
  onOpenPipecatVoice
}) {
  const [subTab, setSubTab] = useState('chat'); // 'chat' | 'radio' | 'clubs'

  // Chat State
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      name: '온기 말벗이 (AI)',
      text: '어르신, 반갑습니다! 오늘 하루 식사는 따뜻하게 잘 챙겨 드셨나요? 마음이 적적하시거나 이야기 나누고 싶으실 때 언제든 편하게 말씀해 주셔요. 제가 정성껏 귀 기울여 듣겠습니다. ❤️',
      time: '방금 전'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [interimVoiceText, setInterimVoiceText] = useState('');
  const [isAiReplying, setIsAiReplying] = useState(false);
  const recognitionInstanceRef = useState(null);

  // Send message to AI
  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      name: '어르신',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setInterimVoiceText('');
    setIsAiReplying(true);

    // Generate warm response
    setTimeout(() => {
      let aiText = "어르신의 말씀을 들으니 가슴이 참 따뜻해집니다. 오늘 하루도 고생 많으셨어요. 혹시 시원한 보리차 한 잔 드시면서 좋아하는 트로트 음악 한 곡 들어보시는 건 어떨까요?";

      const lower = text.toLowerCase();
      if (lower.includes('날씨')) {
        aiText = "오늘 하늘이 참 푸르고 따뜻한 햇살이 비추고 있어요! 오후에 조용한 가디건 하나 걸치시고 동네 공원 한 바퀴 천천히 거닐어보시면 마음도 한결 시원해지실 거예요.";
      } else if (lower.includes('외로') || lower.includes('적적') || lower.includes('쓸쓸')) {
        aiText = "어르신, 외로우실 때는 혼자가 아니라는 걸 꼭 기억해주세요. 대한노인회 온기동행이 늘 어르신 곁에 있답니다. 경로당 소모임에서 마음 맞는 친구분들과 따뜻한 이야기 나눠보시는 건 어떠세요?";
      } else if (lower.includes('메뉴') || lower.includes('식사') || lower.includes('저녁') || lower.includes('점심')) {
        aiText = "오늘 저녁으로는 구수한 된장찌개와 부드러운 두부조림, 그리고 따끈한 쌀밥 어떠세요? 소화도 잘되고 몸도 부드럽게 감싸줄 거예요!";
      } else if (lower.includes('노래') || lower.includes('가요') || lower.includes('음악')) {
        aiText = "나훈아 선생님의 '테스형'이나 이미자 선생님의 '섬마을 선생님' 어떠세요? 들으시면 가슴속 깊은 추억과 추억의 온기가 정겹게 밀려올 거예요.";
      } else if (lower.includes('운동') || lower.includes('건강') || lower.includes('다리')) {
        aiText = "의자에 편안히 앉으셔서 발목을 천천히 돌려주시고, 무릎을 살짝 들었다 내리는 동작을 10번만 해보세요! 관절 부상을 예방하고 다리가 가벼워집니다.";
      }

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        name: '온기 말벗이 (AI)',
        text: aiText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => [...prev, aiMsg]);
      setIsAiReplying(false);

      // Speak response aloud automatically
      speakText(aiText);
    }, 1000);
  };

  // Real Speech recognition handler
  const handleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
      stopSpeech();
      return;
    }

    stopSpeech();
    setIsListening(true);
    setInterimVoiceText('어르신 목소리를 듣고 있습니다... 말씀하세요');

    const recog = startVoiceRecognition(
      (transcript, isFinal) => {
        setInterimVoiceText(transcript);
        if (isFinal && transcript.trim()) {
          setIsListening(false);
          handleSendMessage(transcript);
        }
      },
      (errorMsg) => {
        console.warn("Speech recognition error:", errorMsg);
        setIsListening(false);
        // Fallback for mic issues or permission denial
        const fallbackPrompt = prompt("어르신, 마이크 음성 인식이 제한되었습니다. 말씀하실 내용을 입력해주세요:", "오늘 날씨 어때요?");
        if (fallbackPrompt) {
          handleSendMessage(fallbackPrompt);
        }
      },
      () => {
        setIsListening(false);
      }
    );

    if (!recog) {
      // If browser lacks SpeechRecognition API entirely
      setIsListening(false);
      const fallbackPrompt = prompt("어르신, 하시고 싶은 말씀을 편하게 적어주세요:", "마음이 외로운데 따뜻한 말 한마디 해주세요.");
      if (fallbackPrompt) {
        handleSendMessage(fallbackPrompt);
      }
    }
  };

  // Heart / Tea support button for stories
  const handleAddHeart = (id) => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
    setStories(prev => prev.map(s => s.id === id ? { ...s, hearts: s.hearts + 1 } : s));
  };

  // Join club
  const handleJoinClub = (clubId, clubName) => {
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    setClubs(prev => prev.map(c => {
      if (c.id === clubId) {
        return { ...c, members: c.members + 1, isJoined: true };
      }
      return c;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Intro Warmth Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-orange-400 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold">
            <Coffee className="w-4 h-4" />
            <span>대한노인회 x Pipecat AI 음성 쉼터</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black">
            온기 다방에서 외로움은 씻어내고 온기를 나눠요 ☕
          </h2>
          <p className="text-amber-100 text-sm md:text-base leading-relaxed font-medium">
            GitHub Pipecat 오픈소스 파이프라인으로 작동하는 실시간 음성 말벗이와 무제한 음성 대화를 나눌 수 있습니다!
          </p>
        </div>

        {/* Big Pipecat Voice Trigger Button */}
        <button
          onClick={onOpenPipecatVoice}
          className="relative z-10 bg-white text-rose-600 hover:bg-rose-50 font-black px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 text-base md:text-lg transition transform hover:scale-105 shrink-0 border-2 border-rose-300"
        >
          <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center animate-pulse">
            <Mic className="w-6 h-6" />
          </div>
          <div className="text-left">
            <div className="text-xs text-rose-500 font-extrabold">GitHub Pipecat 연동</div>
            <div>🎙️ 실시간 음성 대화 시작</div>
          </div>
        </button>
      </div>

      {/* Subtab Navigation Buttons */}
      <div className="flex rounded-2xl bg-amber-100/70 p-1.5 gap-2 border border-amber-200">
        <button
          onClick={() => setSubTab('chat')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-extrabold text-sm md:text-base transition ${
            subTab === 'chat' 
              ? 'bg-white text-rose-600 shadow-md ring-2 ring-rose-400' 
              : 'text-amber-900 hover:bg-amber-200/50'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span>AI 온기 말벗이 (대화하기)</span>
        </button>

        <button
          onClick={() => setSubTab('radio')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-extrabold text-sm md:text-base transition ${
            subTab === 'radio' 
              ? 'bg-white text-rose-600 shadow-md ring-2 ring-rose-400' 
              : 'text-amber-900 hover:bg-amber-200/50'
          }`}
        >
          <Radio className="w-5 h-5" />
          <span>마음 라디오 & 사연</span>
        </button>

        <button
          onClick={() => setSubTab('clubs')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-extrabold text-sm md:text-base transition ${
            subTab === 'clubs' 
              ? 'bg-white text-rose-600 shadow-md ring-2 ring-rose-400' 
              : 'text-amber-900 hover:bg-amber-200/50'
          }`}
        >
          <Users className="w-5 h-5" />
          <span>우리동네 소모임</span>
        </button>
      </div>

      {/* SUBTAB 1: AI 온기 말벗이 */}
      {subTab === 'chat' && (
        <div className="bg-white rounded-3xl border border-amber-200 shadow-sm p-4 md:p-6 space-y-4">
          {/* Preset Questions for Seniors */}
          <div>
            <span className="text-xs font-bold text-amber-900 mb-2 block flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-amber-500" />
              어르신께서 자주 물어보시는 말 (버튼을 누르시면 바로 질문돼요):
            </span>
            <div className="flex flex-wrap gap-2">
              {CHAT_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(preset)}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs md:text-sm font-semibold px-3.5 py-2 rounded-xl border border-amber-200/80 transition transform active:scale-95 text-left"
                >
                  💬 {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Chat History Box */}
          <div className="bg-amber-50/40 rounded-2xl p-4 min-h-[340px] max-h-[480px] overflow-y-auto space-y-4 border border-amber-100">
            {chatMessages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-600">{msg.name}</span>
                  <span className="text-[10px] text-slate-400">{msg.time}</span>
                  {msg.sender === 'ai' && (
                    <button
                      onClick={() => speakText(msg.text)}
                      className="text-amber-600 hover:text-amber-800 p-1 rounded hover:bg-amber-100"
                      title="이 메시지 음성으로 듣기"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-base md:text-lg leading-relaxed font-medium shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-rose-500 text-white rounded-tr-none'
                      : 'bg-white text-slate-900 border border-amber-200 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isListening && (
              <div className="bg-rose-50 border-2 border-rose-300 text-rose-950 p-4 rounded-2xl font-black text-base animate-pulse flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-rose-600 animate-ping" />
                <span>🗣️ 어르신 음성 인식 중: "{interimVoiceText}"</span>
              </div>
            )}

            {isAiReplying && (
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm bg-white p-3 rounded-2xl w-fit border border-amber-200">
                <Sparkles className="w-5 h-5 animate-spin text-rose-500" />
                <span>온기 말벗이가 다정한 답변을 적고 있어요...</span>
              </div>
            )}
          </div>

          {/* Input Controls */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {/* Voice Input Button */}
            <button
              onClick={handleVoiceInput}
              className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-black text-sm md:text-base text-white transition shadow-sm ${
                isListening 
                  ? 'bg-rose-600 animate-pulse ring-4 ring-rose-200' 
                  : 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700'
              }`}
            >
              <Mic className="w-6 h-6" />
              <span>{isListening ? '듣고 있어요 (말씀하세요)...' : '음성으로 말하기'}</span>
            </button>

            {/* Text Input */}
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="여기에 편하게 이야기나 하고 싶은 말씀을 적어보세요..."
                className="flex-1 bg-white border-2 border-amber-300 focus:border-rose-500 rounded-2xl px-4 py-3 text-base md:text-lg font-medium outline-none transition"
              />
              <button
                onClick={() => handleSendMessage()}
                className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-6 py-3 rounded-2xl flex items-center justify-center transition shadow-sm"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: 어르신 마음 라디오 */}
      {subTab === 'radio' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900">
                어르신들의 따뜻한 마음 라디오 📻
              </h3>
              <p className="text-sm text-slate-600 font-medium">전국 대한노인회 회원들의 감동 이야기와 응원의 공간입니다.</p>
            </div>
            <button
              onClick={onOpenStoryModal}
              className="bg-rose-500 hover:bg-rose-600 text-white font-black px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm text-sm md:text-base transition"
            >
              <Plus className="w-5 h-5" />
              <span>내 사연 쓰기</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stories.map(story => (
              <div
                key={story.id}
                className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
                      {story.category}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{story.date}</span>
                  </div>

                  <h4 className="text-lg md:text-xl font-bold text-slate-900 leading-snug mb-2">
                    {story.title}
                  </h4>

                  <p className="text-base text-slate-700 leading-relaxed font-medium bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100">
                    "{story.content}"
                  </p>
                </div>

                <div className="pt-3 border-t border-amber-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 font-bold flex items-center justify-center text-xs">
                      {story.author[0]}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">{story.author}</div>
                      <div className="text-xs text-slate-500">{story.location}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => speakText(`${story.title}. ${story.content}`)}
                      className="p-2 rounded-xl bg-amber-100 text-amber-900 hover:bg-amber-200 transition"
                      title="사연 음성 들어가기"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleAddHeart(story.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-sm transition transform active:scale-95"
                    >
                      <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                      <span>온기 전하기 ({story.hearts})</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: 우리동네 소모임 */}
      {subTab === 'clubs' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl md:text-2xl font-black text-slate-900">
              우리동네 온기 소모임 👥
            </h3>
            <p className="text-sm text-slate-600 font-medium">산책, 바둑, 텃밭, 스마트폰 배우기 등 동네 어르신들과 활기차게 어울려보세요!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clubs.map(club => (
              <div
                key={club.id}
                className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1 rounded-full">
                      {club.category}
                    </span>
                    <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-lg">
                      참여 현황: {club.members} / {club.maxMembers}명
                    </span>
                  </div>

                  <h4 className="text-lg md:text-xl font-bold text-slate-900 mb-2">{club.name}</h4>
                  <p className="text-sm md:text-base text-slate-600 font-medium mb-3">{club.description}</p>

                  <div className="space-y-1.5 text-xs md:text-sm text-slate-700 bg-amber-50 p-3 rounded-xl border border-amber-100 font-medium">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-600" />
                      <span>장소: {club.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-600" />
                      <span>일시: {club.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-amber-600" />
                      <span>모임장: {club.leader}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex flex-wrap gap-1">
                    {club.tags.map((t, idx) => (
                      <span key={idx} className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        #{t}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => handleJoinClub(club.id, club.name)}
                    disabled={club.isJoined}
                    className={`px-4 py-2.5 rounded-xl font-extrabold text-sm shadow-sm transition flex items-center gap-1.5 ${
                      club.isJoined 
                        ? 'bg-emerald-100 text-emerald-800 cursor-default' 
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                    }`}
                  >
                    {club.isJoined ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>참여 신청됨</span>
                      </>
                    ) : (
                      <span>모임 참여하기</span>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
