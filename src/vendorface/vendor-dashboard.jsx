// src/screens/VendorDashboard.jsx

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "./header";
import theme from "../theme/theme"; 

const VendorDashboard = () => {
  const navigate = useNavigate();

  // ============================================================
  // CURRENT DATE
  // ============================================================

  const today = new Date();

  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  // ============================================================
  // DEMO / DASHBOARD DATA
  // ============================================================

  const stats = {
    totalAssigned: 0,
    inProgress: 0,
    insufficient: 0,
    completed: 0,
  };

  const recentTasks = [];

  // ============================================================
  // CURRENT MONTH INFORMATION
  // ============================================================

  const currentMonth = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const highlightedDay =
    currentDate.getFullYear() === today.getFullYear() &&
    currentDate.getMonth() === today.getMonth()
      ? today.getDate()
      : null;

  // ============================================================
  // CALENDAR
  // ============================================================

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];

    // Empty cells before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Actual days
    for (let day = 1; day <= totalDays; day++) {
      days.push(day);
    }

    // Complete final row
    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return days;
  }, [currentDate]);

  // ============================================================
  // MONTH NAVIGATION
  // ============================================================

  const previousMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  // ============================================================
  // STAT CARD
  // ============================================================

  const StatCard = ({
    icon,
    title,
    value,
    sideValue,
    iconColor,
    hoverBorder,
    progress,
    progressClass,
  }) => {
    return (
      <div
        className={`group bg-[#0F1F3A] border border-[#1E3A5F]
        rounded-3xl p-7 transition-all duration-500
        hover:-translate-y-1 ${hoverBorder}`}
      >
        <div className="flex justify-between items-start">
          <div>
            <div
              className={`text-4xl mb-2 ${iconColor}`}
              aria-hidden="true"
            >
              {icon}
            </div>

            <div className="uppercase text-xs tracking-[1px] text-[#8899AA]">
              {title}
            </div>

            <div className="text-[52px] font-semibold tracking-tighter text-white mt-1">
              {value}
            </div>
          </div>

          <div className={`text-7xl font-light ${iconColor} opacity-20`}>
            {sideValue}
          </div>
        </div>

        <div className="mt-8 h-2 bg-[#152D50] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${progressClass}`}
            style={{
              width: `${Math.min(Math.max(progress, 0), 100)}%`,
            }}
          />
        </div>
      </div>
    );
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      className="min-h-screen bg-[#060D1B] text-white overflow-hidden"
      style={{ fontFamily: theme.fonts.body }}
    >
      {/* ========================================================
          HEADER
      ======================================================== */}

      <Header />

      {/* ========================================================
          TOP NAVIGATION
      ======================================================== */}

      <div className="bg-[#0A1628] border-b border-[#1E3A5F] px-8 py-4 flex items-center gap-10">
        <button
          type="button"
          className="
            flex items-center gap-3
            text-[#00D4AA]
            border-b-2 border-[#00D4AA]
            pb-4
            font-semibold
            tracking-wide
          "
        >
          📊 DASHBOARD
        </button>

        <button
          type="button"
          onClick={() => navigate("/vendor-workorder-assignment")}
          className="
            flex items-center gap-3
            text-[#8899AA]
            hover:text-white
            pb-4
            font-medium
            transition-all duration-300
          "
        >
          📋 ASSIGNED TASKS
        </button>
      </div>

      {/* ========================================================
          MAIN CONTENT
      ======================================================== */}

      <div className="p-4 sm:p-6 lg:p-8 max-w-[1640px] mx-auto">
        {/* ======================================================
            WELCOME HEADER
        ====================================================== */}

        <div className="flex flex-col lg:flex-row justify-between gap-6 items-start mb-10">
          <div className="flex items-center gap-4">
            <div
              className="
                w-12 h-12
                rounded-2xl
                bg-gradient-to-br
                from-[#00D4AA]
                to-[#10B981]
                flex items-center justify-center
                shadow-xl
                shadow-[#00D4AA]/30
              "
            >
              <span className="text-2xl">🛡️</span>
            </div>

            <div>
              <h1
                className="
                  text-[28px]
                  sm:text-[32px]
                  font-semibold
                  tracking-[-0.02em]
                  leading-none
                "
                style={{ fontFamily: theme.fonts.display }}
              >
                Vendor Partner Dashboard
              </h1>

              <p className="text-[#8899AA] mt-2 text-base sm:text-lg">
                Welcome back,{" "}
                <span className="text-white font-semibold">
                  VENDOR DEMO
                </span>{" "}
                • Operational Status
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/vendor-workorder-assignment")}
            className="
              group
              flex items-center gap-3
              bg-[#00D4AA]
              hover:bg-[#00F0C0]
              text-black
              px-6 sm:px-8
              py-3.5
              rounded-2xl
              font-semibold
              text-sm
              tracking-wider
              uppercase
              transition-all duration-300
              active:scale-[0.985]
              shadow-lg
              shadow-[#00D4AA]/40
            "
          >
            VIEW ASSIGNED TASKS

            <span className="group-hover:translate-x-1 transition-transform">
              →
            </span>
          </button>
        </div>

        {/* ======================================================
            KPI STATS
        ====================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          <StatCard
            icon="📦"
            title="TOTAL ASSIGNED"
            value={stats.totalAssigned}
            sideValue={stats.totalAssigned}
            iconColor="text-emerald-400"
            hoverBorder="hover:border-[#00D4AA]/60"
            progress={stats.totalAssigned > 0 ? 85 : 0}
            progressClass="bg-gradient-to-r from-emerald-400 to-teal-400"
          />

          <StatCard
            icon="🔄"
            title="IN PROGRESS"
            value={stats.inProgress}
            sideValue={stats.inProgress}
            iconColor="text-amber-400"
            hoverBorder="hover:border-[#F5A623]/60"
            progress={stats.totalAssigned ? 45 : 0}
            progressClass="bg-gradient-to-r from-amber-400 to-orange-400"
          />

          <StatCard
            icon="⚠️"
            title="INSUFFICIENT"
            value={stats.insufficient}
            sideValue={stats.insufficient}
            iconColor="text-red-400"
            hoverBorder="hover:border-red-500/60"
            progress={stats.totalAssigned ? 15 : 0}
            progressClass="bg-gradient-to-r from-red-400 to-rose-500"
          />

          <StatCard
            icon="✅"
            title="COMPLETED"
            value={stats.completed}
            sideValue={stats.completed}
            iconColor="text-emerald-400"
            hoverBorder="hover:border-[#10B981]/60"
            progress={stats.totalAssigned ? 92 : 0}
            progressClass="bg-gradient-to-r from-emerald-400 to-cyan-400"
          />
        </div>

        {/* ======================================================
            CONTENT GRID
        ====================================================== */}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* ====================================================
              RECENT ASSIGNED TASKS
          ==================================================== */}

          <div
            className="
              xl:col-span-7
              bg-[#0F1F3A]
              border border-[#1E3A5F]
              rounded-3xl
              p-5 sm:p-8
            "
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="text-2xl">📋</div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
                    Recent Assigned Tasks
                  </h2>

                  <p className="text-[#4A5C6E] text-sm">
                    Latest verification requests
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate("/vendor-workorder-assignment")
                }
                className="
                  text-[#00D4AA]
                  hover:text-[#00F0C0]
                  flex items-center gap-2
                  text-sm
                  font-medium
                  transition-colors
                "
              >
                View All
                <span className="text-lg">↗</span>
              </button>
            </div>

            <div className="border border-[#1E3A5F] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-[#1E3A5F] bg-[#152D50]">
                      <th className="px-6 py-5 text-left text-sm font-medium text-[#8899AA]">
                        CANDIDATE
                      </th>

                      <th className="px-6 py-5 text-left text-sm font-medium text-[#8899AA]">
                        VERIFICATION CHECK
                      </th>

                      <th className="px-6 py-5 text-left text-sm font-medium text-[#8899AA]">
                        STATUS
                      </th>

                      <th className="px-6 py-5 text-left text-sm font-medium text-[#8899AA]">
                        DEADLINE
                      </th>

                      <th className="px-6 py-5 text-right text-sm font-medium text-[#8899AA]">
                        ACTION
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentTasks.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-8 py-24">
                          <div className="flex flex-col items-center justify-center text-center">
                            <div
                              className="
                                w-20 h-20
                                rounded-3xl
                                bg-[#152D50]
                                flex items-center justify-center
                                text-5xl
                                mb-6
                                opacity-75
                              "
                            >
                              📭
                            </div>

                            <p className="text-xl text-[#4A5C6E]">
                              No recent assigned tasks
                            </p>

                            <p className="text-sm text-[#4A5C6E] mt-2 max-w-xs">
                              New tasks will appear here automatically
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      recentTasks.map((task) => (
                        <tr
                          key={task.id}
                          className="border-b border-[#1E3A5F] last:border-b-0"
                        >
                          <td className="px-6 py-5">
                            {task.candidate}
                          </td>

                          <td className="px-6 py-5">
                            {task.check}
                          </td>

                          <td className="px-6 py-5">
                            {task.status}
                          </td>

                          <td className="px-6 py-5">
                            {task.deadline}
                          </td>

                          <td className="px-6 py-5 text-right">
                            <button
                              type="button"
                              className="text-[#00D4AA]"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ====================================================
              STATUS DISTRIBUTION
          ==================================================== */}

          <div
            className="
              xl:col-span-5
              bg-[#0F1F3A]
              border border-[#1E3A5F]
              rounded-3xl
              p-5 sm:p-8
              flex flex-col
              min-h-[420px]
            "
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="text-2xl">📊</div>

              <h2 className="text-xl sm:text-2xl font-semibold">
                Status Distribution
              </h2>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div
                  className="
                    mx-auto
                    w-40 h-40
                    rounded-full
                    border-[16px]
                    border-dashed
                    border-[#1E3A5F]
                    flex items-center justify-center
                    mb-8
                  "
                >
                  <div className="text-6xl opacity-30">
                    📊
                  </div>
                </div>

                <p className="text-[#4A5C6E]">
                  No assigned tasks available
                </p>
              </div>
            </div>
          </div>

          {/* ====================================================
              VERIFICATION CALENDAR
          ==================================================== */}

          <div
            className="
              xl:col-span-7
              bg-[#0F1F3A]
              border border-[#1E3A5F]
              rounded-3xl
              p-5 sm:p-8
            "
          >
            <div className="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="text-2xl">📅</div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold">
                    Verification Calendar
                  </h2>

                  <p className="text-xs text-[#8899AA] mt-1">
                    Track SLA deadlines, target dates, and follow-ups
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                {/* Legend */}

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-400" />
                    Target
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    Deadline
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-400" />
                    Follow-up
                  </div>
                </div>

                {/* Month navigation */}

                <div className="bg-[#152D50] px-3 py-2 rounded-2xl flex items-center gap-2 text-sm font-medium">
                  <button
                    type="button"
                    onClick={previousMonth}
                    className="
                      hover:bg-[#1E3A5F]
                      px-3 py-1
                      rounded-xl
                      transition-colors
                    "
                    aria-label="Previous month"
                  >
                    ←
                  </button>

                  <span className="min-w-[130px] text-center">
                    {currentMonth}
                  </span>

                  <button
                    type="button"
                    onClick={nextMonth}
                    className="
                      hover:bg-[#1E3A5F]
                      px-3 py-1
                      rounded-xl
                      transition-colors
                    "
                    aria-label="Next month"
                  >
                    →
                  </button>
                </div>

                <button
                  type="button"
                  onClick={goToToday}
                  className="
                    text-xs
                    text-[#00D4AA]
                    hover:text-[#00F0C0]
                    font-semibold
                  "
                >
                  TODAY
                </button>
              </div>
            </div>

            {/* ==================================================
                CALENDAR
            ================================================== */}

            <div className="overflow-x-auto">
              <div className="min-w-[650px]">
                <div className="grid grid-cols-7 gap-px bg-[#1E3A5F]/70 rounded-2xl p-1 overflow-hidden">
                  {[
                    "SUN",
                    "MON",
                    "TUE",
                    "WED",
                    "THU",
                    "FRI",
                    "SAT",
                  ].map((day) => (
                    <div
                      key={day}
                      className="
                        bg-[#0A1628]
                        py-4
                        text-center
                        text-xs
                        font-semibold
                        text-[#8899AA]
                        tracking-widest
                      "
                    >
                      {day}
                    </div>
                  ))}

                  {calendarDays.map((day, index) => {
                    const isToday = day === highlightedDay;

                    return (
                      <div
                        key={`${currentDate.getFullYear()}-${currentDate.getMonth()}-${index}`}
                        className={`
                          h-20
                          flex
                          items-center
                          justify-center
                          bg-[#0F1F3A]
                          hover:bg-[#152D50]
                          transition-all
                          relative
                          ${
                            isToday
                              ? "ring-2 ring-inset ring-[#00D4AA] bg-[#152D50]"
                              : ""
                          }
                        `}
                      >
                        {day && (
                          <div
                            className={`
                              w-10
                              h-10
                              flex
                              items-center
                              justify-center
                              rounded-2xl
                              text-sm
                              font-medium
                              transition-all
                              ${
                                isToday
                                  ? "bg-[#00D4AA] text-black shadow-xl shadow-[#00D4AA]/50 scale-110"
                                  : "hover:bg-[#1E3A5F]"
                              }
                            `}
                          >
                            {day}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ==================================================
                TASK DUE BANNER
            ================================================== */}

            <div
              className="
                mt-8
                bg-gradient-to-r
                from-[#152D50]
                to-[#0F1F3A]
                border
                border-[#1E3A5F]
                rounded-2xl
                p-6
                flex
                items-center
                gap-4
              "
            >
              <div className="text-[#00D4AA] text-xl">
                📍
              </div>

              <div>
                <div className="font-semibold text-white">
                  NO TASKS SCHEDULED
                </div>

                <div className="text-sm text-[#4A5C6E] mt-1">
                  No verification tasks or follow-ups are
                  currently scheduled.
                </div>
              </div>
            </div>
          </div>

          {/* ====================================================
              SCHEDULE TIMELINE
          ==================================================== */}

          <div
            className="
              xl:col-span-5
              bg-[#0F1F3A]
              border border-[#1E3A5F]
              rounded-3xl
              p-5 sm:p-8
              flex flex-col
              min-h-[420px]
            "
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="text-2xl">📌</div>

              <h2 className="text-xl sm:text-2xl font-semibold">
                Schedule Timeline
              </h2>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
              <div
                className="
                  w-24 h-24
                  rounded-3xl
                  bg-[#152D50]
                  flex
                  items-center
                  justify-center
                  mb-8
                  text-[70px]
                  opacity-40
                "
              >
                🕒
              </div>

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
