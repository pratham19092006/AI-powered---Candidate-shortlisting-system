import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'Add Candidate', to: '/add-candidate' },
  { label: 'Match Candidates', to: '/match-candidates' },
  { label: 'Saved Candidates', to: '/saved-candidates' },
];

// Persistent navigation bar for the recruiter workflow.
export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-500 text-lg font-black text-slate-950 shadow-lg shadow-cyan-500/25">
            AI
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">Recruitment</p>
            <h1 className="text-lg font-bold text-white">Candidate Shortlisting System</h1>
          </div>
        </NavLink>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-2xl px-4 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-white/15 text-white shadow-lg' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
