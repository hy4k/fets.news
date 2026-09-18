import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Send,
  Loader2,
  X,
  FileText,
  Sliders,
} from 'lucide-react';
import { Participant, FactCheckResult } from '../types';

interface AiNewsroomProducerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTopic: string;
  participants: Participant[];
  onApplyChyron: (headline: string, subStrap: string, urgency: string, tickers: string[]) => void;
  onSendToTeleprompter: (script: string) => void;
}

export const AiNewsroomProducer: React.FC<AiNewsroomProducerProps> = ({
  isOpen,
  onClose,
  activeTopic,
  participants,
  onApplyChyron,
  onSendToTeleprompter,
}) => {
  const [activeTab, setActiveTab] = useState<'fact-check' | 'chyron' | 'rundown'>('fact-check');

  // Fact check state
  const [claimInput, setClaimInput] = useState('');
  const [selectedSpeakerId, setSelectedSpeakerId] = useState(participants[0]?.id || '');
  const [isFactChecking, setIsFactChecking] = useState(false);
  const [factCheckResult, setFactCheckResult] = useState<FactCheckResult | null>(null);

  // Chyron generator state
  const [topicInput, setTopicInput] = useState(activeTopic || 'Calicut & Cochin Morning Shift Handover & Pearson VUE Exam Delivery');
  const [isGeneratingChyron, setIsGeneratingChyron] = useState(false);
  const [generatedChyron, setGeneratedChyron] = useState<{
    headline: string;
    subStrap: string;
    urgency: string;
    tickers: string[];
  } | null>(null);

  // Rundown / Prompter state
  const [isGeneratingRundown, setIsGeneratingRundown] = useState(false);
  const [generatedRundown, setGeneratedRundown] = useState<{
    intro: string;
    transitionCue: string;
    suggestedQuestions: string[];
  } | null>(null);

  if (!isOpen) return null;

  const handleFactCheck = async () => {
    if (!claimInput.trim()) return;
    setIsFactChecking(true);
    setFactCheckResult(null);

    const speaker = participants.find((p) => p.id === selectedSpeakerId) || participants[0];

    try {
      const response = await fetch('/api/news/producer-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'fact-check',
          claim: claimInput,
          speakerName: speaker.name,
          speakerRole: speaker.role,
        }),
      });
      const data = await response.json();
      if (data.success && data.data) {
        setFactCheckResult(data.data);
      }
    } catch (err) {
      console.error('Fact check request failed:', err);
    } finally {
      setIsFactChecking(false);
    }
  };

  const handleGenerateChyron = async () => {
    setIsGeneratingChyron(true);
    const speaker = participants.find((p) => p.id === selectedSpeakerId) || participants[0];

    try {
      const response = await fetch('/api/news/producer-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chyron',
          topic: topicInput,
          speakerName: speaker.name,
          speakerRole: speaker.role,
        }),
      });
      const data = await response.json();
      if (data.success && data.data) {
        setGeneratedChyron(data.data);
      }
    } catch (err) {
      console.error('Chyron generation failed:', err);
    } finally {
      setIsGeneratingChyron(false);
    }
  };

  const handleGenerateRundown = async () => {
    setIsGeneratingRundown(true);
    const speaker = participants.find((p) => p.id === selectedSpeakerId) || participants[0];

    try {
      const response = await fetch('/api/news/producer-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'rundown',
          topic: topicInput,
          speakerName: speaker.name,
          speakerRole: speaker.role,
        }),
      });
      const data = await response.json();
      if (data.success && data.data) {
        setGeneratedRundown(data.data);
      }
    } catch (err) {
      console.error('Rundown generation failed:', err);
    } finally {
      setIsGeneratingRundown(false);
    }
  };

  return (
    <div
      id="ai-producer-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none"
    >
      <div className="w-full max-w-2xl bg-[#0a0f1e] border-2 border-blue-500/50 rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-950/80 to-slate-900 border-b border-blue-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-600/30 border border-blue-400/40">
              <Sparkles className="w-5 h-5 text-blue-400 animate-spin-slow" />
            </div>
            <div>
              <h3 className="font-broadcast font-bold text-white text-lg tracking-wider uppercase leading-none">
                AI NEWSROOM PRODUCER
              </h3>
              <p className="text-[11px] font-tech text-blue-300">
                GEMINI 3.1 PRO (HIGH THINKING MODE) • INVESTIGATIVE JOURNALISM ENGINE
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950">
          <button
            onClick={() => setActiveTab('fact-check')}
            className={`flex-1 py-2.5 text-xs font-broadcast font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'fact-check'
                ? 'border-blue-500 text-blue-300 bg-blue-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>LIVE CLAIM FACT-CHECK</span>
          </button>

          <button
            onClick={() => setActiveTab('chyron')}
            className={`flex-1 py-2.5 text-xs font-broadcast font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'chyron'
                ? 'border-blue-500 text-blue-300 bg-blue-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>AI CHYRON & TICKERS</span>
          </button>

          <button
            onClick={() => setActiveTab('rundown')}
            className={`flex-1 py-2.5 text-xs font-broadcast font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'rundown'
                ? 'border-blue-500 text-blue-300 bg-blue-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>PROMPTER INTRO & QUESTIONS</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: FACT CHECK */}
          {activeTab === 'fact-check' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-tech text-slate-400 block mb-1">
                  TARGET SPEAKER:
                </label>
                <select
                  value={selectedSpeakerId}
                  onChange={(e) => setSelectedSpeakerId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded p-2 text-xs font-sans-ui focus:outline-none"
                >
                  {participants.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.role} ({p.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-tech text-slate-400 block mb-1">
                  SPEAKER'S CLAIM OR ASSERTION TO VERIFY:
                </label>
                <textarea
                  value={claimInput}
                  onChange={(e) => setClaimInput(e.target.value)}
                  placeholder="e.g., 'Pearson VUE morning RMA sync completed across all 45 Calicut workstations with zero candidate biometric queue delays...'"
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded p-3 text-xs font-sans-ui focus:outline-none focus:border-blue-500 h-20 resize-none"
                />
              </div>

              <button
                onClick={handleFactCheck}
                disabled={isFactChecking || !claimInput.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-broadcast font-bold tracking-wider py-2 rounded text-sm flex items-center justify-center gap-2 shadow-lg"
              >
                {isFactChecking ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>INVESTIGATING WITH HIGH THINKING REASONING...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>RUN INVESTIGATIVE FACT-CHECK (GEMINI 3.1 PRO)</span>
                  </>
                )}
              </button>

              {/* Fact Check Results */}
              {factCheckResult && (
                <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 space-y-3 mt-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-broadcast font-extrabold text-sm px-2.5 py-0.5 rounded tracking-wider uppercase ${
                          factCheckResult.verdict === 'VERIFIED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                            : factCheckResult.verdict === 'CONTEXT NEEDED'
                            ? 'bg-amber-950 text-amber-300 border border-amber-600'
                            : 'bg-red-950 text-red-300 border border-red-600'
                        }`}
                      >
                        {factCheckResult.verdict}
                      </span>
                      <span className="text-xs font-tech text-slate-400">
                        CONFIDENCE: {factCheckResult.confidence}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs font-sans-ui text-slate-200 leading-relaxed">
                    {factCheckResult.summary}
                  </p>

                  {/* Sources */}
                  <div>
                    <h5 className="text-[11px] font-tech text-slate-400 uppercase mb-1">
                      VERIFIED REPOSITORIES / SOURCES:
                    </h5>
                    <ul className="text-xs text-blue-300 space-y-0.5">
                      {factCheckResult.keySources.map((src, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-blue-400" />
                          <span>{src}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Anchor follow-up question */}
                  <div className="bg-blue-950/40 border-l-2 border-blue-400 p-2.5 rounded-r">
                    <span className="text-[10px] font-tech font-bold text-blue-300 uppercase block mb-1">
                      SUGGESTED ANCHOR LIVE PROBE QUESTION:
                    </span>
                    <p className="text-xs font-sans-ui italic text-slate-100 font-medium">
                      "{factCheckResult.anchorFollowUp}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CHYRON GENERATOR */}
          {activeTab === 'chyron' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-tech text-slate-400 block mb-1">
                  BROADCAST STORY TOPIC:
                </label>
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded p-2.5 text-xs font-sans-ui focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={handleGenerateChyron}
                disabled={isGeneratingChyron || !topicInput.trim()}
                className="w-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 disabled:opacity-50 text-white font-broadcast font-bold tracking-wider py-2 rounded text-sm flex items-center justify-center gap-2 shadow-lg"
              >
                {isGeneratingChyron ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>DRAFTING BROADCAST CHYRON & TICKERS...</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4" />
                    <span>GENERATE NETWORK CHYRON & TICKERS (GEMINI 3.1 PRO)</span>
                  </>
                )}
              </button>

              {generatedChyron && (
                <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 space-y-3 mt-4">
                  <div className="border-l-4 border-red-500 pl-3 py-1 bg-red-950/30 rounded-r">
                    <span className="text-[10px] font-tech text-red-400 uppercase font-bold tracking-wider">
                      {generatedChyron.urgency} HEADLINE
                    </span>
                    <h4 className="font-broadcast font-extrabold text-white text-base sm:text-lg uppercase">
                      {generatedChyron.headline}
                    </h4>
                    <p className="text-xs font-sans-ui text-slate-300 mt-0.5">
                      {generatedChyron.subStrap}
                    </p>
                  </div>

                  <div>
                    <h5 className="text-[11px] font-tech text-slate-400 uppercase mb-1">
                      GENERATED MASTER TICKER STRAPS:
                    </h5>
                    <div className="space-y-1">
                      {generatedChyron.tickers.map((t, idx) => (
                        <div
                          key={idx}
                          className="text-xs font-tech text-slate-300 bg-black/40 px-2 py-1 rounded"
                        >
                          {t}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onApplyChyron(
                        generatedChyron.headline,
                        generatedChyron.subStrap,
                        generatedChyron.urgency,
                        generatedChyron.tickers
                      );
                      onClose();
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-broadcast font-bold tracking-wider py-2 rounded text-xs flex items-center justify-center gap-2 shadow"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>PUSH CHYRON & TICKERS TO LIVE AIR</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROMPTER & RUNDOWN */}
          {activeTab === 'rundown' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-tech text-slate-400 block mb-1">
                  TOPIC FOR PROMPTER SCRIPT:
                </label>
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded p-2.5 text-xs font-sans-ui focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={handleGenerateRundown}
                disabled={isGeneratingRundown}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-broadcast font-bold tracking-wider py-2 rounded text-sm flex items-center justify-center gap-2 shadow-lg"
              >
                {isGeneratingRundown ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>SYNTHESIZING ANCHOR SCRIPT...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>DRAFT ANCHOR INTRO & INTERVIEW QUESTIONS</span>
                  </>
                )}
              </button>

              {generatedRundown && (
                <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 space-y-3 mt-4">
                  <div>
                    <span className="text-[10px] font-tech text-indigo-400 uppercase font-bold tracking-wider block mb-1">
                      ANCHOR INTRO SCRIPT:
                    </span>
                    <p className="text-xs font-broadcast font-bold uppercase tracking-wide text-white leading-relaxed bg-black/50 p-3 rounded border border-slate-800">
                      {generatedRundown.intro}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-tech text-slate-400 uppercase block mb-1">
                      INTERVIEW QUESTIONS:
                    </span>
                    <ul className="text-xs text-slate-300 space-y-1">
                      {generatedRundown.suggestedQuestions.map((q, i) => (
                        <li key={i} className="bg-slate-950 p-2 rounded border border-slate-800/80">
                          {i + 1}. {q}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      onSendToTeleprompter(
                        `${generatedRundown.intro}\n\n${generatedRundown.transitionCue}\n\n${generatedRundown.suggestedQuestions
                          .map((q, i) => `QUESTION ${i + 1}: ${q}`)
                          .join('\n\n')}`
                      );
                      onClose();
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-broadcast font-bold tracking-wider py-2 rounded text-xs flex items-center justify-center gap-2 shadow"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>LOAD INTO ANCHOR TELEPROMPTER</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
