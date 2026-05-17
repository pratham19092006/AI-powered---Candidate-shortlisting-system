import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCandidates, matchCandidates } from '../api/api';
import CandidateTable from '../components/CandidateTable';
import LoadingSpinner from '../components/LoadingSpinner';
import MatchChart from '../components/MatchChart';

const dashboardRequirements = {
  requiredSkills: ['React', 'Node.js', 'MongoDB'],
  preferredSkills: ['TypeScript', 'AWS'],
  minExperience: 2,
};

const statCardStyles = [
  'from-cyan-500/20 to-cyan-500/5 border-cyan-400/20',
  'from-emerald-500/20 to-emerald-500/5 border-emerald-400/20',
  'from-amber-500/20 to-amber-500/5 border-amber-400/20',
  'from-rose-500/20 to-rose-500/5 border-rose-400/20',
];

// Dashboard gives recruiters a quick operational overview of the talent pool.
export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [candidateResponse, matchResponse] = await Promise.all([
          getCandidates(),
          matchCandidates(dashboardRequirements),
        ]);

        setCandidates(candidateResponse.candidates || []);
        setAnalysis(matchResponse);
      } catch (requestError) {
        setError(requestError?.response?.data?.message || 'Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Loading dashboard overview..." />;
  }

  const summary = analysis?.summary || { highMatch: 0, mediumMatch: 0, lowMatch: 0 };
  const stats = [
    { label: 'Total Candidates', value: candidates.length, note: 'Profiles in the database' },
    { label: 'High Match', value: summary.highMatch || 0, note: '80+ score candidates' },
    { label: 'Medium Match', value: summary.mediumMatch || 0, note: '50-79 score candidates' },
    { label: 'Low Match', value: summary.lowMatch || 0, note: 'Below 50 score candidates' },
  ];

  return (
    <div className="space-y-8 animate-[fadeIn_0.6s_ease-in]">
      <section className="glass-panel overflow-hidden p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">AI Recruitment Dashboard</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Shortlist candidates faster with structured scoring and AI explanations.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              This dashboard combines candidate analytics, deterministic skill matching, and OpenRouter-powered ranking for a polished semester-project presentation.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link to="/match-candidates" className="primary-button">
                Match Candidates
              </Link>
              <span className="rounded-full border border-cyan-300/30 bg-cyan-400/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200">
                AI Recommended
              </span>
            </div>
            {analysis?.message ? <p className="mt-4 text-sm text-emerald-300">{analysis.message}</p> : null}
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 shadow-2xl">
            <p className="text-sm font-medium text-slate-300">Default analysis role</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {dashboardRequirements.requiredSkills.map((skill) => (
                <span key={skill} className="tag">
                  {skill}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm text-slate-300">
              Preferred: {dashboardRequirements.preferredSkills.join(', ')} | Min Exp: {dashboardRequirements.minExperience} years
            </p>
            <div className="mt-6 rounded-2xl bg-gradient-to-br from-cyan-500/15 to-teal-400/10 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Latest insight</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {analysis?.candidates?.[0]?.name || 'No candidate available yet'}
              </p>
              <p className="mt-2 text-sm text-slate-300">
                {analysis?.candidates?.[0]?.explanation || 'Add candidates and run matching to generate the first shortlist.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <div className="glass-panel border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-100">{error}</div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={stat.label} className={`glass-panel border bg-gradient-to-br p-5 ${statCardStyles[index]}`}>
            <p className="text-sm text-slate-300">{stat.label}</p>
            <h3 className="mt-3 text-4xl font-bold text-white">{stat.value}</h3>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">{stat.note}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div>
            <h3 className="section-title">Match Score Overview</h3>
            <p className="section-subtitle">The default full-stack role analysis is used to keep the dashboard informative at a glance.</p>
          </div>
          <MatchChart
            labels={(analysis?.candidates || []).slice(0, 6).map((candidate) => candidate.name)}
            data={(analysis?.candidates || []).slice(0, 6).map((candidate) => candidate.score)}
          />
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="section-title">Recent Candidates</h3>
            <p className="section-subtitle">Latest profiles appear first, which helps recruiters focus on fresh submissions.</p>
          </div>
          <div className="max-h-[460px] overflow-y-auto rounded-3xl">
            <CandidateTable rows={candidates} emptyMessage="No candidates have been added yet." />
          </div>
        </div>
      </section>
    </div>
  );
}
