import React, { useState } from 'react';
import './App.css';

function App() {
  const [documentText, setDocumentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!documentText.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/v1/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ documentText })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze contract');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-indigo-400">LexiShield</h1>
          <p className="text-slate-400 text-sm md:text-base">AI-Powered Legal Document Risk & Clause Analyzer</p>
        </header>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Document Content</label>
              <textarea
                rows="6"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                placeholder="Paste your legal agreement or contract text here..."
                value={documentText}
                onChange={(e) => setDocumentText(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Analyzing Contract...' : 'Analyze Risk & Clauses'}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-950/50 border border-red-800 text-red-300 p-4 rounded-xl">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-xl">
            <h2 className="text-xl font-bold text-indigo-300">Analysis Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <span className="text-xs uppercase text-slate-500 font-bold">Risk Score</span>
                <p className="text-lg font-semibold text-amber-400 mt-1">{result.risk_score || 'N/A'}</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <span className="text-xs uppercase text-slate-500 font-bold">Summary</span>
                <p className="text-sm text-slate-300 mt-1">{result.summary || 'No summary provided.'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
