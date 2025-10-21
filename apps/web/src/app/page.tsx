'use client';
import { useState } from 'react';
import ChatInterface from './components/ChatInterface';

export default function Home() {
  const [showChat, setShowChat] = useState(false);
  const [initialPrd, setInitialPrd] = useState('');
  const [prd, setPrd] = useState('');
  const [loading, setLoading] = useState(false);

  const onAnalyze = async () => {
    if (!prd.trim()) return;
    
    setLoading(true);
    setInitialPrd(prd);
    
    try {
      const r = await fetch('/api/analyze', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prd }) 
      });
      const j = await r.json();
      
      // 채팅 화면으로 이동
      setShowChat(true);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const onBackToLanding = () => {
    setShowChat(false);
    setInitialPrd('');
    setPrd('');
  };

  if (showChat) {
    return <ChatInterface initialPrd={initialPrd} onBackToLanding={onBackToLanding} />;
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200"></div>
        
        {/* Main Content */}
        <div className="relative max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold text-black mb-6">
              Ignitee
            </h1>
            <p className="text-2xl text-gray-700 mb-4">
              PRD → Go-to-Market Strategy
            </p>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              PRD를 입력하면 AI가 도메인 분석부터 GTM 전략, 콘텐츠 생성까지 자동으로 완성합니다.
            </p>
          </div>

          {/* Input Section */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 mb-8 shadow-lg">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  PRD (Product Requirements Document)
                </label>
                <textarea
                  className="bg-gray-50 border-2 border-gray-300 rounded-xl p-6 text-gray-900 placeholder-gray-500 resize-none focus:border-black focus:ring-2 focus:ring-black/20 focus:outline-none transition-all w-full h-48"
                  placeholder="제품의 PRD를 입력하세요...&#10;&#10;예시:&#10;독서 메모 앱 - 사용자가 책을 읽으면서 메모를 남기고, AI가 요약해주는 서비스"
                  value={prd} 
                  onChange={e => setPrd(e.target.value)}
                />
              </div>
              
              <button 
                className="bg-black hover:bg-gray-800 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none w-full"
                onClick={onAnalyze}
                disabled={loading || !prd.trim()}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    AI가 분석 중입니다...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span className="mr-2">🔥</span>
                    Ignite My Launch
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-300 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gray-600">
            Powered by AI • Built with Clean Architecture • TypeScript Monorepo
          </p>
        </div>
      </div>
    </div>
  );
}