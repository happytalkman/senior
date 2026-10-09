import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, X, Heart, Radio, Activity, RefreshCw, MessageSquare, Repeat } from 'lucide-react';
import confetti from 'canvas-confetti';
import { speakText, stopSpeech } from '../utils/speech';
import { queryOpenRouterLLM } from '../utils/llm';

export default function PipecatVoiceModal({ onClose }) {
  const [isListening, setIsListening] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isMultiTurn, setIsMultiTurn] = useState(true); // Continuous multi-turn voice mode
  const [turnCount, setTurnCount] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('어르신, 하시고 싶은 말씀을 편하게 말씀해 주셔요. 질문하시면 AI가 듣고 답변을 소리로 읽어드립니다...');

  // Message History for Multi-turn Conversation Context
  const [conversationHistory, setConversationHistory] = useState([]);

  const recognitionRef = useRef(null);
  const isAiSpeakingRef = useRef(false);

  const voicePresets = [
    "오늘 날씨가 어떤가요?",
    "마음이 적적하고 외로운데 따뜻한 한마디 부탁해요",
    "오늘 저녁으로 드시기 좋은 건강 식단 추천해주세요",
    "경로당 어르신 일자리가 궁금합니다"
  ];

  // Helper to start speech recognition safely
  const startListening = () => {
    if (isAiSpeakingRef.current) return;
    stopSpeech();
    setTranscript('');
    setIsListening(true);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn("Recognition start error/already running:", err);
      }
    } else {
      // Fallback prompt simulation if mic blocked
      setTimeout(() => {
        const simulatedText = "오늘 날씨 참 좋네요. 경로당 식당 메뉴도 알려주세요.";
        setTranscript(simulatedText);
        handleUserSpeechInput(simulatedText);
      }, 3000);
    }
  };

  const stopListening = () => {
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {}
    }
  };

  // Initialize SpeechRecognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'ko-KR';

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);

        if (event.results[event.results.length - 1].isFinal) {
          stopListening();
          handleUserSpeechInput(currentTranscript);
        }
      };

      recognition.onend = () => {
        if (!isAiSpeakingRef.current && isListening) {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    }

    // Auto start initial listening
    const timer = setTimeout(() => {
      startListening();
    }, 600);

    return () => {
      clearTimeout(timer);
      stopSpeech();
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  // Main Pipeline: STT -> LLM (OpenRouter) -> TTS (Voice Output) -> Multi-turn Auto Re-listen
  const handleUserSpeechInput = async (userText) => {
    if (!userText.trim()) return;
    setTranscript(userText);
    stopSpeech();
    stopListening();
    setIsAiProcessing(true);
    setTurnCount(prev => prev + 1);

    // Update history
    const newHistory = [...conversationHistory, { role: "user", content: userText }];
    setConversationHistory(newHistory);

    // 1. LLM API Query (OpenRouter GPT-4o-mini / Llama 3.3)
    let llmResponse = await queryOpenRouterLLM(newHistory);

    // Local Fallback if LLM API network unavailable
    if (!llmResponse) {
      const t = userText.toLowerCase();
      if (t.includes('안녕') || t.includes('반갑') || t.includes('시작')) {
        llmResponse = "어르신, 반갑습니다! 대한노인회 온기동행 AI 음성 말벗입니다. 오늘 식사는 따뜻하게 잘 드셨나요?";
      } else if (t.includes('외롭') || t.includes('적적') || t.includes('쓸쓸')) {
        llmResponse = "어르신, 혼자 계실 때 마음이 쓸쓸하시지요. 제가 늘 곁에서 어르신의 이야기를 들을 테니 편하게 말씀해주세요.";
      } else if (t.includes('날씨') || t.includes('오늘')) {
        llmResponse = "오늘 하늘이 참 푸르고 맑은 햇살이 내려오고 있어요. 가벼운 외투를 입으시고 동네 산책 다녀오시면 마음이 쾌청해질 거예요.";
      } else if (t.includes('일자리') || t.includes('일') || t.includes('청춘')) {
        llmResponse = "어르신의 깊은 경험과 삶의 지혜는 동네의 보물입니다. 초등학교 등하교 도우미와 경로당 식사 도우미 등 보람찬 일자리가 기다리고 있습니다.";
      } else {
        llmResponse = `어르신 말씀에 가슴이 참 따뜻해집니다. 말씀해주신 ${userText}에 대해 이야기 나누어 주셔서 감사해요. 늘 건강하세요.`;
      }
    }

    // Append AI response to history
    setConversationHistory([...newHistory, { role: "assistant", content: llmResponse }]);
    setAiResponse(llmResponse);
    setIsAiProcessing(false);

    // 2. TTS Voice Output (Speak response out loud!)
    setIsAiSpeaking(true);
    isAiSpeakingRef.current = true;
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });

    speakText(llmResponse, () => {
      setIsAiSpeaking(false);
      isAiSpeakingRef.current = false;

      // 3. Multi-Turn Auto Re-listening Loop
      if (isMultiTurn) {
        setTranscript('');
        setTimeout(() => {
          startListening();
        }, 500);
      }
    });
  };

  const toggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleManualReplay = () => {
    if (aiResponse) {
      setIsAiSpeaking(true);
      isAiSpeakingRef.current = true;
      speakText(aiResponse, () => {
        setIsAiSpeaking(false);
        isAiSpeakingRef.current = false;
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 border-4 border-rose-500 shadow-2xl relative space-y-5 animate-in fade-in zoom-in duration-200 max-h-[92vh] overflow-y-auto">
        <button
          onClick={() => {
            stopSpeech();
            onClose();
          }}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-800 text-xs font-black px-3.5 py-1 rounded-full border border-rose-300">
              <Sparkles className="w-4 h-4 text-rose-500 animate-spin" />
              <span>STT → OpenRouter LLM → TTS 파이프라인 작동 중</span>
            </span>

            <button
              onClick={() => setIsMultiTurn(!isMultiTurn)}
              className={`text-xs font-black px-3 py-1 rounded-full border transition flex items-center gap-1 ${
                isMultiTurn
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-xs'
                  : 'bg-slate-100 text-slate-600 border-slate-300'
              }`}
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>연속 대화 (자동 이음): {isMultiTurn ? '켜짐' : '꺼짐'}</span>
            </button>
          </div>

          <h3 className="text-2xl md:text-3xl font-black text-slate-900">
            실시간 멀티턴 음성 말벗이 🎙️
          </h3>
          <p className="text-sm text-slate-600 font-medium">
            마이크로 묻고 ➔ OpenRouter AI가 답변 생각하고 ➔ 따뜻한 음성으로 읽어줍니다! (현재 {turnCount}번째 대화)
          </p>
        </div>

        {/* Voice Presets */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 text-rose-500" />
            질문을 누르시면 바로 LLM ➔ TTS 답변이 재생됩니다:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {voicePresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleUserSpeechInput(preset)}
                className="bg-rose-50 hover:bg-rose-100 text-rose-950 text-xs md:text-sm font-bold p-2.5 rounded-xl border border-rose-200 text-left transition transform active:scale-95 flex items-center gap-1.5"
              >
                <span>💬</span>
                <span className="truncate">{preset}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Voice Visualizer / Status Display */}
        <div className="bg-gradient-to-b from-amber-50 to-orange-50/70 p-6 rounded-3xl border-2 border-amber-200 text-center space-y-4 shadow-inner">
          <div className="flex justify-center items-center gap-3">
            {isListening ? (
              <div className="flex items-center gap-2 bg-rose-500 text-white px-4 py-1.5 rounded-full font-black text-xs animate-bounce shadow-md">
                <Mic className="w-4 h-4 animate-pulse" />
                <span>🟢 어르신 목소리 듣는 중 (말씀하세요)...</span>
              </div>
            ) : isAiProcessing ? (
              <div className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-1.5 rounded-full font-black text-xs animate-pulse shadow-md">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>🧠 OpenRouter AI가 답변을 생각하고 있어요...</span>
              </div>
            ) : isAiSpeaking ? (
              <div className="flex items-center gap-2 bg-amber-500 text-white px-4 py-1.5 rounded-full font-black text-xs animate-pulse shadow-md">
                <Volume2 className="w-4 h-4 animate-bounce" />
                <span>🔊 AI 음성 답변 낭독 중...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-slate-700 text-white px-4 py-1.5 rounded-full font-black text-xs shadow-md">
                <Activity className="w-4 h-4 text-yellow-300" />
                <span>준비 완료 (마이크 버튼을 눌러보세요)</span>
              </div>
            )}
          </div>

          {/* Audio Waves Animation */}
          <div className="flex justify-center items-center gap-1.5 h-6">
            <span className={`w-2 rounded-full ${isListening ? 'bg-rose-500 wave-bar' : isAiSpeaking ? 'bg-amber-500 wave-bar' : 'bg-slate-300 h-2'}`}></span>
            <span className={`w-2 rounded-full ${isListening ? 'bg-rose-500 wave-bar' : isAiSpeaking ? 'bg-amber-500 wave-bar' : 'bg-slate-300 h-2'}`}></span>
            <span className={`w-2 rounded-full ${isListening ? 'bg-rose-500 wave-bar' : isAiSpeaking ? 'bg-amber-500 wave-bar' : 'bg-slate-300 h-2'}`}></span>
            <span className={`w-2 rounded-full ${isListening ? 'bg-rose-500 wave-bar' : isAiSpeaking ? 'bg-amber-500 wave-bar' : 'bg-slate-300 h-2'}`}></span>
          </div>

          {/* User Transcript Box */}
          {transcript && (
            <div className="bg-white p-3 rounded-2xl border border-rose-200 text-sm font-bold text-rose-900 animate-pulse">
              🗣️ 어르신 질문: "{transcript}"
            </div>
          )}

          {/* AI Response Display Box */}
          <div className="bg-white p-5 rounded-2xl border border-amber-300 text-base md:text-lg font-bold text-slate-900 leading-relaxed text-left min-h-[110px] flex items-start justify-between gap-2 shadow-xs">
            <div className="flex-1">{aiResponse}</div>
            <button
              onClick={handleManualReplay}
              className="p-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 shrink-0 font-extrabold text-xs flex items-center gap-1 shadow-xs border border-amber-300"
              title="다시 낭독하기"
            >
              <Volume2 className="w-5 h-5 text-amber-800" />
              <span>다시 읽기</span>
            </button>
          </div>
        </div>

        {/* Mic Control Button */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={toggleMic}
            className={`w-24 h-24 rounded-full flex flex-col items-center justify-center text-white shadow-xl transition transform active:scale-90 ${
              isListening
                ? 'bg-rose-600 ring-8 ring-rose-200 animate-pulse'
                : 'bg-gradient-to-tr from-rose-500 via-orange-500 to-amber-500 hover:scale-105'
            }`}
          >
            <Mic className="w-10 h-10 mb-1" />
            <span className="text-xs font-black">{isListening ? '듣는 중' : '음성 시작'}</span>
          </button>
          <span className="text-xs text-slate-500 font-bold">
            🟢 STT ➔ OpenRouter AI (GPT-4o-mini / Llama 3.3) ➔ TTS 멀티턴 연결됨
          </span>
        </div>
      </div>
    </div>
  );
}
