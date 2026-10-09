// 대한노인회 온기동행 - 감정선이 살아있는 초자연 신경망(Neural Voice) 음성 유틸리티

let currentAudio = null;
let cachedVoices = [];

// 최고의 감정과 친화감을 주는 한국어 자연어 음성 찾기
const getBestKoreanVoice = () => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  if (cachedVoices.length === 0) {
    cachedVoices = window.speechSynthesis.getVoices();
  }

  // 1순위: Microsoft Natural (자연어 신경망 음성)
  let best = cachedVoices.find(v => v.lang.includes('ko') && (v.name.includes('Natural') || v.name.includes('SunHi') || v.name.includes('InJoon')));
  // 2순위: Google 한국어 음성
  if (!best) best = cachedVoices.find(v => v.lang.includes('ko') && v.name.includes('Google'));
  // 3순위: 기타 모든 한국어 음성
  if (!best) best = cachedVoices.find(v => v.lang.includes('ko') || v.lang.includes('KO'));

  return best;
};

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

/**
 * 감정을 담은 따뜻한 한국어 음성 낭독 (TTS)
 */
export const speakText = async (text, onEndCallback) => {
  if (!text) return;

  stopSpeech();

  try {
    // 1순위: Microsoft Neural Voice API 연동 (사람의 감정과 호흡이 담긴 최고 음질)
    const ttsUrl = `http://localhost:8000/api/tts?text=${encodeURIComponent(text)}&voice=ko-KR-SunHiNeural`;
    const audio = new Audio(ttsUrl);
    currentAudio = audio;

    let ended = false;
    const finish = () => {
      if (!ended) {
        ended = true;
        if (onEndCallback) onEndCallback();
      }
    };

    audio.onended = finish;
    audio.onerror = () => {
      fallbackWebSpeech(text, finish);
    };

    const promise = audio.play();
    if (promise !== undefined) {
      promise.catch(err => {
        console.warn("Neural Audio play policy block, falling back to tuned WebSpeech:", err);
        fallbackWebSpeech(text, finish);
      });
    }
  } catch (err) {
    console.warn("Neural Audio error, using WebSpeech fallback:", err);
    fallbackWebSpeech(text, onEndCallback);
  }
};

/**
 * 감정과 친밀감이 적용된 브라우저 WebSpeech Fallback
 */
export const fallbackWebSpeech = (text, onEndCallback) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEndCallback) onEndCallback();
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ko-KR';
  utterance.rate = 0.85; // 따뜻하고 여유로운 속도
  utterance.pitch = 1.04; // 정답고 친근한 톤

  const voice = getBestKoreanVoice();
  if (voice) {
    utterance.voice = voice;
  }

  if (onEndCallback) {
    utterance.onend = onEndCallback;
    utterance.onerror = onEndCallback;
  }

  window.speechSynthesis.speak(utterance);
};

/**
 * 모든 음성 재생 즉시 중지
 */
export const stopSpeech = () => {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (e) {}
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

/**
 * Base64 신경망 감정 오디오 바로 재생
 */
export const playBase64Audio = (base64Data, textFallback, onEndCallback) => {
  stopSpeech();
  try {
    const audio = new Audio(`data:audio/mpeg;base64,${base64Data}`);
    currentAudio = audio;

    let callbackFired = false;
    const fireCallback = () => {
      if (!callbackFired) {
        callbackFired = true;
        if (onEndCallback) onEndCallback();
      }
    };

    audio.onended = fireCallback;
    audio.onerror = () => {
      if (textFallback) {
        fallbackWebSpeech(textFallback, fireCallback);
      } else {
        fireCallback();
      }
    };

    const promise = audio.play();
    if (promise !== undefined) {
      promise.catch(err => {
        console.warn("Base64 Audio play blocked by browser, using emotional WebSpeech fallback:", err);
        if (textFallback) {
          fallbackWebSpeech(textFallback, fireCallback);
        } else {
          fireCallback();
        }
      });
    }
  } catch (err) {
    console.error("Base64 Audio play error:", err);
    if (textFallback) {
      fallbackWebSpeech(textFallback, onEndCallback);
    } else if (onEndCallback) {
      onEndCallback();
    }
  }
};

/**
 * 마이크 음성 인식 (STT - Speech to Text)
 */
export const startVoiceRecognition = (onResultCallback, onErrorCallback, onEndCallback) => {
  if (typeof window === 'undefined') return null;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    if (onErrorCallback) onErrorCallback("현재 브라우저는 마이크 음성 인식을 지원하지 않습니다.");
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'ko-KR';

  recognition.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    const isFinal = event.results[event.results.length - 1].isFinal;
    if (onResultCallback) onResultCallback(transcript, isFinal);
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    if (onErrorCallback) onErrorCallback(event.error);
  };

  recognition.onend = () => {
    if (onEndCallback) onEndCallback();
  };

  try {
    recognition.start();
    return recognition;
  } catch (err) {
    console.error("Failed to start recognition:", err);
    if (onErrorCallback) onErrorCallback(err.message);
    return null;
  }
};
