/* ============================================================
   MainLayout.jsx — Completely Zero Left Space
   ============================================================ */
import React, { useState } from 'react';
import Header from './header';
import Dashboard from './dashboard';
import Administration from './adminstration';
import BGVPlatform from './bgv-platform';
import BGVDashboard from './bgv-dashboard';
import theme from '../theme/theme';

export default function MainLayout() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isFlipping, setIsFlipping] = useState(false);

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;

    setIsFlipping(true);
    setTimeout(() => {
      setActiveTab(tab);
      setIsFlipping(false);
    }, 280);
  };

  return (
    <div
      className="min-h-screen relative"
      style={{
        background: 'linear-gradient(135deg, #E7FBF5 0%, #DFF8F1 35%, #D3F3EC 65%, #EAF9F6 100%)',
      }}
    >
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[600px] h-[600px] rounded-full blur-[150px] opacity-[0.05]" 
             style={{ background: theme.colors.accent, top: '-15%', right: '-5%', animation: 'blobFloat1 25s ease-in-out infinite' }} />
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.04]" 
             style={{ background: theme.colors.indigo, bottom: '-10%', left: '-5%', animation: 'blobFloat2 20s ease-in-out infinite' }} />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Full width — no max-w cap, no centering */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full">
          <div
            className={`transition-all duration-700 ${
              isFlipping ? 'opacity-0 scale-95 rotate-y-6' : 'opacity-100 scale-100 rotate-y-0'
            }`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {activeTab === 'Dashboard' && <Dashboard />}
            {activeTab === 'Administration' && <Administration />}
            {activeTab === 'BGVPlatform' && <BGVDashboard />}
          </div>
        </main>
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blobFloat1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(80px, -60px) rotate(12deg); }
        }
        @keyframes blobFloat2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-70px, 80px) rotate(-8deg); }
        }
      `}</style>
    </div>
  );
}