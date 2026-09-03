// * ============================================================
//    BGVPlatform.jsx
//    ============================================================ */
import React from 'react';
import { FiDatabase } from 'react-icons/fi';
import theme from '../theme/theme';

export default function BGVPlatform() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold" style={{ color: theme.colors.textPrimary, fontFamily: theme.fonts.display }}>BGV Platform</h2>
        <button className="px-6 py-2.5 rounded-2xl text-sm font-medium flex items-center gap-2" style={{ background: `linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.accentHover})`, color: theme.colors.bgDeep }}>
          <FiDatabase size={16} /> New Verification Request
        </button>
      </div>

      {/* Recent Verifications */}
      <div className="rounded-2xl p-6" style={{ background: theme.colors.glassBg, border: `1px solid ${theme.colors.glassBorder}` }}>
        {/* Content same as previous version */}
      </div>
    </div>
  );
}