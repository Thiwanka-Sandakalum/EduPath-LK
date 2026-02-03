import React, { useMemo, useState } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { ALCategory, OLOption } from './types';
import { AL_SUBJECTS, UNIVERSITIES } from './constants';
import MindMapNode from './components/MindMapNode';
import ConnectorLines from './components/ConnectorLines';

const EducationPathMapperView = ({ onBack }: { onBack: () => void }) => {
  const [selectedStream, setSelectedStream] = useState<'AL' | 'OL' | null>(null);
  const [selectedALCategory, setSelectedALCategory] = useState<ALCategory | null>(null);
  const [selectedALSubjects, setSelectedALSubjects] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedOLOption, setSelectedOLOption] = useState<OLOption | null>(null);

  const resetAll = () => {
    setSelectedStream(null);
    setSelectedALCategory(null);
    setSelectedALSubjects([]);
    setShowResults(false);
    setSelectedOLOption(null);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  };

  const scrollToId = (id: string) => {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  const handleStreamSelect = (stream: 'AL' | 'OL') => {
    setSelectedStream(stream);
    setShowResults(false);
    setSelectedOLOption(null);
    setSelectedALCategory(null);
    setSelectedALSubjects([]);
    scrollToId(stream === 'AL' ? 'al-section' : 'ol-section');
  };

  const toggleSubject = (subject: string) => {
    setSelectedALSubjects((prev) => (prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]));
  };

  const results = useMemo(() => {
    if (!showResults) return [];
    if (selectedStream === 'AL') return UNIVERSITIES.filter((u) => u.type === 'Public');
    return UNIVERSITIES.filter((u) => u.type === 'Private');
  }, [showResults, selectedStream]);

  return (
    <div className="min-h-screen bg-[#fcfdfe] dark:bg-slate-950 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-10">
          <button
            onClick={onBack}
            className="flex items-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={18} className="mr-4" /> Exit Module
          </button>
          <button
            onClick={resetAll}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 hover:text-blue-600 transition-colors"
            title="Restart Map"
          >
            <RotateCcw size={16} /> Restart
          </button>
        </div>

        <div className="relative w-full bg-slate-50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800 rounded-[3rem] overflow-hidden">
          <div className="relative min-h-[2600px] w-full flex flex-col items-center py-16 overflow-x-auto">
            {/* 1. Stream Selection */}
            <div id="stream-section" className="flex flex-col items-center mb-40 w-full px-6">
              <MindMapNode id="stream-node" label="Select Education Level" variant="primary" className="mb-16" />

              <ConnectorLines parentRefId="stream-node" childrenRefIds={['al-btn', 'ol-btn']} orientation="vertical" />
              <div className="flex flex-row justify-center gap-10 w-full z-10">
                <MindMapNode
                  id="al-btn"
                  label="Advanced Level (A/L)"
                  isActive={selectedStream === 'AL'}
                  onClick={() => handleStreamSelect('AL')}
                />
                <MindMapNode
                  id="ol-btn"
                  label="Ordinary Level (O/L)"
                  isActive={selectedStream === 'OL'}
                  onClick={() => handleStreamSelect('OL')}
                />
              </div>
            </div>

            {/* 3. A/L Flow */}
            {selectedStream === 'AL' && (
              <div id="al-section" className="flex flex-col items-center mb-40 w-full px-6">
                <ConnectorLines parentRefId="al-btn" childrenRefIds={['al-center']} orientation="vertical" />
                <MindMapNode id="al-center" label="A/L Streams" variant="primary" className="mb-16" />

                <ConnectorLines
                  parentRefId="al-center"
                  childrenRefIds={Object.values(ALCategory).map((c) => `alc-${c}`)}
                  orientation="vertical"
                />

                <div className="flex flex-row flex-wrap justify-center gap-5 w-full z-10 max-w-6xl">
                  {Object.values(ALCategory).map((cat) => (
                    <div key={cat} className="flex flex-col items-center">
                      <MindMapNode
                        id={`alc-${cat}`}
                        label={cat}
                        isActive={selectedALCategory === cat}
                        onClick={() => {
                          setSelectedALCategory(cat);
                          setSelectedALSubjects([]);
                        }}
                      />

                      {selectedALCategory === cat && (
                        <div className="mt-16 flex flex-col items-center w-full">
                          <ConnectorLines parentRefId={`alc-${cat}`} childrenRefIds={['subjects-node']} orientation="vertical" />
                          <MindMapNode
                            id="subjects-node"
                            label={`Choose ${cat} Subjects`}
                            variant="secondary"
                            className="mb-12"
                          />

                          <div className="flex flex-row flex-wrap justify-center gap-3 w-full max-w-3xl z-10">
                            {AL_SUBJECTS[cat].map((s) => {
                              const safeId = `sub-${s.replace(/\s/g, '')}`;
                              const active = selectedALSubjects.includes(s);
                              return (
                                <div
                                  key={s}
                                  id={safeId}
                                  onClick={() => toggleSubject(s)}
                                  className={`px-4 py-3 rounded-xl border-2 cursor-pointer transition-all text-xs font-black ${active
                                    ? 'bg-blue-100 border-blue-500 text-blue-700 shadow-md'
                                    : 'bg-white border-slate-100 text-slate-700 hover:border-blue-300'
                                    }`}
                                >
                                  {s}
                                </div>
                              );
                            })}
                          </div>

                          {selectedALSubjects.length >= 2 && (
                            <MindMapNode
                              id="al-ok"
                              label="View Universities"
                              variant="accent"
                              className="mt-12"
                              onClick={() => {
                                setShowResults(true);
                                scrollToId('results-section');
                              }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. O/L Flow */}
            {selectedStream === 'OL' && (
              <div id="ol-section" className="flex flex-col items-center mb-40 w-full px-6">
                <ConnectorLines parentRefId="ol-btn" childrenRefIds={['ol-center']} orientation="vertical" />
                <MindMapNode id="ol-center" label="Post-O/L Options" variant="primary" className="mb-16" />

                <ConnectorLines
                  parentRefId="ol-center"
                  childrenRefIds={Object.values(OLOption).map((o) => `olc-${o.replace(/\s/g, '')}`)}
                  orientation="vertical"
                />

                <div className="flex flex-row flex-wrap justify-center gap-5 w-full z-10 max-w-5xl">
                  {Object.values(OLOption).map((opt) => (
                    <MindMapNode
                      key={opt}
                      id={`olc-${opt.replace(/\s/g, '')}`}
                      label={opt}
                      isActive={selectedOLOption === opt}
                      onClick={() => {
                        setSelectedOLOption(opt);
                        setShowResults(true);
                        scrollToId('results-section');
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 5. Results */}
            {showResults && (
              <div id="results-section" className="flex flex-col items-center w-full px-6 mb-24">
                <ConnectorLines
                  parentRefId={selectedStream === 'AL' ? 'al-ok' : `olc-${selectedOLOption?.replace(/\s/g, '')}`}
                  childrenRefIds={['uni-hub']}
                  orientation="vertical"
                />

                <MindMapNode id="uni-hub" label="Your Future Path" variant="primary" className="mb-16" />

                <ConnectorLines parentRefId="uni-hub" childrenRefIds={results.map((_, i) => `uni-${i}`)} orientation="vertical" />

                <div className="flex flex-row flex-wrap justify-center gap-6 w-full z-10 max-w-7xl">
                  {results.map((uni, idx) => (
                    <div key={idx} id={`uni-${idx}`} className="flex flex-col items-center">
                      <MindMapNode
                        variant="leaf"
                        className="!min-h-[110px] !w-[240px]"
                        label={
                          <div className="flex flex-col text-left w-full p-2">
                            <span className="font-black text-slate-900">{uni.name}</span>
                            <div className="mt-2 space-y-1">
                              {uni.programs.slice(0, 2).map((p, pi) => (
                                <div key={pi} className="text-[10px] text-slate-500 truncate">
                                  • {p}
                                </div>
                              ))}
                            </div>
                            <div className="mt-2 text-[9px] uppercase font-black text-blue-500">{uni.location}</div>
                          </div>
                        }
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setShowResults(false);
                    scrollToId('stream-section');
                  }}
                  className="mt-12 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 hover:text-blue-600 transition-colors"
                >
                  Change Selection
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationPathMapperView;
