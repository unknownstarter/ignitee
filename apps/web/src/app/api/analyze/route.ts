import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prd, conversationHistory = [] } = await request.json();
    
    if (!prd || prd.trim().length === 0) {
      return NextResponse.json({ error: 'PRD를 입력해주세요.' }, { status: 400 });
    }

    // Agent Orchestrator 호출
    const orchestratorUrl = process.env.AGENT_ORCHESTRATOR_URL || 'http://localhost:3002';
    
    const response = await fetch(`${orchestratorUrl}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prd, conversationHistory }),
    });

    if (!response.ok) {
      console.error('Agent Orchestrator error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return NextResponse.json({ error: 'AI 분석 중 오류가 발생했습니다.' }, { status: 500 });
    }

    // 응답이 JSON인지 확인
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error('Non-JSON response:', textResponse);
      return NextResponse.json({ error: 'AI 응답 형식 오류가 발생했습니다.' }, { status: 500 });
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: '분석 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
