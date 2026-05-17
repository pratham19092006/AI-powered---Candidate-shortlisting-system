// Compact table view used for recent candidates and saved shortlist summaries.
export default function CandidateTable({ rows = [], onRemove, emptyMessage = 'No records found.' }) {
  return (
    <div className="glass-panel overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm text-slate-200">
          <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-slate-400">
            <tr>
              <th className="px-5 py-4">Candidate</th>
              <th className="px-5 py-4">Email</th>
              <th className="px-5 py-4">Skills</th>
              <th className="px-5 py-4">Experience</th>
              <th className="px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.length ? (
              rows.map((row) => {
                const candidate = row.candidateId || row;
                return (
                  <tr key={candidate._id || candidate.id || candidate.email} className="hover:bg-white/5">
                    <td className="px-5 py-4 font-medium text-white">{candidate.name}</td>
                    <td className="px-5 py-4 text-slate-300">{candidate.email}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        {(candidate.skills || []).slice(0, 4).map((skill) => (
                          <span key={skill} className="tag">
                            {skill}
                          </span>
                        ))}
                        {candidate.skills?.length > 4 && <span className="tag">+{candidate.skills.length - 4}</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-300">{candidate.experience || 0} years</td>
                    <td className="px-5 py-4">
                      {onRemove ? (
                        <button type="button" onClick={() => onRemove(row, candidate)} className="secondary-button px-4 py-2 text-xs">
                          Remove
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">View only</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td className="px-5 py-10 text-center text-slate-400" colSpan="5">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
