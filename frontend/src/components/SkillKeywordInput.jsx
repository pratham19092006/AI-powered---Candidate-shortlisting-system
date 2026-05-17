import { useMemo, useState } from 'react';

const skillKeywords = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C', 'C++', 'C#', 'Go', 'Rust', 'Kotlin',
  'Swift', 'Dart', 'R', 'PHP', 'Ruby', 'Scala', 'MATLAB', 'Bash', 'PowerShell', 'SQL',

  'HTML5', 'CSS3', 'SASS', 'LESS', 'Tailwind CSS', 'Bootstrap', 'Material UI', 'Chakra UI', 'Shadcn UI', 'Styled Components',
  'React', 'Next.js', 'Vue.js', 'Nuxt.js', 'Angular', 'Svelte', 'Remix', 'Redux', 'Zustand', 'Context API',
  'React Query', 'TanStack Query', 'Framer Motion', 'Three.js', 'WebGL', 'D3.js', 'Chart.js', 'Recharts', 'Vite', 'Webpack',

  'Node.js', 'Express.js', 'NestJS', 'Fastify', 'Django', 'Flask', 'FastAPI', 'Spring Boot', '.NET', 'ASP.NET Core',
  'Laravel', 'Ruby on Rails', 'Gin', 'Echo', 'GraphQL', 'REST API', 'gRPC', 'Socket.IO', 'WebSockets', 'Microservices',
  'System Design', 'Monolith', 'Event-Driven Architecture', 'Message Queues', 'Apache Kafka', 'RabbitMQ', 'Redis Streams', 'API Gateway', 'Rate Limiting', 'Caching',

  'MongoDB', 'Mongoose', 'MySQL', 'PostgreSQL', 'SQLite', 'MariaDB', 'Oracle DB', 'SQL Server', 'Redis', 'Elasticsearch',
  'Firebase', 'Supabase', 'Prisma', 'Sequelize', 'TypeORM', 'Drizzle ORM', 'Data Modeling', 'Database Indexing', 'Query Optimization', 'ETL',

  'AWS', 'Azure', 'GCP', 'DigitalOcean', 'Vercel', 'Netlify', 'Render', 'Heroku', 'Docker', 'Kubernetes',
  'Terraform', 'Ansible', 'Jenkins', 'GitHub Actions', 'GitLab CI/CD', 'CircleCI', 'Prometheus', 'Grafana', 'Nginx', 'Apache',
  'Linux', 'Ubuntu', 'Cloud Computing', 'Serverless', 'Lambda', 'Cloud Functions', 'DevOps', 'SRE', 'Load Balancing', 'CDN',

  'Git', 'GitHub', 'Bitbucket', 'CI/CD', 'Unit Testing', 'Integration Testing', 'End-to-End Testing', 'Jest', 'Vitest', 'Mocha',
  'Chai', 'Cypress', 'Playwright', 'Selenium', 'Testing Library', 'Postman', 'Swagger', 'OpenAPI', 'SonarQube', 'Code Review',

  'Machine Learning', 'Deep Learning', 'Artificial Intelligence', 'AI', 'NLP', 'LLM', 'Generative AI', 'Prompt Engineering', 'RAG', 'Fine-Tuning',
  'LangChain', 'LlamaIndex', 'Hugging Face', 'Transformers', 'OpenAI API', 'OpenRouter API', 'TensorFlow', 'Keras', 'PyTorch', 'Scikit-learn',
  'XGBoost', 'LightGBM', 'Computer Vision', 'OpenCV', 'MLOps', 'MLflow', 'Kubeflow', 'Feature Engineering', 'Model Deployment', 'Model Monitoring',
  'Data Science', 'Data Analysis', 'Pandas', 'NumPy', 'SciPy', 'Matplotlib', 'Seaborn', 'Plotly', 'Power BI', 'Tableau',
  'Big Data', 'Hadoop', 'Spark', 'Databricks', 'Airflow', 'Snowflake', 'Data Warehouse', 'Data Engineering', 'Time Series Forecasting', 'Reinforcement Learning',

  'AR', 'VR', 'AR/VR', 'XR', 'Unity', 'Unreal Engine', 'ARKit', 'ARCore', 'Mixed Reality', '3D Modeling',

  'Android', 'iOS', 'React Native', 'Flutter', 'Ionic', 'Xamarin', 'Mobile Development', 'PWA', 'Responsive Design', 'Cross-Platform Development',

  'Cybersecurity', 'Network Security', 'Application Security', 'OWASP', 'Penetration Testing', 'Vulnerability Assessment', 'JWT', 'OAuth2', 'OpenID Connect', 'Authentication',
  'Authorization', 'RBAC', 'SSO', 'Encryption', 'Hashing', 'Security Auditing',

  'Agile', 'Scrum', 'Kanban', 'Jira', 'Confluence', 'Figma', 'UI/UX', 'Communication', 'Problem Solving', 'Team Leadership',
  'DSA', 'Data Structures', 'Algorithms', 'OOP', 'SOLID Principles', 'Design Patterns', 'Performance Optimization', 'Scalability', 'SEO', 'Accessibility',
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
  const activeToken = useMemo(() => {
    const segments = String(value || '').split(',');
    return (segments[segments.length - 1] || '').trim();
  }, [value]);

  const suggestions = useMemo(() => {
    const search = activeToken.toLowerCase();
    return skillKeywords
      .filter((skill) => !currentSkills.some((existing) => existing.toLowerCase() === skill.toLowerCase()))
      .filter((skill) => !search || skill.toLowerCase().includes(search))
        .slice(0, 14);
  }, [activeToken, currentSkills]);

  const updateValue = (nextSkills) => {
    onChange(nextSkills.join(', '));
  };

  const handleSelect = (skill) => {
    const rawValue = String(value || '');
    const rawSegments = rawValue.split(',');
    const committedSkills = rawSegments
      .slice(0, -1)
      .map((item) => item.trim())
      .filter(Boolean);
    const endsWithComma = /,\s*$/.test(rawValue);
    const activeIsKnownKeyword = skillKeywords.some(
      (keyword) => keyword.toLowerCase() === activeToken.toLowerCase()
    );

    // Replace only an in-progress token; otherwise append to existing selected skills.
    const baseSkills = endsWithComma || activeIsKnownKeyword ? currentSkills : committedSkills;

    if (!baseSkills.some((item) => item.toLowerCase() === skill.toLowerCase())) {
      updateValue([...baseSkills, skill]);
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
