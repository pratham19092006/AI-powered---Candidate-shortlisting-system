import { useMemo, useState } from 'react';

const skillKeywords = [
  'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Svelte', 'Next.js', 'Node.js', 'Express.js', 'NestJS',
  'MongoDB', 'MySQL', 'PostgreSQL', 'SQLite', 'Redis', 'GraphQL', 'REST API', 'Docker', 'Kubernetes', 'AWS',
  'Azure', 'GCP', 'Firebase', 'Supabase', 'Tailwind CSS', 'Bootstrap', 'Material UI', 'Chakra UI', 'Redux', 'Zustand',
  'Context API', 'HTML5', 'CSS3', 'SASS', 'Less', 'Webpack', 'Vite', 'Jest', 'Vitest', 'Cypress',
  'Playwright', 'Testing Library', 'Git', 'GitHub', 'CI/CD', 'Linux', 'Nginx', 'Apache', 'Python', 'Django',
  'Flask', 'FastAPI', 'Java', 'Spring Boot', 'C#', '.NET', 'PHP', 'Laravel', 'Ruby', 'Rails',
  'Go', 'Rust', 'C++', 'C', 'Data Structures', 'Algorithms', 'OOP', 'DSA', 'Agile', 'Scrum',
  'Jira', 'Figma', 'UI/UX', 'Responsive Design', 'Mobile Development', 'Android', 'iOS', 'Flutter', 'React Native', 'Node.js API',
  'Authentication', 'Authorization', 'JWT', 'OAuth', 'Microservices', 'System Design', 'Performance Optimization', 'SEO', 'Accessibility', 'Cloud Computing',
  'Machine Learning', 'Deep Learning', 'AI', 'NLP', 'TensorFlow', 'PyTorch', 'Computer Vision', 'Data Analysis', 'Power BI', 'Tableau',
];

const normalizeValue = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

// Autocomplete input that keeps freeform entry while recommending common keywords.
export default function SkillKeywordInput({
  label,
  value,
  onChange,
  placeholder = 'Type or select skills',
  helperText = 'Start typing to see recommendations. You can still add your own custom skill.',
}) {
  const [focused, setFocused] = useState(false);

  const currentSkills = useMemo(() => normalizeValue(value), [value]);
  const activeToken = normalizeValue(value).at(-1) || '';

  const suggestions = useMemo(() => {
    const search = activeToken.toLowerCase();
    return skillKeywords
      .filter((skill) => !currentSkills.some((existing) => existing.toLowerCase() === skill.toLowerCase()))
      .filter((skill) => !search || skill.toLowerCase().includes(search))
      .slice(0, 10);
  }, [activeToken, currentSkills]);

  const updateValue = (nextSkills) => {
    onChange(nextSkills.join(', '));
  };

  const handleSelect = (skill) => {
    const existingSkills = normalizeValue(value);
    if (!existingSkills.some((item) => item.toLowerCase() === skill.toLowerCase())) {
      updateValue([...existingSkills.slice(0, Math.max(0, existingSkills.length - 1)), skill]);
    }
  };

  const handleChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      <input
        className="input-field"
        value={value}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          window.setTimeout(() => setFocused(false), 150);
        }}
        placeholder={placeholder}
      />
      <div className="flex flex-wrap gap-2">
        {currentSkills.slice(0, 6).map((skill) => (
          <span key={skill} className="tag">
            {skill}
          </span>
        ))}
        {currentSkills.length > 6 ? <span className="tag">+{currentSkills.length - 6}</span> : null}
      </div>
      <p className="text-xs text-slate-400">{helperText}</p>
      {focused && suggestions.length > 0 ? (
        <div className="rounded-2xl border border-white/10 bg-slate-950/95 p-3 shadow-2xl">
          <p className="mb-2 text-[11px] uppercase tracking-[0.3em] text-cyan-300">Recommended skills</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((skill) => (
              <button
                key={skill}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(skill)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200 transition hover:bg-cyan-400/15 hover:text-white"
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </label>
  );
}
