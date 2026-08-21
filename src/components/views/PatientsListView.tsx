import { Avatar } from '../common/Avatar';
import React, { useState } from 'react';
import { Search, Plus, ChevronRight, X, AlertCircle, ShieldCheck, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SupervisorSelectionModal } from '../therapist/SupervisorSelectionModal';
import { Patient } from '../../types';

const LANGUAGES = ['English', 'Telugu', 'Hindi', 'Kannada', 'Tamil', 'Malayalam', 'Gujarati', 'Bengali', 'Marathi'];
const TARGET_SOUNDS = ['/r/', '/s/', '/l/', '/k/', '/g/', '/sh/', '/th/', '/f/', '/v/', '/p/', '/b/', '/t/', '/d/', '/n/', '/m/'];
const DIAGNOSES = [
  'Functional Articulation Disorder',
  'Phonological Disorder',
  'Childhood Apraxia of Speech (CAS)',
  'Stuttering / Fluency Disorder',
  'Voice Disorder',
  'Language Delay',
  'Velar Fronting',
  'Interdental Lisping',
  'Lateral Lisp',
  'Developmental Language Disorder',
  'Other (specify in notes)',
];

interface NewPatientForm {
  name: string;
  age: string;
  gender: string;
  primaryLanguage: string;
  therapyLanguage: string;
  targetSound: string;
  diagnosis: string;
  initialNotes: string;
}

const emptyForm: NewPatientForm = {
  name: '',
  age: '',
  gender: 'Male',
  primaryLanguage: 'Telugu',
  therapyLanguage: 'English',
  targetSound: '/r/',
  diagnosis: 'Functional Articulation Disorder',
  initialNotes: '',
};

export const PatientsListView: React.FC = () => {
  const { patients, navigateToPatient, addPatient, deletePatient, setCurrentView, role, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [soundFilter, setSoundFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<NewPatientForm>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [selectedPatientForSupervisor, setSelectedPatientForSupervisor] = useState<Patient | null>(null);

  const filtered = patients.filter((p) => {
    // ── Student Therapist Isolation: Show only assigned/registered patients ──
    if (role === 'student_therapist' && currentUser) {
      const therapistName = (currentUser.name || '').toLowerCase().trim();
      const patientTherapistName = (p.assignedTherapist?.name || '').toLowerCase().trim();
      const isAssignedToMe =
        patientTherapistName.includes(therapistName) ||
        therapistName.includes(patientTherapistName) ||
        p.assignedTherapist?.id === currentUser.name.toLowerCase().replace(/\s+/g, '-');
      if (!isAssignedToMe) return false;
    }

    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSound = soundFilter === 'All' || p.targetSound === soundFilter;
    return matchSearch && matchSound;
  });

  const handleOpenModal = () => {
    setForm(emptyForm);
    setSubmitError('');
    setSubmitSuccess('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSubmitError('');
    setSubmitSuccess('');
  };

  const handleChange = (field: keyof NewPatientForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!form.name.trim()) { setSubmitError('Patient name is required.'); return; }
    if (!form.age || isNaN(Number(form.age)) || Number(form.age) < 1 || Number(form.age) > 120) {
      setSubmitError('Please enter a valid age (1–120).'); return;
    }
    setIsSubmitting(true);
    try {
      await addPatient({
        name: form.name.trim(),
        age: Number(form.age),
        gender: form.gender,
        primaryLanguage: form.primaryLanguage,
        therapyLanguage: form.therapyLanguage,
        targetSound: form.targetSound,
        diagnosis: form.diagnosis,
        initialNotes: form.initialNotes.trim(),
      });
      setSubmitSuccess(`✅ Patient "${form.name}" registered successfully! Status: Pending Allocation.`);
      setForm(emptyForm);
      setTimeout(() => handleCloseModal(), 1800);
    } catch (err: any) {
      setSubmitError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusColors: Record<string, string> = {
    'Active': 'bg-teal-100 text-teal-700',
    'Pending Allocation': 'bg-amber-100 text-amber-700',
    'Review Needed': 'bg-orange-100 text-orange-700',
    'Milestone Due': 'bg-blue-100 text-blue-700',
    'Completed': 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {role === 'supervisor' ? 'Supervised Cases' : 'My Assigned Cases'}
          </h2>
          <p className="text-xs text-slate-500">
            {role === 'supervisor'
              ? `Active clinical cases under your supervision — ${patients.length} total.`
              : `All active patient cases — ${patients.length} total.`}
          </p>
        </div>

        {role === 'student_therapist' && (
          <button
            id="btn-new-patient"
            onClick={handleOpenModal}
            className="px-3.5 py-2 bg-[#006A61] hover:bg-[#005049] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Patient Registration</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-xs">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter by patient name, case ID, diagnosis..."
            className="w-full bg-transparent outline-none text-slate-800 placeholder-slate-400"
          />
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <span className="text-slate-500 font-medium">Target Sound:</span>
          <select
            value={soundFilter}
            onChange={(e) => setSoundFilter(e.target.value)}
            className="p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-semibold"
          >
            <option value="All">All Sounds</option>
            {TARGET_SOUNDS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Patient Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-400 text-sm">
            No patients match your search criteria.
          </div>
        )}
        {filtered.map((p) => (
          <div
            key={p.id}
            id={`patient-card-${p.id}`}
            onClick={() => navigateToPatient(p.id, 'overview')}
            className="bg-white rounded-xl p-5 border border-slate-200 hover:border-[#006A61] transition-all cursor-pointer shadow-xs space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={p.name} role="patient" gender={p.gender || 'neutral'} size="md" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{p.name}</h3>
                    <span className="text-[11px] font-mono text-slate-400">
                      {p.caseId} • {p.age}y {p.gender?.[0] || '?'}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#006A61] bg-[#E0F2F1] px-2 py-0.5 rounded">
                  {p.targetSound}
                </span>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{p.diagnosis}</p>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${statusColors[p.status] || 'bg-slate-100 text-slate-500'}`}>
                    {p.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Level:</span>
                  <strong className="text-slate-800">{p.currentLevel}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Therapy Language:</span>
                  <span className="text-slate-700">{p.therapyLanguage}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-mono">Progress:</span>
                <span className="font-bold text-[#006A61]">{p.progressPct}%</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Therapist action: Select Supervisor */}
                {role === 'student_therapist' && (!p.supervisor || p.status === 'Pending Allocation' || (p.status as string) === 'PENDING_SUPERVISOR_REVIEW') && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPatientForSupervisor(p);
                    }}
                    className="px-2.5 py-1 bg-[#006A61] hover:bg-[#005049] text-white rounded-lg font-bold text-[10px] shadow-xs flex items-center gap-1"
                  >
                    <ShieldCheck className="w-3 h-3 text-[#86F2E4]" />
                    <span>Select Supervisor</span>
                  </button>
                )}

                {/* Admin action: Delete Student Case */}
                {role === 'admin' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Are you sure you want to delete registered student "${p.name}" (${p.caseId})?`)) {
                        deletePatient(p.id);
                      }
                    }}
                    className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg font-bold text-[10px] shadow-xs flex items-center gap-1"
                    title="Delete Registered Student Account"
                  >
                    <Trash2 className="w-3 h-3 text-red-600" />
                    <span>Delete</span>
                  </button>
                )}

                <span className="text-[#006A61] font-semibold flex items-center gap-1">
                  <span>View Record</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Supervisor Selection Modal ─── */}
      {selectedPatientForSupervisor && (
        <SupervisorSelectionModal
          patient={selectedPatientForSupervisor}
          isOpen={!!selectedPatientForSupervisor}
          onClose={() => setSelectedPatientForSupervisor(null)}
          onSelectSuccess={(supervisorName) => {
            // Update patient's local status display
            selectedPatientForSupervisor.status = 'Pending Allocation';
            selectedPatientForSupervisor.supervisor = {
              id: 'temp',
              name: supervisorName,
              title: 'Supervising SLP',
            };
          }}
        />
      )}

      {/* ─── New Patient Registration Modal ─── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-[#006A61] rounded-t-2xl">
              <div>
                <h3 className="text-white font-bold text-base">New Patient Registration</h3>
                <p className="text-[#86F2E4] text-xs mt-0.5">Register a new speech therapy case under your ownership</p>
              </div>
              <button
                id="modal-close"
                onClick={handleCloseModal}
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {submitError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {submitError}
                </div>
              )}
              {submitSuccess && (
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-700 font-semibold">
                  {submitSuccess}
                </div>
              )}

              {/* Name + Age */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Patient Full Name *</label>
                  <input
                    id="reg-patient-name"
                    type="text"
                    required
                    value={form.name}
                    onChange={e => handleChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006A61]"
                    placeholder="e.g. Rahul Verma"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Age *</label>
                  <input
                    id="reg-patient-age"
                    type="number"
                    required
                    min="1"
                    max="120"
                    value={form.age}
                    onChange={e => handleChange('age', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006A61]"
                    placeholder="e.g. 9"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Gender</label>
                <div className="flex gap-2">
                  {['Male', 'Female', 'Other'].map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => handleChange('gender', g)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                        form.gender === g
                          ? 'bg-[#006A61] text-white border-[#006A61]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary Language + Therapy Language */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Primary Language</label>
                  <select
                    value={form.primaryLanguage}
                    onChange={e => handleChange('primaryLanguage', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006A61]"
                  >
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Therapy Language</label>
                  <select
                    value={form.therapyLanguage}
                    onChange={e => handleChange('therapyLanguage', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006A61]"
                  >
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              {/* Target Sound */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Primary Target Sound</label>
                <select
                  value={form.targetSound}
                  onChange={e => handleChange('targetSound', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006A61]"
                >
                  {TARGET_SOUNDS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Diagnosis */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Diagnosis / Clinical Category</label>
                <select
                  value={form.diagnosis}
                  onChange={e => handleChange('diagnosis', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006A61]"
                >
                  {DIAGNOSES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              {/* Initial Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Initial Screening Notes <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={form.initialNotes}
                  onChange={e => handleChange('initialNotes', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006A61] resize-none"
                  placeholder="Describe initial presentation, oral motor exam findings, referral reason..."
                />
              </div>

              <div className="bg-[#E0F2F1] border border-[#006A61]/30 rounded-xl p-3 text-[11px] text-[#006A61] space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Case Ownership & Supervisor Workflow</span>
                </div>
                <p className="text-slate-700">
                  After registration, this patient/case will belong to your therapist account. You will select a Supervising SLP to submit the case for review.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-2.5 border border-slate-300 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="btn-register-patient"
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-[#006A61] hover:bg-[#005049] text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? 'Registering...' : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      Register Patient
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
