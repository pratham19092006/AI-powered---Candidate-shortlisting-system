// Normalizes skill strings so matching is case-insensitive and whitespace-safe.
const normalizeSkills = (skills = []) =>
  [...new Set(skills.map((skill) => String(skill).trim()).filter(Boolean).map((skill) => skill.toLowerCase()))];

const originalSkillMap = (skills = []) => {
  const map = new Map();
  skills.forEach((skill) => {
    const cleaned = String(skill).trim();
    if (cleaned) {
      map.set(cleaned.toLowerCase(), cleaned);
    }
  });
  return map;
};

// Calculates a structured match result for a single candidate.
const calculateCandidateMatch = (candidate, requirements = {}) => {
  const requiredSkills = originalSkillMap(requirements.requiredSkills || []);
  const preferredSkills = originalSkillMap(requirements.preferredSkills || []);
  const candidateSkills = new Set(normalizeSkills(candidate.skills || []));
  const requiredSkillKeys = [...requiredSkills.keys()];
  const preferredSkillKeys = [...preferredSkills.keys()];

  const matchedSkills = requiredSkillKeys.filter((skill) => candidateSkills.has(skill));
  const missingSkills = requiredSkillKeys.filter((skill) => !candidateSkills.has(skill));
  const preferredMatches = preferredSkillKeys.filter((skill) => candidateSkills.has(skill));

  const requiredScore = requiredSkillKeys.length
    ? (matchedSkills.length / requiredSkillKeys.length) * 60
    : 0;
  const preferredScore = Math.min(10, preferredMatches.length * 5);

  const minExperience = Number(requirements.minExperience || 0);
  const candidateExperience = Number(candidate.experience || 0);
  let experienceScore = 0;

  if (minExperience > 0) {
    if (candidateExperience >= minExperience) {
      experienceScore = Math.min(30, 15 + (candidateExperience - minExperience) * 3);
    } else {
      experienceScore = Math.max(0, 15 - (minExperience - candidateExperience) * 10);
    }
  } else {
    experienceScore = Math.min(30, candidateExperience * 5);
  }

  const score = Math.max(0, Math.min(100, Math.round(requiredScore + preferredScore + experienceScore)));
  const rankingLevel = score >= 80 ? 'High Match' : score >= 50 ? 'Medium Match' : 'Low Match';
  const experienceMet = candidateExperience >= minExperience;

  const explanationParts = [];
  explanationParts.push(`${matchedSkills.length} of ${requiredSkillKeys.length || 0} required skills matched`);
  if (preferredMatches.length) {
    explanationParts.push(`${preferredMatches.length} preferred skills matched`);
  }
  explanationParts.push(experienceMet ? 'meets the minimum experience' : 'does not meet the minimum experience');

  return {
    candidateId: candidate._id,
    name: candidate.name,
    email: candidate.email,
    skills: candidate.skills || [],
    experience: candidate.experience || 0,
    projects: candidate.projects || '',
    bio: candidate.bio || '',
    matchedSkills: matchedSkills.map((skill) => requiredSkills.get(skill) || skill),
    missingSkills: missingSkills.map((skill) => requiredSkills.get(skill) || skill),
    preferredMatches: preferredMatches.map((skill) => preferredSkills.get(skill) || skill),
    score,
    rankingLevel,
    experienceMet,
    explanation: explanationParts.join(', '),
  };
};

module.exports = {
  calculateCandidateMatch,
  normalizeSkills,
};
