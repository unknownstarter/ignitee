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
    const { prd, action } = await req.json();
    
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
          content: `당신은 전문적인 마케팅 실행 계획 수립자입니다.
          주어진 PRD를 바탕으로 실행 가능한 마케팅 캘린더를 생성해주세요.
          다음 JSON 구조로 응답해주세요:
          {
            "timeline": [
              {
                "phase": "1단계: 준비 및 기반 구축",
                "duration": "4주",
                "tasks": [
                  {
                    "task": "구체적인 작업명",
                    "description": "작업에 대한 상세 설명",
                    "deliverable": "산출물",
                    "owner": "담당자",
                    "dependencies": ["선행 작업들"]
                  }
                ]
              }
            ],
            "milestones": [
              {
                "milestone": "마일스톤명",
                "date": "예상 완료일",
                "success_metrics": ["성공 지표들"],
                "risks": ["위험 요소들"]
              }
            ],
            "resources": {
              "team": ["필요한 팀원들"],
              "budget": "예상 예산",
              "tools": ["필요한 도구들"]
            }
          }`
        },
        { 
          role: "user", 
          content: `다음 PRD를 바탕으로 실행 캘린더를 생성해주세요:\n\n${prd}` 
        }
      ],
      temperature: 0.3,
      max_tokens: 3000,
    });

    const calendarText = completion.choices[0].message.content ?? "{}";
    
    // JSON 파싱 검증
    let calendar;
    try {
      calendar = JSON.parse(calendarText);
    } catch (error) {
      console.error('Failed to parse OpenAI response:', calendarText);
      return new Response(
        JSON.stringify({ error: 'Failed to parse calendar result' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify(calendar),
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
