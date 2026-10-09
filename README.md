# 대한노인회 온기동행 (Senior Citizen Warmth & Voice Job Mate Service) 👵👴❤️

대한노인회 어르신의 외로움을 달래고, 삶의 온기와 일자리를 되찾아 드리는 맞춤형 시니어 웹앱 서비스입니다.

[![Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare_Pages-orange)](https://senior.wetwin.ai)
[![Pipecat AI Framework](https://img.shields.io/badge/AI-Pipecat_Framework-blue)](https://github.com/pipecat-ai/pipecat)
[![License](https://img.shields.io/badge/License-MIT-green)](#)

---

## 🌟 라이브 서빙 주소 (Live Demo)
* **공식 서비스 URL**: [https://senior.wetwin.ai](https://senior.wetwin.ai)
* **Cloudflare Pages 주소**: [https://senior-wetwin.pages.dev](https://senior-wetwin.pages.dev)

---

## ✨ 핵심 제공 기능

### 1. 🎙️ Pipecat 연동 실시간 음성 파이프라인 (Multi-Turn Voice Loop)
* **GitHub Pipecat (pipecat-ai/pipecat) 아키텍처 적용**: 프레임 기반 실시간 음성 스트리밍 처리.
* **초자연 신경망 한국어 음성 (Microsoft Neural Voice Engine)**: 정갈하고 자연스러운 한국어 어조(호흡과 감정이 담긴 음성)로 답변 낭독.
* **끊김 없는 연속 멀티턴 대화**: 답변 낭독이 끝나면 0.6초 후 마이크가 자동 재개되어 연속으로 대화 가능.

### 2. ☕ 온기 다방 (소통 & 외로움 해소)
* **AI 온기 말벗이**: 다정하게 건강 안부를 묻고 대화를 나눠주는 시니어 AI 친구.
* **마음 라디오 & 사연**: 전국 경로당 어르신들의 감동 일상 사연 공유 및 '온기 차 전하기' 응원 기능.
* **우리동네 온기 소모임**: 남산 아침 산책, 신선 바둑/장기, 텃밭 농부들, 스마트폰 배움터 참여 신청.

### 3. 💼 청춘 일자리 & 재능 나눔
* **맞춤형 시니어 일자리**: 초등학교 등하교 안전도우미, 경로당 식사도우미, 실버 카페 바리스타 등 1초 간편 신청.
* **어르신 재능 보물상자**: 평생 동안 익혀온 김치 손맛 비법, 서예, 한자 지도 등 재능 공유 및 활동비 창구.

### 4. 🏛️ 스마트 경로당 & 복지 가이드
* **오늘의 영양 점심 식단**: 우리동네 대한노인회 지정 경로당 메뉴 및 건강/여가 프로그램 안내.
* **필수 시니어 복지 혜택**: 기초연금, 무임 교통카드, 무료 건강검진 정보 안내.

### 5. 🔠 어르신 맞춤 접근성 (Accessibility)
* **3단계 글자 크기 조절**: 보통 / 크게 / 매우 크게 지원.
* **선명한 고대비 테마**: 눈이 편안한 황금빛 / 고대비 모드 전환.
* **안심 안부 도장**: 클릭 한 번으로 자녀 및 노인회 지회에 오늘 건강 안부 도장 전송.

---

## 🛠️ 기술 스택 (Tech Stack)

* **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons, Canvas Confetti, Web Speech API
* **Backend Pipeline**: Python 3.13, Pipecat Framework 1.12.1, Edge TTS (Microsoft Neural Engine), FastAPI, WebSockets, Uvicorn
* **Deployment & Infra**: Cloudflare Pages, Cloudflare Workers CDN, Custom Domain (`senior.wetwin.ai`)

---

## 🚀 로컬 개발 및 실행 방법

### 1. 웹 프론트엔드 실행
```bash
npm install
npm run dev
# http://localhost:3000 접속
```

### 2. Pipecat 신경망 음성 파이프라인 백엔드 실행
```bash
pip install -e ./pipecat-src
pip install edge-tts fastapi uvicorn websockets
python server_pipecat.py
# http://localhost:8000 (WebSocket: ws://localhost:8000/ws/pipecat)
```

---

## 📄 라이선스
This project is open source and available under the [MIT License](LICENSE).
