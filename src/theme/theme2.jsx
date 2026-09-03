/* ============================================================
   theme.js — Verifitech Design System (Royal Blue & Smoke White)
   Primary: Royal Blue | Neutral: Smoke White + Dark Backgrounds
   ============================================================ */

const theme = {
  colors: {
    // Backgrounds
    bgDeep: '#0A0F1C',           // Very dark navy
    bgPrimary: '#111827',        // Dark slate
    bgSecondary: '#1F2937',
    bgTertiary: '#374151',

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

    // Text
    textPrimary: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
    textOnAccent: '#0F172A',

    // Borders
    border: 'rgba(148, 163, 184, 0.15)',
    borderLight: 'rgba(148, 163, 184, 0.25)',
    borderFocus: '#60A5FA',

    // Semantic
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#60A5FA',

    // Glass Effect
    glassBg: 'rgba(15, 23, 42, 0.85)',
    glassBorder: 'rgba(148, 163, 184, 0.12)',

    // Header Specific
    headerBg: '#1E3A8A',
    headerBorder: '#1C2C5F',

    // Profile / Avatar
    avatarBg: '#F8FAFC',
    avatarText: '#1E3A8A',

    // Tab States
    tabActiveBg: 'rgba(255, 255, 255, 0.08)',
    tabActiveBorder: '#F8FAFC',
    tabActiveText: '#F8FAFC',

    tabInactiveText: '#94A3B8',
    tabInactiveHover: '#CBD5E1',

    // Others
    notificationDot: '#F8FAFC',
    logout: '#EF4444',
    logoutHover: 'rgba(239, 68, 68, 0.15)',
  },

  fonts: {
    display: "'Inter', system-ui, sans-serif",
    body: "'Inter', system-ui, sans-serif",
    mono: "'JetBrains Mono', monospace",
  },

  shadows: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.3)',
    md: '0 4px 16px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 30px rgba(0, 0, 0, 0.5)',
    glow: '0 0 20px rgba(59, 130, 246, 0.3)', // royal blue glow
    glass: '0 8px 32px rgba(0, 0, 0, 0.5)',
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