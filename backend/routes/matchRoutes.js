const express = require('express');
const {
  matchCandidates,
  saveShortlistedCandidate,
  getSavedCandidates,
  deleteSavedCandidate,
} = require('../controllers/matchController');

const router = express.Router();

// Matching routes power both basic scoring and saved shortlist management.
router.post('/', matchCandidates);
router.post('/save', saveShortlistedCandidate);
router.get('/saved', getSavedCandidates);
router.delete('/saved/:candidateId', deleteSavedCandidate);

module.exports = router;
