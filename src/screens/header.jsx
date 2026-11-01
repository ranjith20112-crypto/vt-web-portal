/* ============================================================
   Header.jsx — Verifitech Shared Header (Redesigned)
   - Logo removed (text wordmark instead)
   - New UI theme: modern dark slate + indigo accent
   - All backend logic preserved:
       useAuth, useNavigate, useLocation, logout, vendor detection,
       ProfileOverlay, live datetime, tab routing on /mainlayout
   ============================================================ */
import React, { useState, useEffect } from 'react';
import {
  FiShield,
  FiSearch,
  FiBell,
  FiSettings,
  FiChevronDown,
  FiLogOut,
  FiGrid,
  FiSliders,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import ProfileOverlay from '../screens/profileoverlay';

// ── New theme: "Midnight Indigo" ──────────────────────────────
// Deep slate header with glass blur, indigo accent, soft white text.
const THEME = {
  base: '#0B1120',              // deep slate background
  baseAlt: '#111827',           // slightly lighter slate
  surface: 'rgba(255,255,255,0.06)', // glass surface for inputs/chips
  surfaceHover: 'rgba(255,255,255,0.10)',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(99,102,241,0.35)',
  accent: '#6366F1',            // indigo-500
  accentSoft: 'rgba(99,102,241,0.15)',
  accentGlow: 'rgba(99,102,241,0.45)',
  text: '#F8FAFC',              // near-white
  textMuted: '#94A3B8',         // slate-400
  danger: '#F87171',
  dangerSoft: 'rgba(248,113,113,0.12)',
};

const tabs = [
  { id: 'Dashboard', label: 'Dashboard', icon: FiGrid },
  { id: 'Administration', label: 'Administration', icon: FiSliders },
  { id: 'BGVPlatform', label: 'BGV Platform', icon: FiShield },
];

// Live DateTime Hook (unchanged logic)
function useLiveDateTime() {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatted = dateTime.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short'
  }) + ' • ' + dateTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  return formatted;
}

export default function Header({ activeTab, onTabChange, showNavigation = true }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const liveDateTime = useLiveDateTime();

  const [showProfile, setShowProfile] = useState(false);

  // Tabs visible ONLY on /mainlayout route.
  const isMainLayoutRoute = location.pathname === '/mainlayout';
  const shouldShowTabs = showNavigation && isMainLayoutRoute;

  // Detect vendor account
  const isVendor =
    user?.isVendor === true ||
    user?.accountType === 'Vendor' ||
    user?.userType === 'Vendor';

  // User Info (unchanged logic)
  const displayName = isVendor
    ? (user?.company || user?.fullName || user?.contact || 'Vendor')
    : (user?.fullName || user?.name || user?.displayName || 'Admin User');

  const displayRole = isVendor
    ? 'Vendor'
    : (user?.userType || user?.role || 'Super Admin');

  const displayEmail = isVendor
    ? (user?.portalEmail || user?.email || '')
    : (user?.email || '');

  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <header
        className="sticky top-0 z-50 backdrop-blur-xl border-b"
        style={{
          background: `linear-gradient(180deg, ${THEME.base} 0%, ${THEME.baseAlt} 100%)`,
          borderColor: THEME.border,
          boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
        }}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Top Bar - Always Visible */}
          <div className="flex items-center justify-between h-20">
            {/* ── Brand wordmark (logo removed) ── */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: THEME.accentSoft,
                  border: `1px solid ${THEME.borderStrong}`,
                  boxShadow: `0 0 20px ${THEME.accentGlow}`,
                }}
              >
                <FiShield size={20} style={{ color: THEME.accent }} />
              </div>
              <div className="hidden sm:flex flex-col leading-none">
                <span
                  className="text-lg font-bold tracking-tight"
                  style={{ color: THEME.text, letterSpacing: '-0.02em' }}
                >
                  Verifi<span style={{ color: THEME.accent }}>tech</span>
                </span>
                <span
                  className="text-[10px] font-medium uppercase tracking-[0.18em]"
                  style={{ color: THEME.textMuted }}
                >
                  Background Verification
                </span>
              </div>
            </div>

            {/* Search */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-6 lg:mx-8">
              <div
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all focus-within:border-indigo-400"
                style={{
                  background: THEME.surface,
                  borderColor: THEME.border,
                }}
              >
                <FiSearch size={18} style={{ color: THEME.textMuted }} />
                <input
                  type="text"
                  placeholder="Search candidates, clients, or reports..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
                  style={{ color: THEME.text }}
                />
                <kbd
                  className="hidden lg:inline px-1.5 py-0.5 text-[10px] rounded font-mono"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    color: THEME.textMuted,
                    border: `1px solid ${THEME.border}`,
                  }}
                >
                  ⌘K
                </kbd>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Live DateTime */}
              <div
                className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium font-mono whitespace-nowrap border"
                style={{
                  background: THEME.surface,
                  borderColor: THEME.border,
                  color: THEME.textMuted,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: THEME.accent,
                    boxShadow: `0 0 8px ${THEME.accentGlow}`,
                  }}
                />
                {liveDateTime}
              </div>

              {/* Notifications */}
              <button
                className="p-2.5 rounded-xl relative transition-all hover:scale-105"
                style={{ background: THEME.surface, border: `1px solid ${THEME.border}` }}
                title="Notifications"
              >
                <FiBell size={18} style={{ color: THEME.text }} />
                <span
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                  style={{
                    background: THEME.accent,
                    boxShadow: `0 0 0 2px ${THEME.baseAlt}`,
                  }}
                />
              </button>

              {/* Settings */}
              <button
                className="p-2.5 rounded-xl transition-all hover:scale-105"
                style={{ background: THEME.surface, border: `1px solid ${THEME.border}` }}
                title="Settings"
              >
                <FiSettings size={18} style={{ color: THEME.text }} />
              </button>

              {/* User Profile chip */}
              <div
                className="flex items-center gap-2 pl-2 sm:pl-3 pr-1 sm:pr-2 py-1.5 rounded-xl border"
                style={{
                  background: THEME.surface,
                  borderColor: THEME.border,
                }}
              >
                <button
                  onClick={() => setShowProfile(true)}
                  className="flex items-center gap-2 cursor-pointer"
                  title="View profile"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                    style={{
                      background: `linear-gradient(135deg, ${THEME.accent} 0%, #8B5CF6 100%)`,
                      color: '#FFFFFF',
                      boxShadow: `0 2px 8px ${THEME.accentGlow}`,
                    }}
                  >
                    {initials || 'VT'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p
                      className="text-sm font-medium leading-none"
                      style={{ color: THEME.text }}
                    >
                      {displayName}
                    </p>
                    {isVendor ? (
                      <p
                        className="text-[10px] leading-tight mt-0.5"
                        style={{ color: THEME.textMuted }}
                      >
                        Vendor{displayEmail ? ` • ${displayEmail}` : ''}
                      </p>
                    ) : (
                      <p
                        className="text-[10px] mt-0.5"
                        style={{ color: THEME.textMuted }}
                      >
                        {displayRole}
                      </p>
                    )}
                  </div>
                  <FiChevronDown
                    size={14}
                    className="hidden sm:block"
                    style={{ color: THEME.textMuted }}
                  />
                </button>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="ml-1 p-2 rounded-lg transition-all hover:scale-105 cursor-pointer"
                  style={{
                    background: THEME.dangerSoft,
                    color: THEME.danger,
                  }}
                  title="Logout"
                >
                  <FiLogOut size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs - Shown ONLY on /mainlayout */}
          {shouldShowTabs && (
            <div
              className="flex items-center border-t overflow-x-auto scrollbar-hide"
              style={{ borderColor: THEME.border }}
            >
              <nav className="flex w-full min-w-max">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => onTabChange(tab.id)}
                      className="flex items-center gap-2 px-5 sm:px-7 py-3.5 text-sm font-medium whitespace-nowrap transition-all duration-200 relative"
                      style={{
                        color: isActive ? THEME.text : THEME.textMuted,
                      }}
                    >
                      <Icon
                        size={16}
                        style={{ color: isActive ? THEME.accent : THEME.textMuted }}
                      />
                      {tab.label}
                      {isActive && (
                        <span
                          className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                          style={{
                            background: THEME.accent,
                            boxShadow: `0 0 12px ${THEME.accentGlow}`,
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Profile Overlay */}
      <ProfileOverlay
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        user={user}
      />
    </>
  );
}
