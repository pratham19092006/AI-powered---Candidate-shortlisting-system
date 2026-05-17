// Card used to render ranked candidates with score, tags, and actions.
export default function CandidateCard({
  candidate,
  onSave,
  onGenerateQuestions,
  showSaveButton = true,
  saveLabel = 'Save Candidate',
}) {
  const skills = candidate.skills || candidate.matchedSkills || [];
  const experience = candidate.experience ?? candidate.experienceYears ?? 0;

  return (
    <article className="glass-panel flex h-full flex-col justify-between p-5 transition duration-300 hover:-translate-y-1 hover:shadow-glow">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">{candidate.rankingLevel || 'Candidate'}</p>
            <h3 className="mt-1 text-xl font-semibold text-white">{candidate.name}</h3>
            <p className="text-sm text-slate-300">{candidate.email}</p>
          </div>
          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Match</p>
            <p className="text-2xl font-bold text-white">{candidate.score ?? 0}%</p>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
            <span>Match Progress</span>
            <span>{candidate.score ?? 0}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 transition-all"
              style={{ width: `${candidate.score ?? 0}%` }}
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-200">Experience: {experience} year{experience === 1 ? '' : 's'}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {skills.length ? (
              skills.map((skill) => (
                <span key={skill} className="tag">
                  {skill}
                </span>
              ))
            ) : (
              <span className="tag">No skills added</span>
            )}
          </div>
        </div>

        <div className="space-y-2 rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-300">
          <p className="font-semibold text-slate-100">AI Explanation</p>
          <p>{candidate.explanation || 'This candidate is ready for recruiter review.'}</p>
          {candidate.matchedSkills?.length ? (
            <p>
              <span className="font-semibold text-emerald-300">Matched:</span> {candidate.matchedSkills.join(', ')}
            </p>
          ) : null}
          {candidate.missingSkills?.length ? (
            <p>
              <span className="font-semibold text-rose-300">Missing:</span> {candidate.missingSkills.join(', ')}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {showSaveButton && (
          <button
            type="button"
            onClick={() => onSave?.(candidate)}
            className="secondary-button flex-1 min-w-[160px]"
          >
            {saveLabel}
          </button>
        )}
        <button
          type="button"
          onClick={() => onGenerateQuestions?.(candidate)}
          className="primary-button flex-1 min-w-[180px]"
        >
          Generate Questions
        </button>
      </div>
    </article>
  );
}
