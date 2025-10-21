'use client';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  data?: any;
}

interface ChatInterfaceProps {
  initialPrd: string;
  onBackToLanding: () => void;
}

export default function ChatInterface({ initialPrd, onBackToLanding }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isProcessingRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 초기 PRD 분석 - 한 번만 실행
  useEffect(() => {
    if (initialPrd && !hasInitialized) {
      setHasInitialized(true);
      analyzePrd(initialPrd);
    }
  }, [initialPrd, hasInitialized]);

  const analyzePrd = async (prd: string) => {
    // 이미 같은 PRD가 있는지 체크
    const existingMessage = messages.find(msg => 
      msg.type === 'user' && msg.content === prd
    );
    
    if (existingMessage) {
      console.log('Message already exists, skipping...');
      return;
    }

    // 처리 중이면 중복 실행 방지
    if (isProcessingRef.current) {
      console.log('Already processing, skipping...');
      return;
    }

    isProcessingRef.current = true;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}-${Math.random()}`,
      type: 'user',
      content: prd,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const r = await fetch('/api/analyze', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prd }) 
      });
      const j = await r.json();

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}-${Math.random()}`,
        type: 'assistant',
        content: j.isGeneralChat ? j.message : '분석이 완료되었습니다.',
        timestamp: new Date(),
        data: j.isGeneralChat ? null : j
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Analysis failed:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}-${Math.random()}`,
        type: 'assistant',
        content: '분석 중 오류가 발생했습니다.',
        timestamp: new Date(),
        data: { error: '분석 중 오류가 발생했습니다.' }
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      isProcessingRef.current = false;
    }
  };

  const onSendMessage = async (message: string, event?: React.MouseEvent) => {
    // 이벤트 전파 방지
    if (event) {
      event.stopPropagation();
    }
    
    if (!message.trim()) return;

    // 이미 같은 메시지가 있는지 체크
    const existingMessage = messages.find(msg => 
      msg.type === 'user' && msg.content === message
    );
    
    if (existingMessage) {
      console.log('Message already exists, skipping...');
      return;
    }

    // 처리 중이면 중복 실행 방지
    if (isProcessingRef.current) {
      console.log('Already processing, skipping...');
      return;
    }

    isProcessingRef.current = true;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}-${Math.random()}`,
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const r = await fetch('/api/analyze', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prd: message, conversationHistory: messages }) 
      });
      const j = await r.json();

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}-${Math.random()}`,
        type: 'assistant',
        content: j.isGeneralChat ? j.message : '분석이 완료되었습니다.',
        timestamp: new Date(),
        data: j.isGeneralChat ? null : j
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Analysis failed:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}-${Math.random()}`,
        type: 'assistant',
        content: '분석 중 오류가 발생했습니다.',
        timestamp: new Date(),
        data: { error: '분석 중 오류가 발생했습니다.' }
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      isProcessingRef.current = false;
    }
  };

  const onActionClick = async (action: string, event: React.MouseEvent) => {
    // 이벤트 전파 방지
    event.stopPropagation();
    
    if (isProcessingRef.current) {
      console.log('Already processing, skipping...');
      return;
    }

    isProcessingRef.current = true;
    setLoading(true);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}-${Math.random()}`,
      type: 'user',
      content: `${action}을 실행해주세요`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      let apiEndpoint = '/api/analyze';
      let requestBody = { prd: initialPrd, conversationHistory: messages };

      // 액션에 따라 다른 API 엔드포인트 사용
      if (action === '더 자세한 분석') {
        apiEndpoint = '/api/analyze';
        requestBody = { prd: initialPrd, conversationHistory: messages };
      } else if (action === '원페이저 전략 구성') {
        apiEndpoint = '/api/generate-strategy';
        requestBody = { prd: initialPrd, action: 'one-pager-strategy', conversationHistory: messages };
      } else if (action === '실행 캘린더 제작') {
        apiEndpoint = '/api/generate-content';
        requestBody = { prd: initialPrd, action: 'execution-calendar', conversationHistory: messages };
      }

      const r = await fetch(apiEndpoint, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody) 
      });
      const j = await r.json();

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}-${Math.random()}`,
        type: 'assistant',
        content: `${action}이 완료되었습니다.`,
        timestamp: new Date(),
        data: j
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Action failed:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}-${Math.random()}`,
        type: 'assistant',
        content: `${action} 중 오류가 발생했습니다.`,
        timestamp: new Date(),
        data: { error: `${action} 중 오류가 발생했습니다.` }
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      isProcessingRef.current = false;
    }
  };

  return (
    <div className="h-screen bg-white text-gray-900 font-sans flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={onBackToLanding}
          >
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">I</span>
            </div>
            <h1 className="text-xl font-bold text-black">Ignitee</h1>
          </div>
          <div className="text-sm text-gray-500">
            PRD → Go-to-Market Strategy
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-3xl ${message.type === 'user' ? 'bg-black text-white' : 'bg-gray-100 text-gray-900'} rounded-2xl px-4 py-3`}>
                <div className="flex items-start space-x-3">
                  {message.type === 'assistant' && (
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs">AI</span>
                    </div>
                  )}
                  <div className="flex-1">
                        {message.data?.isGeneralChat ? (
                          <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#374151' }}>
                            {message.content.split('\n').map((line, index) => {
                              if (line.trim() === '') {
                                return <br key={index} />;
                              }
                              if (line.startsWith('**') && line.endsWith('**')) {
                                const text = line.replace(/\*\*/g, '');
                                return <div key={index} style={{ fontSize: '16px', fontWeight: 'bold', color: '#000', margin: '12px 0 8px 0' }}>{text}</div>;
                              }
                              if (line.startsWith('•') || line.startsWith('-')) {
                                return <div key={index} style={{ marginLeft: '20px', marginBottom: '4px' }}>{line}</div>;
                              }
                              if (line.match(/^\d+\./)) {
                                return <div key={index} style={{ marginLeft: '20px', marginBottom: '4px' }}>{line}</div>;
                              }
                              return <div key={index} style={{ marginBottom: '8px' }}>{line}</div>;
                            })}
                          </div>
                        ) : (
                          <div style={{ fontSize: '14px' }}>{message.content}</div>
                        )}
                    {message.data && !message.data.error && (
                      <div className="mt-4 space-y-4">
                        {/* Domain */}
                        {message.data.domain && (
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-black mb-2">🎯 도메인</h3>
                            <p className="text-gray-700">{message.data.domain}</p>
                          </div>
                        )}

                        {/* Personas */}
                        {message.data.personas && message.data.personas.length > 0 && (
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-black mb-3">👥 페르소나</h3>
                            <div className="grid gap-3 md:grid-cols-2">
                              {message.data.personas.map((persona: any, index: number) => (
                                <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                  <h4 className="font-medium text-black mb-1">{persona.name}</h4>
                                  <p className="text-sm text-gray-600 mb-2">{persona.description}</p>
                                  <div className="text-xs text-gray-500">
                                    <div>Pain: {persona.pain}</div>
                                    <div>Need: {persona.need}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Pains */}
                        {message.data.pains && message.data.pains.length > 0 && (
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-black mb-3">💔 페인포인트</h3>
                            <div className="grid gap-2 md:grid-cols-2">
                              {message.data.pains.map((pain: string, index: number) => (
                                <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                                  <span className="text-sm text-gray-700">{pain}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Solution Map */}
                        {message.data.solutionMap && message.data.solutionMap.length > 0 && (
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-black mb-3">💡 솔루션 매핑</h3>
                            <div className="space-y-3">
                              {message.data.solutionMap.map((solution: any, index: number) => (
                                <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="text-xs text-gray-500 mb-1">Pain</div>
                                      <div className="text-sm text-black mb-2">{solution.pain}</div>
                                      <div className="text-xs text-gray-500 mb-1">Solution</div>
                                      <div className="text-sm text-gray-700">{solution.solution}</div>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                      solution.priority === 'high' ? 'bg-red-100 text-red-800' :
                                      solution.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-green-100 text-green-800'
                                    }`}>
                                      {solution.priority}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Strategy Results */}
                        {message.data.positioning && (
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold text-black">🎯 포지셔닝</h3>
                              <button
                                onClick={() => {
                                  const text = `🎯 포지셔닝\n\nTarget: ${message.data.positioning.target}\nBenefit: ${message.data.positioning.benefit}\nDifferentiation: ${message.data.positioning.differentiation}`;
                                  navigator.clipboard.writeText(text);
                                }}
                                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
                              >
                                📋 복사
                              </button>
                            </div>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                              <div className="text-sm text-gray-600 mb-1">Target</div>
                              <div className="text-black mb-3">{message.data.positioning.target}</div>
                              <div className="text-sm text-gray-600 mb-1">Benefit</div>
                              <div className="text-black mb-3">{message.data.positioning.benefit}</div>
                              <div className="text-sm text-gray-600 mb-1">Differentiation</div>
                              <div className="text-black">{message.data.positioning.differentiation}</div>
                            </div>
                          </div>
                        )}

                        {/* Key Messages */}
                        {message.data.keyMessages && message.data.keyMessages.length > 0 && (
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold text-black">💬 핵심 메시지</h3>
                              <button
                                onClick={() => {
                                  const text = `💬 핵심 메시지\n\n${message.data.keyMessages.map((msg: any) => `• ${msg.message} (${msg.tone}, ${msg.useCase})`).join('\n')}`;
                                  navigator.clipboard.writeText(text);
                                }}
                                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
                              >
                                📋 복사
                              </button>
                            </div>
                            <div className="space-y-3">
                              {message.data.keyMessages.map((msg: any, index: number) => (
                                <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                  <div className="text-black mb-1">{msg.message}</div>
                                  <div className="text-xs text-gray-500">Tone: {msg.tone} | Use: {msg.useCase}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Channel Mix */}
                        {message.data.channelMix && message.data.channelMix.length > 0 && (
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold text-black">📺 채널 믹스</h3>
                              <button
                                onClick={() => {
                                  const text = `📺 채널 믹스\n\n${message.data.channelMix.map((channel: any) => `• ${channel.channel}\n  ${channel.strategy}\n  Content: ${channel.contentTypes?.join(', ')} | Frequency: ${channel.frequency}`).join('\n\n')}`;
                                  navigator.clipboard.writeText(text);
                                }}
                                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
                              >
                                📋 복사
                              </button>
                            </div>
                            <div className="space-y-3">
                              {message.data.channelMix.map((channel: any, index: number) => (
                                <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                  <div className="font-medium text-black mb-2">{channel.channel}</div>
                                  <div className="text-sm text-gray-700 mb-2">{channel.strategy}</div>
                                  <div className="text-xs text-gray-500">
                                    Content: {channel.contentTypes?.join(', ')} | 
                                    Frequency: {channel.frequency}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Timeline */}
                        {message.data.timeline && message.data.timeline.length > 0 && (
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold text-black">📅 실행 타임라인</h3>
                              <button
                                onClick={() => {
                                  const text = `📅 실행 타임라인\n\n${message.data.timeline.map((phase: any) => {
                                    const phaseText = `${phase.phase} (${phase.duration})\n`;
                                    const tasksText = phase.tasks?.map((task: any) => 
                                      `  • ${task.task}\n    ${task.description}\n    Owner: ${task.owner} | Deliverable: ${task.deliverable}`
                                    ).join('\n\n') || '';
                                    return phaseText + tasksText;
                                  }).join('\n\n')}`;
                                  navigator.clipboard.writeText(text);
                                }}
                                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
                              >
                                📋 복사
                              </button>
                            </div>
                            <div className="space-y-4">
                              {message.data.timeline.map((phase: any, index: number) => (
                                <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                  <div className="font-medium text-black mb-2">{phase.phase} ({phase.duration})</div>
                                  <div className="space-y-2">
                                    {phase.tasks?.map((task: any, taskIndex: number) => (
                                      <div key={taskIndex} className="bg-white border border-gray-200 rounded p-2">
                                        <div className="text-sm text-black font-medium">{task.task}</div>
                                        <div className="text-xs text-gray-600">{task.description}</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                          Owner: {task.owner} | Deliverable: {task.deliverable}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Milestones */}
                        {message.data.milestones && message.data.milestones.length > 0 && (
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold text-black">🎯 마일스톤</h3>
                              <button
                                onClick={() => {
                                  const text = `🎯 마일스톤\n\n${message.data.milestones.map((milestone: any) => 
                                    `• ${milestone.milestone}\n  Date: ${milestone.date}\n  Metrics: ${milestone.success_metrics?.join(', ')}`
                                  ).join('\n\n')}`;
                                  navigator.clipboard.writeText(text);
                                }}
                                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
                              >
                                📋 복사
                              </button>
                            </div>
                            <div className="space-y-3">
                              {message.data.milestones.map((milestone: any, index: number) => (
                                <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                  <div className="font-medium text-black mb-1">{milestone.milestone}</div>
                                  <div className="text-sm text-gray-600 mb-2">Date: {milestone.date}</div>
                                  <div className="text-xs text-gray-500">
                                    Metrics: {milestone.success_metrics?.join(', ')}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Resources */}
                        {message.data.resources && (
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold text-black">🛠️ 리소스</h3>
                              <button
                                onClick={() => {
                                  const text = `🛠️ 리소스\n\nTeam: ${message.data.resources.team?.join(', ')}\nBudget: ${message.data.resources.budget}\nTools: ${message.data.resources.tools?.join(', ')}`;
                                  navigator.clipboard.writeText(text);
                                }}
                                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
                              >
                                📋 복사
                              </button>
                            </div>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                              <div className="text-sm text-gray-600 mb-1">Team</div>
                              <div className="text-black mb-3">{message.data.resources.team?.join(', ')}</div>
                              <div className="text-sm text-gray-600 mb-1">Budget</div>
                              <div className="text-black mb-3">{message.data.resources.budget}</div>
                              <div className="text-sm text-gray-600 mb-1">Tools</div>
                              <div className="text-black">{message.data.resources.tools?.join(', ')}</div>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons - Show only for initial analysis or if not an action result */}
                        {(!message.content.includes('완료되었습니다') || message.content.includes('분석이 완료되었습니다')) && (
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-black mb-3">다음 액션을 선택하세요</h3>
                            <div className="grid gap-2 md:grid-cols-3">
                              <button
                                onClick={(e) => onActionClick('더 자세한 분석', e)}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm py-2 px-3 rounded-lg transition-colors"
                              >
                                🔍 더 자세한 분석
                              </button>
                              <button
                                onClick={(e) => onActionClick('원페이저 전략 구성', e)}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm py-2 px-3 rounded-lg transition-colors"
                              >
                                📄 원페이저 전략 구성
                              </button>
                              <button
                                onClick={(e) => onActionClick('실행 캘린더 제작', e)}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm py-2 px-3 rounded-lg transition-colors"
                              >
                                📅 실행 캘린더 제작
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Helpful Question - Show only for action results */}
                        {message.content.includes('완료되었습니다') && !message.content.includes('분석이 완료되었습니다') && (
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="text-center">
                              <p className="text-gray-700 text-sm">💬 어떤걸 더 도와드릴까요?</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {message.data?.error && (
                      <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center mb-2">
                          <span className="text-red-600 mr-2">⚠️</span>
                          <span className="text-red-800 font-medium text-sm">오류 발생</span>
                        </div>
                        <p className="text-red-700 text-sm">{message.data.error}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 rounded-2xl px-4 py-3">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xs">AI</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    <span className="text-sm">AI가 분석 중입니다...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed Input Bar */}
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSendMessage(input);
                }
              }}
              placeholder="PRD를 입력하거나 질문을 해보세요..."
              className="w-full resize-none border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-black focus:ring-2 focus:ring-black/20 focus:outline-none transition-all"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={(e) => onSendMessage(input, e)}
            disabled={loading || !input.trim()}
            className="bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl transition-colors flex items-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <span>전송</span>
                <span>→</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
