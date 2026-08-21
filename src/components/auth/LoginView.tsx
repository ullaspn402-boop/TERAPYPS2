import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { apiClient } from '../../api/client';
import { ShieldCheck, Activity, UserPlus, LogIn, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { getTranslation } from '../../i18n/translations';

type Tab = 'signin' | 'register';

type RoleOption = {
  value: string;
  label: string;
  icon: string;
  description: string;
};

const ROLES: RoleOption[] = [
  {
    value: 'student_therapist',
    label: 'Student Therapist',
    icon: '👩‍⚕️',
    description: 'Manage caseload, log sessions, speech practice',
  },
  {
    value: 'supervisor',
    label: 'Clinical Supervisor',
    icon: '👩‍🏫',
    description: 'Review plans, evaluate students, approve cases',
  },
  {
    value: 'admin',
    label: 'Administrator',
    icon: '🛡️',
    description: 'Institutional analytics, user management',
  },
];

const ROLE_PORTALS: Record<string, { label: string; color: string }> = {
  student_therapist: { label: 'Student Therapist Portal', color: 'text-teal-700 bg-teal-50 border-teal-200' },
  supervisor: { label: 'Supervisor Command Center', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  admin: { label: 'Administrator Dashboard', color: 'text-violet-700 bg-violet-50 border-violet-200' },
};

export const LoginView: React.FC = () => {
  const { login } = useApp();
  const storedLang = localStorage.getItem('speechcare_lang') || 'en';
  const t = getTranslation(storedLang);
  const [activeTab, setActiveTab] = useState<Tab>('signin');

  // Sign In state
  const [selectedRole, setSelectedRole] = useState<string>('student_therapist');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [signinError, setSigninError] = useState('');
  const [signinLoading, setSigninLoading] = useState(false);

  // Register state
  const [regRole, setRegRole] = useState<string>('student_therapist');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regShowPwd, setRegShowPwd] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSigninError('');
    setSigninLoading(true);
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      if (res.success && res.data) {
        // Backend is the authority — role comes from the token
        login(res.data.token, res.data);
      } else {
        setSigninError('Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      setSigninError(err.message || 'An error occurred during login.');
    } finally {
      setSigninLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');
    if (regPassword !== regConfirm) {
      setRegError('Passwords do not match.');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters.');
      return;
    }
    setRegLoading(true);
    try {
      const res = await apiClient.post('/auth/register', {
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        avatarType: 'neutral',
      });
      if (res.success && res.data) {
        login(res.data.token, res.data);
      } else {
        setRegError('Registration failed. Please try again.');
      }
    } catch (err: any) {
      setRegError(err.message || 'Registration failed. Email may already be registered.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleDemoLogin = (roleEmail: string, role: string) => {
    setEmail(roleEmail);
    setPassword('password123');
    setSelectedRole(role);
  };

  const currentPortal = ROLE_PORTALS[selectedRole] || ROLE_PORTALS['student_therapist'];
  const regPortal = ROLE_PORTALS[regRole] || ROLE_PORTALS['student_therapist'];

  return (
    <div className="min-h-screen bg-[#F7F9FB] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#006A61] p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 mb-4">
            <Activity className="w-6 h-6 text-[#86F2E4]" />
          </div>
          <h1 className="text-xl font-bold text-white mb-1">SpeechCare AI</h1>
          <p className="text-[#86F2E4] text-xs">Clinical Supervision Platform</p>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-slate-200">
          <button
            id="tab-signin"
            onClick={() => { setActiveTab('signin'); setSigninError(''); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-colors ${
              activeTab === 'signin'
                ? 'text-[#006A61] border-b-2 border-[#006A61] bg-[#E0F2F1]/30'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            {t.signIn}
          </button>
          <button
            id="tab-register"
            onClick={() => { setActiveTab('register'); setRegError(''); setRegSuccess(''); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-colors ${
              activeTab === 'register'
                ? 'text-[#006A61] border-b-2 border-[#006A61] bg-[#E0F2F1]/30'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            {t.createAccount}
          </button>
        </div>

        <div className="p-6">
          {/* ─── SIGN IN ─── */}
          {activeTab === 'signin' && (
            <>
              <h2 className="text-lg font-bold text-slate-800 mb-4">Sign In to Your Account</h2>

              {/* Portal badge */}
              <div className={`mb-4 px-3 py-2 rounded-xl border text-xs font-semibold ${currentPortal.color}`}>
                🔑 Signing into: {currentPortal.label}
              </div>

              {signinError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                  {signinError}
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-4">
                {/* Role Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Select Your Role
                  </label>
                  <div className="relative">
                    <select
                      id="signin-role"
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full px-3 py-2 pr-8 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006A61] focus:border-transparent appearance-none bg-white cursor-pointer"
                    >
                      {ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.icon} {r.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {ROLES.find((r) => r.value === selectedRole)?.description}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
                  <input
                    id="signin-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006A61] focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      id="signin-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-9 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006A61] focus:border-transparent"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  id="btn-signin"
                  type="submit"
                  disabled={signinLoading}
                  className="w-full py-2.5 bg-[#006A61] hover:bg-[#005049] text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {signinLoading ? 'Signing In...' : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Sign In
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 mb-3 text-center">Demo Accounts (Click to fill)</p>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    id="demo-student"
                    onClick={() => handleDemoLogin('ananya.sharma@speechcare.ai', 'student_therapist')}
                    type="button"
                    className="text-xs py-2 px-3 bg-slate-50 hover:bg-[#E0F2F1] hover:text-[#006A61] border border-slate-200 rounded-lg text-left transition-colors"
                  >
                    <strong className="block text-slate-700">👩‍⚕️ Student Therapist</strong>
                    <span className="text-slate-500">ananya.sharma@speechcare.ai</span>
                  </button>
                  <button
                    id="demo-supervisor"
                    onClick={() => handleDemoLogin('sarah.mehta@speechcare.ai', 'supervisor')}
                    type="button"
                    className="text-xs py-2 px-3 bg-slate-50 hover:bg-[#E0F2F1] hover:text-[#006A61] border border-slate-200 rounded-lg text-left transition-colors"
                  >
                    <strong className="block text-slate-700">👩‍🏫 Clinical Supervisor</strong>
                    <span className="text-slate-500">sarah.mehta@speechcare.ai</span>
                  </button>
                  <button
                    id="demo-admin"
                    onClick={() => handleDemoLogin('admin@speechcare.ai', 'admin')}
                    type="button"
                    className="text-xs py-2 px-3 bg-slate-50 hover:bg-[#E0F2F1] hover:text-[#006A61] border border-slate-200 rounded-lg text-left transition-colors"
                  >
                    <strong className="block text-slate-700">🛡️ Administrator</strong>
                    <span className="text-slate-500">admin@speechcare.ai</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ─── REGISTER ─── */}
          {activeTab === 'register' && (
            <>
              <h2 className="text-lg font-bold text-slate-800 mb-1">Create New Account</h2>
              <p className="text-xs text-slate-500 mb-4">
                Register your clinical role. Supervisors and Admins may need institutional approval.
              </p>

              {/* Portal badge */}
              <div className={`mb-4 px-3 py-2 rounded-xl border text-xs font-semibold ${regPortal.color}`}>
                🔑 Creating: {regPortal.label}
              </div>

              {regError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                  {regError}
                </div>
              )}
              {regSuccess && (
                <div className="mb-4 p-3 bg-teal-50 text-teal-700 text-xs rounded-xl border border-teal-200">
                  {regSuccess}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                {/* Role Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Select Your Role
                  </label>
                  <div className="relative">
                    <select
                      id="reg-role"
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                      className="w-full px-3 py-2 pr-8 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006A61] focus:border-transparent appearance-none bg-white cursor-pointer"
                    >
                      {ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.icon} {r.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {ROLES.find((r) => r.value === regRole)?.description}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name</label>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006A61] focus:border-transparent"
                    placeholder="e.g. Priya Nair"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006A61] focus:border-transparent"
                    placeholder="your.name@institute.ai"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      id="reg-password"
                      type={regShowPwd ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-9 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006A61] focus:border-transparent"
                      placeholder="Min. 6 characters"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setRegShowPwd(v => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {regShowPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Confirm Password</label>
                  <input
                    id="reg-confirm"
                    type="password"
                    required
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006A61] focus:border-transparent"
                    placeholder="Re-enter your password"
                  />
                </div>

                <button
                  id="btn-register"
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-2.5 bg-[#006A61] hover:bg-[#005049] text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {regLoading ? 'Creating Account...' : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Create Account & Sign In
                    </>
                  )}
                </button>
              </form>

              <p className="text-center mt-4 text-xs text-slate-500">
                Already have an account?{' '}
                <button
                  className="text-[#006A61] font-semibold hover:underline"
                  onClick={() => setActiveTab('signin')}
                >
                  Sign In
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
