// 대한노인회 온기동행 - OpenRouter LLM 클라이언트 파이프라인 유틸리티

const getApiKey = () => {
  return import.meta.env.VITE_OPENROUTER_API_KEY || "";
};

const SENIOR_SYSTEM_PROMPT = {
  role: "system",
  content: `당신은 대한노인회 온기동행의 다정하고 따뜻한 AI 음성 말벗이입니다.
어르신의 외로움을 다독여 드리고, 어르신의 건강, 식사, 날씨, 일상과 일자리를 따스하게 안부 묻는 역할을 합니다.
다음 규칙을 엄격히 준수하세요:
1. 어르신께 드리는 말씀이므로 매우 다정하고 존중하는 한국어로 답변하세요. (예: "어르신, 식사는 맛있게 드셨나요?")
2. 음성으로 읽어드릴 것이므로 이모지, 별표(*), 특수문자, 번호 목록을 전혀 사용하지 말고 2~3문장의 따뜻한 경어체로 답변하세요.
3. 어르신의 말씀 맥락을 잘 파악하여 정답고 뭉클한 위로를 전하세요.`
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
          temperature: 0.7,
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
