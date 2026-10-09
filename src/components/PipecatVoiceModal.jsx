import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, X, Heart, Radio, Activity, RefreshCw, MessageSquare, Repeat } from 'lucide-react';
import confetti from 'canvas-confetti';
import { speakText, stopSpeech, playBase64Audio } from '../utils/speech';

export default function PipecatVoiceModal({ onClose }) {
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connecting' | 'connected' | 'error'
  const [isListening, setIsListening] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isMultiTurn, setIsMultiTurn] = useState(true); // Continuous multi-turn voice mode
  const [turnCount, setTurnCount] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('어르신, 하시고 싶은 말씀을 편하게 말씀해 주셔요. 끊김 없이 이어서 대화 나누실 수 있습니다...');

  const wsRef = useRef(null);
  const recognitionRef = useRef(null);
  const isAiSpeakingRef = useRef(false);
  const currentAiResponseRef = useRef('');

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
      // Fallback simulation if mic is blocked
      setTimeout(() => {
        const simulatedText = "오늘 날씨 참 좋네요. 경로당 프로그램도 알려주세요.";
        setTranscript(simulatedText);
        sendVoiceToPipecat(simulatedText);
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

  // Connect to Pipecat WebSocket server
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/pipecat');
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionStatus('connected');
      setTimeout(() => {
        startListening();
      }, 800);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'connected') {
          console.log('[Pipecat WS Connected]:', data.message);
        } else if (data.type === 'text_delta') {
          setAiResponse(prev => {
            const nextText = (prev === '어르신, 하시고 싶은 말씀을 편하게 말씀해 주셔요. 끊김 없이 이어서 대화 나누실 수 있습니다...') ? data.text : prev + data.text;
            currentAiResponseRef.current = nextText;
            return nextText;
          });
        } else if (data.type === 'neural_audio' && data.audio_base64) {
          // Play ultra-natural Neural Voice
          setIsAiSpeaking(true);
          isAiSpeakingRef.current = true;
          stopListening();

          playBase64Audio(data.audio_base64, data.text || currentAiResponseRef.current, () => {
            setIsAiSpeaking(false);
            isAiSpeakingRef.current = false;
            confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });

            // AUTOMATIC MULTI-TURN RE-ACTIVATION
            if (isMultiTurn) {
              setTranscript('');
              setTimeout(() => {
                startListening();
              }, 600);
            }
          });
        } else if (data.type === 'status') {
          if (data.status === 'speaking_start') {
            setIsAiSpeaking(true);
            isAiSpeakingRef.current = true;
            stopListening();
            setAiResponse('');
            currentAiResponseRef.current = '';
          } else if (data.status === 'speaking_end') {
            // Fallback audio trigger if neural_audio frame did not arrive
            setTimeout(() => {
              if (isAiSpeakingRef.current && currentAiResponseRef.current) {
                speakText(currentAiResponseRef.current, () => {
                  setIsAiSpeaking(false);
                  isAiSpeakingRef.current = false;
                  if (isMultiTurn) {
                    setTranscript('');
                    setTimeout(startListening, 600);
                  }
                });
              }
            }, 300);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    ws.onerror = (err) => {
      console.error('Pipecat WebSocket error:', err);
      setConnectionStatus('error');
    };

    ws.onclose = () => {
      setConnectionStatus('disconnected');
    };

    // Initialize Web Speech API for continuous voice capture
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
          sendVoiceToPipecat(currentTranscript);
        }
      };

      recognition.onend = () => {
        if (!isAiSpeakingRef.current && isListening) {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      ws.close();
      stopSpeech();
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [isMultiTurn]);

  const sendVoiceToPipecat = (text) => {
    if (!text.trim()) return;
    setTranscript(text);
    setTurnCount(prev => prev + 1);
    stopSpeech();

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'user_speak',
        text: text
      }));
    } else {
      // Fallback
      setIsAiSpeaking(true);
      isAiSpeakingRef.current = true;
      const fallbackMsg = `어르신, "${text}" 말씀 잘 들었습니다! 언제나 따뜻하고 건강한 하루 보내셔요.`;
      setAiResponse(fallbackMsg);
      speakText(fallbackMsg, () => {
        setIsAiSpeaking(false);
        isAiSpeakingRef.current = false;
        if (isMultiTurn) {
          setTimeout(startListening, 600);
        }
      });
    }
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
              <span>Pipecat 끊김 없는 멀티턴 음성 엔진</span>
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
            한 번 말씀하시면 답변 후 자동으로 다시 귀 기울입니다. 대화가 끊기지 않고 계속 이어집니다! (현재 {turnCount}번째 대화)
          </p>
        </div>

        {/* Voice Presets */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 text-rose-500" />
            질문을 클릭하셔도 연속 대화가 시작됩니다:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {voicePresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => sendVoiceToPipecat(preset)}
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
                <span>🟢 듣고 있습니다 (말씀해 주세요)...</span>
              </div>
            ) : isAiSpeaking ? (
              <div className="flex items-center gap-2 bg-amber-500 text-white px-4 py-1.5 rounded-full font-black text-xs animate-pulse shadow-md">
                <Volume2 className="w-4 h-4 animate-bounce" />
                <span>🔊 온기 말벗이 신경망 음성 답변 중...</span>
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
              🗣️ 어르신 말씀: "{transcript}"
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
            {connectionStatus === 'connected' ? '🟢 Pipecat 끊김 없는 멀티턴 세션 작동 중' : '🟡 음성 서버 연결 중...'}
          </span>
        </div>
      </div>
    </div>
  );
}
