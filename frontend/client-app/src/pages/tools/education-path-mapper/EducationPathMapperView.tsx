import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ALStreamId } from './types';
import {
  ARTS_MAJOR_SUBJECTS,
  ARTS_THIRD_SUBJECTS,
  STREAMS,
} from './constants';
import MindMapNode from './components/MindMapNode';
import ConnectorLines from './components/ConnectorLines';

type GovernmentInstitution = {
  _id?: string;
  id?: string;
  name: string;
  type?: string | string[];
  description?: string;
  location?: string;
  image_url?: string;
};

type GovernmentDegreeProgram = {
  _id: string;
  title?: string;
  name?: string;
  stream?: string;
  duration_years?: number;
  medium_of_instruction?: string[];
  al_requirements?: {
    logic_type?: string;
    subjects?: string[];
  };
};

type GovernmentCourseOffering = {
  degree_program_id: string;
  university_id: string;
  proposed_intake?: number;
  cutoff_marks?: Record<string, string | number | null | undefined>;
  academic_year?: string;
};

type GovernmentUniversityMatch = {
  institution: GovernmentInstitution & { _id: string };
  programs: GovernmentDegreeProgram[];
};

const safeJsonFetch = async (url: string) => {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const text = await res.text();
  const cleaned = text.replace(/^\uFEFF/, '');
  return JSON.parse(cleaned);
};

const extractArrayFromJson = (json: any, keys: string[]): any[] => {
  if (Array.isArray(json)) return json;
  if (!json || typeof json !== 'object') return [];
  for (const k of keys) {
    const v = (json as any)[k];
    if (Array.isArray(v)) return v;
  }
  return [];
};

const normalizeText = (value: unknown) => String(value ?? '')
  .toLowerCase()
  .replace(/&/g, 'and')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const streamLabelForSelection = (streamId: ALStreamId, selectedSubjects: string[]) => {
  if (streamId === 'physical') return ['physical science'];
  if (streamId === 'bio') return ['biological science'];
  if (streamId === 'commerce') return ['commerce'];
  if (streamId === 'arts') return ['arts'];

  // Technology stream in the JSON sometimes uses ET/BST explicitly.
  if (streamId === 'tech') {
    const subjects = selectedSubjects.map(normalizeText);
    const tokens = ['technology'];
    if (subjects.some((s) => s.includes('engineering technology'))) tokens.push('engineering technology');
    if (subjects.some((s) => s.includes('bio system technology') || s.includes('biosystem technology'))) tokens.push('biosystems technology');
    return tokens;
  }

  return [];
};

const programStreamMatches = (programStreamRaw: unknown, selectedLabels: string[]) => {
  const stream = normalizeText(programStreamRaw);
  if (!stream) return false;
  if (stream.includes('any stream')) return true;
  return selectedLabels.some((label) => stream.includes(normalizeText(label)));
};

const compulsorySubjectsSatisfied = (program: GovernmentDegreeProgram, selectedSubjects: string[]) => {
  const logicType = normalizeText(program.al_requirements?.logic_type);
  if (logicType !== 'compulsory subjects') return true;

  const required = (program.al_requirements?.subjects ?? []).map(normalizeText).filter(Boolean);
  if (required.length === 0) return true;

  const selected = selectedSubjects.map(normalizeText);
  // Small synonyms to align with UI text
  const selectedExpanded = new Set(selected);
  for (const s of selected) {
    if (s === 'combined maths') selectedExpanded.add('combined mathematics');
    if (s === 'combined mathematics') selectedExpanded.add('combined maths');
  }

  return required.every((req) => {
    // Allow multiword required subjects like "combined mathematics"
    return Array.from(selectedExpanded).some((sel) => sel === req);
  });
};

const EducationPathMapperView = ({ onBack }: { onBack: () => void }) => {
  const navigate = useNavigate();

  const [selectedStreamId, setSelectedStreamId] = useState<ALStreamId | null>(null);
  const [artsMajor1, setArtsMajor1] = useState<(typeof ARTS_MAJOR_SUBJECTS)[number]>(ARTS_MAJOR_SUBJECTS[0]);
  const [artsMajor2, setArtsMajor2] = useState<(typeof ARTS_MAJOR_SUBJECTS)[number]>(ARTS_MAJOR_SUBJECTS[1]);
  const [artsThird, setArtsThird] = useState<(typeof ARTS_THIRD_SUBJECTS)[number]>(ARTS_THIRD_SUBJECTS[0]);

  // Match HomePage Z-score stream subject selection behavior
  const [physicalThirdSubject, setPhysicalThirdSubject] = useState<'Chemistry' | 'ICT'>('Chemistry');
  const [bioThirdSubject, setBioThirdSubject] = useState<'Physics' | 'Agriculture'>('Physics');
  const [commerceSecondSubject, setCommerceSecondSubject] = useState<'Business Studies' | 'ICT'>('Business Studies');
  const [commerceThirdSubject, setCommerceThirdSubject] = useState<'Economics' | 'Business Statistics' | 'ICT'>('Economics');
  const [techSecondSubject, setTechSecondSubject] = useState<'Bio System Technology' | 'Engineering Technology'>('Engineering Technology');
  const [techThirdSubject, setTechThirdSubject] = useState<'Agriculture' | 'Geography' | 'Business Studies' | 'ICT'>('ICT');

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [matches, setMatches] = useState<GovernmentUniversityMatch[]>([]);
  const [selectedUniversityId, setSelectedUniversityId] = useState<string | null>(null);
  const [showAllUniversities, setShowAllUniversities] = useState(false);
  const [showAllCourses, setShowAllCourses] = useState(false);

  const resetAll = () => {
    setSelectedStreamId(null);
    setLoadError(null);
    setMatches([]);
    setSelectedUniversityId(null);
    setShowAllUniversities(false);
    setShowAllCourses(false);
    setPhysicalThirdSubject('Chemistry');
    setBioThirdSubject('Physics');
    setCommerceSecondSubject('Business Studies');
    setCommerceThirdSubject('Economics');
    setTechSecondSubject('Engineering Technology');
    setTechThirdSubject('ICT');
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  };

  const scrollToId = (id: string) => {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  const scrollToResults = () => scrollToId('results-section');

  const selectedStream = useMemo(() => {
    return STREAMS.find((s) => s.id === selectedStreamId) ?? null;
  }, [selectedStreamId]);

  const artsMajor2Options = useMemo(() => {
    return ARTS_MAJOR_SUBJECTS.filter((s) => s !== artsMajor1);
  }, [artsMajor1]);

  const selectedSubjects = useMemo(() => {
    if (!selectedStreamId) return [] as string[];

    if (selectedStreamId === 'physical') return ['Combined Maths', 'Physics', physicalThirdSubject];
    if (selectedStreamId === 'bio') return ['Biology', 'Chemistry', bioThirdSubject];
    if (selectedStreamId === 'commerce') return ['Accounting', commerceSecondSubject, commerceThirdSubject];
    if (selectedStreamId === 'tech') return ['Science for Technology', techSecondSubject, techThirdSubject];
    if (selectedStreamId === 'arts') return [artsMajor1, artsMajor2, artsThird];

    return selectedStream?.subjects ?? [];
  }, [
    selectedStreamId,
    selectedStream,
    physicalThirdSubject,
    bioThirdSubject,
    commerceSecondSubject,
    commerceThirdSubject,
    techSecondSubject,
    techThirdSubject,
    artsMajor1,
    artsMajor2,
    artsThird,
  ]);

  const fetchALSuggestions = async () => {
    if (!selectedStreamId) return;
    setLoading(true);
    setLoadError(null);
    setMatches([]);
    setSelectedUniversityId(null);
    setShowAllUniversities(false);
    setShowAllCourses(false);
    try {
      const [institutionsJson, degreeProgramsJson, offeringsJson] = await Promise.all([
        safeJsonFetch('/government-institutions.json'),
        safeJsonFetch('/government-degree-programs.json'),
        safeJsonFetch('/government-course-offerings.json'),
      ]);

      const institutionsRaw = extractArrayFromJson(institutionsJson, ['institutions', 'items', 'data']);
      const degreeProgramsRaw = extractArrayFromJson(degreeProgramsJson, ['degreePrograms', 'degree_programs', 'programs', 'data']);
      const offeringsRaw = extractArrayFromJson(offeringsJson, ['offerings', 'course_offerings', 'data']);

      const institutions: (GovernmentInstitution & { _id: string })[] = institutionsRaw
        .filter((x: any) => x && typeof x === 'object' && (typeof x._id === 'string' || typeof x.id === 'string') && typeof x.name === 'string')
        .map((x: any) => ({
          ...x,
          _id: String(x._id ?? x.id).trim(),
          name: String(x.name).trim(),
        }));

      const institutionsById = new Map<string, (GovernmentInstitution & { _id: string })>();
      for (const i of institutions) institutionsById.set(i._id, i);

      const programs: GovernmentDegreeProgram[] = degreeProgramsRaw
        .filter((p: any) => p && typeof p === 'object' && typeof p._id === 'string')
        .map((p: any) => ({
          _id: String(p._id),
          title: typeof p.title === 'string' ? p.title : undefined,
          name: typeof p.name === 'string' ? p.name : undefined,
          stream: typeof p.stream === 'string' ? p.stream : undefined,
          duration_years: typeof p.duration_years === 'number' ? p.duration_years : undefined,
          medium_of_instruction: Array.isArray(p.medium_of_instruction) ? p.medium_of_instruction : undefined,
          al_requirements: p.al_requirements && typeof p.al_requirements === 'object' ? {
            logic_type: typeof p.al_requirements.logic_type === 'string' ? p.al_requirements.logic_type : undefined,
            subjects: Array.isArray(p.al_requirements.subjects) ? p.al_requirements.subjects : undefined,
          } : undefined,
        }));

      const programsById = new Map<string, GovernmentDegreeProgram>();
      for (const p of programs) programsById.set(p._id, p);

      const offerings: GovernmentCourseOffering[] = offeringsRaw
        .filter((o: any) => o && typeof o === 'object' && typeof o.degree_program_id === 'string' && typeof o.university_id === 'string')
        .map((o: any) => ({
          degree_program_id: String(o.degree_program_id).trim(),
          university_id: String(o.university_id).trim(),
          proposed_intake: typeof o.proposed_intake === 'number' ? o.proposed_intake : undefined,
          cutoff_marks: o.cutoff_marks && typeof o.cutoff_marks === 'object' ? o.cutoff_marks : undefined,
          academic_year: typeof o.academic_year === 'string' ? o.academic_year : undefined,
        }));

      const selectedLabels = streamLabelForSelection(selectedStreamId, selectedSubjects);
      const eligibleProgramIds = new Set(
        programs
          .filter((p) => programStreamMatches(p.stream, selectedLabels))
          .filter((p) => compulsorySubjectsSatisfied(p, selectedSubjects))
          .map((p) => p._id)
      );

      const offeringsForEligiblePrograms = offerings.filter((o) => eligibleProgramIds.has(o.degree_program_id));

      const universityToProgramIds = new Map<string, Set<string>>();
      for (const o of offeringsForEligiblePrograms) {
        if (!o.university_id || !o.degree_program_id) continue;
        const set = universityToProgramIds.get(o.university_id) ?? new Set<string>();
        set.add(o.degree_program_id);
        universityToProgramIds.set(o.university_id, set);
      }

      const nextMatches: GovernmentUniversityMatch[] = Array.from(universityToProgramIds.entries())
        .map(([universityId, programIds]) => {
          const institution = institutionsById.get(universityId);
          if (!institution) return null;

          const uniPrograms = Array.from(programIds)
            .map((pid) => programsById.get(pid))
            .filter(Boolean) as GovernmentDegreeProgram[];

          uniPrograms.sort((a, b) => {
            const an = String(a.title ?? a.name ?? a._id);
            const bn = String(b.title ?? b.name ?? b._id);
            return an.localeCompare(bn);
          });

          return { institution, programs: uniPrograms };
        })
        .filter(Boolean) as GovernmentUniversityMatch[];

      nextMatches.sort((a, b) => {
        const byCount = b.programs.length - a.programs.length;
        if (byCount !== 0) return byCount;
        return a.institution.name.localeCompare(b.institution.name);
      });

      setMatches(nextMatches);
    } catch {
      setLoadError('Unable to load suggestions right now.');
    } finally {
      setLoading(false);
      scrollToResults();
    }
  };

  const selectedMatch = useMemo(() => {
    if (!selectedUniversityId) return null;
    return matches.find((m) => m.institution._id === selectedUniversityId) ?? null;
  }, [matches, selectedUniversityId]);

  const selectedUniversityNodeId = useMemo(() => {
    if (!selectedMatch) return null;
    return `uni-${selectedMatch.institution._id}`;
  }, [selectedMatch]);

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
            {/* A/L-only flow (starts here) */}
            <div id="al-section" className="flex flex-col items-center mb-40 w-full px-6">
              <MindMapNode id="al-root" label="Advanced Level (A/L)" variant="primary" className="mb-16" />

              <ConnectorLines
                parentRefId="al-root"
                childrenRefIds={STREAMS.map((s) => `stream-${s.id}`)}
                orientation="vertical"
              />

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 w-full z-10 max-w-6xl place-items-center">
                {STREAMS.map((s) => (
                  <MindMapNode
                    key={s.id}
                    id={`stream-${s.id}`}
                    label={s.name}
                    isActive={selectedStreamId === s.id}
                    onClick={() => {
                      setSelectedStreamId(s.id);
                      setLoadError(null);
                      setMatches([]);
                      setSelectedUniversityId(null);
                      setShowAllUniversities(false);
                      setShowAllCourses(false);

                      // Reset dependent defaults when stream changes (match HomePage)
                      if (s.id === 'physical') setPhysicalThirdSubject('Chemistry');
                      if (s.id === 'bio') setBioThirdSubject('Physics');
                      if (s.id === 'commerce') {
                        setCommerceSecondSubject('Business Studies');
                        setCommerceThirdSubject('Economics');
                      }
                      if (s.id === 'tech') {
                        setTechSecondSubject('Engineering Technology');
                        setTechThirdSubject('ICT');
                      }
                      if (s.id === 'arts') {
                        setArtsMajor1(ARTS_MAJOR_SUBJECTS[0]);
                        setArtsMajor2(ARTS_MAJOR_SUBJECTS[1]);
                        setArtsThird(ARTS_THIRD_SUBJECTS[0]);
                      }
                    }}
                  />
                ))}
              </div>

              {selectedStreamId && (
                <div className="mt-16 flex flex-col items-center w-full">
                  <ConnectorLines parentRefId={`stream-${selectedStreamId}`} childrenRefIds={['subjects-node']} orientation="vertical" />
                  <MindMapNode id="subjects-node" label="Subjects" variant="secondary" className="mb-10" />

                  {selectedStreamId !== 'arts' ? (
                    <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4 z-10">
                      {/* Stream-specific subject options (match HomePage Z-score widget) */}
                      {selectedStreamId === 'physical' && (
                        <>
                          <div className="px-4 py-4 rounded-2xl border bg-white border-slate-100">
                            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Subject 1</div>
                            <div className="mt-2 text-sm font-black text-slate-800">Combined Maths</div>
                          </div>
                          <div className="px-4 py-4 rounded-2xl border bg-white border-slate-100">
                            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Subject 2</div>
                            <div className="mt-2 text-sm font-black text-slate-800">Physics</div>
                          </div>
                          <div className="px-4 py-4 rounded-2xl border bg-white border-slate-100">
                            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Subject 3</div>
                            <select
                              value={physicalThirdSubject}
                              onChange={(e) => setPhysicalThirdSubject(e.target.value as 'Chemistry' | 'ICT')}
                              className="mt-2 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-black"
                            >
                              <option value="Chemistry">Chemistry</option>
                              <option value="ICT">ICT</option>
                            </select>
                          </div>
                        </>
                      )}

                      {selectedStreamId === 'bio' && (
                        <>
                          <div className="px-4 py-4 rounded-2xl border bg-white border-slate-100">
                            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Subject 1</div>
                            <div className="mt-2 text-sm font-black text-slate-800">Biology</div>
                          </div>
                          <div className="px-4 py-4 rounded-2xl border bg-white border-slate-100">
                            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Subject 2</div>
                            <div className="mt-2 text-sm font-black text-slate-800">Chemistry</div>
                          </div>
                          <div className="px-4 py-4 rounded-2xl border bg-white border-slate-100">
                            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Subject 3</div>
                            <select
                              value={bioThirdSubject}
                              onChange={(e) => setBioThirdSubject(e.target.value as 'Physics' | 'Agriculture')}
                              className="mt-2 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-black"
                            >
                              <option value="Physics">Physics</option>
                              <option value="Agriculture">Agriculture</option>
                            </select>
                          </div>
                        </>
                      )}

                      {selectedStreamId === 'commerce' && (
                        <>
                          <div className="px-4 py-4 rounded-2xl border bg-white border-slate-100">
                            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Subject 1</div>
                            <div className="mt-2 text-sm font-black text-slate-800">Accounting</div>
                          </div>
                          <div className="px-4 py-4 rounded-2xl border bg-white border-slate-100">
                            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Subject 2</div>
                            <select
                              value={commerceSecondSubject}
                              onChange={(e) => setCommerceSecondSubject(e.target.value as 'Business Studies' | 'ICT')}
                              className="mt-2 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-black"
                            >
                              <option value="Business Studies">Business Studies</option>
                              <option value="ICT">ICT</option>
                            </select>
                          </div>
                          <div className="px-4 py-4 rounded-2xl border bg-white border-slate-100">
                            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Subject 3</div>
                            <select
                              value={commerceThirdSubject}
                              onChange={(e) => setCommerceThirdSubject(e.target.value as 'Economics' | 'Business Statistics' | 'ICT')}
                              className="mt-2 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-black"
                            >
                              <option value="Economics">Economics</option>
                              <option value="Business Statistics">Business Statistics</option>
                              <option value="ICT">ICT</option>
                            </select>
                          </div>
                        </>
                      )}

                      {selectedStreamId === 'tech' && (
                        <>
                          <div className="px-4 py-4 rounded-2xl border bg-white border-slate-100">
                            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Subject 1</div>
                            <div className="mt-2 text-sm font-black text-slate-800">Science for Technology</div>
                          </div>
                          <div className="px-4 py-4 rounded-2xl border bg-white border-slate-100">
                            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Subject 2</div>
                            <select
                              value={techSecondSubject}
                              onChange={(e) => setTechSecondSubject(e.target.value as 'Bio System Technology' | 'Engineering Technology')}
                              className="mt-2 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-black"
                            >
                              <option value="Bio System Technology">Bio System Technology</option>
                              <option value="Engineering Technology">Engineering Technology</option>
                            </select>
                          </div>
                          <div className="px-4 py-4 rounded-2xl border bg-white border-slate-100">
                            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Subject 3</div>
                            <select
                              value={techThirdSubject}
                              onChange={(e) => setTechThirdSubject(e.target.value as 'Agriculture' | 'Geography' | 'Business Studies' | 'ICT')}
                              className="mt-2 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-black"
                            >
                              <option value="Agriculture">Agriculture</option>
                              <option value="Geography">Geography</option>
                              <option value="Business Studies">Business Studies</option>
                              <option value="ICT">ICT</option>
                            </select>
                          </div>
                        </>
                      )}

                      <div className="md:col-span-3 text-xs font-bold text-slate-500 text-center">
                        Selected: {selectedSubjects.join(', ')}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 z-10">
                      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Major Subjects (Pick 2)</div>
                        <div className="grid grid-cols-1 gap-3">
                          <select
                            value={artsMajor1}
                            onChange={(e) => {
                              const next = e.target.value as (typeof ARTS_MAJOR_SUBJECTS)[number];
                              setArtsMajor1(next);
                              if (next === artsMajor2) setArtsMajor2(artsMajor2Options[0] ?? ARTS_MAJOR_SUBJECTS[0]);
                            }}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold"
                          >
                            {ARTS_MAJOR_SUBJECTS.map((x) => (
                              <option key={x} value={x}>
                                {x}
                              </option>
                            ))}
                          </select>

                          <select
                            value={artsMajor2}
                            onChange={(e) => setArtsMajor2(e.target.value as (typeof ARTS_MAJOR_SUBJECTS)[number])}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold"
                          >
                            {artsMajor2Options.map((x) => (
                              <option key={x} value={x}>
                                {x}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Third Subject (Pick 1)</div>
                        <select
                          value={artsThird}
                          onChange={(e) => setArtsThird(e.target.value as (typeof ARTS_THIRD_SUBJECTS)[number])}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold"
                        >
                          {ARTS_THIRD_SUBJECTS.map((x) => (
                            <option key={x} value={x}>
                              {x}
                            </option>
                          ))}
                        </select>

                        <div className="mt-4 text-xs text-slate-500 font-medium">
                          Selected: {artsMajor1}, {artsMajor2}, {artsThird}
                        </div>
                      </div>
                    </div>
                  )}

                  <MindMapNode
                    id="al-ok"
                    label="View Government Universities"
                    variant="accent"
                    className="mt-12"
                    onClick={fetchALSuggestions}
                  />
                </div>
              )}
            </div>

            {/* 4. Results */}
            {(loading || loadError || matches.length > 0) && (
              <div id="results-section" className="flex flex-col items-center w-full px-6 mb-24">
                {!loading && !loadError && !selectedMatch && matches.length > 0 && (
                  <ConnectorLines parentRefId={'al-ok'} childrenRefIds={['universities-anchor']} orientation="vertical" />
                )}

                {!loading && !loadError && selectedMatch && selectedUniversityNodeId && (
                  <>
                    <ConnectorLines parentRefId={'al-ok'} childrenRefIds={[selectedUniversityNodeId]} orientation="vertical" />
                    <ConnectorLines parentRefId={selectedUniversityNodeId} childrenRefIds={['courses-anchor']} orientation="vertical" />
                  </>
                )}

                {loadError && (
                  <div className="mb-10 text-sm font-bold text-red-600 bg-red-50 border border-red-200 px-6 py-4 rounded-2xl">
                    {loadError}
                  </div>
                )}

                {loading && (
                  <div className="mb-10 text-sm font-black uppercase tracking-[0.2em] text-slate-400">
                    Loading suggestions...
                  </div>
                )}

                <div className="w-full max-w-7xl grid grid-cols-1 gap-10 z-10">
                  <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Government Universities</div>
                    {!selectedMatch && (
                      <div className="w-full flex justify-center mb-6">
                        <div id="universities-anchor" className="w-2 h-2" />
                      </div>
                    )}

                    <div className="w-full">
                      {!selectedMatch && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full place-items-center">
                          {(showAllUniversities ? matches : matches.slice(0, 6)).map((m) => (
                            <MindMapNode
                              key={m.institution._id}
                              id={`uni-${m.institution._id}`}
                              variant="leaf"
                              className="!min-h-[80px] !w-[300px]"
                              onClick={() => {
                                setSelectedUniversityId(m.institution._id);
                                setShowAllCourses(false);
                              }}
                              label={
                                <div className="flex flex-col text-left w-full p-2">
                                  <span className="font-black text-slate-900 line-clamp-2">{m.institution.name}</span>
                                </div>
                              }
                            />
                          ))}
                        </div>
                      )}

                      {!selectedMatch && matches.length > 6 && (
                        <div className="mt-8 flex justify-center">
                          <button
                            onClick={() => setShowAllUniversities((v) => !v)}
                            className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 hover:text-blue-600 transition-colors"
                          >
                            {showAllUniversities ? 'Show less' : 'Read more'}
                          </button>
                        </div>
                      )}

                      {selectedMatch && (
                        <div className="w-full">
                          <div className="flex items-center justify-center mb-6">
                            <MindMapNode
                              id={`uni-${selectedMatch.institution._id}`}
                              variant="leaf"
                              className="!min-h-[80px] !w-[420px]"
                              onClick={() => navigate(`/institutions/${selectedMatch.institution._id}`)}
                              label={
                                <div className="flex flex-col text-left w-full p-2">
                                  <span className="font-black text-slate-900 line-clamp-2">{selectedMatch.institution.name}</span>
                                  <span className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-blue-600">Open university details</span>
                                </div>
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between gap-4 mb-6">
                            <div className="text-sm font-black text-slate-900">Courses</div>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => setSelectedUniversityId(null)}
                                className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 hover:text-blue-600 transition-colors"
                              >
                                Back to universities
                              </button>
                            </div>
                          </div>
                          <div className="w-full flex justify-center mb-6">
                            <div id="courses-anchor" className="w-2 h-2" />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full place-items-center">
                            {(showAllCourses ? selectedMatch.programs : selectedMatch.programs.slice(0, 6)).map((p) => (
                              <MindMapNode
                                key={p._id}
                                id={`course-${p._id}`}
                                variant="secondary"
                                className="!min-h-[64px] !w-[320px]"
                                onClick={() => navigate(`/courses/${p._id}`)}
                                label={
                                  <div className="flex flex-col text-left w-full">
                                    <span className="text-sm font-black text-slate-900 line-clamp-2">{p.title ?? p.name ?? p._id}</span>
                                    {p.stream && (
                                      <span className="mt-1 text-[10px] font-bold text-slate-500 line-clamp-1">Stream: {p.stream}</span>
                                    )}
                                    <span className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-blue-600">Open course details</span>
                                  </div>
                                }
                              />
                            ))}
                            {selectedMatch.programs.length === 0 && (
                              <div className="text-xs font-bold text-slate-400">No courses found for this university for the selected stream.</div>
                            )}
                          </div>

                          {selectedMatch.programs.length > 6 && (
                            <div className="mt-8 flex justify-center">
                              <button
                                onClick={() => setShowAllCourses((v) => !v)}
                                className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 hover:text-blue-600 transition-colors"
                              >
                                {showAllCourses ? 'Show less' : 'Read more'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {!loading && matches.length === 0 && !loadError && !selectedMatch && (
                        <div className="text-xs font-bold text-slate-400">No matching government universities found for this selection yet.</div>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setMatches([]);
                    setSelectedUniversityId(null);
                    setLoadError(null);
                    setLoading(false);
                    scrollToId('al-section');
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
