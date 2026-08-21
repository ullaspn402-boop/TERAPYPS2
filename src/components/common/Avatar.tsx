import React from 'react';

interface AvatarProps {
  name: string;
  role?: 'student_therapist' | 'supervisor' | 'admin' | 'patient' | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  gender?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  role = 'patient',
  size = 'md',
  className = '',
  gender = 'Male',
}) => {
  const sizeMap = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const getRoleColors = () => {
    switch (role) {
      case 'supervisor':
        return { bg: 'bg-[#006A61]', text: 'text-[#86F2E4]', ring: 'ring-[#006A61]/20', border: 'border-[#006A61]' };
      case 'admin':
        return { bg: 'bg-indigo-600', text: 'text-indigo-100', ring: 'ring-indigo-500/20', border: 'border-indigo-600' };
      case 'student_therapist':
        return { bg: 'bg-teal-600', text: 'text-teal-100', ring: 'ring-teal-500/20', border: 'border-teal-600' };
      case 'patient':
      default:
        return { bg: 'bg-cyan-700', text: 'text-cyan-100', ring: 'ring-cyan-500/20', border: 'border-cyan-600' };
    }
  };

  const colors = getRoleColors();

  const getInitials = (n: string) => {
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  const isChild = name.toLowerCase().includes('rahul') || name.toLowerCase().includes('arav') || name.toLowerCase().includes('priya') || gender === 'Male';

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full font-bold shadow-xs ${colors.bg} ${colors.text} ${sizeMap[size]} ${className}`}
      title={`${name} (${role})`}
    >
      <svg
        className="w-3/5 h-3/5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {role === 'supervisor' ? (
          <>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </>
        ) : role === 'admin' ? (
          <>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </>
        ) : role === 'student_therapist' ? (
          <>
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </>
        ) : (
          <>
            <circle cx="12" cy="8" r="5" />
            <path d="M20 21a8 8 0 1 0-16 0" />
          </>
        )}
      </svg>
    </div>
  );
};
