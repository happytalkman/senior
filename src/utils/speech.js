// 대한노인회 온기동행 - 초자연 신경망(Neural Voice) 음성 합성(TTS/STT) 서비스 유틸리티

let currentAudio = null;

/**
 * 초자연스러운 신경망(Neural) 한국어 음성 낭독
 * 1순위: Pipecat / Microsoft Neural Voice API (ko-KR-SunHiNeural)
 * 2순위: 브라우저 Web Speech API Fallback
 */
export const speakText = async (text, onEndCallback) => {
  if (!text) return;

  // 기존 재생 중인 음성 즉시 중지
  stopSpeech();

  try {
    // 1. 신경망 Neural TTS API 호출 (사람처럼 호흡과 감정이 살아있는 음성)
    const ttsUrl = `http://localhost:8000/api/tts?text=${encodeURIComponent(text)}&voice=ko-KR-SunHiNeural`;
    const audio = new Audio(ttsUrl);
    currentAudio = audio;

    audio.onended = () => {
      if (onEndCallback) onEndCallback();
    };

    audio.onerror = (e) => {
      console.warn("Neural TTS API error, falling back to WebSpeech:", e);
      fallbackWebSpeech(text, onEndCallback);
    };

    const promise = audio.play();
    if (promise !== undefined) {
      promise.catch(err => {
        console.warn("Audio play blocked by browser policy, using WebSpeech fallback:", err);
        fallbackWebSpeech(text, onEndCallback);
      });
    }
  } catch (err) {
    console.warn("Audio playback error, switching to WebSpeech fallback:", err);
    fallbackWebSpeech(text, onEndCallback);
  }
};

/**
 * 브라우저 기본 Web Speech API Fallback
 */
export const fallbackWebSpeech = (text, onEndCallback) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEndCallback) onEndCallback();
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ko-KR';
  utterance.rate = 0.88;
  utterance.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const koVoice = voices.find(v => v.lang.includes('ko') || v.lang.includes('KO'));
  if (koVoice) utterance.voice = koVoice;

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
 * Base64 신경망 오디오 바로 재생
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
        console.warn("Base64 Audio play blocked by browser autoplay policy, using WebSpeech fallback:", err);
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
