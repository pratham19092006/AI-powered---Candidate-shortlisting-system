const Candidate = require('../models/Candidate');

// Normalizes comma-separated or array-based skills into clean, unique strings.
const parseSkillsInput = (skillsInput) => {
  const rawSkills = Array.isArray(skillsInput)
    ? skillsInput
    : String(skillsInput || '')
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean);

  const seen = new Map();

  rawSkills.forEach((skill) => {
    const cleanSkill = String(skill).trim();
    if (cleanSkill && !seen.has(cleanSkill.toLowerCase())) {
      seen.set(cleanSkill.toLowerCase(), cleanSkill);
    }
  });

  return [...seen.values()];
};

const buildCandidatePayload = (body = {}) => ({
  name: String(body.name || '').trim(),
  email: String(body.email || '').trim().toLowerCase(),
  skills: parseSkillsInput(body.skills),
  experience: Number(body.experience || 0),
  projects: String(body.projects || '').trim(),
  bio: String(body.bio || '').trim(),
});

// Creates a new candidate profile with validation and duplicate-email protection.
const createCandidate = async (req, res) => {
  try {
    const payload = buildCandidatePayload(req.body);

    if (!payload.name || !payload.email) {
      return res.status(400).json({ message: 'Name and email are required.' });
    }

    if (payload.skills.length === 0) {
      return res.status(400).json({ message: 'Please provide at least one skill.' });
    }

    if (Number.isNaN(payload.experience) || payload.experience < 0) {
      return res.status(400).json({ message: 'Experience cannot be negative.' });
    }

    const existingCandidate = await Candidate.findOne({ email: payload.email });
    if (existingCandidate) {
      return res.status(409).json({ message: 'A candidate with this email already exists.' });
    }

    const candidate = await Candidate.create(payload);
    return res.status(201).json({
      message: 'Candidate created successfully.',
      candidate,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A candidate with this email already exists.' });
    }

    return res.status(500).json({ message: 'Failed to create candidate.', error: error.message });
  }
};

// Returns all candidates sorted by latest first, with optional skill and experience filters.
const getAllCandidates = async (req, res) => {
  try {
    const { searchSkill, minExperience } = req.query;
    let candidates = await Candidate.find().sort({ createdAt: -1 });

    if (searchSkill) {
      const normalizedSkill = String(searchSkill).trim().toLowerCase();
      candidates = candidates.filter((candidate) =>
        (candidate.skills || []).some((skill) => String(skill).trim().toLowerCase().includes(normalizedSkill))
      );
    }

    if (minExperience !== undefined && minExperience !== '') {
      const minimumExperience = Number(minExperience);
      candidates = candidates.filter((candidate) => Number(candidate.experience || 0) >= minimumExperience);
    }

    return res.json({
      message: 'Candidates fetched successfully.',
      count: candidates.length,
      candidates,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch candidates.', error: error.message });
  }
};

// Updates an existing candidate profile.
const updateCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = buildCandidatePayload(req.body);

    if (!payload.name || !payload.email) {
      return res.status(400).json({ message: 'Name and email are required.' });
    }

    if (payload.skills.length === 0) {
      return res.status(400).json({ message: 'Please provide at least one skill.' });
    }

    if (Number.isNaN(payload.experience) || payload.experience < 0) {
      return res.status(400).json({ message: 'Experience cannot be negative.' });
    }

    const duplicate = await Candidate.findOne({ email: payload.email, _id: { $ne: id } });
    if (duplicate) {
      return res.status(409).json({ message: 'A candidate with this email already exists.' });
    }

    const candidate = await Candidate.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found.' });
    }

    return res.json({
      message: 'Candidate updated successfully.',
      candidate,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update candidate.', error: error.message });
  }
};

// Deletes a candidate profile permanently.
const deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const candidate = await Candidate.findByIdAndDelete(id);

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found.' });
    }

    return res.json({ message: 'Candidate deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete candidate.', error: error.message });
  }
};

module.exports = {
  createCandidate,
  getAllCandidates,
  updateCandidate,
  deleteCandidate,
  parseSkillsInput,
};
