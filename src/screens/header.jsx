/* ============================================================
   Header.jsx — Verifitech Shared Header (Redesigned — Verifitrust)
   - Logo loaded directly from https://verifitrust.com/assets/logo.png
   - Theme colors pulled from the logo:
       "Verifi" deep blue  → primary brand
       "trust" emerald green → secondary accent
       blue shield icon     → iconography
   - All backend logic preserved end-to-end:
       useAuth, useNavigate, useLocation, logout, vendor detection,
       ProfileOverlay, live datetime, tab routing on /mainlayout.
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

// ── Verifitrust logo (loaded from the live site) ──
const VERIFITRUST_LOGO_URL = 'https://verifitrust.com/assets/logo.png';

// ── "Verifitrust Blue + Green" theme ───────────────────────────
// Pulled directly from the logo: deep blue for "Verifi", emerald
// green for "trust", blue shield as the security iconography.
const THEME = {
  // Surfaces — clean white with a faint blue tint
  base: '#FFFFFF',
  baseAlt: '#F6F9FC',                    // very faint cool tint
  surface: '#F1F5FB',                    // soft blue-tinted chip
  surfaceStrong: '#E6EEF8',
  surfaceHover: '#DCE7F3',
  border: '#E2EAF4',                     // faint blue hairline
  borderStrong: 'rgba(30,64,175,0.30)',  // blue border for focus/active

  // Brand — Deep Blue (from "Verifi" in the logo)
  brand: '#1D4ED8',                      // blue-700
  brandDark: '#1E3A8A',                  // blue-900
  brandDeep: '#172554',                  // blue-950 (deep)
  brandSoft: 'rgba(29,78,216,0.10)',     // soft blue fill
  brandGlow: 'rgba(29,78,216,0.30)',     // blue glow

  // Secondary — Emerald Green (from "trust" in the logo)
  accent: '#10B981',                     // emerald-500
  accentDark: '#059669',                 // emerald-600
  accentSoft: 'rgba(16,185,129,0.12)',
  accentGlow: 'rgba(16,185,129,0.30)',

  // Text
  text: '#0F172A',                       // near-black
  textMuted: '#64748B',                  // slate-500
  textSubtle: '#94A3B8',                 // slate-400

  // Status
  danger: '#DC2626',
  dangerSoft: 'rgba(220,38,38,0.08)',
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
          boxShadow: '0 2px 16px rgba(29,78,216,0.06)',
        }}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Top Bar - Always Visible */}
          <div className="flex items-center justify-between h-20">
            {/* ── Brand: Verifitrust logo + tagline ── */}
            <div className="flex items-center gap-3">
              <img
                src={VERIFITRUST_LOGO_URL}
                alt="Verifitrust — Right People · Safer Future"
                className="h-10 sm:h-11 w-auto object-contain"
                style={{ maxHeight: 44 }}
                onError={(e) => {
                  // Graceful fallback: if the remote logo fails to load,
                  // hide the broken img so the layout doesn't break.
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="hidden lg:flex flex-col leading-none pl-3 border-l"
                   style={{ borderColor: THEME.border }}>
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.22em]"
                  style={{ color: THEME.brandDark }}
                >
                  Right People
                </span>
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.22em] mt-0.5"
                  style={{ color: THEME.accentDark }}
                >
                  Safer Future
                </span>
              </div>
            </div>

            {/* Search */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-6 lg:mx-8">
              <div
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100"
                style={{
                  background: THEME.surface,
                  borderColor: THEME.border,
                }}
              >
                <FiSearch size={18} style={{ color: THEME.brand }} />
                <input
                  type="text"
                  placeholder="Search candidates, clients, or reports..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  style={{ color: THEME.text }}
                />
                <kbd
                  className="hidden lg:inline px-1.5 py-0.5 text-[10px] rounded font-mono"
                  style={{
                    background: '#FFFFFF',
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
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
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
                    boxShadow: `0 0 0 2px ${THEME.base}`,
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
                      background: `linear-gradient(135deg, ${THEME.brand} 0%, ${THEME.brandDark} 100%)`,
                      color: '#FFFFFF',
                      boxShadow: `0 2px 8px ${THEME.brandGlow}`,
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
                        color: isActive ? THEME.brandDark : THEME.textMuted,
                      }}
                    >
                      <Icon
                        size={16}
                        style={{ color: isActive ? THEME.brand : THEME.textMuted }}
                      />
                      {tab.label}
                      {isActive && (
                        <span
                          className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                          style={{
                            background: `linear-gradient(90deg, ${THEME.brand} 0%, ${THEME.accent} 100%)`,
                            boxShadow: `0 0 12px ${THEME.brandGlow}`,
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
