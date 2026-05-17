const express = require('express');
const { shortlistCandidates, generateInterviewQuestions } = require('../controllers/aiController');

const router = express.Router();

// AI routes communicate with OpenRouter for shortlist intelligence and interview questions.
router.post('/shortlist', shortlistCandidates);
router.post('/questions', generateInterviewQuestions);

module.exports = router;
