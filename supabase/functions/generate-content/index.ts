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
    const { strategy, platform, count = 5 } = await req.json();
    
    if (!strategy || !platform) {
      return new Response(
        JSON.stringify({ error: 'Strategy and platform are required' }),
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
          content: `당신은 전문적인 콘텐츠 크리에이터입니다.
          주어진 전략을 바탕으로 ${platform} 플랫폼용 콘텐츠를 생성해주세요.
          다음 JSON 배열 형태로 응답해주세요:
          [
            {
              "platform": "${platform}",
              "title": "매력적인 콘텐츠 제목",
              "description": "콘텐츠에 대한 상세 설명",
              "type": "educational|entertainment|behind-scenes|promotional",
              "hashtags": ["관련 해시태그들"],
              "callToAction": "행동 유도 문구"
            }
          ]
          
          각 플랫폼의 특성을 고려해주세요:
          - YouTube: 교육적이고 긴 형태의 콘텐츠
          - Instagram: 시각적이고 짧은 형태의 콘텐츠
          - TikTok: 트렌디하고 재미있는 짧은 콘텐츠
          - LinkedIn: 전문적이고 비즈니스 중심의 콘텐츠`
        },
        { 
          role: "user", 
          content: `다음 전략을 바탕으로 ${platform}용 콘텐츠 ${count}개를 생성해주세요:\n\n${JSON.stringify(strategy, null, 2)}` 
        }
      ],
      temperature: 0.4,
      max_tokens: 2000,
    });

    const contentText = completion.choices[0].message.content ?? "[]";
    
    // JSON 파싱 검증
    let contents;
    try {
      contents = JSON.parse(contentText);
    } catch (error) {
      console.error('Failed to parse OpenAI response:', contentText);
      return new Response(
        JSON.stringify({ error: 'Failed to parse content result' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify(contents),
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
