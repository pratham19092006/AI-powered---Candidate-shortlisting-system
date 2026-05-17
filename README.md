<<<<<<< HEAD
# Candidate Shortlisting System

An AI-powered full stack recruitment dashboard built with the MERN stack and OpenRouter integration. Recruiters can add candidates, score them using skill matching and experience logic, ask OpenRouter to rank them intelligently, save shortlisted profiles, and generate interview questions.

## Features

- Add, update, delete, and view candidate profiles
- Basic matching using required skills, preferred skills, and minimum experience
- AI-based shortlisting using OpenRouter
- Match percentages with ranking labels
- AI explanations, strengths, weaknesses, and interview questions
- Save shortlisted candidates for later review
- Search, filter, sort, and paginate shortlisted candidates
- Export shortlist to PDF
- Modern responsive dashboard with charts and glassmorphism styling
- Friendly error states, loading states, and duplicate email protection

## Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- Axios
- React Router DOM
- Chart.js
- React Chart.js 2
- jsPDF

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- dotenv
- cors
- Axios

### AI
- OpenRouter API

## Project Structure

```text
candidate-shortlisting-system/
├── backend/
└── frontend/
```

## Installation

### 1. Install dependencies

From the project root:

```bash
npm install
```

If you prefer to install the apps separately, use the commands below.

Backend:

```bash
cd backend
npm init -y
npm install express mongoose cors dotenv axios
```

Frontend:

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install axios react-router-dom tailwindcss chart.js react-chartjs-2 jspdf
```

### 2. Configure environment variables

Create `backend/.env` with:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/candidate_shortlisting_system
OPENROUTER_API_KEY=your_openrouter_key_here
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free
FRONTEND_URL=http://localhost:5173
```

Optional frontend variable in `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Run the App

In two terminals, run:

```bash
npm run dev --workspace backend
npm run dev --workspace frontend
```

Or from the root, if you installed the workspace dependencies:

```bash
npm run dev
```

## API Endpoints

### Candidates

- `POST /api/candidates` - add a candidate
- `GET /api/candidates` - get all candidates
- `PUT /api/candidates/:id` - update a candidate
- `DELETE /api/candidates/:id` - delete a candidate

### Basic Matching and Saved Shortlists

- `POST /api/match` - rank candidates using deterministic matching
- `POST /api/match/save` - save a shortlisted candidate
- `GET /api/match/saved` - get saved candidates
- `DELETE /api/match/saved/:candidateId` - remove a saved candidate

### AI Features

- `POST /api/ai/shortlist` - AI rank candidates using OpenRouter
- `POST /api/ai/questions` - generate interview questions

## Example Request Payloads

### Add Candidate

```json
{
  "name": "Rahul Sharma",
  "email": "rahul@gmail.com",
  "skills": ["React", "Node.js", "MongoDB"],
  "experience": 2,
  "projects": "E-commerce website",
  "bio": "Frontend and backend developer"
}
```

### Basic Match

```json
{
  "requiredSkills": ["React", "Node.js"],
  "preferredSkills": ["MongoDB", "AWS"],
  "minExperience": 2
}
```

### AI Shortlist

```json
{
  "requiredSkills": ["React", "Node.js"],
  "preferredSkills": ["MongoDB", "AWS"],
  "minExperience": 2
}
```

## Screenshots

Add screenshots of the dashboard, add candidate form, matching screen, and saved shortlist here.

## Future Improvements

- Authentication and role-based access control
- Resume upload and parsing
- Advanced AI feedback history
- Email interview scheduling
- Analytics by department and job role
- Docker deployment
- Pagination directly from the backend

## Notes

- If OpenRouter is unavailable or the API key is missing, the backend falls back to deterministic shortlist generation so the app remains usable.
- MongoDB must be running locally or connected through a cloud URI for persistence.
=======
# AI-powered---Candidate-shortlisting-system
AI-powered candidate shortlisting system using MERN stack and OpenRouter. Recruiters can add candidates, match skills, rank profiles, save shortlists, generate interview questions, and view responsive analytics dashboard in one place.
>>>>>>> 7c4463256e9b51dd213dc301c0408aaf670d8c18
