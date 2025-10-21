'use client';
import { useState } from 'react';

export default function Home() {
  const [prd, setPrd] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const onAnalyze = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/analyze', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prd }) 
      });
      const j = await r.json(); 
      setResult(j);
    } catch (error) {
      console.error('Analysis failed:', error);
      setResult({ error: '분석 중 오류가 발생했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-3xl font-bold">Ignite — PRD → Go-to-Market</h1>
      <p className="text-gray-600">
        PRD를 입력하면 도메인 분석과 GTM 전략을 자동으로 생성합니다.
      </p>
      
      <div className="space-y-4">
        <textarea
          className="w-full border rounded p-3 h-40 resize-none"
          placeholder="PRD를 붙여넣으세요..."
          value={prd} 
          onChange={e => setPrd(e.target.value)}
        />
        
        <button 
          className="px-6 py-3 rounded bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed" 
          onClick={onAnalyze}
          disabled={loading || !prd.trim()}
        >
          {loading ? '분석 중...' : '분석 실행'}
        </button>
      </div>

      {result && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-3">분석 결과</h2>
          <pre className="bg-gray-50 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
}
