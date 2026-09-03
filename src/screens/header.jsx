/* ============================================================
   Header.jsx — Verifitech Shared Header (Mobile Optimized)
   Updated with AuthContext + Real User Data + Logout + Profile Overlay
   Recolored to match teal/turquoise brand palette
   ============================================================ */
import React, { useState, useEffect } from 'react';
import {
  FiShield,
  FiSearch,
  FiBell,
  FiSettings,
  FiChevronDown,
  FiLogOut
} from 'react-icons/fi';
import verifiTechLogo from '../assets/verifitech-logoo.png';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import ProfileOverlay from '../screens/profileoverlay';
// theme import kept for anything else that still relies on it,
// but this header now uses its own local teal palette (see TEAL below)
import theme from '../theme/theme';

// ── Teal brand palette, matched to the marketing/landing page ──
// Light mint/teal gradient (same family as the hero background),
// so the header now sits on light shades instead of a solid dark teal.
const TEAL = {
  brand: '#14B8A6',        // bright teal accent (buttons, avatars, active-tab underline)
  headerGradient: 'linear-gradient(135deg, #F0FDFA 0%, #E6FFFA 35%, #CCFBF1 70%, #99F6E4 100%)',
  headerBgDark: 'rgba(255,255,255,0.55)', // soft white glass for search/pill backgrounds
  headerBorder: 'rgba(13,148,136,0.15)',  // faint teal hairline borders

  // ── Text color: Pure Black ──
  textColor: '#000000', // used for ALL text and icons in this header
};

const tabs = [
  { id: 'Dashboard', label: 'Dashboard', icon: FiShield },
  { id: 'Administration', label: 'Administration', icon: FiSettings },
  { id: 'BGVPlatform', label: 'BGV Platform', icon: FiShield },
];

// Live DateTime Hook
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

  // User Info
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
          background: TEAL.headerGradient,
          borderColor: TEAL.headerBorder,
          boxShadow: '0 1px 12px rgba(13,148,136,0.08)'
        }}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Top Bar - Always Visible */}
          <div className="flex items-center justify-between h-24">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img
                src={verifiTechLogo}
                alt="VerifiTech"
                className="min-h-[168px] min-w-[216px] h-40 w-56 object-contain"
                style={{ padding: '4px 0' }}
              />
            </div>

            {/* Search */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-6 lg:mx-8">
              <div
                className="w-full flex items-center gap-3 px-5 py-2.5 rounded-2xl border"
                style={{
                  background: TEAL.headerBgDark,
                  borderColor: TEAL.headerBorder
                }}
              >
                <FiSearch size={18} style={{ color: TEAL.textColor }} />
                <input
                  type="text"
                  placeholder="Search candidates, clients, or reports..."
                  className="w-full bg-transparent text-sm outline-none"
                  style={{ color: TEAL.textColor }}
                />
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Live DateTime */}
              <div
                className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 rounded-2xl text-xs sm:text-sm font-medium font-mono whitespace-nowrap border"
                style={{
                  background: TEAL.headerBgDark,
                  borderColor: TEAL.headerBorder,
                  color: TEAL.textColor,
                }}
              >
                {liveDateTime}
              </div>

              <button className="p-2.5 rounded-2xl hover:bg-black/5 relative transition-colors">
                <FiBell size={20} style={{ color: TEAL.textColor }} />
                <div
                  className="absolute top-1 right-1 w-2 h-2 rounded-full ring-2 ring-offset-2"
                  style={{
                    background: TEAL.brand,
                    boxShadow: '0 0 0 2px #F0FDFA',
                  }}
                />
              </button>

              <button className="p-2.5 rounded-2xl hover:bg-black/5 transition-colors">
                <FiSettings size={20} style={{ color: TEAL.textColor }} />
              </button>

              {/* User Profile */}
              <div className="flex items-center gap-2 pl-3 border-l"
                   style={{ borderColor: TEAL.headerBorder }}>
                <div
                  className="w-8 h-8 rounded-2xl flex items-center justify-center text-sm font-bold"
                  style={{ background: TEAL.brand, color: '#FFFFFF' }}
                >
                  {initials || "VT"}
                </div>

                <div className="hidden sm:block text-right">
                  <p
                    className="text-sm font-medium leading-none"
                    style={{ color: TEAL.textColor }}
                  >
                    {displayName}
                  </p>
                  {isVendor ? (
                    <p className="text-[10px] leading-tight" style={{ color: TEAL.textColor }}>
                      Vendor{displayEmail ? ` • ${displayEmail}` : ''}
                    </p>
                  ) : (
                    <p className="text-[10px]" style={{ color: TEAL.textColor }}>{displayRole}</p>
                  )}
                </div>

                {/* Chevron for Desktop */}
                <button
                  onClick={() => setShowProfile(true)}
                  className="hidden sm:block p-1 rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
                  title="View profile"
                >
                  <FiChevronDown size={16} style={{ color: TEAL.textColor }} />
                </button>

                {/* Mobile Avatar */}
                <button
                  onClick={() => setShowProfile(true)}
                  className="sm:hidden p-0 rounded-2xl cursor-pointer"
                  title="View profile"
                >
                  <div
                    className="w-8 h-8 rounded-2xl flex items-center justify-center text-sm font-bold"
                    style={{ background: TEAL.brand, color: '#FFFFFF' }}
                  >
                    {initials || "VT"}
                  </div>
                </button>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="ml-1 sm:ml-2 p-2 rounded-xl hover:bg-red-500/10 text-red-300 hover:text-red-400 transition-all cursor-pointer"
                  title="Logout"
                >
                  <FiLogOut size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs - Shown ONLY on /mainlayout */}
          {shouldShowTabs && (
            <div className="flex items-center border-t overflow-x-auto scrollbar-hide"
                 style={{ borderColor: TEAL.headerBorder }}>
              <nav className="flex w-full -mb-px min-w-max">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => onTabChange(tab.id)}
                      className={`flex items-center gap-2 px-5 sm:px-8 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200 ${
                        isActive
                          ? 'bg-black/5'
                          : 'hover:bg-black/5 border-transparent'
                      }`}
                      style={{ color: TEAL.textColor, borderColor: isActive ? TEAL.brand : 'transparent' }}
                    >
                      <Icon size={18} />
                      {tab.label}
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