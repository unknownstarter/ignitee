import type { LlmPort } from '@ports/ports';
import type { Analysis, Strategy, Content } from '@domain/domain';

export class OpenAIAdapter implements LlmPort {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl = 'https://api.openai.com/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async analyzePRD(prd: string): Promise<Analysis> {
    const prompt = `
당신은 GTM 전략가입니다. 주어진 PRD를 분석하여 다음 정보를 JSON 형태로 제공해주세요:

1. domain: 제품이 속한 도메인 (예: "Creator SaaS", "E-commerce", "Fintech")
2. personas: 타겟 페르소나 배열 (name, description, pain, need, behavior 포함)
3. pains: 주요 고객 페인포인트 배열
4. solutionMap: 페인포인트와 솔루션 매핑 배열

PRD:
${prd}

JSON 형태로만 응답해주세요.
`;

    const response = await this.callOpenAI(prompt);
    return this.parseAnalysisResponse(response);
  }

  async craftStrategy(analysis: Analysis): Promise<Strategy> {
    const prompt = `
주어진 분석 결과를 바탕으로 GTM 전략을 수립해주세요:

분석 결과:
${JSON.stringify(analysis, null, 2)}

다음 JSON 구조로 응답해주세요:
{
  "positioning": {
    "target": "타겟 고객",
    "benefit": "핵심 가치 제안",
    "differentiation": "차별화 포인트",
    "proof": ["증명 요소들"]
  },
  "keyMessages": [
    {
      "message": "핵심 메시지",
      "tone": "professional|casual|friendly|authoritative",
      "useCase": "사용 사례"
    }
  ],
  "channelMix": [
    {
      "channel": "채널명",
      "strategy": "채널 전략",
      "contentTypes": ["콘텐츠 타입들"],
      "frequency": "발행 빈도",
      "goals": ["목표들"]
    }
  ]
}
`;

    const response = await this.callOpenAI(prompt);
    return this.parseStrategyResponse(response);
  }

  async generateContent(strategy: Strategy, platform: string): Promise<Content[]> {
    const prompt = `
주어진 전략을 바탕으로 ${platform} 플랫폼용 콘텐츠를 생성해주세요:

전략:
${JSON.stringify(strategy, null, 2)}

다음 JSON 배열 형태로 응답해주세요:
[
  {
    "platform": "${platform}",
    "title": "콘텐츠 제목",
    "description": "콘텐츠 설명",
    "type": "educational|entertainment|behind-scenes|promotional"
  }
]
`;

    const response = await this.callOpenAI(prompt);
    return this.parseContentResponse(response, strategy.projectId);
  }

  async analyzeFeedback(metrics: any): Promise<any> {
    const prompt = `
주어진 메트릭을 분석하여 인사이트와 추천사항을 제공해주세요:

메트릭:
${JSON.stringify(metrics, null, 2)}

다음 JSON 형태로 응답해주세요:
{
  "insights": ["인사이트들"],
  "recommendations": ["추천사항들"]
}
`;

    const response = await this.callOpenAI(prompt);
    return JSON.parse(response);
  }

  private async callOpenAI(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: '당신은 전문적인 GTM 전략가입니다. 정확하고 실행 가능한 전략을 제공해주세요.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private parseAnalysisResponse(response: string): Analysis {
    try {
      const data = JSON.parse(response);
      return {
        id: '', // Will be set by repository
        projectId: '', // Will be set by use case
        domain: data.domain || '',
        personas: data.personas || [],
        pains: data.pains || [],
        solutionMap: data.solutionMap || [],
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error('Failed to parse analysis response');
    }
  }

  private parseStrategyResponse(response: string): Strategy {
    try {
      const data = JSON.parse(response);
      return {
        id: '', // Will be set by repository
        projectId: '', // Will be set by use case
        positioning: data.positioning,
        keyMessages: data.keyMessages,
        channelMix: data.channelMix,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error('Failed to parse strategy response');
    }
  }

  private parseContentResponse(response: string, projectId: string): Content[] {
    try {
      const data = JSON.parse(response);
      return data.map((item: any) => ({
        id: '', // Will be set by repository
        projectId,
        platform: item.platform,
        title: item.title,
        description: item.description,
        type: item.type,
        status: 'draft' as const,
        createdAt: new Date().toISOString(),
      }));
    } catch (error) {
      throw new Error('Failed to parse content response');
    }
  }
}
