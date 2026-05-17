const Candidate = require('../models/Candidate');
const SavedCandidate = require('../models/SavedCandidate');
const { calculateCandidateMatch } = require('../utils/skillMatcher');

const normalizeArray = (value) =>
  Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : String(value || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

const buildRankSummary = (matches = []) => ({
  highMatch: matches.filter((candidate) => candidate.score >= 80).length,
  mediumMatch: matches.filter((candidate) => candidate.score >= 50 && candidate.score < 80).length,
  lowMatch: matches.filter((candidate) => candidate.score < 50).length,
});

// Performs the deterministic shortlist computation using skill overlap and experience.
const matchCandidates = async (req, res) => {
  try {
    const requiredSkills = normalizeArray(req.body.requiredSkills);
    const preferredSkills = normalizeArray(req.body.preferredSkills);
    const minExperience = Number(req.body.minExperience || 0);

    if (requiredSkills.length === 0) {
      return res.status(400).json({ message: 'At least one required skill is needed for matching.' });
    }

    if (Number.isNaN(minExperience) || minExperience < 0) {
      return res.status(400).json({ message: 'Minimum experience cannot be negative.' });
    }

    const candidates = await Candidate.find().sort({ createdAt: -1 });
    const rankedCandidates = candidates
      .map((candidate) =>
        calculateCandidateMatch(candidate, {
          requiredSkills,
          preferredSkills,
          minExperience,
        })
      )
      .sort((firstCandidate, secondCandidate) => secondCandidate.score - firstCandidate.score);

    return res.json({
      message: 'Candidates ranked successfully.',
      requirements: {
        requiredSkills,
        preferredSkills,
        minExperience,
      },
      summary: buildRankSummary(rankedCandidates),
      total: rankedCandidates.length,
      candidates: rankedCandidates,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to rank candidates.', error: error.message });
  }
};

// Saves a shortlisted candidate so the recruiter can review the pick later.
const saveShortlistedCandidate = async (req, res) => {
  try {
    const { candidateId } = req.body;

    if (!candidateId) {
      return res.status(400).json({ message: 'candidateId is required.' });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found.' });
    }

    const savedCandidate = await SavedCandidate.findOneAndUpdate(
      { candidateId },
      { candidateId, savedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('candidateId');

    return res.status(201).json({
      message: 'Candidate saved successfully.',
      savedCandidate,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to save candidate.', error: error.message });
  }
};

// Returns the saved shortlist with full candidate details.
const getSavedCandidates = async (req, res) => {
  try {
    const savedCandidates = await SavedCandidate.find().sort({ savedAt: -1 }).populate('candidateId');
    const cleanedList = savedCandidates.filter((entry) => entry.candidateId);

    return res.json({
      message: 'Saved candidates fetched successfully.',
      count: cleanedList.length,
      savedCandidates: cleanedList,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch saved candidates.', error: error.message });
  }
};

// Removes a candidate from the saved shortlist.
const deleteSavedCandidate = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const deleted = await SavedCandidate.findOneAndDelete({ candidateId });

    if (!deleted) {
      return res.status(404).json({ message: 'Saved candidate not found.' });
    }

    return res.json({ message: 'Saved candidate removed successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to remove saved candidate.', error: error.message });
  }
};

module.exports = {
  matchCandidates,
  saveShortlistedCandidate,
  getSavedCandidates,
  deleteSavedCandidate,
};
