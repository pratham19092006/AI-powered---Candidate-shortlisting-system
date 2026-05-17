import { useState } from 'react';
import { createCandidate } from '../api/api';
import LoadingSpinner from '../components/LoadingSpinner';
import SkillKeywordInput from '../components/SkillKeywordInput';

const initialFormState = {
  name: '',
  email: '',
  skills: '',
  experience: '',
  projects: '',
  bio: '',
};

// Recruiters can quickly add a new candidate using a clean, validated form.
export default function AddCandidate() {
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const updateField = (field) => (event) => {
    setFormData((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const skillsArray = formData.skills
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);

    if (!formData.name.trim() || !formData.email.trim() || !skillsArray.length) {
      setFeedback({ type: 'error', message: 'Name, email, and at least one skill are required.' });
      return;
    }

    const experienceValue = Number(formData.experience);
    if (Number.isNaN(experienceValue) || experienceValue < 0) {
      setFeedback({ type: 'error', message: 'Experience cannot be negative.' });
      return;
    }

    try {
      setLoading(true);
      await createCandidate({
        ...formData,
        skills: skillsArray,
        experience: experienceValue,
      });
      setFormData(initialFormState);
      setFeedback({ type: 'success', message: 'Candidate profile added successfully.' });
    } catch (requestError) {
      setFeedback({
        type: 'error',
        message: requestError?.response?.data?.message || 'Unable to save the candidate profile.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <section>
        <h2 className="section-title">Add Candidate</h2>
        <p className="section-subtitle">Store candidate profiles so the matching engine and AI shortlist can evaluate them later.</p>
      </section>

      <form className="glass-panel space-y-5 p-6 sm:p-8" onSubmit={handleSubmit}>
        {feedback.message ? (
          <div
            className={`rounded-2xl border p-4 text-sm ${
              feedback.type === 'success'
                ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-100'
                : 'border-rose-400/20 bg-rose-500/10 text-rose-100'
            }`}
          >
            {feedback.message}
          </div>
        ) : null}

        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-200">Name</span>
            <input className="input-field" value={formData.name} onChange={updateField('name')} placeholder="Rahul Sharma" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-200">Email</span>
            <input className="input-field" type="email" value={formData.email} onChange={updateField('email')} placeholder="rahul@gmail.com" />
          </label>
          <div className="md:col-span-2">
            <SkillKeywordInput
              label="Skills"
              value={formData.skills}
              onChange={(nextValue) => setFormData((current) => ({ ...current, skills: nextValue }))}
              placeholder="React, Node.js, MongoDB"
            />
          </div>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-200">Experience (years)</span>
            <input
              className="input-field"
              type="number"
              min="0"
              value={formData.experience}
              onChange={updateField('experience')}
              placeholder="2"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-200">Projects</span>
            <input className="input-field" value={formData.projects} onChange={updateField('projects')} placeholder="E-commerce website" />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-slate-200">Bio</span>
            <textarea
              className="input-field min-h-[140px]"
              value={formData.bio}
              onChange={updateField('bio')}
              placeholder="Frontend and backend developer"
            />
          </label>
        </div>

        <div className="flex items-center justify-between gap-4 pt-2">
          <p className="text-xs text-slate-400">All fields are stored in MongoDB with validation and duplicate email protection.</p>
          <button type="submit" className="primary-button min-w-[180px]" disabled={loading}>
            {loading ? 'Saving...' : 'Save Candidate'}
          </button>
        </div>
      </form>

      {loading ? <LoadingSpinner label="Saving candidate profile..." /> : null}
    </div>
  );
}
