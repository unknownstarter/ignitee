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
    const { prd } = await req.json();
    
    if (!prd || typeof prd !== 'string') {
      return new Response(
        JSON.stringify({ error: 'PRD is required and must be a string' }),
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
          주어진 PRD를 분석하여 다음 JSON 구조로 응답해주세요:
          {
            "domain": "제품 도메인 (예: Creator SaaS, E-commerce, Fintech)",
            "personas": [
              {
                "name": "페르소나 이름",
                "description": "페르소나 설명",
                "pain": "주요 페인포인트",
                "need": "핵심 니즈",
                "behavior": ["행동 패턴들"]
              }
            ],
            "pains": ["고객 페인포인트들"],
            "solutionMap": [
              {
                "pain": "페인포인트",
                "solution": "해결책",
                "priority": "high|medium|low"
              }
            ]
          }`
        },
        { 
          role: "user", 
          content: `다음 PRD를 분석해주세요:\n\n${prd}` 
        }
      ],
      temperature: 0.2,
      max_tokens: 2000,
    });

    const analysisText = completion.choices[0].message.content ?? "{}";
    
    // JSON 파싱 검증
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (error) {
      console.error('Failed to parse OpenAI response:', analysisText);
      return new Response(
        JSON.stringify({ error: 'Failed to parse analysis result' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify(analysis),
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
