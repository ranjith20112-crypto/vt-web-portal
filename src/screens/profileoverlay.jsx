/* ============================================================
   ProfileOverlay.jsx — Verifitech Profile Screen
   LANDSCAPE RECTANGLE DESIGN (LIGHT THEME)
   Two-column: Left sidebar (identity) + Right scrollable (details)
   ============================================================ */

import React, { useEffect, useRef } from 'react';
import {
  FiX,
  FiUser,
  FiMail,
  FiPhone,
  FiShield,
  FiBriefcase,
  FiMapPin,
  FiCalendar,
  FiHash,
  FiGlobe,
  FiHome,
  FiFileText,
  FiStar,
  FiCheckCircle,
  FiClock,
  FiPackage,
  FiUsers,
  FiLayers,
  FiLogOut,
  FiChevronRight,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/* ───────── Badge ───────── */
function Badge({ children, color = 'accent', icon: Icon }) {
  const colorMap = {
    accent: {
      bg: 'rgba(59, 130, 246, 0.1)',
      border: 'rgba(59, 130, 246, 0.25)',
      text: '#2563eb',
    },
    amber: {
      bg: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.25)',
      text: '#d97706',
    },
    indigo: {
      bg: 'rgba(99, 102, 241, 0.1)',
      border: 'rgba(99, 102, 241, 0.25)',
      text: '#4f46e5',
    },
    success: {
      bg: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(16, 185, 129, 0.25)',
      text: '#10b981',
    },
    red: {
      bg: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.25)',
      text: '#ef4444',
    },
  };
  const c = colorMap[color] || colorMap.accent;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.text,
      }}
    >
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
}

/* ───────── Info Row (compact) ───────── */
function InfoRow({ icon: Icon, label, value, mono = false }) {
  if (!value && value !== 0 && value !== false) return null;

  return (
    <div
      className="flex items-center gap-3 py-2.5 px-3 rounded-xl transition-colors duration-200 group"
      style={{ background: 'transparent' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.02)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
        style={{
          background: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.15)',
        }}
      >
        <Icon size={13} style={{ color: '#2563eb' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-[10px] font-semibold uppercase tracking-wider leading-none mb-1"
          style={{ color: '#64748b' }}
        >
          {label}
        </p>
        <p
          className="text-[13px] font-medium truncate leading-tight"
          style={{
            color: '#0f172a',
            fontFamily: mono
              ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
              : 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          {value}
        </p>
      </div>
      <FiChevronRight
        size={12}
        className="opacity-0 group-hover:opacity-40 transition-opacity flex-shrink-0"
        style={{ color: '#94a3b8' }}
      />
    </div>
  );
}

/* ───────── Section Header ───────── */
function SectionHeader({ title, icon: Icon, count }) {
  return (
    <div className="flex items-center gap-2 pt-4 pb-1.5 px-1">
      {Icon && (
        <div
          className="w-5 h-5 rounded flex items-center justify-center"
          style={{ background: 'rgba(59, 130, 246, 0.1)' }}
        >
          <Icon size={10} style={{ color: '#2563eb' }} />
        </div>
      )}
      <h3
        className="text-[10px] font-bold uppercase tracking-[0.15em] flex-1"
        style={{ color: '#475569', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
      >
        {title}
      </h3>
      {count !== undefined && (
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded"
          style={{
            background: 'rgba(0,0,0,0.05)',
            color: '#64748b',
            fontFamily: 'ui-monospace, monospace',
          }}
        >
          {count}
        </span>
      )}
      <div
        className="flex-1 h-px max-w-[60px]"
        style={{
          background: 'linear-gradient(to right, rgba(59,130,246,0.2), transparent)',
        }}
      />
    </div>
  );
}

/* ───────── Mini Stat (for left sidebar) ───────── */
function MiniStat({ icon: Icon, label, value, color = 'accent' }) {
  const colorMap = {
    accent: '#2563eb',
    amber: '#d97706',
    indigo: '#4f46e5',
    success: '#10b981',
  };
  const c = colorMap[color] || colorMap.accent;

  return (
    <div
      className="flex-1 p-2.5 rounded-xl text-center transition-all duration-200 hover:scale-[1.02]"
      style={{
        background: 'rgba(255,255,255,0.7)',
        border: '1px solid rgba(0,0,0,0.08)',
      }}
    >
      <div className="flex justify-center mb-1.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: `${c}15`, border: `1px solid ${c}25` }}
        >
          <Icon size={13} style={{ color: c }} />
        </div>
      </div>
      <p
        className="text-xs font-bold truncate"
        style={{ color: '#0f172a' }}
      >
        {value || '—'}
      </p>
      <p className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: '#64748b' }}>
        {label}
      </p>
    </div>
  );
}

/* ============================================================
   MAIN PROFILE OVERLAY — LANDSCAPE RECTANGLE (LIGHT)
   ============================================================ */
export default function ProfileOverlay({ isOpen, onClose, user }) {
  const overlayRef = useRef(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e) => {
    if (overlayRef.current && e.target === overlayRef.current) {
      onClose();
    }
  };

  const handleLogout = () => {
    onClose();
    logout();
    navigate('/');
  };

  if (!isOpen || !user) return null;

  const isClient = user.role === 'Client';

  const displayName =
    user.fullName || user.clientName || user.name || user.displayName || 'Unknown User';
  const displayEmail = user.email || user.portalEmail || '—';
  const displayRole = user.userType || user.role || '—';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const fmtDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return d;
    }
  };

  const countFields = (fields) => fields.filter((f) => f).length;

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* LANDSCAPE RECTANGLE CONTAINER - LIGHT THEME */}
      <div
        className="relative w-full rounded-2xl overflow-hidden flex"
        style={{
          maxWidth: '860px',
          height: '520px',
          margin: '24px',
          background: '#f8fefd',
          border: '1px solid #e2e8f0',
          boxShadow: `
            0 25px 80px -12px rgba(0,0,0,0.15),
            0 0 0 1px rgba(59,130,246,0.1)
          `,
          animation: 'landscapeSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-px z-10"
          style={{
            background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)',
          }}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-30 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 hover:bg-black/5"
          style={{
            background: 'rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.08)',
            color: '#64748b',
          }}
          title="Close"
        >
          <FiX size={14} />
        </button>

        {/* LEFT COLUMN — Identity Sidebar */}
        <div
          className="relative flex-shrink-0 flex flex-col"
          style={{
            width: '280px',
            background: 'linear-gradient(180deg, #f0f9ff 0%, #f8fafc 100%)',
            borderRight: '1px solid #e2e8f0',
          }}
        >
          {/* Avatar area */}
          <div className="relative px-5 pt-7 pb-5">
            <div className="flex justify-center mb-4">
              <div className="relative">
                {user.companyLogo ? (
                  <img
                    src={user.companyLogo}
                    alt={displayName}
                    className="w-[72px] h-[72px] rounded-2xl object-cover"
                    style={{
                      border: '2px solid #bfdbfe',
                      boxShadow: '0 0 40px rgba(59,130,246,0.15)',
                    }}
                  />
                ) : (
                  <div
                    className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center text-2xl font-bold"
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                      color: '#ffffff',
                      border: '2px solid #bfdbfe',
                      boxShadow: '0 0 40px rgba(59,130,246,0.2)',
                    }}
                  >
                    {initials}
                  </div>
                )}
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2"
                  style={{
                    background: user.isActive !== false ? '#10b981' : '#f59e0b',
                    borderColor: '#f8fefd',
                  }}
                />
              </div>
            </div>

            {/* Name + Email */}
            <div className="text-center">
              <h2
                className="text-base font-bold truncate px-2"
                style={{ color: '#0f172a' }}
              >
                {displayName}
              </h2>
              <p
                className="text-xs truncate mt-1 px-2"
                style={{ color: '#64748b' }}
              >
                {displayEmail}
              </p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap justify-center gap-1.5 mt-3">
              <Badge color="accent" icon={FiShield}>
                {displayRole}
              </Badge>
              {user.isActive !== false ? (
                <Badge color="success" icon={FiCheckCircle}>
                  Active
                </Badge>
              ) : (
                <Badge color="amber" icon={FiClock}>
                  Inactive
                </Badge>
              )}
            </div>
          </div>

          {/* Mini Stats */}
          <div className="px-4 pb-4">
            {!isClient ? (
              <div className="flex gap-2">
                <MiniStat icon={FiBriefcase} label="Role" value={user.role} color="accent" />
                <MiniStat icon={FiLayers} label="Dept" value={user.department} color="indigo" />
                <MiniStat icon={FiUsers} label="Team" value={user.team} color="amber" />
              </div>
            ) : (
              <div className="flex gap-2">
                <MiniStat icon={FiPackage} label="Pkg" value={user.assignedPackage} color="accent" />
                <MiniStat icon={FiStar} label="Cat" value={user.category} color="amber" />
                <MiniStat icon={FiFileText} label="Bill" value={user.billingCycle} color="indigo" />
              </div>
            )}
          </div>

          <div
            className="mx-5 h-px"
            style={{ background: 'rgba(148, 163, 184, 0.2)' }}
          />

          {/* Quick info */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
            {!isClient ? (
              <>
                <InfoRow icon={FiHash} label="Code" value={user.employeeCode} mono />
                <InfoRow icon={FiPhone} label="Phone" value={user.phone} />
                <InfoRow icon={FiCalendar} label="Joined" value={fmtDate(user.createdAt)} />
              </>
            ) : (
              <>
                <InfoRow icon={FiHash} label="Code" value={user.clientCode} mono />
                <InfoRow icon={FiBriefcase} label="Industry" value={user.industry} />
                <InfoRow icon={FiPhone} label="Phone" value={user.contactPhone} />
                <InfoRow icon={FiMapPin} label="City" value={user.city} />
                <InfoRow icon={FiCalendar} label="Since" value={fmtDate(user.createdAt)} />
              </>
            )}
          </div>

          {/* Logout */}
          <div className="p-4 pt-2" style={{ borderTop: '1px solid #e2e8f0' }}>
            <button
              onClick={handleLogout}
              className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
              }}
            >
              <FiLogOut size={13} />
              Sign Out
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN — Scrollable Details */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          <div
            className="flex-shrink-0 px-6 py-3.5 flex items-center gap-3"
            style={{ borderBottom: '1px solid #e2e8f0' }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
              }}
            >
              <FiUser size={13} style={{ color: '#2563eb' }} />
            </div>
            <div>
              <h3
                className="text-sm font-bold leading-none"
                style={{ color: '#0f172a' }}
              >
                {isClient ? 'Client Profile' : 'Employee Profile'}
              </h3>
              <p className="text-[10px] mt-0.5" style={{ color: '#64748b' }}>
                {isClient ? 'Company & contract details' : 'Personal & organization details'}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-3 custom-scrollbar">
            {/* Employee Content */}
            {!isClient && (
              <>
                <SectionHeader
                  title="Personal Information"
                  icon={FiUser}
                  count={countFields([user.employeeCode, user.email, user.phone, user.role, user.userType])}
                />
                <InfoRow icon={FiHash} label="Employee Code" value={user.employeeCode} mono />
                <InfoRow icon={FiMail} label="Email Address" value={user.email} />
                <InfoRow icon={FiPhone} label="Phone Number" value={user.phone} />
                <InfoRow icon={FiBriefcase} label="Role" value={user.role} />
                <InfoRow icon={FiShield} label="User Type" value={user.userType} />

                {(user.department || user.team) && (
                  <>
                    <SectionHeader title="Organization" icon={FiHome} count={countFields([user.department, user.team])} />
                    <InfoRow icon={FiLayers} label="Department" value={user.department} />
                    <InfoRow icon={FiUsers} label="Team" value={user.team} />
                  </>
                )}

                <SectionHeader title="Account" icon={FiClock} count={2} />
                <InfoRow icon={FiCalendar} label="Created On" value={fmtDate(user.createdAt)} />
                <InfoRow icon={FiClock} label="Last Updated" value={fmtDate(user.updatedAt)} />
              </>
            )}

            {/* Client Content */}
            {isClient && (
              <>
                <SectionHeader
                  title="Company Information"
                  icon={FiHome}
                  count={countFields([user.clientCode, user.companyName, user.displayName, user.industry, user.website, user.category, user.companyDate])}
                />
                <InfoRow icon={FiHash} label="Client Code" value={user.clientCode} mono />
                <InfoRow icon={FiHome} label="Company Name" value={user.companyName} />
                <InfoRow icon={FiUser} label="Display Name" value={user.displayName} />
                <InfoRow icon={FiBriefcase} label="Industry" value={user.industry} />
                <InfoRow icon={FiGlobe} label="Website" value={user.website} />
                <InfoRow icon={FiStar} label="Category" value={user.category} />
                <InfoRow icon={FiCalendar} label="Company Date" value={fmtDate(user.companyDate)} />

                <SectionHeader
                  title="Contact Details"
                  icon={FiPhone}
                  count={countFields([user.contactName, user.contactEmail, user.contactPhone, user.landline])}
                />
                <InfoRow icon={FiUser} label="Contact Name" value={user.contactName} />
                <InfoRow icon={FiMail} label="Contact Email" value={user.contactEmail} />
                <InfoRow icon={FiPhone} label="Contact Phone" value={user.contactPhone} />
                <InfoRow icon={FiPhone} label="Landline" value={user.landline} />

                <SectionHeader
                  title="Address"
                  icon={FiMapPin}
                  count={countFields([user.addressLine1, user.addressLine2, user.city, user.state, user.pinCode, user.country])}
                />
                <InfoRow icon={FiMapPin} label="Address Line 1" value={user.addressLine1} />
                <InfoRow icon={FiMapPin} label="Address Line 2" value={user.addressLine2} />
                <InfoRow icon={FiHome} label="City" value={user.city} />
                <InfoRow icon={FiMapPin} label="State" value={user.state} />
                <InfoRow icon={FiHash} label="Pin Code" value={user.pinCode} mono />
                <InfoRow icon={FiGlobe} label="Country" value={user.country} />

                <SectionHeader title="Tax Information" icon={FiFileText} count={countFields([user.gstin, user.pan])} />
                <InfoRow icon={FiFileText} label="GSTIN" value={user.gstin} mono />
                <InfoRow icon={FiFileText} label="PAN" value={user.pan} mono />

                <SectionHeader
                  title="Subscription & Contract"
                  icon={FiPackage}
                  count={countFields([user.assignedPackage, user.billingCycle, user.contractStartDate, user.contractEndDate])}
                />
                <InfoRow icon={FiPackage} label="Assigned Package" value={user.assignedPackage} />
                <InfoRow icon={FiStar} label="Billing Cycle" value={user.billingCycle} />
                <InfoRow icon={FiCalendar} label="Contract Start" value={fmtDate(user.contractStartDate)} />
                <InfoRow icon={FiCalendar} label="Contract End" value={fmtDate(user.contractEndDate)} />

                {user.customerSupporter && (
                  <SectionHeader title="Support" icon={FiUsers} count={1} />
                )}
                <InfoRow icon={FiUsers} label="Customer Supporter" value={user.customerSupporter} />

                <SectionHeader
                  title="Portal Access"
                  icon={FiShield}
                  count={countFields([user.portalEmail, user.enablePortalLogin])}
                />
                <InfoRow icon={FiMail} label="Portal Email" value={user.portalEmail} />
                <InfoRow
                  icon={FiShield}
                  label="Portal Login"
                  value={user.enablePortalLogin ? 'Enabled' : 'Disabled'}
                />

                <SectionHeader title="Account" icon={FiClock} count={2} />
                <InfoRow icon={FiCalendar} label="Created On" value={fmtDate(user.createdAt)} />
                <InfoRow icon={FiClock} label="Last Updated" value={fmtDate(user.updatedAt)} />
              </>
            )}

            <div className="h-4" />
          </div>
        </div>
      </div>

      {/* Keyframes + Scrollbar */}
      <style>{`
        @keyframes landscapeSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.25);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.45);
        }
      `}</style>
    </div>
  );
}