import { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import {
  aiShortlist,
  generateInterviewQuestions,
  matchCandidates,
  saveCandidate,
} from '../api/api';
import AIRecommendationBox from '../components/AIRecommendationBox';
import CandidateCard from '../components/CandidateCard';
import LoadingSpinner from '../components/LoadingSpinner';
import SkillKeywordInput from '../components/SkillKeywordInput';

const initialForm = {
  requiredSkills: 'React, Node.js',
  preferredSkills: 'MongoDB, AWS',
  minExperience: '2',
};

const pageSize = 6;

const parseSkills = (value) =>
  String(value || '')
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);

const normalizeCandidate = (candidate) => ({
  ...candidate,
  candidateId: candidate.candidateId || candidate._id,
});

// Shortlist workspace for both deterministic matching and AI-based ranking.
export default function MatchCandidates() {
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [savingCandidateId, setSavingCandidateId] = useState('');
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [analysis, setAnalysis] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [candidateQuery, setCandidateQuery] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [sortMode, setSortMode] = useState('score-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  useEffect(() => {
    setCurrentPage(1);
  }, [candidateQuery, experienceFilter, sortMode, analysis, aiAnalysis]);

  const updateField = (field) => (event) => {
    setFormData((current) => ({ ...current, [field]: event.target.value }));
  };

  const executeMatch = async (useAi) => {
    try {
      setLoading(true);
      setNotification({ type: '', message: '' });
      setSelectedQuestions([]);

      const payload = {
        requiredSkills: parseSkills(formData.requiredSkills),
        preferredSkills: parseSkills(formData.preferredSkills),
        minExperience: Number(formData.minExperience || 0),
      };

      const response = useAi ? await aiShortlist(payload) : await matchCandidates(payload);
      const candidates = useAi ? response.rankedCandidates || [] : response.candidates || [];
      const normalizedCandidates = candidates.map(normalizeCandidate);

      if (useAi) {
        setAiAnalysis({ ...response, rankedCandidates: normalizedCandidates });
        setAnalysis(null);
      } else {
        setAnalysis({ ...response, candidates: normalizedCandidates });
        setAiAnalysis(null);
      }

      setNotification({
        type: 'success',
        message: useAi ? 'AI shortlist generated successfully.' : 'Basic match completed successfully.',
      });
    } catch (requestError) {
      setNotification({
        type: 'error',
        message: requestError?.response?.data?.message || 'Unable to shortlist candidates.',
      });
    } finally {
      setLoading(false);
    }
  };

  const activeCandidates = (aiAnalysis?.rankedCandidates || analysis?.candidates || [])
    .filter((candidate) => {
      const searchTerm = candidateQuery.trim().toLowerCase();
      const candidateSkills = (candidate.skills || candidate.matchedSkills || []).join(' ').toLowerCase();
      const matchesSearch =
        !searchTerm ||
        candidate.name.toLowerCase().includes(searchTerm) ||
        candidateSkills.includes(searchTerm);
      const matchesExperience =
        experienceFilter === '' || Number(candidate.experience || 0) >= Number(experienceFilter);
      return matchesSearch && matchesExperience;
    })
    .sort((firstCandidate, secondCandidate) => {
      if (sortMode === 'score-asc') return firstCandidate.score - secondCandidate.score;
      if (sortMode === 'name-asc') return firstCandidate.name.localeCompare(secondCandidate.name);
      if (sortMode === 'name-desc') return secondCandidate.name.localeCompare(firstCandidate.name);
      return secondCandidate.score - firstCandidate.score;
    });

  const totalPages = Math.max(1, Math.ceil(activeCandidates.length / pageSize));
  const pagedCandidates = activeCandidates.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const summary = analysis?.summary || {
    highMatch: aiAnalysis?.rankedCandidates?.filter((candidate) => candidate.score >= 80).length || 0,
    mediumMatch: aiAnalysis?.rankedCandidates?.filter((candidate) => candidate.score >= 50 && candidate.score < 80).length || 0,
    lowMatch: aiAnalysis?.rankedCandidates?.filter((candidate) => candidate.score < 50).length || 0,
  };

  const handleSave = async (candidate) => {
    try {
      setSavingCandidateId(candidate.candidateId || candidate._id || candidate.id || '');
      await saveCandidate({ candidateId: candidate.candidateId || candidate._id || candidate.id });
      setNotification({ type: 'success', message: `${candidate.name} was saved to the shortlist.` });
    } catch (requestError) {
      setNotification({
        type: 'error',
        message: requestError?.response?.data?.message || 'Unable to save the candidate.',
      });
    } finally {
      setSavingCandidateId('');
    }
  };

  const handleGenerateQuestions = async (candidate) => {
    try {
      const response = await generateInterviewQuestions({
        candidateId: candidate.candidateId || candidate._id || candidate.id,
        role: 'Full Stack Developer',
      });
      setSelectedQuestions(response.questions || []);
      setNotification({ type: 'success', message: 'Interview questions generated successfully.' });
    } catch (requestError) {
      setNotification({
        type: 'error',
        message: requestError?.response?.data?.message || 'Unable to generate interview questions.',
      });
    }
  };

  const exportPdf = () => {
    const pdf = new jsPDF();
    pdf.setFontSize(18);
    pdf.text('Candidate Shortlist', 14, 18);
    pdf.setFontSize(11);
    pdf.text(`Role skills: ${formData.requiredSkills}`, 14, 28);
    pdf.text(`Preferred skills: ${formData.preferredSkills}`, 14, 35);
    pdf.text(`Minimum experience: ${formData.minExperience} years`, 14, 42);

    let cursorY = 55;
    pagedCandidates.forEach((candidate, index) => {
      if (cursorY > 270) {
        pdf.addPage();
        cursorY = 20;
      }

      pdf.setFontSize(12);
      pdf.text(`${index + 1}. ${candidate.name} - ${candidate.score}%`, 14, cursorY);
      pdf.setFontSize(10);
      pdf.text(`Skills: ${(candidate.skills || candidate.matchedSkills || []).join(', ') || 'None'}`, 14, cursorY + 7);
      pdf.text(`Matched: ${(candidate.matchedSkills || []).join(', ') || 'None'}`, 14, cursorY + 13);
      pdf.text(`Missing: ${(candidate.missingSkills || []).join(', ') || 'None'}`, 14, cursorY + 19);
      cursorY += 30;
    });

    pdf.save('candidate-shortlist.pdf');
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="section-title">Match Candidates</h2>
        <p className="section-subtitle">Run a basic rule-based shortlist or ask OpenRouter to produce an intelligent AI ranking with explanations.</p>
      </section>

      <section className="glass-panel space-y-5 p-6 sm:p-8">
        {notification.message ? (
          <div
            className={`rounded-2xl border p-4 text-sm ${
              notification.type === 'success'
                ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-100'
                : 'border-rose-400/20 bg-rose-500/10 text-rose-100'
            }`}
          >
            {notification.message}
          </div>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-3">
            <SkillKeywordInput
              label="Required Skills"
              value={formData.requiredSkills}
              onChange={(nextValue) => setFormData((current) => ({ ...current, requiredSkills: nextValue }))}
              placeholder="React, Node.js"
            />
          </div>
          <div className="lg:col-span-2">
            <SkillKeywordInput
              label="Preferred Skills"
              value={formData.preferredSkills}
              onChange={(nextValue) => setFormData((current) => ({ ...current, preferredSkills: nextValue }))}
              placeholder="MongoDB, AWS"
            />
          </div>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-200">Minimum Experience</span>
            <input className="input-field" type="number" min="0" value={formData.minExperience} onChange={updateField('minExperience')} />
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="button" className="primary-button" onClick={() => executeMatch(false)} disabled={loading}>
            {loading && !aiAnalysis ? 'Running...' : 'Basic Match'}
          </button>
          <button type="button" className="secondary-button" onClick={() => executeMatch(true)} disabled={loading}>
            {loading && !analysis ? 'Running...' : 'AI Match'}
          </button>
          <button type="button" className="secondary-button" onClick={exportPdf} disabled={!pagedCandidates.length}>
            Export PDF
          </button>
        </div>
      </section>

      {(analysis || aiAnalysis) && (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'High Match', value: summary.highMatch || 0 },
            { label: 'Medium Match', value: summary.mediumMatch || 0 },
            { label: 'Low Match', value: summary.lowMatch || 0 },
            { label: 'Displayed', value: activeCandidates.length },
          ].map((item) => (
            <div key={item.label} className="glass-panel p-5">
              <p className="text-sm text-slate-300">{item.label}</p>
              <h3 className="mt-2 text-3xl font-bold text-white">{item.value}</h3>
            </div>
          ))}
        </section>
      )}

      {(analysis || aiAnalysis) && (
        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="section-title">Ranked Candidates</h3>
                <p className="section-subtitle">Search, filter, sort, paginate, and save the best profiles from the shortlist.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <input
                  className="input-field max-w-[220px]"
                  value={candidateQuery}
                  onChange={(event) => setCandidateQuery(event.target.value)}
                  placeholder="Search by skill or name"
                />
                <input
                  className="input-field max-w-[200px]"
                  type="number"
                  min="0"
                  value={experienceFilter}
                  onChange={(event) => setExperienceFilter(event.target.value)}
                  placeholder="Min experience"
                />
                <select className="input-field max-w-[180px]" value={sortMode} onChange={(event) => setSortMode(event.target.value)}>
                  <option value="score-desc">Score high-low</option>
                  <option value="score-asc">Score low-high</option>
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                </select>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {pagedCandidates.length ? (
                pagedCandidates.map((candidate) => (
                  <CandidateCard
                    key={candidate.candidateId || candidate._id || candidate.name}
                    candidate={candidate}
                    onSave={handleSave}
                    onGenerateQuestions={handleGenerateQuestions}
                    saveLabel={savingCandidateId === (candidate.candidateId || candidate._id) ? 'Saving...' : 'Save Candidate'}
                  />
                ))
              ) : (
                <div className="glass-panel p-8 text-center text-slate-300 lg:col-span-2">
                  No shortlisted candidates match the current filters.
                </div>
              )}
            </div>

            {totalPages > 1 ? (
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  className="secondary-button px-4 py-2"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                >
                  Previous
                </button>
                <span className="text-sm text-slate-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  className="secondary-button px-4 py-2"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                >
                  Next
                </button>
              </div>
            ) : null}
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="section-title">AI Explanation</h3>
              <p className="section-subtitle">The AI panel summarizes why the top candidate fits the role and what to ask in the interview.</p>
            </div>
            <AIRecommendationBox data={aiAnalysis} />
            {selectedQuestions.length ? (
              <div className="glass-panel space-y-3 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Generated Questions</p>
                <ul className="space-y-2 text-sm text-slate-200">
                  {selectedQuestions.map((question) => (
                    <li key={question} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                      {question}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>
      )}

      {loading ? <LoadingSpinner label="Processing shortlist..." /> : null}
    </div>
  );
}
