// Presents the AI explanation, strengths, weaknesses, and interview questions together.
export default function AIRecommendationBox({ data }) {
  if (!data) {
    return null;
  }

  return (
    <div className="glass-panel space-y-5 p-5 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">AI Recommendation</p>
          <h3 className="mt-1 text-xl font-semibold text-white">{data.bestCandidate?.name || 'No recommendation yet'}</h3>
        </div>
        <span className="tag">{data.source === 'openrouter' ? 'OpenRouter AI' : 'Fallback Intelligence'}</span>
      </div>

      <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-200">
        {data.summary || data.bestCandidate?.reason || 'The assistant did not return a summary.'}
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Strengths</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-200">
            {(data.rankedCandidates?.[0]?.strengths || []).map((item) => (
              <li key={item} className="rounded-2xl border border-emerald-400/15 bg-emerald-400/10 px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-300">Weaknesses</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-200">
            {(data.rankedCandidates?.[0]?.weaknesses || []).map((item) => (
              <li key={item} className="rounded-2xl border border-rose-400/15 bg-rose-400/10 px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {Array.isArray(data.interviewQuestions) && data.interviewQuestions.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">Interview Questions</h4>
          <ol className="mt-3 space-y-2 text-sm text-slate-200">
            {data.interviewQuestions.map((question, index) => (
              <li key={question} className="rounded-2xl border border-amber-400/15 bg-amber-400/10 px-3 py-2">
                {index + 1}. {question}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
