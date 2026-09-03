/* ============================================================
   adminstration.jsx — Administration Panel
   ============================================================ */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiSettings, FiHome, FiLock, FiPlus, FiEdit3, FiTrash2, FiChevronRight, FiShield, FiUserCheck } from 'react-icons/fi';
import theme from '../theme/theme';

export default function Administration() {
  const navigate = useNavigate();

  return (
    <div
      className="space-y-10 min-h-screen -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8"
      style={{
        background: '#f8fefd',
      }}
    >
      {/* Page Header */}
      <div>
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{
            color: "#000", // Black
            fontFamily: theme.fonts.display,
          }}
        >
          Administration
        </h1>
        <p
          className="text-sm mt-1"
          style={{ color: "#000" }}
        >
          Manage organization, users, and permissions
        </p>
      </div>

      {/* Company Settings Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <FiHome size={24} style={{ color: theme.colors.accent }} />
          <h2 className="text-2xl font-semibold" style={{ color: theme.colors.textPrimary, fontFamily: theme.fonts.display }}>
            Company Settings
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Organization Card */}
          <div
            className="rounded-2xl p-6 group hover:scale-[1.02] transition-all duration-300 cursor-pointer"
            style={{
              background: theme.colors.glassBg,
              border: `1px solid ${theme.colors.glassBorder}`,
              backdropFilter: 'blur(12px)'
            }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: `rgba(${theme.colors.accentRgb}, 0.15)` }}>
              <FiHome size={28} style={{ color: theme.colors.accent }} />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>Organization</h3>
            <p className="text-sm mb-6" style={{ color: theme.colors.textSecondary }}>
              Manage company profile, logo, and general information
            </p>
            <button
              className="flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-2xl w-full justify-center transition-all hover:bg-white/10"
              style={{ border: `1px solid ${theme.colors.accent}`, color: theme.colors.accent }}
            >
              Manage Organization <FiChevronRight />
            </button>
          </div>

          {/* Branches Card */}
          <div
            className="rounded-2xl p-6 group hover:scale-[1.02] transition-all duration-300 cursor-pointer"
            style={{
              background: theme.colors.glassBg,
              border: `1px solid ${theme.colors.glassBorder}`,
              backdropFilter: 'blur(12px)'
            }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: `rgba(${theme.colors.indigoRgb}, 0.15)` }}>
              <FiUsers size={28} style={{ color: theme.colors.indigo }} />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>Branches</h3>
            <p className="text-sm mb-6" style={{ color: theme.colors.textSecondary }}>
              Add and manage multiple office locations
            </p>
            <button
              className="flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-2xl w-full justify-center transition-all hover:bg-white/10"
              style={{ border: `1px solid ${theme.colors.indigo}`, color: theme.colors.indigo }}
            >
              Manage Branches <FiChevronRight />
            </button>
          </div>

          {/* Company Card */}
          <div
            className="rounded-2xl p-6 group hover:scale-[1.02] transition-all duration-300 cursor-pointer"
            style={{
              background: theme.colors.glassBg,
              border: `1px solid ${theme.colors.glassBorder}`,
              backdropFilter: 'blur(12px)'
            }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: `rgba(${theme.colors.amberRgb}, 0.15)` }}>
              <FiSettings size={28} style={{ color: theme.colors.amber }} />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>Company</h3>
            <p className="text-sm mb-6" style={{ color: theme.colors.textSecondary }}>
              Legal details, GST, PAN, and compliance settings
            </p>
            <button
              className="flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-2xl w-full justify-center transition-all hover:bg-white/10"
              style={{ border: `1px solid ${theme.colors.amber}`, color: theme.colors.amber }}
            >
              Company Details <FiChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* Users & Permissions Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <FiLock size={24} style={{ color: theme.colors.indigo }} />
          <h2 className="text-2xl font-semibold" style={{ color: theme.colors.textPrimary, fontFamily: theme.fonts.display }}>
            Users &amp; Permissions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Role & Permissions Card */}
          <div
            className="rounded-2xl p-6 group hover:scale-[1.02] transition-all duration-300 cursor-pointer"
            style={{
              background: theme.colors.glassBg,
              border: `1px solid ${theme.colors.glassBorder}`,
              backdropFilter: 'blur(12px)'
            }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: `rgba(${theme.colors.indigoRgb}, 0.15)` }}>
              <FiShield size={28} style={{ color: theme.colors.indigo }} />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>Roles &amp; Permissions</h3>
            <p className="text-sm mb-6" style={{ color: theme.colors.textSecondary }}>
              Define roles, assign permissions, and manage access control across the organization
            </p>
            <button
              onClick={() => navigate('/roles-and-permissions')}
              className="flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-2xl w-full justify-center transition-all hover:bg-white/10"
              style={{ border: `1px solid ${theme.colors.indigo}`, color: theme.colors.indigo }}
            >
              Manage Roles <FiChevronRight />
            </button>
          </div>

          {/* User Management Card */}
          <div
            className="rounded-2xl p-6 group hover:scale-[1.02] transition-all duration-300 cursor-pointer"
            style={{
              background: theme.colors.glassBg,
              border: `1px solid ${theme.colors.glassBorder}`,
              backdropFilter: 'blur(12px)'
            }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: `rgba(${theme.colors.accentRgb}, 0.15)` }}>
              <FiUsers size={28} style={{ color: theme.colors.accent }} />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>User Management</h3>
            <p className="text-sm mb-6" style={{ color: theme.colors.textSecondary }}>
              Add, edit, and manage all users in the system
            </p>
            <button
              onClick={() => navigate('/user-access-management')}
              className="flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-2xl w-full justify-center transition-all hover:bg-white/10"
              style={{ border: `1px solid ${theme.colors.accent}`, color: theme.colors.accent }}
            >
              Manage Users <FiChevronRight />
            </button>
          </div>

          {/* Groups & Teams Card */}
          <div
            className="rounded-2xl p-6 group hover:scale-[1.02] transition-all duration-300 cursor-pointer"
            style={{
              background: theme.colors.glassBg,
              border: `1px solid ${theme.colors.glassBorder}`,
              backdropFilter: 'blur(12px)'
            }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: `rgba(${theme.colors.amberRgb}, 0.15)` }}>
              <FiUserCheck size={28} style={{ color: theme.colors.amber }} />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>Groups &amp; Teams</h3>
            <p className="text-sm mb-6" style={{ color: theme.colors.textSecondary }}>
              Create and manage permission groups and teams
            </p>
            <button
              onClick={() => navigate('/groups-management')}
              className="flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-2xl w-full justify-center transition-all hover:bg-white/10"
              style={{ border: `1px solid ${theme.colors.amber}`, color: theme.colors.amber }}
            >
              Manage Groups <FiChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}