import { useState } from 'react';
import { CreditCard, FileText, CheckCircle } from 'lucide-react';

import React, { useState } from 'react';
import axios from 'axios';
import { Shield, AlertTriangle, CheckCircle, FileText, Loader2, CreditCard } from 'lucide-react';

export default function App() {
  const [contractText, setContractText] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  // Calculate live word and character counts
  const wordCount = contractText.trim() ? contractText.trim().split(/\s+/).length : 0;
  const charCount = contractText.length;

  const handleAudit = async () => {
    if (contractText.trim().length < 50) {
      setError('Please enter at least 50 characters of contract text to run an audit.');
      return;
    }
    setError('');
    setLoading(true);
    setReport(null);

    try {
      // Calls your Express server API running on port 3000
      const response = await axios.post('http://localhost:3000/api/v1/analyze', {
        documentText: contractText,
      });
      setReport(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to connect to LexiShield Audit Engine.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-sky-400" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">LexiShield AI</h1>
              <p className="text-xs text-slate-400">Commercial Contract Risk & Compliance Scanner</p>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-xs px-3 py-2 rounded-lg border border-slate-700 transition">
            <CreditCard className="w-4 h-4 text-sky-400" /> Pro Tier
          </button>
        </header>

        {/* Real-time Metrics Bar */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-4 text-center">
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Words</span>
            <p className="text-2xl font-bold text-sky-400 mt-1">{wordCount}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-4 text-center">
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Characters</span>
            <p className="text-2xl font-bold text-sky-400 mt-1">{charCount}</p>
          </div>
        </div>

        {/* Input Card */}
        <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-5 space-y-4">
          <label className="block text-sm font-medium text-slate-300 flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-400" /> Paste Contract or Agreement Text
          </label>
          <textarea
            value={contractText}
            onChange={(e) => setContractText(e.target.value)}
            placeholder="Paste freelance agreement, NDA, or service contract here (min 50 characters)..."
            className="w-full h-48 bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-sky-500 resize-none"
          />
          {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
          <button
            onClick={handleAudit}
            disabled={loading}
            className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Running AI Audit Engine...
              </>
            ) : (
              'Run Risk Audit'
            )}
          </button>
        </div>

        {/* AI Audit Results */}
        {report && (
          <div className="space-y-4">
            {/* Summary Banner */}
            <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase text-slate-400 font-semibold tracking-wider">Overall Risk Rating</span>
                <p className={`text-xl font-bold mt-1 ${
                  report.risk_score === 'High' ? 'text-red-400' :
                  report.risk_score === 'Medium' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {report.risk_score} Risk
                </p>
              </div>
              <div className="max-w-md text-right text-xs text-slate-300">
                {report.summary}
              </div>
            </div>

            {/* Identified Risk Flags */}
            <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-200">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Flagged Clauses
              </h3>
              <div className="space-y-2">
                {report.flags?.map((flag, idx) => (
                  <div key={idx} className="bg-slate-900/60 border-l-4 border-amber-500 p-3 rounded-r-lg space-y-1">
                    <span className="text-xs font-bold text-slate-200">[{flag.severity}] {flag.clause}</span>
                    <p className="text-xs text-slate-400">{flag.issue}</p>
                    <p className="text-xs text-sky-400 font-medium">Recommendation: {flag.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Clauses */}
            <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-200">
                <CheckCircle className="w-4 h-4 text-emerald-400" /> Recommended Additions
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
                {report.missing_clauses?.map((item, idx) => (
                  <li key={idx} className="bg-slate-900/40 border border-slate-800 p-2 rounded flex items-center gap-2">
                    <span className="text-emerald-400">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

