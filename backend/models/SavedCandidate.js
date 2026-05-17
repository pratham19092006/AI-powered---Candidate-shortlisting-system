const mongoose = require('mongoose');

// Tracks the candidates a recruiter has shortlisted and saved for later review.
const savedCandidateSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
      unique: true,
    },
    savedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model('SavedCandidate', savedCandidateSchema);
