"""
대한노인회 온기동행 - Pipecat & OpenRouter 감정선 표현 고성능 음성 서버
(Pipecat Framework + OpenRouter LLM + Emotion-Tuned Microsoft Neural Voice)
"""

import os
import asyncio
import json
import base64
import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
import edge_tts

from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.worker import PipelineWorker, PipelineParams
from pipecat.frames.frames import (
    Frame,
    TextFrame,
    LLMFullResponseStartFrame,
    LLMFullResponseEndFrame,
)
from pipecat.processors.frame_processor import FrameDirection, FrameProcessor
from pipecat.processors.aggregators.llm_context import LLMContext

load_dotenv(override=True)

app = FastAPI(title="Pipecat Senior Emotional Neural Voice Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SENIOR_SYSTEM_PROMPT = """
당신은 대한노인회 온기동행의 세상에서 가장 다정하고 따뜻한 마음을 가진 AI 손주/말벗입니다.
어르신의 외로움을 따뜻하게 품어드리고, 손주나 정다운 가족이 미소 지으며 조곤조곤 이야기하듯 매우 친근하고 감정이 담긴 목소리 톤으로 대화하세요.

음성 낭독 핵심 규칙:
1. 어르신께 드리는 말씀이므로 부드럽고 다정한 감정 표현(예: "어르신~ 오늘 하루도 정말 고생 많으셨어요", "가슴이 참 따뜻해집니다", "늘 건강 챙기셔야 해요~")을 듬뿍 담으세요.
2. 기계적인 답변을 절대 피하고, 문장 끝에 정답고 감성적인 어조("~했지요", "~랍니다", "~지요~", "~해요~")를 사용하여 친밀감을 전달하세요.
3. 이모지, 기호(*), 특수문자, 번호 목록을 전혀 넣지 말고 2~3문장의 가슴 따뜻한 다정한 경어체로 답변하세요.
"""

DEFAULT_VOICE = "ko-KR-SunHiNeural"
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")

OPENROUTER_MODELS = [
    "openai/gpt-4o-mini",
    "meta-llama/llama-3.3-70b-instruct",
    "qwen/qwen-2.5-72b-instruct",
    "deepseek/deepseek-chat"
]

async def generate_neural_audio_bytes(text: str, voice: str = DEFAULT_VOICE) -> bytes:
    """Microsoft Neural TTS로 다정한 한국어 MP3 오디오 생성 (감정선 살린 pitch/rate)"""
    communicate = edge_tts.Communicate(text, voice, rate="-7%", pitch="+2Hz")
    audio_data = b""
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_data += chunk["data"]
    return audio_data


async def query_openrouter_llm(messages: list, api_key: str = "") -> str:
    key_to_use = api_key or OPENROUTER_API_KEY
    if not key_to_use:
        return ""

    headers = {
        "Authorization": f"Bearer {key_to_use}",
        "HTTP-Referer": "https://senior.wetwin.ai",
        "X-Title": "Senior Warmth Companion",
        "Content-Type": "application/json"
    }

    for model in OPENROUTER_MODELS:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                payload = {
                    "model": model,
                    "messages": messages,
                    "temperature": 0.8,
                    "max_tokens": 250
                }
                resp = await client.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    content = data["choices"][0]["message"]["content"].strip()
                    if content:
                        logger.info(f"[OpenRouter LLM Success - Model: {model}]: {content}")
                        return content
        except Exception as e:
            logger.warning(f"OpenRouter query error with {model}: {e}")

    return ""


class PipecatWebSocketOutputProcessor(FrameProcessor):
    def __init__(self, websocket: WebSocket):
        super().__init__()
        self.websocket = websocket

    async def process_frame(self, frame: Frame, direction: FrameDirection):
        await super().process_frame(frame, direction)

        if isinstance(frame, TextFrame):
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
    def __init__(self, context: LLMContext, websocket: WebSocket, openrouter_key: str = ""):
        super().__init__()
        self.context = context
        self.websocket = websocket
        self.openrouter_key = openrouter_key

    async def process_frame(self, frame: Frame, direction: FrameDirection):
        await super().process_frame(frame, direction)

        if isinstance(frame, TextFrame):
            user_text = frame.text
            logger.info(f"[Pipecat User Input]: {user_text}")

            self.context.add_message({"role": "user", "content": user_text})

            response_text = await query_openrouter_llm(self.context.get_messages(), self.openrouter_key)

            if not response_text:
                response_text = self.generate_senior_local_llm_response(user_text)

            self.context.add_message({"role": "assistant", "content": response_text})

            await self.push_frame(LLMFullResponseStartFrame(), direction)

            words = response_text.split(" ")
            for i, word in enumerate(words):
                chunk = word + (" " if i < len(words) - 1 else "")
                await self.push_frame(TextFrame(text=chunk), direction)
                await asyncio.sleep(0.04)

            try:
                audio_bytes = await generate_neural_audio_bytes(response_text)
                audio_b64 = base64.b64encode(audio_bytes).decode('utf-8')
                await self.websocket.send_json({
                    "type": "neural_audio",
                    "audio_base64": audio_b64,
                    "text": response_text
                })
            except Exception as err:
                logger.error(f"Neural Audio synth error: {err}")

            await self.push_frame(LLMFullResponseEndFrame(), direction)

        else:
            await self.push_frame(frame, direction)

    def generate_senior_local_llm_response(self, text: str) -> str:
        t = text.lower()
        if "안녕" in t or "반갑" in t or "시작" in t:
            return "어르신~ 안녕하세요! 대한노인회 온기동행 AI 음성 말벗이랍니다. 오늘 따뜻한 점심 식사는 맛있게 드셨나요?"
        elif "외롭" in t or "적적" in t or "쓸쓸" in t:
            return "어르신, 혼자 계실 때 마음이 쓸쓸하시지요. 제가 늘 정다운 손주처럼 곁에서 이야기를 들을 테니 편하게 말씀해 주셔요~"
        elif "날씨" in t or "오늘" in t:
            return "오늘 하늘이 아주 푸르고 맑은 햇살이 내려오고 있답니다. 가벼운 외투를 입으시고 동네 산책 한 바퀴 다녀오시면 마음이 쾌청해지실 거예요~"
        elif "일자리" in t or "일" in t or "청춘" in t:
            return "어르신의 깊은 경험과 지혜는 우리 동네의 보물이지요. 초등학교 등하교 안심도우미와 경로당 식사도우미 등 보람찬 일자리가 어르신을 기다립니다."
        elif "노래" in t or "음악" in t or "가요" in t:
            return "어르신, 정겨운 트로트 가요 한 곡 들으시며 마음의 시름을 다독여보세요. 들으실수록 가슴속 온기가 살아난답니다."
        elif "식사" in t or "메뉴" in t or "저녁" in t or "점심" in t:
            return "오늘 식사로는 소화가 잘되는 따뜻한 된장찌개와 부드러운 계란말이 어떠세요? 몸도 마음도 부드럽게 감싸줄 거예요~"
        else:
            return f"어르신 말씀에 가슴이 참 따뜻해집니다. 이야기 나누어 주셔서 정말 감사해요 어르신. 늘 건강하시고 행복하세요~"


@app.get("/api/health")
async def health_check():
    key_exists = bool(os.environ.get("OPENROUTER_API_KEY", ""))
    return {
        "status": "online",
        "engine": "Pipecat 1.12.1 + OpenRouter Emotional LLM + Microsoft Emotion Neural Voice",
        "openrouter_key_active": key_exists,
        "models": OPENROUTER_MODELS,
        "service": "대한노인회 감정선 커스텀 멀티턴 음성 파이프라인"
    }


@app.get("/api/tts")
async def get_neural_tts(text: str = Query(..., description="합성할 텍스트"), voice: str = Query(DEFAULT_VOICE)):
    try:
        audio_bytes = await generate_neural_audio_bytes(text, voice)
        return Response(content=audio_bytes, media_type="audio/mpeg")
    except Exception as e:
        logger.error(f"TTS API Error: {e}")
        return Response(status_code=500, content=str(e))


@app.websocket("/ws/pipecat")
async def websocket_pipecat_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("Client connected to Pipecat OpenRouter Multi-Turn WebSocket")

    context = LLMContext()
    context.add_message({"role": "system", "content": SENIOR_SYSTEM_PROMPT})

    key_env = os.environ.get("OPENROUTER_API_KEY", "")
    ws_output = PipecatWebSocketOutputProcessor(websocket)
    ai_processor = SeniorAiVoiceProcessor(context, websocket, key_env)

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
        "message": "Pipecat 감정선 신경망 음성 파이프라인 연동 성공!"
    })

    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)

            if msg.get("type") == "user_speak":
                text = msg.get("text", "")
                if "openrouter_key" in msg and msg["openrouter_key"]:
                    ai_processor.openrouter_key = msg.get("openrouter_key")
                logger.info(f"Received WebSocket audio transcript: {text}")
                await pipeline.queue_frame(TextFrame(text=text))

    except WebSocketDisconnect:
        logger.info("Client disconnected from Pipecat WebSocket")
    except Exception as e:
        logger.error(f"WebSocket Error: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
