import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { apiClient } from '../../api/client';
import {
  Users, Trash2, ShieldCheck, GraduationCap, AlertTriangle,
  Search, RefreshCw, UserX, CheckCircle2, XCircle, Crown
} from 'lucide-react';

interface UserRecord {
  _id: string;
  name: string;
  email: string;
  role: 'student_therapist' | 'supervisor' | 'admin';
  createdAt?: string;
}

const ROLE_META: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  student_therapist: { label: 'Student Therapist', color: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20', icon: GraduationCap },
  supervisor: { label: 'Supervisor', color: 'bg-violet-500/10 text-violet-300 border-violet-500/20', icon: ShieldCheck },
  admin: { label: 'Administrator', color: 'bg-amber-500/10 text-amber-300 border-amber-500/20', icon: Crown },
};

export const AdminUsersView: React.FC = () => {
  const { currentUser } = useApp();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);


  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/users');
      if (res.success && Array.isArray(res.data)) {
        setUsers(res.data);
      } else {
        showToast('error', res.error || 'Failed to load users');
      }
    } catch {
      showToast('error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const handleDelete = async (user: UserRecord) => {
    if (confirmId !== user._id) {
      setConfirmId(user._id);
      return;
    }
    setDeletingId(user._id);
    setConfirmId(null);
    try {
      const res = await apiClient.delete(`/users/${user._id}`);
      if (res.success) {
        setUsers(prev => prev.filter(u => u._id !== user._id));
        showToast('success', res.message || `${user.name} deleted successfully`);
      } else {
        showToast('error', res.error || 'Delete failed');
      }
    } catch {
      showToast('error', 'Network error during deletion');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = users.filter(u => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const counts = {
    all: users.length,
    student_therapist: users.filter(u => u.role === 'student_therapist').length,
    supervisor: users.filter(u => u.role === 'supervisor').length,
    admin: users.filter(u => u.role === 'admin').length,
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0D1117] min-h-full p-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[999] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border backdrop-blur-sm transition-all duration-300 ${
          toast.type === 'success'
            ? 'bg-emerald-900/90 border-emerald-500/30 text-emerald-200'
            : 'bg-red-900/90 border-red-500/30 text-red-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006A61] to-[#00897B] flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Account Management</h1>
            <p className="text-sm text-slate-400">Manage all registered users — delete trial accounts to keep data clean</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { key: 'all', label: 'Total Accounts', color: 'from-[#006A61] to-[#00897B]' },
          { key: 'student_therapist', label: 'Student Therapists', color: 'from-cyan-600 to-cyan-500' },
          { key: 'supervisor', label: 'Supervisors', color: 'from-violet-600 to-violet-500' },
          { key: 'admin', label: 'Admins', color: 'from-amber-600 to-amber-500' },
        ].map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setRoleFilter(key)}
            className={`rounded-xl p-4 text-left border transition-all ${
              roleFilter === key
                ? 'border-[#006A61]/60 bg-[#006A61]/10'
                : 'border-white/5 bg-white/3 hover:bg-white/5'
            }`}
          >
            <div className={`text-2xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
              {counts[key as keyof typeof counts]}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">{label}</div>
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#006A61]/50 focus:bg-white/8 transition-all"
          />
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-300 hover:bg-white/8 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-5">
        <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm text-amber-300 font-medium">Admin Only — Irreversible Action</p>
          <p className="text-xs text-amber-400/70 mt-0.5">
            Deleting an account permanently removes the user and ALL their associated cases, patients, and session data.
            Default demo accounts (Rahul Verma, etc.) come from the seed database and will remain unaffected.
          </p>
        </div>
      </div>

      {/* User Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-[#006A61] animate-spin" />
            <p className="text-sm text-slate-400">Loading accounts...</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3 text-center">
            <UserX className="w-10 h-10 text-slate-600" />
            <p className="text-slate-400">No users found matching your filters</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(user => {
            const roleMeta = ROLE_META[user.role] || ROLE_META.student_therapist;
            const RoleIcon = roleMeta.icon;
            const isSelf = user._id === (currentUser as any)?._id;
            const isAdmin = user.role === 'admin';
            const isConfirming = confirmId === user._id;
            const isDeleting = deletingId === user._id;

            return (
              <div
                key={user._id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  isConfirming
                    ? 'bg-red-900/20 border-red-500/30'
                    : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10'
                }`}
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#006A61] to-[#00897B] flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white truncate">{user.name}</span>
                    {isSelf && <span className="text-[10px] bg-[#006A61]/20 text-[#006A61] border border-[#006A61]/30 rounded-full px-2 py-0.5">You</span>}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>

                {/* Role Badge */}
                <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${roleMeta.color}`}>
                  <RoleIcon className="w-3 h-3" />
                  {roleMeta.label}
                </div>

                {/* Created at */}
                <div className="hidden md:block text-xs text-slate-600 shrink-0">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                </div>

                {/* Action */}
                {!isSelf && !isAdmin ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleDelete(user)}
                      disabled={isDeleting}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isConfirming
                          ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                      }`}
                    >
                      {isDeleting ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      {isDeleting ? 'Deleting...' : isConfirming ? 'Confirm?' : 'Delete'}
                    </button>
                    {isConfirming && (
                      <button
                        onClick={() => setConfirmId(null)}
                        className="text-xs text-slate-400 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-slate-600 shrink-0">{isSelf ? 'Current User' : 'Protected'}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
