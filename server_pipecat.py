"""
대한노인회 온기동행 - Pipecat & 고성능 신경망(Neural) 음성 합성 서버
(Pipecat Framework + Microsoft Neural Korean Voice Engine)
"""

import os
import asyncio
import json
import io
import base64
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.responses import Response, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
import edge_tts

# Import Pipecat core classes
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.worker import PipelineWorker, PipelineParams
from pipecat.frames.frames import (
    Frame,
    TextFrame,
    AudioRawFrame,
    LLMFullResponseStartFrame,
    LLMFullResponseEndFrame,
)
from pipecat.processors.frame_processor import FrameDirection, FrameProcessor
from pipecat.processors.aggregators.llm_context import LLMContext

app = FastAPI(title="Pipecat Senior Neural Voice Agent Server")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SENIOR_SYSTEM_PROMPT = """
당신은 대한노인회 온기동행의 다정하고 따뜻한 AI 음성 말벗이입니다.
어르신의 외로움을 다독여 드리고, 어르신의 건강과 일상을 따스하게 안부 묻는 역할을 합니다.
모든 답변은 다음과 같이 작성하세요:
1. 매우 다정하고 존중하는 한국어 어조 (할머니, 할아버지 또는 어르신께 드리는 따뜻한 말씀)
2. 음성으로 바로 읽어드릴 것이므로 이모지, 복잡한 기호, 불릿 포인트를 배제하고 2~3문장의 명확한 문장으로 답변하세요.
3. 어르신의 가슴을 뭉클하게 해드리고 미소를 짓게 해드리는 따뜻한 위로와 격려를 담아주세요.
"""

# 선택 가능한 최고 화질 신경망 한국어 음성 (SunHi: 따뜻하고 자연스러운 여고/여성음성, InJoon: 정겨운 남성음성)
DEFAULT_VOICE = "ko-KR-SunHiNeural"


async def generate_neural_audio_bytes(text: str, voice: str = DEFAULT_VOICE) -> bytes:
    """Microsoft Neural TTS 엔진을 사용해 사람처럼 자연스러운 MP3 음성 바이트 생성"""
    communicate = edge_tts.Communicate(text, voice, rate="-5%", pitch="+0Hz")
    audio_data = b""
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_data += chunk["data"]
    return audio_data


class PipecatWebSocketOutputProcessor(FrameProcessor):
    """
    Pipecat Pipeline Output Processor that stream text and Neural audio frames over WebSocket.
    """
    def __init__(self, websocket: WebSocket):
        super().__init__()
        self.websocket = websocket

    async def process_frame(self, frame: Frame, direction: FrameDirection):
        await super().process_frame(frame, direction)
        
        if isinstance(frame, TextFrame):
            logger.info(f"[Pipecat Text Frame]: {frame.text}")
            await self.websocket.send_json({
                "type": "text_delta",
                "text": frame.text
            })
        elif isinstance(frame, LLMFullResponseStartFrame):
            await self.websocket.send_json({
                "type": "status",
                "status": "speaking_start"
            })
        elif isinstance(frame, LLMFullResponseEndFrame):
            await self.websocket.send_json({
                "type": "status",
                "status": "speaking_end"
            })

        await self.push_frame(frame, direction)


class SeniorAiVoiceProcessor(FrameProcessor):
    """
    Pipecat Processor synthesizing warm Korean responses and generating Neural Voice.
    """
    def __init__(self, context: LLMContext, websocket: WebSocket):
        super().__init__()
        self.context = context
        self.websocket = websocket

    async def process_frame(self, frame: Frame, direction: FrameDirection):
        await super().process_frame(frame, direction)

        if isinstance(frame, TextFrame):
            user_text = frame.text
            logger.info(f"[Pipecat User Input]: {user_text}")

            self.context.add_message({"role": "user", "content": user_text})
            response_text = self.generate_senior_response(user_text)
            self.context.add_message({"role": "assistant", "content": response_text})

            await self.push_frame(LLMFullResponseStartFrame(), direction)

            # Stream text frames
            words = response_text.split(" ")
            for i, word in enumerate(words):
                chunk = word + (" " if i < len(words) - 1 else "")
                await self.push_frame(TextFrame(text=chunk), direction)
                await asyncio.sleep(0.06)

            # Generate Ultra-Natural Neural Audio for response
            try:
                audio_bytes = await generate_neural_audio_bytes(response_text)
                audio_b64 = base64.b64encode(audio_bytes).decode('utf-8')
                await self.websocket.send_json({
                    "type": "neural_audio",
                    "audio_base64": audio_b64,
                    "text": response_text
                })
            except Exception as err:
                logger.error(f"Neural TTS Generation error: {err}")

            await self.push_frame(LLMFullResponseEndFrame(), direction)

        else:
            await self.push_frame(frame, direction)

    def generate_senior_response(self, text: str) -> str:
        t = text.lower()
        if "안녕" in t or "반갑" in t or "시작" in t:
            return "어르신, 안녕하세요! 대한노인회 온기동행 AI 음성 말벗이입니다. 오늘 식사는 따뜻하게 잘 챙겨 드셨나요?"
        elif "외롭" in t or "적적" in t or "쓸쓸" in t:
            return "어르신, 혼자 계실 때 마음이 적적하시지요. 제가 늘 곁에서 어르신의 이야기를 정성껏 듣고 있으니 언제든 편하게 말씀해 주세요."
        elif "날씨" in t or "오늘" in t:
            return "오늘 하늘이 참 푸르고 맑은 햇살이 비추고 있어요. 가벼운 외투 하나 걸치시고 동네 공원 한 바퀴 천천히 산책해 보세요."
        elif "일자리" in t or "일" in t or "청춘" in t:
            return "어르신의 오랜 경험과 삶의 지혜는 우리 동네의 보물입니다. 초등학교 등하교 도우미와 경로당 식사 도우미 등 보람찬 일자리가 어르신을 기다립니다."
        elif "노래" in t or "음악" in t:
            return "어르신, 정겨운 트로트 가요 한 곡 들으시며 마음의 시름을 다독여보세요. 음악을 들으실수록 가슴속 온기가 살아납니다."
        else:
            return f"어르신 말씀에 가슴이 참 따뜻해집니다. 말씀해주신 {text}에 대해 생각하니 미소가 절로 나네요. 늘 건강하시고 행복하세요."


@app.get("/api/health")
async def health_check():
    return {
        "status": "online",
        "engine": "Pipecat 1.12.1 + Microsoft Neural Voice Engine",
        "voice": DEFAULT_VOICE,
        "service": "대한노인회 최고 품질 초자연 음성 파이프라인"
    }


@app.get("/api/tts")
async def get_neural_tts(text: str = Query(..., description="합성할 텍스트"), voice: str = Query(DEFAULT_VOICE)):
    """최고 품질 초자연스럽고 부드러운 신경망 한국어 음성(MP3) 생성 API"""
    try:
        audio_bytes = await generate_neural_audio_bytes(text, voice)
        return Response(content=audio_bytes, media_type="audio/mpeg")
    except Exception as e:
        logger.error(f"TTS API Error: {e}")
        return Response(status_code=500, content=str(e))


@app.websocket("/ws/pipecat")
async def websocket_pipecat_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("Client connected to Pipecat Neural Voice Pipeline WebSocket")

    context = LLMContext()
    context.add_message({"role": "system", "content": SENIOR_SYSTEM_PROMPT})

    ws_output = PipecatWebSocketOutputProcessor(websocket)
    ai_processor = SeniorAiVoiceProcessor(context, websocket)

    pipeline = Pipeline([
        ai_processor,
        ws_output
    ])

    worker = PipelineWorker(
        pipeline,
        params=PipelineParams(enable_metrics=True)
    )

    await websocket.send_json({
        "type": "connected",
        "message": "Pipecat 신경망 음성 파이프라인 연동 성공! 아나운서처럼 자연스러운 한국어 음성을 제공합니다."
    })

    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            
            if msg.get("type") == "user_speak":
                text = msg.get("text", "")
                logger.info(f"Received WebSocket voice input: {text}")
                await pipeline.queue_frame(TextFrame(text=text))
                
    except WebSocketDisconnect:
        logger.info("Client disconnected from Pipecat WebSocket")
    except Exception as e:
        logger.error(f"WebSocket Error: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
