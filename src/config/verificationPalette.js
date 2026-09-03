// src/config/verificationPalette.js
// Since check types are created dynamically (Masters -> Check Types),
// we can't hardcode a color/icon per type. Instead we assign one from
// a rotating palette based on a stable hash of the check type's _id,
// so the same check type always gets the same color across reloads.

import {
  FiMapPin, FiBook, FiBriefcase, FiShield, FiMessageSquare,
  FiCheckSquare, FiFileText, FiUsers, FiGlobe, FiFlag,
} from 'react-icons/fi';

export const PALETTE = [
  { color: '#06B6D4', icon: FiMapPin },
  { color: '#8B5CF6', icon: FiBook },
  { color: '#F59E0B', icon: FiBriefcase },
  { color: '#EF4444', icon: FiShield },
  { color: '#EC4899', icon: FiMessageSquare },
  { color: '#10B981', icon: FiCheckSquare },
  { color: '#3B82F6', icon: FiFileText },
  { color: '#F97316', icon: FiUsers },
  { color: '#14B8A6', icon: FiGlobe },
  { color: '#A855F7', icon: FiFlag },
];

// Simple stable string hash -> non-negative int
function hashString(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getCheckTypeVisual(checkTypeId) {
  const idx = hashString(checkTypeId) % PALETTE.length;
  return PALETTE[idx];
}