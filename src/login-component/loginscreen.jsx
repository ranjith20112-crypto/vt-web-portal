/* ============================================================
   LoginPage.jsx — Verifitech Portal Login
   Dual-mode: Employee (email + password) / Client (username + password)
   Fully responsive · Connected with AuthContext + Backend
   ============================================================ */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FiShield, FiMapPin, FiBookOpen, FiBriefcase,
  FiMail, FiLock, FiUser, FiHome, FiArrowRight,
  FiCheck, FiX, FiCheckCircle, FiAlertCircle,
  FiEye, FiEyeOff, FiSearch, FiMenu,
} from 'react-icons/fi';
import theme from '../theme/theme';
import { useNavigate } from "react-router-dom";
import verifiTechLogo from '../assets/verifitech-logoo.png';
import api from '../apiroute/apiroute';
import { useAuth } from '../context/AuthContext';

/* ───────── verification steps data ───────── */
const verificationSteps = [
  { Icon: FiMapPin,      title: 'Address Verification',    desc: 'Physical address validation with geocoding and utility cross-checks' },
  { Icon: FiBookOpen,    title: 'Education Verification',   desc: 'Academic credential authentication from universities and boards' },
  { Icon: FiBriefcase,   title: 'Employment Verification',  desc: 'Employment history, designation, and tenure confirmation' },
  { Icon: FiShield,      title: 'Criminal Background Check',desc: 'National and state-level criminal records database screening' },
];

const statsData = [
  { value: '10M+',  label: 'Verifications' },
  { value: '500+',  label: 'Enterprise Clients' },
  { value: '99.9%', label: 'Accuracy Rate' },
  { value: '24/7',  label: 'Support' },
];

/* ───────── Particle Canvas Background ───────── */
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let particles = [];

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 30 : Math.min(65, Math.floor(window.innerWidth / 22));
    const connectDist = isMobile ? 100 : 140;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.8 + 0.5,
        opacity: Math.random() * 0.45 + 0.1,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectDist) {
            const alpha = (1 - dist / connectDist) * 0.08;
            ctx.strokeStyle = `rgba(0, 100, 200, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.1, p.r), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 100, 200, ${p.opacity})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: '#f8fefd' }}
    />
  );
}

/* ───────── Gradient Blobs ───────── */
function GradientBlobs() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div
        className="absolute w-[500px] h-[500px] sm:w-[600px] sm:h-[600px] rounded-full blur-[120px] opacity-[0.06]"
        style={{
          background: 'radial-gradient(circle, #3b82f6, transparent)',
          top: '-10%', left: '-5%',
          animation: 'blobFloat1 20s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] rounded-full blur-[100px] opacity-[0.05]"
        style={{
          background: 'radial-gradient(circle, #f59e0b, transparent)',
          bottom: '-15%', right: '-10%',
          animation: 'blobFloat2 25s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-full blur-[80px] opacity-[0.04]"
        style={{
          background: 'radial-gradient(circle, #6366f1, transparent)',
          top: '40%', left: '50%',
          animation: 'blobFloat3 18s ease-in-out infinite',
        }}
      />
    </div>
  );
}

/* ───────── Verifitech Logo ───────── */
function VerifitechLogo({ size = 'default' }) {
  const textSize = size === 'large' ? 'text-3xl sm:text-4xl' : 'text-xl sm:text-2xl';
  const iconPx  = size === 'large' ? 30 : 22;

  return (
    <div
      className="flex items-center gap-2.5"
      style={{ animation: 'logoEntrance 0.8s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
    >
      <div className="flex items-center gap-3">
        <img
          src={verifiTechLogo}
          alt="VerifiTech"
          className="min-h-[136px] min-w-[176px] h-30 w-44 object-contain"
          style={{ padding: '4px 0' }}
        />
      </div>
    </div>
  );
}

/* ───────── Single Verification Flow Step ───────── */
function FlowStep({ Icon, title, desc, delay, isLast }) {
  return (
    <div
      className="flex items-start gap-3 sm:gap-4 relative"
      style={{ animation: `slideInLeft 0.6s ${delay}s cubic-bezier(0.34,1.56,0.64,1) both` }}
    >
      <div className="relative flex-shrink-0">
        <div
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center"
          style={{
            background: '#e0f2fe',
            border: '1px solid rgba(59, 130, 246, 0.25)',
          }}
        >
          <Icon size={18} style={{ color: '#1e40af' }} />
        </div>
        <div
          className="absolute inset-0 rounded-xl"
          style={{
            border: '1px solid rgba(59, 130, 246, 0.3)',
            animation: 'pulseRing 3s ease-out infinite',
            animationDelay: `${delay + 1}s`,
          }}
        />
        {!isLast && (
          <div className="absolute top-10 sm:top-12 left-1/2 -translate-x-1/2 w-px h-6 sm:h-8 overflow-hidden">
            <div
              className="w-full h-full"
              style={{ background: 'linear-gradient(to bottom, rgba(59, 130, 246, 0.4), transparent)' }}
            />
            <div
              className="absolute left-0 w-full h-2.5"
              style={{
                background: '#1e40af',
                filter: 'blur(2px)',
                animation: 'travelDown 2.5s ease-in-out infinite',
                animationDelay: `${delay + 0.5}s`,
              }}
            />
          </div>
        )}
      </div>
      <div className="pt-1.5 sm:pt-2 pb-4 sm:pb-6">
        <h4
          className="text-xs sm:text-sm font-semibold mb-0.5 sm:mb-1"
          style={{ color: '#111827', fontFamily: theme.fonts.display }}
        >
          {title}
        </h4>
        <p className="text-[11px] sm:text-xs leading-relaxed" style={{ color: '#4b5563' }}>
          {desc}
        </p>
      </div>
    </div>
  );
}

/* ───────── Stat Item ───────── */
function StatItem({ value, label, delay }) {
  return (
    <div
      className="text-center px-3 sm:px-4"
      style={{ animation: `fadeInUp 0.6s ${delay}s cubic-bezier(0.34,1.56,0.64,1) both` }}
    >
      <div
        className="text-lg sm:text-2xl font-bold mb-0.5 sm:mb-1"
        style={{ color: '#1e40af', fontFamily: theme.fonts.display }}
      >
        {value}
      </div>
      <div className="text-[10px] sm:text-xs" style={{ color: '#6b7280' }}>
        {label}
      </div>
    </div>
  );
}

/* ───────── Floating Input ───────── */
function FloatingInput({
  label, Icon, type = 'text', value, onChange, error,
  showPasswordToggle = false, showPassword = false, onTogglePassword,
}) {
  const [focused, setFocused] = useState(false);
  const isActive = focused || value;
  const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

  return (
    <div
      className="relative mb-4 sm:mb-5"
      style={{ animation: 'fadeInUp 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}
    >
      <div
        className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 z-10"
        style={{ color: isActive ? '#1e40af' : '#6b7280' }}
      >
        <Icon size={16} />
      </div>

      <input
        type={inputType}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full pl-11 pr-12 pt-5 pb-2 rounded-xl text-sm outline-none transition-all duration-300"
        style={{
          background: '#ffffff',
          border: `1.5px solid ${error ? '#ef4444' : focused ? '#1e40af' : '#d1d5db'}`,
          color: '#111827',
          fontFamily: theme.fonts.body,
          boxShadow: focused ? '0 0 0 3px rgba(30, 64, 175, 0.1)' : 'none',
        }}
      />

      <label
        className="absolute left-11 transition-all duration-300 pointer-events-none"
        style={{
          top: isActive ? '8px' : '50%',
          transform: isActive ? 'translateY(0)' : 'translateY(-50%)',
          fontSize: isActive ? '10px' : '13px',
          color: error ? '#ef4444' : isActive ? '#1e40af' : '#6b7280',
          fontFamily: theme.fonts.body,
          fontWeight: isActive ? 600 : 400,
        }}
      >
        {label}
      </label>

      {showPasswordToggle && (
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 transition-colors duration-200 hover:scale-110"
          style={{ color: '#6b7280' }}
        >
          {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
        </button>
      )}

      {error && (
        <p className="text-xs mt-1 ml-1 flex items-center gap-1" style={{ color: '#ef4444' }}>
          <FiAlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}

/* ───────── Mode Toggle ───────── */
function ModeToggle({ mode, setMode }) {
  return (
    <div
      className="relative flex rounded-xl p-1 mb-6 sm:mb-8"
      style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
      }}
    >
      <div
        className="absolute top-1 bottom-1 rounded-lg transition-all duration-500"
        style={{
          width: 'calc(50% - 4px)',
          left: mode === 'employee' ? '4px' : 'calc(50%)',
          background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
          boxShadow: '0 0 15px rgba(30, 64, 175, 0.3)',
        }}
      />
      <button
        type="button"
        onClick={() => setMode('employee')}
        className="relative z-10 flex-1 py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-colors duration-300 flex items-center justify-center gap-1.5 sm:gap-2"
        style={{
          color: mode === 'employee' ? '#ffffff' : '#4b5563',
          fontFamily: theme.fonts.display,
        }}
      >
        <FiUser size={14} />
        Employee
      </button>
      <button
        type="button"
        onClick={() => setMode('client')}
        className="relative z-10 flex-1 py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-colors duration-300 flex items-center justify-center gap-1.5 sm:gap-2"
        style={{
          color: mode === 'client' ? '#ffffff' : '#4b5563',
          fontFamily: theme.fonts.display,
        }}
      >
        <FiHome size={14} />
        Client
      </button>
    </div>
  );
}

/* ───────── Toast ───────── */
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: { bg: 'rgba(16,185,129,0.12)', border: '#10b981', IconComp: FiCheckCircle, color: '#10b981' },
    error:   { bg: 'rgba(239,68,68,0.12)',  border: '#ef4444',   IconComp: FiAlertCircle, color: '#ef4444' },
  };
  const c = config[type] || config.error;

  return (
    <div
      className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 rounded-xl backdrop-blur-xl max-w-[90vw] sm:max-w-none"
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        animation: 'toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        fontFamily: theme.fonts.body,
      }}
    >
      <c.IconComp size={18} style={{ color: c.color, flexShrink: 0 }} />
      <span className="text-sm" style={{ color: '#111827' }}>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100 transition-opacity flex-shrink-0">
        <FiX size={14} style={{ color: '#6b7280' }} />
      </button>
    </div>
  );
}

/* ───────── Verification Chips ───────── */
function VerificationChips() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl"
        style={{
          background: '#e0f2fe',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          color: '#1e40af',
        }}
      >
        <FiMenu size={18} />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 w-full rounded-xl overflow-hidden z-50"
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
          }}
        >
          {verificationSteps.map((step, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0"
              style={{ borderColor: '#e5e7eb' }}
            >
              <step.Icon size={16} style={{ color: '#1e40af' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: '#111827' }}>
                  {step.title}
                </p>
                <p className="text-xs mt-1" style={{ color: '#4b5563' }}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   MAIN LOGIN PAGE (FULLY CONNECTED)
   ============================================================ */
export default function LoginPage() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const [mode, setMode] = useState('employee');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    email: '',
    password: '',
    remember: false,
  });
  
  const [errors, setErrors] = useState({});

  const updateField = useCallback((field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  }, [errors]);

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setErrors({});
    setShowPassword(false);
  };

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) {
      errs.email = mode === 'employee' ? 'Email is required' : 'Email / Username is required';
    } else if (mode === 'employee' && !/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = 'Invalid email format';
    } else if (mode === 'client' && form.email.length < 3) {
      errs.email = 'Minimum 3 characters';
    }
    
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);

    try {
      if (mode === 'employee') {
        const response = await api.post('/api/employee/login', {
          email: form.email,
          password: form.password,
        });

        if (response.data.success) {
          const userData = response.data.data || response.data.employee || response.data.user || response.data;

          const isVendor =
            userData?.isVendor === true ||
            userData?.accountType === 'Vendor' ||
            userData?.userType === 'Vendor';

          authLogin({
            ...userData,
            fullName: userData.fullName || userData.name,
            role: userData.userType || userData.role || 'Employee',
          });

          setToast({ message: 'Login Successful! Redirecting...', type: 'success' });

          setTimeout(() => {
            navigate(isVendor ? '/vendor-dashboard' : '/mainlayout');
          }, 1200);
        }
      } else {
        const response = await api.post('/api/client/login', {
          email: form.email,
          password: form.password,
        });

        if (response.data.success) {
          const userData = response.data.data || response.data;

          authLogin({
            ...userData,
            fullName: userData.fullName || userData.clientName || userData.username || userData.email,
            role: 'Client',
          });

          setToast({
            message: 'Client Login Successful!',
            type: 'success',
          });

          setTimeout(() => navigate('/client-dashboard'), 1200);
        }
      }
    } catch (error) {
      console.error(error);
      setToast({
        message: error.response?.data?.message || "Invalid email or password",
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const firstField = mode === 'employee'
    ? { label: 'Email Address', Icon: FiMail, type: 'email', field: 'email', error: errors.email }
    : { label: 'Email / Username', Icon: FiUser, type: 'text', field: 'email', error: errors.email };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#f8fefd' }}>
      <ParticleCanvas />
      <GradientBlobs />

      <div
        className="fixed inset-0 z-[1] pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        {/* LEFT PANEL */}
        <div
          className="hidden lg:flex lg:w-[55%] flex-col justify-between p-10 xl:p-16 relative"
          style={{ animation: 'panelSlideRight 0.8s cubic-bezier(0.4,0,0.2,1) both' }}
        >
          <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(rgba(30, 64, 175, 0.3) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(30, 64, 175, 0.3) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />

          <div className="relative">
            <VerifitechLogo size="large" />
          </div>

          <div className="relative py-6">
            <h2
              className="text-xl font-semibold mb-1.5"
              style={{ color: '#111827', fontFamily: theme.fonts.display }}
            >
              Verification Workflow
            </h2>
            <p className="text-sm mb-8" style={{ color: '#4b5563' }}>
              End-to-end background verification process
            </p>
            <div className="space-y-1">
              {verificationSteps.map((step, i) => (
                <FlowStep
                  key={i}
                  Icon={step.Icon}
                  title={step.title}
                  desc={step.desc}
                  delay={0.5 + i * 0.2}
                  isLast={i === verificationSteps.length - 1}
                />
              ))}
            </div>
          </div>

          <div
            className="relative flex items-center divide-x rounded-2xl p-5"
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              backdropFilter: 'blur(12px)',
            }}
          >
            {statsData.map((s, i) => (
              <StatItem key={i} value={s.value} label={s.label} delay={1.4 + i * 0.1} />
            ))}
          </div>
        </div>

        {/* RIGHT PANEL — LOGIN */}
        <div
          className="flex-1 flex flex-col items-center justify-center px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12 relative"
          style={{ animation: 'panelSlideLeft 0.8s 0.2s cubic-bezier(0.4,0,0.2,1) both' }}
        >
          <div className="lg:hidden w-full max-w-[440px] mb-6 sm:mb-8">
            <div className="mb-5">
              <VerifitechLogo />
            </div>
            <VerificationChips />
          </div>

          <div
            className="w-full max-w-[440px] rounded-2xl p-6 sm:p-8 lg:p-10 relative overflow-hidden"
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
            }}
          >
            <div className="absolute -inset-px rounded-2xl pointer-events-none opacity-40"
              style={{
                background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.2), transparent 40%, transparent 60%, rgba(30, 64, 175, 0.1))',
                animation: 'borderGlow 4s ease-in-out infinite alternate',
              }}
            />

            <div className="relative">
              <div className="mb-6 sm:mb-8">
                <h1 className="text-xl sm:text-2xl font-bold mb-1.5" style={{ color: '#111827' }}>
                  Welcome Back
                </h1>
                <p className="text-xs sm:text-sm" style={{ color: '#4b5563' }}>
                  Sign in to your {mode === 'employee' ? 'employee' : 'client'} dashboard
                </p>
              </div>

              <ModeToggle mode={mode} setMode={handleModeSwitch} />

              <form key={mode} onSubmit={handleSubmit}>
                <FloatingInput
                  label={firstField.label}
                  Icon={firstField.Icon}
                  type={firstField.type}
                  value={form[firstField.field]}
                  onChange={updateField(firstField.field)}
                  error={firstField.error}
                />

                <FloatingInput
                  label="Password"
                  Icon={FiLock}
                  type="password"
                  value={form.password}
                  onChange={updateField('password')}
                  error={errors.password}
                  showPasswordToggle
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword((v) => !v)}
                />

                <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, remember: !p.remember }))}
                      className="w-5 h-5 rounded-md flex items-center justify-center transition-all duration-300"
                      style={{
                        background: form.remember ? '#1e40af' : 'transparent',
                        border: `1.5px solid ${form.remember ? '#1e40af' : '#d1d5db'}`,
                      }}
                    >
                      {form.remember && <FiCheck size={12} style={{ color: '#ffffff' }} />}
                    </button>
                    <span className="text-xs" style={{ color: '#4b5563' }}>Remember me</span>
                  </label>
                  <a href="#" className="text-xs font-medium hover:underline" style={{ color: '#1e40af' }}
                    onClick={(e) => { e.preventDefault(); setToast({ message: 'Password reset link sent!', type: 'success' }); }}>
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 sm:py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden group disabled:opacity-70"
                  style={{
                    background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                    color: '#ffffff',
                    boxShadow: '0 4px 20px rgba(30, 64, 175, 0.3)',
                  }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Sign In as {mode === 'employee' ? 'Employee' : 'Client'}
                      <FiArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </button>
              </form>

              <p className="text-center text-xs sm:text-sm mt-5 sm:mt-6" style={{ color: '#4b5563' }}>
                Don't have an account?{' '}
                <a href="#" className="font-semibold hover:underline" style={{ color: '#1e40af' }}>Get Started</a>
              </p>
            </div>
          </div>

          <div className="lg:hidden mt-6 sm:mt-8 grid grid-cols-2 gap-2.5 sm:gap-3 w-full max-w-[440px]">
            {statsData.map((s, i) => (
              <div key={i} className="text-center p-3 sm:p-4 rounded-xl"
                style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}>
                <div className="text-lg sm:text-xl font-bold" style={{ color: '#1e40af' }}>{s.value}</div>
                <div className="text-[10px] sm:text-xs" style={{ color: '#6b7280' }}>{s.label}</div>
              </div>
            ))}
          </div>

          <p className="lg:hidden mt-6 text-[11px]" style={{ color: '#6b7280' }}>
            &copy; {new Date().getFullYear()} Verifitech. All rights reserved.
          </p>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
