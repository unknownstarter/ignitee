import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.57.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { analysis } = await req.json();
    
    if (!analysis) {
      return new Response(
        JSON.stringify({ error: 'Analysis data is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const openai = new OpenAI({ 
      apiKey: Deno.env.get("OPENAI_API_KEY")! 
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: `당신은 전문적인 GTM 전략가입니다. 
          주어진 분석 결과를 바탕으로 실행 가능한 GTM 전략을 수립해주세요.
          다음 JSON 구조로 응답해주세요:
          {
            "positioning": {
              "target": "타겟 고객 명확한 정의",
              "benefit": "핵심 가치 제안 (고객이 얻는 이익)",
              "differentiation": "경쟁사 대비 차별화 포인트",
              "proof": ["신뢰성을 뒷받침하는 증명 요소들"]
            },
            "keyMessages": [
              {
                "message": "핵심 메시지",
                "tone": "professional|casual|friendly|authoritative",
                "useCase": "이 메시지를 사용할 상황"
              }
            ],
            "channelMix": [
              {
                "channel": "채널명 (YouTube, Instagram, TikTok, LinkedIn 등)",
                "strategy": "해당 채널에서의 전략",
                "contentTypes": ["콘텐츠 타입들"],
                "frequency": "발행 빈도 (daily, weekly, biweekly, monthly)",
                "goals": ["이 채널을 통한 목표들"]
              }
            ]
          }`
        },
        { 
          role: "user", 
          content: `다음 분석 결과를 바탕으로 GTM 전략을 수립해주세요:\n\n${JSON.stringify(analysis, null, 2)}` 
        }
      ],
      temperature: 0.3,
      max_tokens: 2500,
    });

    const strategyText = completion.choices[0].message.content ?? "{}";
    
    // JSON 파싱 검증
    let strategy;
    try {
      strategy = JSON.parse(strategyText);
    } catch (error) {
      console.error('Failed to parse OpenAI response:', strategyText);
      return new Response(
        JSON.stringify({ error: 'Failed to parse strategy result' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify(strategy),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
