/* ============================================================
   theme.js — Verifitech Design System (Royal Blue & Smoke White)
   Primary: Royal Blue | Neutral: Smoke White + Light Backgrounds
   color code for bg : f8fefd
   ============================================================ */

const theme = {
  colors: {
    // Backgrounds
    bgDeep: '#0A0F1C',           // Very dark navy (kept for reference / dark elements)
    bgPrimary: '#F8Fefd',        // Light — for any full-page surfaces
    bgSecondary: '#FFFFFF',      // Was dark slate — now white for panels on light bg
    bgTertiary: '#EAF6F2',       // Was dark grey — now soft mint-tinted grey

    // Royal Blue Palette
    royalBlue: '#1E3A8A',
    royalBlueDark: '#1E40AF',
    royalBlueDarker: '#1C2C5F',
    royalBlueLight: '#3B82F6',
    royalBlueHover: '#2563EB',

    // Smoke White / Light Accents
    smokeWhite: '#F8FAFC',
    smokeWhiteMuted: '#E2E8F0',
    smokeWhiteDark: '#CBD5E1',

    // Text — flipped for light background (was light-on-dark, now dark-on-light)
    textPrimary: '#0F172A',      // near-black navy, high contrast on mint
    textSecondary: '#475569',    // slate gray
    textMuted: '#64748B',        // muted slate
    textOnAccent: '#F8FAFC',     // for text sitting on royal blue / dark buttons

    // Borders — darker/subtler since bg is now light
    border: 'rgba(15, 23, 42, 0.10)',
    borderLight: 'rgba(15, 23, 42, 0.16)',
    borderFocus: '#2563EB',

    // Semantic
    success: '#16A34A',
    error: '#DC2626',
    warning: '#D97706',
    info: '#2563EB',

    // Glass Effect — was dark translucent navy, now light translucent white
    glassBg: 'rgba(255, 255, 255, 0.75)',
    glassBorder: 'rgba(15, 23, 42, 0.08)',

    // Header Specific (unchanged — header keeps its own dark royal-blue bg)
    headerBg: '#1E3A8A',
    headerBorder: '#1C2C5F',

    // Profile / Avatar (unchanged — sits on header)
    avatarBg: '#F8FAFC',
    avatarText: '#1E3A8A',

    // Tab States (unchanged — sit on header)
    tabActiveBg: 'rgba(255, 255, 255, 0.08)',
    tabActiveBorder: '#F8FAFC',
    tabActiveText: '#F8FAFC',

    tabInactiveText: '#94A3B8',
    tabInactiveHover: '#CBD5E1',

    // Others
    notificationDot: '#F8FAFC',
    logout: '#DC2626',
    logoutHover: 'rgba(220, 38, 38, 0.12)',
  },

  fonts: {
    display: "'Inter', system-ui, sans-serif",
    body: "'Inter', system-ui, sans-serif",
    mono: "'JetBrains Mono', monospace",
  },

  shadows: {
    sm: '0 2px 8px rgba(15, 23, 42, 0.06)',
    md: '0 4px 16px rgba(15, 23, 42, 0.08)',
    lg: '0 10px 30px rgba(15, 23, 42, 0.10)',
    glow: '0 0 20px rgba(59, 130, 246, 0.25)', // royal blue glow
    glass: '0 8px 32px rgba(15, 23, 42, 0.10)',
  },

  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    xxl: '24px',
    full: '9999px',
  },

  timing: {
    fast: '0.15s',
    normal: '0.25s',
    slow: '0.4s',
    entrance: '0.6s',
  },

  easing: {
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  backdrop: {
    blur: '20px',
    blurStrong: '30px',
  },
};

// Helper to easily access colors in components
export const COLORS = theme.colors;

export default theme;