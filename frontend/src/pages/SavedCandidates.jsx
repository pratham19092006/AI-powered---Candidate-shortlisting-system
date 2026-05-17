import { useEffect, useState } from 'react';
import { getSavedCandidates, removeSavedCandidate } from '../api/api';
import CandidateTable from '../components/CandidateTable';
import LoadingSpinner from '../components/LoadingSpinner';

// Saved shortlist page for reviewing candidates that have already been selected.
export default function SavedCandidates() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savedCandidates, setSavedCandidates] = useState([]);
  const [message, setMessage] = useState('');

  const loadSavedCandidates = async () => {
    try {
      setLoading(true);
      const response = await getSavedCandidates();
      setSavedCandidates(response.savedCandidates || []);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to load saved candidates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedCandidates();
  }, []);

  const handleRemove = async (_row, candidate) => {
    try {
      await removeSavedCandidate(candidate._id);
      setMessage(`${candidate.name} removed from the shortlist.`);
      loadSavedCandidates();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to remove the saved candidate.');
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading saved shortlist..." />;
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="section-title">Saved Candidates</h2>
        <p className="section-subtitle">These are the shortlisted profiles that recruiters marked for follow-up or interview scheduling.</p>
      </section>

      {message ? <div className="glass-panel border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">{message}</div> : null}
      {error ? <div className="glass-panel border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-100">{error}</div> : null}

      <CandidateTable
        rows={savedCandidates}
        onRemove={handleRemove}
        emptyMessage="No candidates have been saved yet."
      />

      {savedCandidates.length ? (
        <div className="glass-panel p-5 text-sm text-slate-300">
          <p className="font-semibold text-white">Saved shortlist count: {savedCandidates.length}</p>
          <p className="mt-2">Use this list when preparing interviews, comparing candidates, or presenting final recommendations.</p>
        </div>
      ) : null}
    </div>
  );
}
