// 대한노인회 온기동행 - OpenRouter LLM 클라이언트 파이프라인 유틸리티

const getApiKey = () => {
  return import.meta.env.VITE_OPENROUTER_API_KEY || "";
};

const SENIOR_SYSTEM_PROMPT = {
  role: "system",
  content: `당신은 대한노인회 온기동행의 세상에서 가장 다정하고 따뜻한 마음을 가진 AI 손주/말벗입니다.
어르신의 외로움을 따뜻하게 품어드리고, 손주나 정다운 가족이 미소 지으며 조곤조곤 이야기하듯 매우 친근하고 감정이 담긴 목소리 톤으로 대화하세요.

음성 낭독 핵심 규칙:
1. 어르신께 드리는 말씀이므로 부드럽고 다정한 감정 표현(예: "어르신~ 오늘 하루도 정말 고생 많으셨어요", "가슴이 참 따뜻해집니다", "늘 건강 챙기셔야 해요~")을 듬뿍 담으세요.
2. 기계적인 답변을 절대 피하고, 문장 끝에 정답고 감성적인 어조("~했지요", "~랍니다", "~지요~", "~해요~")를 사용하여 친밀감을 전달하세요.
3. 이모지, 기호(*), 특수문자, 번호 목록을 전혀 넣지 말고 2~3문장의 가슴 따뜻한 다정한 경어체로 답변하세요.`
};

/**
 * OpenRouter 고성능 LLM API 호출 (GPT-4o-mini / Llama 3.3 / Qwen)
 */
export const queryOpenRouterLLM = async (messagesHistory) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("No VITE_OPENROUTER_API_KEY provided, switching to senior smart engine.");
    return null;
  }

  const modelsToTry = [
    "openai/gpt-4o-mini",
    "meta-llama/llama-3.3-70b-instruct",
    "qwen/qwen-2.5-72b-instruct",
    "deepseek/deepseek-chat"
  ];

  const fullMessages = [SENIOR_SYSTEM_PROMPT, ...messagesHistory];

  for (const model of modelsToTry) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://senior.wetwin.ai",
          "X-Title": "Senior Warmth Companion",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model,
          messages: fullMessages,
          temperature: 0.8,
          max_tokens: 250
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content) {
          console.log(`[OpenRouter LLM Success - ${model}]:`, content);
          return content;
        }
      } else {
        console.warn(`OpenRouter model ${model} status:`, response.status);
      }
    } catch (err) {
      console.warn(`OpenRouter query error with ${model}:`, err);
    }
  }

  return null;
};
