const Candidate = require('../models/Candidate');
const { calculateCandidateMatch } = require('../utils/skillMatcher');
const { chatWithOpenRouter, extractJsonFromText } = require('../utils/openrouter');

const normalizeArray = (value) =>
  Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : String(value || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

const buildCandidateDigest = (candidate) => ({
  id: candidate._id,
  name: candidate.name,
  email: candidate.email,
  skills: candidate.skills || [],
  experience: candidate.experience || 0,
  projects: candidate.projects || '',
  bio: candidate.bio || '',
});

const buildAiPrompt = ({ requiredSkills, preferredSkills, minExperience, candidates }) => `You are an expert HR recruiter.

Job Requirements:
- Required Skills: ${requiredSkills.length ? requiredSkills.join(', ') : 'None'}
- Preferred Skills: ${preferredSkills.length ? preferredSkills.join(', ') : 'None'}
- Minimum Experience: ${minExperience} years

Candidates:
${candidates
  .map(
    (candidate, index) => `${index + 1}. ${candidate.name}
Skills: ${candidate.skills.join(', ') || 'None'}
Experience: ${candidate.experience} years
Projects: ${candidate.projects || 'Not provided'}
Bio: ${candidate.bio || 'Not provided'}`
  )
  .join('\n\n')}

Tasks:
1. Rank candidates from best to worst.
2. Give a match score out of 100 for each candidate.
3. Explain strengths and weaknesses.
4. Recommend the best candidate.
5. Suggest interview questions for the best candidate.
6. Return valid JSON only using this schema:
{
  "rankedCandidates": [
    {
      "candidateId": "string",
      "name": "string",
      "score": 0,
      "rankingLevel": "High Match | Medium Match | Low Match",
      "matchedSkills": ["string"],
      "missingSkills": ["string"],
      "strengths": ["string"],
      "weaknesses": ["string"],
      "explanation": "string"
    }
  ],
  "bestCandidate": {
    "candidateId": "string",
    "name": "string",
    "reason": "string"
  },
  "interviewQuestions": ["string"],
  "summary": "string"
}`;

const buildFallbackAiResponse = ({ requiredSkills, preferredSkills, minExperience, candidates }) => {
  const rankedCandidates = candidates
    .map((candidate) => calculateCandidateMatch(candidate, { requiredSkills, preferredSkills, minExperience }))
    .sort((firstCandidate, secondCandidate) => secondCandidate.score - firstCandidate.score)
    .map((candidate) => ({
      candidateId: candidate.candidateId,
      name: candidate.name,
      score: candidate.score,
      rankingLevel: candidate.rankingLevel,
      matchedSkills: candidate.matchedSkills,
      missingSkills: candidate.missingSkills,
      strengths: [
        candidate.matchedSkills.length ? `Matches ${candidate.matchedSkills.length} required skills` : 'Good communication potential',
        candidate.experienceMet ? 'Meets the minimum experience requirement' : 'Can still be considered for junior roles',
      ],
      weaknesses: [
        candidate.missingSkills.length ? `Missing ${candidate.missingSkills.length} required skills` : 'No major missing skills',
        candidate.experienceMet ? 'No major experience gap' : 'Below the requested experience level',
      ],
      explanation: candidate.explanation,
    }));

  const bestCandidate = rankedCandidates[0] || null;
  const interviewQuestions = bestCandidate
    ? [
        `Tell us about a project where you used ${requiredSkills[0] || 'your strongest skill'}.`,
        'How do you approach debugging and performance improvements?',
        `Describe your experience with ${preferredSkills[0] || 'collaborative team work'}.`,
        'How do you ensure code quality in a production environment?',
      ]
    : [];

  return {
    rankedCandidates,
    bestCandidate: bestCandidate
      ? {
          candidateId: bestCandidate.candidateId,
          name: bestCandidate.name,
          reason: bestCandidate.explanation,
        }
      : null,
    interviewQuestions,
    summary: 'OpenRouter was unavailable, so the system generated a smart fallback ranking locally.',
  };
};

// Sends the candidate list and job requirements to OpenRouter for AI-driven ranking.
const shortlistCandidates = async (req, res) => {
  try {
    const requiredSkills = normalizeArray(req.body.requiredSkills);
    const preferredSkills = normalizeArray(req.body.preferredSkills);
    const minExperience = Number(req.body.minExperience || 0);

    if (requiredSkills.length === 0) {
      return res.status(400).json({ message: 'At least one required skill is needed for AI shortlisting.' });
    }

    if (Number.isNaN(minExperience) || minExperience < 0) {
      return res.status(400).json({ message: 'Minimum experience cannot be negative.' });
    }

    const allCandidates = await Candidate.find().sort({ createdAt: -1 });
    if (!allCandidates.length) {
      return res.status(404).json({ message: 'No candidates available for shortlisting.' });
    }

    const candidateDigest = allCandidates.map(buildCandidateDigest);
    const prompt = buildAiPrompt({ requiredSkills, preferredSkills, minExperience, candidates: candidateDigest });

    try {
      const openRouterResponse = await chatWithOpenRouter({
        messages: [
          {
            role: 'system',
            content: 'You are a recruitment assistant that returns precise JSON and nothing else.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
        maxTokens: 1800,
      });

      const content = openRouterResponse?.choices?.[0]?.message?.content || '';
      const parsed = extractJsonFromText(content);

      return res.json({
        source: 'openrouter',
        requirements: {
          requiredSkills,
          preferredSkills,
          minExperience,
        },
        total: candidateDigest.length,
        ...parsed,
      });
    } catch (openRouterError) {
      const fallback = buildFallbackAiResponse({
        requiredSkills,
        preferredSkills,
        minExperience,
        candidates: allCandidates,
      });

      return res.status(200).json({
        source: 'fallback',
        requirements: {
          requiredSkills,
          preferredSkills,
          minExperience,
        },
        total: candidateDigest.length,
        error: openRouterError.message,
        ...fallback,
      });
    }
  } catch (error) {
    return res.status(500).json({ message: 'AI shortlisting failed.', error: error.message });
  }
};

// Generates follow-up interview questions for a specific candidate or the shortlisted top match.
const generateInterviewQuestions = async (req, res) => {
  try {
    const candidateId = req.body.candidateId || '';
    const role = String(req.body.role || 'the open role').trim();
    const candidate = candidateId ? await Candidate.findById(candidateId) : null;

    if (candidateId && !candidate) {
      return res.status(404).json({ message: 'Candidate not found.' });
    }

    const candidateContext = candidate
      ? `Candidate Name: ${candidate.name}\nSkills: ${(candidate.skills || []).join(', ')}\nExperience: ${candidate.experience} years\nProjects: ${candidate.projects || 'Not provided'}\nBio: ${candidate.bio || 'Not provided'}`
      : 'No specific candidate was provided.';

    const prompt = `You are an expert interviewer.

Role: ${role}

Candidate Context:
${candidateContext}

Generate 8 concise, practical interview questions in JSON format only:
{
  "questions": ["string"],
  "focusAreas": ["string"]
}`;

    try {
      const response = await chatWithOpenRouter({
        messages: [
          {
            role: 'system',
            content: 'Return valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
        maxTokens: 900,
      });

      const content = response?.choices?.[0]?.message?.content || '';
      const parsed = extractJsonFromText(content);

      return res.json({
        source: 'openrouter',
        candidate: candidate ? buildCandidateDigest(candidate) : null,
        role,
        ...parsed,
      });
    } catch (openRouterError) {
      const fallbackQuestions = candidate
        ? [
            `Explain a project where you used ${candidate.skills[0] || 'your primary technical skill'}.`,
            'How do you handle tight deadlines and changing requirements?',
            'What is your approach to debugging production issues?',
            'How do you collaborate with designers, testers, and backend engineers?',
            'Describe a time you improved an application for performance or scalability.',
          ]
        : [
            'Tell us about a project that best represents your technical strengths.',
            'How do you approach problem solving when requirements are unclear?',
            'What tools do you use to learn new technologies quickly?',
            'How do you ensure quality before submitting your work?',
          ];

      return res.json({
        source: 'fallback',
        candidate: candidate ? buildCandidateDigest(candidate) : null,
        role,
        questions: fallbackQuestions,
        focusAreas: candidate ? candidate.skills.slice(0, 3) : ['communication', 'problem solving', 'adaptability'],
        error: openRouterError.message,
      });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Failed to generate interview questions.', error: error.message });
  }
};

module.exports = {
  shortlistCandidates,
  generateInterviewQuestions,
};
