import React, { useState } from 'react';
import Header from '../screens/header';
import theme from '../theme/theme';

const VendorDashboard = () => {
  const [currentMonth] = useState('June 2026');
  const highlightedDay = 20;

  // Generate calendar days for June 2026 (starts on Monday)
  const calendarDays = Array.from({ length: 35 }, (_, i) => {
    const dayNum = i - 5; // Adjust offset so June 1 is correct
    return dayNum > 0 && dayNum <= 30 ? dayNum : null;
  });

  return (
    <div 
      className="min-h-screen bg-[#060D1B] text-white overflow-hidden"
      style={{ fontFamily: theme.fonts.body }}
    >
      <Header />

      {/* Top Navigation Tabs */}
      <div className="bg-[#0A1628] border-b border-[#1E3A5F] px-8 py-4 flex items-center gap-10">
        <button 
          className="flex items-center gap-3 text-[#00D4AA] border-b-2 border-[#00D4AA] pb-4 font-semibold tracking-wide transition-all hover:text-[#00F0C0]"
        >
          📊 DASHBOARD
        </button>
        <button 
          className="flex items-center gap-3 text-[#8899AA] hover:text-white pb-4 font-medium transition-all duration-300"
        >
          📋 ASSIGNED TASKS
        </button>
      </div>

      <div className="p-8 max-w-[1640px] mx-auto">
        {/* Welcome Header */}
        <div className="flex justify-between items-start mb-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#00D4AA] to-[#10B981] flex items-center justify-center shadow-xl shadow-[#00D4AA]/30">
              <span className="text-2xl">🛡️</span>
            </div>
            <div>
              <h1 
                className="text-[32px] font-semibold tracking-[-0.02em] leading-none"
                style={{ fontFamily: theme.fonts.display }}
              >
                Vendor Partner Dashboard
              </h1>
              <p className="text-[#8899AA] mt-1.5 text-lg">
                Welcome back, <span className="text-white font-semibold">VENDOR DEMO</span> • Operational Status
              </p>
            </div>
          </div>

          <button 
            className="group flex items-center gap-3 bg-[#00D4AA] hover:bg-[#00F0C0] text-black px-8 py-3.5 rounded-2xl font-semibold text-sm tracking-wider uppercase transition-all duration-300 active:scale-[0.985] shadow-lg shadow-[#00D4AA]/40 hover:shadow-xl"
          >
            VIEW ASSIGNED TASKS
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </button>
        </div>

        {/* KPI Stats */}
        <div className="grid grid-cols-4 gap-6 mb-10">
          {/* Total Assigned */}
          <div className="group bg-[#0F1F3A] border border-[#1E3A5F] rounded-3xl p-7 hover:border-[#00D4AA]/60 transition-all duration-500 hover:-translate-y-1">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-emerald-400 text-4xl mb-2">📦</div>
                <div className="uppercase text-xs tracking-[1px] text-[#8899AA]">TOTAL ASSIGNED</div>
                <div className="text-[52px] font-semibold tracking-tighter text-white mt-1">0</div>
              </div>
              <div className="text-emerald-500/30 text-7xl font-light">0</div>
            </div>
            <div className="mt-8 h-2 bg-[#152D50] rounded-full overflow-hidden">
              <div className="h-full w-[85%] bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all group-hover:w-full" />
            </div>
          </div>

          {/* In Progress */}
          <div className="group bg-[#0F1F3A] border border-[#1E3A5F] rounded-3xl p-7 hover:border-[#F5A623]/60 transition-all duration-500 hover:-translate-y-1">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-amber-400 text-4xl mb-2">🔄</div>
                <div className="uppercase text-xs tracking-[1px] text-[#8899AA]">IN PROGRESS</div>
                <div className="text-[52px] font-semibold tracking-tighter text-white mt-1">0</div>
              </div>
              <div className="text-amber-500/30 text-7xl font-light">0</div>
            </div>
            <div className="mt-8 h-2 bg-[#152D50] rounded-full overflow-hidden">
              <div className="h-full w-[45%] bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all group-hover:w-[70%]" />
            </div>
          </div>

          {/* Insufficient */}
          <div className="group bg-[#0F1F3A] border border-[#1E3A5F] rounded-3xl p-7 hover:border-red-500/60 transition-all duration-500 hover:-translate-y-1">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-red-400 text-4xl mb-2">⚠️</div>
                <div className="uppercase text-xs tracking-[1px] text-[#8899AA]">INSUFFICIENT</div>
                <div className="text-[52px] font-semibold tracking-tighter text-white mt-1">0</div>
              </div>
              <div className="text-red-500/30 text-7xl font-light">0</div>
            </div>
            <div className="mt-8 h-2 bg-[#152D50] rounded-full overflow-hidden">
              <div className="h-full w-[15%] bg-gradient-to-r from-red-400 to-rose-500 rounded-full transition-all group-hover:w-[35%]" />
            </div>
          </div>

          {/* Completed */}
          <div className="group bg-[#0F1F3A] border border-[#1E3A5F] rounded-3xl p-7 hover:border-[#10B981]/60 transition-all duration-500 hover:-translate-y-1">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-emerald-400 text-4xl mb-2">✅</div>
                <div className="uppercase text-xs tracking-[1px] text-[#8899AA]">COMPLETED</div>
                <div className="text-[52px] font-semibold tracking-tighter text-white mt-1">0</div>
              </div>
              <div className="text-emerald-500/30 text-7xl font-light">0</div>
            </div>
            <div className="mt-8 h-2 bg-[#152D50] rounded-full overflow-hidden">
              <div className="h-full w-[92%] bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all group-hover:w-full" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Recent Assigned Tasks */}
          <div className="col-span-7 bg-[#0F1F3A] border border-[#1E3A5F] rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="text-2xl">📋</div>
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">Recent Assigned Tasks</h2>
                  <p className="text-[#4A5C6E] text-sm">Latest verification requests</p>
                </div>
              </div>
              <button className="text-[#00D4AA] hover:text-[#00F0C0] flex items-center gap-2 text-sm font-medium transition-colors">
                View All <span className="text-lg">↗</span>
              </button>
            </div>

            <div className="border border-[#1E3A5F] rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1E3A5F] bg-[#152D50]">
                    <th className="px-8 py-5 text-left text-sm font-medium text-[#8899AA]">CANDIDATE</th>
                    <th className="px-8 py-5 text-left text-sm font-medium text-[#8899AA]">VERIFICATION CHECK</th>
                    <th className="px-8 py-5 text-left text-sm font-medium text-[#8899AA]">STATUS</th>
                    <th className="px-8 py-5 text-left text-sm font-medium text-[#8899AA]">DEADLINE</th>
                    <th className="px-8 py-5 text-right text-sm font-medium text-[#8899AA]">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={5} className="px-8 py-24">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 rounded-3xl bg-[#152D50] flex items-center justify-center text-5xl mb-6 opacity-75">
                          📭
                        </div>
                        <p className="text-xl text-[#4A5C6E]">No recent assigned tasks</p>
                        <p className="text-sm text-[#4A5C6E] mt-2 max-w-xs">New tasks will appear here automatically</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="col-span-5 bg-[#0F1F3A] border border-[#1E3A5F] rounded-3xl p-8 flex flex-col">
            <div className="flex items-center gap-4 mb-6">
              <div className="text-2xl">📊</div>
              <h2 className="text-2xl font-semibold">Status Distribution</h2>
            </div>
            
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="mx-auto w-40 h-40 rounded-full border-[16px] border-dashed border-[#1E3A5F] flex items-center justify-center mb-8">
                  <div className="text-6xl opacity-30">📊</div>
                </div>
                <p className="text-[#4A5C6E]">No assigned tasks available</p>
              </div>
            </div>
          </div>

          {/* Verification Calendar */}
          <div className="col-span-7 bg-[#0F1F3A] border border-[#1E3A5F] rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="text-2xl">📅</div>
                <div>
                  <h2 className="text-2xl font-semibold">Verification Calendar</h2>
                  <p className="text-xs text-[#8899AA] -mt-0.5">Track SLA deadlines, target dates, and follow-ups</p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="flex gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-400" /> Target
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" /> Deadline
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-400" /> Follow-up
                  </div>
                </div>

                <div className="bg-[#152D50] px-5 py-2 rounded-2xl flex items-center gap-3 text-sm font-medium">
                  <button className="hover:bg-[#1E3A5F] px-3 py-1 rounded-xl transition-colors">←</button>
                  <span>{currentMonth}</span>
                  <button className="hover:bg-[#1E3A5F] px-3 py-1 rounded-xl transition-colors">→</button>
                </div>
              </div>
            </div>

            {/* Calendar */}
            <div className="grid grid-cols-7 gap-px bg-[#1E3A5F]/70 rounded-2xl p-1">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                <div key={day} className="bg-[#0A1628] py-4 text-center text-xs font-semibold text-[#8899AA] tracking-widest">
                  {day}
                </div>
              ))}

              {calendarDays.map((day, idx) => (
                <div
                  key={idx}
                  className={`h-20 flex items-center justify-center bg-[#0F1F3A] hover:bg-[#152D50] transition-all relative ${
                    day === highlightedDay 
                      ? 'ring-2 ring-offset-2 ring-offset-[#0F1F3A] ring-[#00D4AA] bg-[#152D50]' 
                      : ''
                  }`}
                >
                  {day && (
                    <div 
                      className={`w-10 h-10 flex items-center justify-center rounded-2xl text-sm font-medium transition-all
                        ${day === highlightedDay 
                          ? 'bg-[#00D4AA] text-black shadow-xl shadow-[#00D4AA]/50 scale-110' 
                          : 'hover:bg-[#1E3A5F]'
                        }`}
                    >
                      {day}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Tasks Due Banner */}
            <div className="mt-8 bg-gradient-to-r from-[#152D50] to-[#0F1F3A] border border-[#1E3A5F] rounded-2xl p-6 flex items-center gap-4">
              <div className="text-[#00D4AA] text-xl">📍</div>
              <div>
                <div className="font-semibold text-white">TASKS DUE ON JUN 20, 2026</div>
                <div className="text-sm text-[#4A5C6E]">No verification tasks or follow-ups scheduled on this date.</div>
              </div>
            </div>
          </div>

          {/* Schedule Timeline */}
          <div className="col-span-5 bg-[#0F1F3A] border border-[#1E3A5F] rounded-3xl p-8 flex flex-col">
            <div className="flex items-center gap-4 mb-8">
              <div className="text-2xl">📌</div>
              <h2 className="text-2xl font-semibold">Schedule Timeline</h2>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-24 h-24 rounded-3xl bg-[#152D50] flex items-center justify-center mb-8 text-[70px] opacity-40">🕒</div>
              <p className="text-[#4A5C6E] text-center max-w-[260px]">
                No upcoming deadlines or follow-ups.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;