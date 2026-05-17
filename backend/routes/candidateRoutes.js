const express = require('express');
const {
  createCandidate,
  getAllCandidates,
  updateCandidate,
  deleteCandidate,
} = require('../controllers/candidateController');

const router = express.Router();

// Candidate CRUD routes used by the recruiter dashboard.
router.route('/').post(createCandidate).get(getAllCandidates);
router.route('/:id').put(updateCandidate).delete(deleteCandidate);

module.exports = router;
