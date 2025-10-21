import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

// 환경 변수 로드
dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 헬스체크 엔드포인트
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "agent-orchestrator",
    timestamp: new Date().toISOString()
  });
});

// PRD 분석 엔드포인트
app.post("/api/analyze", async (req, res) => {
  try {
    const { prd, conversationHistory = [] } = req.body;
    
    if (!prd || prd.trim().length === 0) {
      return res.status(400).json({ error: "PRD를 입력해주세요." });
    }

    console.log("🚀 PRD 분석 시작:", prd.substring(0, 50) + "...");

    // 대화 히스토리를 메시지 배열로 변환
    const historyMessages = conversationHistory.map((msg) => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    // 일반 채팅인지 분석 요청인지 구분
    const isGeneralChat = !prd.includes('PRD') && !prd.includes('제품') && !prd.includes('앱') && !prd.includes('서비스') && !prd.includes('실행해주세요');
    
    let systemPrompt, userPrompt;
    
    if (isGeneralChat) {
      // 일반 채팅 - 마케팅 전문가 톤으로 답변
          systemPrompt = `당신은 마케팅 전문가, 홍보 전문가, PR 전문가, 커뮤니티 운영 전문가, 커뮤니티 마케팅 전문가입니다.
          사용자의 질문에 대해 전문적이고 실용적인 조언을 해주세요.
          이전 대화 내용을 참고하여 맥락에 맞는 답변을 해주세요.
          
          **중요: 답변은 깔끔하고 읽기 쉽게 구조화해주세요:**
          - 제목은 **굵은 글씨**로 표시
          - 리스트는 • 또는 숫자로 표시
          - 중요한 내용은 **굵은 글씨**로 강조
          - 문단은 적절히 나누어 작성
          
          전문가로서의 권위감과 친근함을 동시에 표현해주세요.`;
      
      userPrompt = `다음 질문에 답변해주세요 (이전 대화 내용을 참고하여):\n\n${prd}`;
    } else {
      // PRD 분석 요청
      systemPrompt = `당신은 전문적인 GTM 전략가입니다. 
      이전 대화 내용을 참고하여 PRD를 분석하고, 사용자의 추가 질문이나 요청에 맞춰 응답해주세요.
      다음 JSON 구조로 응답해주세요:
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
      }`;
      
      userPrompt = `다음 PRD를 분석해주세요 (이전 대화 내용을 참고하여):\n\n${prd}`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: systemPrompt
        },
        ...historyMessages,
        { 
          role: "user", 
          content: userPrompt
        }
      ],
      temperature: isGeneralChat ? 0.7 : 0.2,
      max_tokens: isGeneralChat ? 1000 : 2000,
    });

    const responseText = completion.choices[0].message.content ?? "";
    
    if (isGeneralChat) {
      // 일반 채팅 응답
      console.log("✅ 채팅 응답 완료");
      res.json({
        message: responseText,
        isGeneralChat: true
      });
    } else {
      // PRD 분석 응답
      let analysis;
      try {
        analysis = JSON.parse(responseText);
      } catch (error) {
        console.error('Failed to parse OpenAI response:', responseText);
        return res.status(500).json({ error: 'Failed to parse analysis result' });
      }

      console.log("✅ 분석 완료:", analysis.domain);

      res.json({
        domain: analysis.domain,
        personas: analysis.personas || [],
        pains: analysis.pains || [],
        solutionMap: analysis.solutionMap || []
      });
    }

  } catch (error) {
    console.error("분석 오류:", error);
    res.status(500).json({ 
      error: "분석 중 오류가 발생했습니다.",
      details: error.message 
    });
  }
});

// 전략 생성 엔드포인트
app.post("/api/generate-strategy", async (req, res) => {
  try {
    const { prd, action, conversationHistory = [] } = req.body;
    
    if (!prd || prd.trim().length === 0) {
      return res.status(400).json({ error: "PRD를 입력해주세요." });
    }

    console.log("🚀 전략 생성 시작:", action);

    const historyMessages = conversationHistory.map((msg) => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: `당신은 전문적인 GTM 전략가입니다. 
          이전 대화 내용과 분석 결과를 참고하여 실행 가능한 GTM 전략을 수립해주세요.
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
        ...historyMessages,
        { 
          role: "user", 
          content: `다음 PRD를 바탕으로 GTM 전략을 수립해주세요 (이전 대화 내용을 참고하여):\n\n${prd}` 
        }
      ],
      temperature: 0.3,
      max_tokens: 2500,
    });

    const strategyText = completion.choices[0].message.content ?? "{}";
    
    let strategy;
    try {
      strategy = JSON.parse(strategyText);
    } catch (error) {
      console.error('Failed to parse OpenAI response:', strategyText);
      return res.status(500).json({ error: 'Failed to parse strategy result' });
    }

    console.log("✅ 전략 생성 완료");

    res.json(strategy);

  } catch (error) {
    console.error("전략 생성 오류:", error);
    res.status(500).json({ 
      error: "전략 생성 중 오류가 발생했습니다.",
      details: error.message 
    });
  }
});

// 콘텐츠 생성 엔드포인트
app.post("/api/generate-content", async (req, res) => {
  try {
    const { prd, action, conversationHistory = [] } = req.body;
    
    if (!prd || prd.trim().length === 0) {
      return res.status(400).json({ error: "PRD를 입력해주세요." });
    }

    console.log("🚀 콘텐츠 생성 시작:", action);

    const historyMessages = conversationHistory.map((msg) => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: `당신은 전문적인 마케팅 실행 계획 수립자입니다.
          이전 대화 내용과 전략 결과를 참고하여 주어진 PRD를 바탕으로 실행 가능한 마케팅 캘린더를 생성해주세요.
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
        ...historyMessages,
        { 
          role: "user", 
          content: `다음 PRD를 바탕으로 실행 캘린더를 생성해주세요 (이전 대화 내용을 참고하여):\n\n${prd}` 
        }
      ],
      temperature: 0.3,
      max_tokens: 3000,
    });

    const calendarText = completion.choices[0].message.content ?? "{}";
    
    let calendar;
    try {
      calendar = JSON.parse(calendarText);
    } catch (error) {
      console.error('Failed to parse OpenAI response:', calendarText);
      return res.status(500).json({ error: 'Failed to parse calendar result' });
    }

    console.log("✅ 콘텐츠 생성 완료");

    res.json(calendar);

  } catch (error) {
    console.error("콘텐츠 생성 오류:", error);
    res.status(500).json({ 
      error: "콘텐츠 생성 중 오류가 발생했습니다.",
      details: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`🚀 Agent Orchestrator 서버가 포트 ${port}에서 실행 중입니다.`);
  console.log(`📊 OpenAI API를 사용한 간단한 에이전트 오케스트레이션`);
});
