import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AddCandidate from './pages/AddCandidate';
import MatchCandidates from './pages/MatchCandidates';
import SavedCandidates from './pages/SavedCandidates';

// App-level routing keeps the recruiter dashboard organized and easy to navigate.
export default function App() {
  return (
    <div className="min-h-screen bg-ink text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-amber-400/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-teal-400/10 blur-3xl" />
      </div>

      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add-candidate" element={<AddCandidate />} />
          <Route path="/match-candidates" element={<MatchCandidates />} />
          <Route path="/saved-candidates" element={<SavedCandidates />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
