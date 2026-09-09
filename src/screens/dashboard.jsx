/* ============================================================
 Dashboard.jsx
 Backend Integration + Client / Candidate / Date Filters
============================================================ */

import React, {
 useState,
 useEffect
} from 'react';

import { useNavigate } from 'react-router-dom';

import axios from 'axios';



import {
 FiBriefcase,
 FiSearch,
 FiCheckCircle,
 FiClock,
 FiAlertCircle,
 FiMoreVertical,
 FiTrendingUp,
 FiTrendingDown,
 FiRefreshCw,
 FiUsers,
 FiLoader
} from 'react-icons/fi';

import {
 AreaChart,
 Area,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 ResponsiveContainer,
 BarChart,
 Bar,
 PieChart,
 Pie,
 Cell
} from 'recharts';

import theme from '../theme/theme';


/* ============================================================
 COLORS
============================================================ */

const COLORS = {

 accent: '#8B5CF6',
 accentRgb: '139, 92, 246',

 indigo: '#6366F1',
 indigoRgb: '99, 102, 241',

 success: '#10B981',
 successRgb: '16, 185, 129',

 amber: '#F5A623',
 amberRgb: '245, 166, 35',

 error: '#EF4444',
 errorRgb: '239, 68, 68',

 muted: '#64748B'

};


/* ============================================================
 CUSTOM TOOLTIP
============================================================ */

const CustomTooltip = ({
 active,
 payload,
 label
}) => {

 if (
 active &&
 payload &&
 payload.length
 ) {

 return (

 <div
 className="px-3 py-2 rounded-lg text-xs"
 style={{
 background:
 theme.colors.bgSecondary,

 border:
 `1px solid ${theme.colors.border}`
 }}
 >

 <p
 className="mb-1 font-semibold"
 style={{
 color:
 theme.colors.textPrimary
 }}
 >
 {label}
 </p>

 {payload.map(
 (p, i) => (

 <p
 key={i}
 style={{
 color: p.color
 }}
 >

 {p.name}:{' '}

 <span className="font-bold">
 {p.value}
 </span>

 </p>

 )
 )}

 </div>

 );

 }

 return null;

};


/* ============================================================
 COUNT UP
============================================================ */

function useCountUp(
 target,
 duration = 1500
) {

 const [count, setCount] =
 useState(0);

 const ref =
 React.useRef(null);

 useEffect(() => {

 let startTime;

 const animate = (
 timestamp
 ) => {

 if (!startTime) {
 startTime = timestamp;
 }

 const progress =
 Math.min(
 (timestamp - startTime) /
 duration,
 1
 );

 setCount(
 Math.floor(
 progress * target
 )
 );

 if (
 progress < 1
 ) {

 ref.current =
 requestAnimationFrame(
 animate
 );

 }

 };

 ref.current =
 requestAnimationFrame(
 animate
 );

 return () =>
 cancelAnimationFrame(
 ref.current
 );

 }, [
 target,
 duration
 ]);

 return count;

}


/* ============================================================
 LIVE CLOCK
============================================================ */

function useLiveClock() {

 const [time, setTime] =
 useState(new Date());

 useEffect(() => {

 const interval =
 setInterval(
 () =>
 setTime(
 new Date()
 ),
 1000
 );

 return () =>
 clearInterval(
 interval
 );

 }, []);

 return time.toLocaleTimeString(
 'en-US',
 {
 hour: '2-digit',
 minute: '2-digit',
 second: '2-digit',
 hour12: false
 }
 );

}


/* ============================================================
 STAT CARD
============================================================ */

function StatCard({
 title,
 value,
 icon: Icon,
 change,
 color,
 colorRgb,
 delay,
 refreshKey
}) {

 const animatedValue =
 useCountUp(
 value,
 1200 + delay * 100,
 refreshKey
 );

 const isPositive =
 change >= 0;

 return (

 <div
 className="relative rounded-2xl p-5 overflow-hidden group transition-all duration-300 hover:scale-[1.02]"
 style={{
 background:
 theme.colors.glassBg,

 border:
 `1px solid ${theme.colors.glassBorder}`,

 backdropFilter:
 'blur(12px)'
 }}
 >

 <div
 className="relative flex items-start justify-between mb-4"
 >

 <div
 className="w-11 h-11 rounded-xl flex items-center justify-center"
 style={{
 background:
 `rgba(${colorRgb}, 0.12)`
 }}
 >

 <Icon
 size={20}
 style={{
 color
 }}
 />

 </div>

 <div
 className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md"
 style={{
 background:
 isPositive
 ? 'rgba(16,185,129,0.1)'
 : 'rgba(239,68,68,0.1)',

 color:
 isPositive
 ? COLORS.success
 : COLORS.error
 }}
 >

 {isPositive
 ? <FiTrendingUp size={12} />
 : <FiTrendingDown size={12} />
 }

 {Math.abs(change)}%

 </div>

 </div>

 <div>

 <h3
 className="text-3xl font-bold mb-1"
 style={{
 color:
 theme.colors.textPrimary,

 fontFamily:
 theme.fonts.display
 }}
 >
 {animatedValue}
 </h3>

 <p
 className="text-xs"
 style={{
 color:
 theme.colors.textSecondary
 }}
 >
 {title}
 </p>

 </div>

 </div>

 );

}


/* ============================================================
 CHART CARD
============================================================ */

function ChartCard({
 title,
 children
}) {

 return (

 <div
 className="rounded-2xl p-6 overflow-hidden"
 style={{
 background:
 theme.colors.glassBg,

 border:
 `1px solid ${theme.colors.glassBorder}`,

 backdropFilter:
 'blur(12px)'
 }}
 >

 <div
 className="flex items-center justify-between mb-6"
 >

 <h3
 className="text-sm font-semibold"
 style={{
 color:
 theme.colors.textPrimary,

 fontFamily:
 theme.fonts.display
 }}
 >
 {title}
 </h3>

 <button
 className="p-1.5 rounded-lg transition-colors duration-200 hover:bg-white/5"
 >

 <FiMoreVertical
 size={16}
 style={{
 color:
 COLORS.muted
 }}
 />

 </button>

 </div>

 {children}

 </div>

 );

}


/* ============================================================
 DASHBOARD
============================================================ */

export default function Dashboard() {

 const navigate = useNavigate();

 const liveTime =
 useLiveClock();


 /* ==========================================================
 STATES
 ========================================================== */

 const [statsData, setStatsData] =
 useState([

 {
 title: 'Total Work Orders',
 value: 0,
 icon: FiBriefcase,
 change: 0,
 color: COLORS.accent,
 colorRgb: COLORS.accentRgb
 },

 {
 title: 'Total Checks',
 value: 0,
 icon: FiSearch,
 change: 0,
 color: COLORS.indigo,
 colorRgb: COLORS.indigoRgb
 },

 {
 title: 'Completed',
 value: 0,
 icon: FiCheckCircle,
 change: 0,
 color: COLORS.success,
 colorRgb: COLORS.successRgb
 },

 {
 title: 'In Progress',
 value: 0,
 icon: FiClock,
 change: 0,
 color: COLORS.amber,
 colorRgb: COLORS.amberRgb
 },

 {
 title: 'Discrepancies',
 value: 0,
 icon: FiAlertCircle,
 change: 0,
 color: COLORS.error,
 colorRgb: COLORS.errorRgb
 }

 ]);


 const [tableData, setTableData] =
 useState([]);

 const [chartData, setChartData] =
 useState([]);

 const [pieData, setPieData] =
 useState([]);


 const [isLoading, setIsLoading] =
 useState(true);

 const [isRefreshing, setIsRefreshing] =
 useState(false);
 const [refreshKey, setRefreshKey] =
 useState(0);

 const [isOffline, setIsOffline] =
 useState(false);

 const [errorMessage, setErrorMessage] =
 useState("");


 /* ==========================================================
 ALL BACKEND DATA
 ========================================================== */

 const [allWorkorders, setAllWorkorders] =
 useState([]);


 /* ==========================================================
 CLIENT FILTER
 ========================================================== */

 const [clientFilter, setClientFilter] =
 useState('all');


 /* ==========================================================
 CANDIDATE FILTER
 ========================================================== */

 const [candidateFilter, setCandidateFilter] =
 useState('all');


 /* ==========================================================
 DATE FILTER
 ========================================================== */

 const [dateFilter, setDateFilter] =
 useState('all');

 const [customStartDate, setCustomStartDate] =
 useState('');

 const [customEndDate, setCustomEndDate] =
 useState('');


 /* ============================================================
 CLIENT NAME HELPER
 
 Handles:
 client
 clientName
 client_name
 client.name
 client.companyName
 client.company
 client.displayName
============================================================ */

 const getClientName = (wo) => {

 if (!wo) {
 return '';
 }


 /* STRING */

 if (
 typeof wo.client === 'string' &&
 wo.client.trim()
 ) {

 return wo.client.trim();

 }


 if (
 typeof wo.clientName === 'string' &&
 wo.clientName.trim()
 ) {

 return wo.clientName.trim();

 }


 if (
 typeof wo.client_name === 'string' &&
 wo.client_name.trim()
 ) {

 return wo.client_name.trim();

 }


 /* OBJECT */

 if (
 wo.client &&
 typeof wo.client === 'object'
 ) {

 return (

 wo.client.name ||

 wo.client.clientName ||

 wo.client.companyName ||

 wo.client.company ||

 wo.client.displayName ||

 wo.client.client_name ||

 ''

 );

 }


 return '';

 };


 /* ============================================================
 CANDIDATE NAME HELPER
============================================================ */

 const getCandidateName = (wo) => {

 if (!wo) {
 return '';
 }


 if (
 typeof wo.candidate === 'string' &&
 wo.candidate.trim()
 ) {

 return wo.candidate.trim();

 }


 if (
 typeof wo.candidateName === 'string' &&
 wo.candidateName.trim()
 ) {

 return wo.candidateName.trim();

 }


 if (
 typeof wo.candidate_name === 'string' &&
 wo.candidate_name.trim()
 ) {

 return wo.candidate_name.trim();

 }


 if (
 typeof wo.name === 'string' &&
 wo.name.trim()
 ) {

 return wo.name.trim();

 }


 if (
 wo.candidate &&
 typeof wo.candidate === 'object'
 ) {

 return (

 wo.candidate.name ||

 wo.candidate.fullName ||

 wo.candidate.candidateName ||

 wo.candidate.displayName ||

 ''

 );

 }


 return '';

 };


 /* ============================================================
 BUILD CLIENT OPTIONS
============================================================ */

 const clientOptions = [
 ...new Set(

 allWorkorders

 .map(
 (wo) =>
 getClientName(wo)
 )

 .filter(
 (name) =>
 name &&
 String(name).trim()
 )

 .map(
 (name) =>
 String(name).trim()
 )

 )
 ].sort(
 (a, b) =>
 a.localeCompare(b)
 );


 /* ============================================================
 BUILD CANDIDATE OPTIONS
============================================================ */

 const candidateOptions = [
 ...new Set(

 allWorkorders

 .map(
 (wo) =>
 getCandidateName(wo)
 )

 .filter(
 (name) =>
 name &&
 String(name).trim()
 )

 .map(
 (name) =>
 String(name).trim()
 )

 )
 ].sort(
 (a, b) =>
 a.localeCompare(b)
 );


 /* ============================================================
 DATE HELPERS
============================================================ */

 const startOfDay = (date) => {

 const d =
 new Date(date);

 d.setHours(
 0,
 0,
 0,
 0
 );

 return d;

 };


 const endOfDay = (date) => {

 const d =
 new Date(date);

 d.setHours(
 23,
 59,
 59,
 999
 );

 return d;

 };


 /* ============================================================
 GET WORKORDER DATE
============================================================ */

 const getWorkorderDate = (wo) => {

 const rawDate =

 wo.createdAt ||

 wo.createdDate ||

 wo.workorderDate ||

 wo.workOrderDate ||

 wo.date ||

 wo.assignedDate ||

 wo.updatedAt;


 if (!rawDate) {
 return null;
 }


 const parsed =
 new Date(rawDate);


 if (
 isNaN(
 parsed.getTime()
 )
 ) {

 return null;

 }


 return parsed;

 };


 /* ============================================================
 APPLY ALL FILTERS
============================================================ */

 const getFilteredData = () => {

 if (
 !allWorkorders.length
 ) {

 return [];

 }


 /* START WITH ALL DATA */

 let filtered =
 [...allWorkorders];


 /* ========================================================
 CLIENT FILTER
 ======================================================== */

 if (
 clientFilter !== 'all'
 ) {

 filtered =
 filtered.filter(
 (wo) => {

 const clientName =
 String(
 getClientName(wo) || ''
 ).trim();


 return (
 clientName ===
 clientFilter
 );

 }
 );

 }


 /* ========================================================
 CANDIDATE FILTER
 ======================================================== */

 if (
 candidateFilter !== 'all'
 ) {

 filtered =
 filtered.filter(
 (wo) => {

 const candidateName =
 String(
 getCandidateName(wo) || ''
 ).trim();


 return (
 candidateName ===
 candidateFilter
 );

 }
 );

 }


 /* ========================================================
 NO DATE FILTER
 ======================================================== */

 if (
 dateFilter === 'all'
 ) {

 return filtered;

 }


 const now =
 new Date();


 let startDate;
 let endDate;


 /* ========================================================
 TODAY
 ======================================================== */

 if (
 dateFilter === 'today'
 ) {

 startDate =
 startOfDay(now);

 endDate =
 endOfDay(now);

 }


 /* ========================================================
 YESTERDAY
 ======================================================== */

 else if (
 dateFilter === 'yesterday'
 ) {

 const yesterday =
 new Date(now);

 yesterday.setDate(
 yesterday.getDate() - 1
 );

 startDate =
 startOfDay(yesterday);

 endDate =
 endOfDay(yesterday);

 }


 /* ========================================================
 THIS MONTH
 ======================================================== */

 else if (
 dateFilter === 'thisMonth'
 ) {

 startDate =
 new Date(
 now.getFullYear(),
 now.getMonth(),
 1,
 0,
 0,
 0,
 0
 );


 endDate =
 new Date(
 now.getFullYear(),
 now.getMonth() + 1,
 0,
 23,
 59,
 59,
 999
 );

 }


 /* ========================================================
 PAST MONTH
 ======================================================== */

 else if (
 dateFilter === 'pastMonth'
 ) {

 startDate =
 new Date(
 now.getFullYear(),
 now.getMonth() - 1,
 1,
 0,
 0,
 0,
 0
 );


 endDate =
 new Date(
 now.getFullYear(),
 now.getMonth(),
 0,
 23,
 59,
 59,
 999
 );

 }


 /* ========================================================
 CUSTOM DATE
 ======================================================== */

 else if (
 dateFilter === 'custom'
 ) {

 if (
 !customStartDate ||
 !customEndDate
 ) {

 return filtered;

 }


 startDate =
 startOfDay(
 customStartDate
 );


 endDate =
 endOfDay(
 customEndDate
 );

 }


 if (
 !startDate ||
 !endDate
 ) {

 return filtered;

 }


 /* ========================================================
 APPLY DATE
 ======================================================== */

 return filtered.filter(
 (wo) => {

 const workorderDate =
 getWorkorderDate(wo);


 if (!workorderDate) {
 return false;
 }


 return (

 workorderDate >=
 startDate &&

 workorderDate <=
 endDate

 );

 }
 );

 };


 /* ============================================================
 UPDATE DASHBOARD
============================================================ */

 const updateDashboard =
 (data) => {


 /* ========================================================
 STATS
 ======================================================== */

 const totalWorkOrders =
 data.length;


 const totalChecks =
 data.reduce(
 (sum, wo) =>
 sum +
 (
 Array.isArray(
 wo.checks
 )
 ? wo.checks.length
 : 0
 ),
 0
 );


 const completed =
 data.filter(
 (wo) => {

 const status =
 String(
 wo.status || ''
 ).toLowerCase();


 return (

 status ===
 'completed' ||

 status ===
 'complete'

 );

 }
 ).length;


 const inProgress =
 data.filter(
 (wo) => {

 const status =
 String(
 wo.status || ''
 ).toLowerCase();


 return (

 status ===
 'active' ||

 status ===
 'in progress' ||

 status ===
 'inprogress' ||

 status ===
 'pending'

 );

 }
 ).length;


 const discrepancies =
 data.filter(
 (wo) => {

 const status =
 String(
 wo.status || ''
 ).toLowerCase();


 return (

 status ===
 'stopped' ||

 status ===
 'discrepancy' ||

 status ===
 'failed'

 );

 }
 ).length;


 setStatsData([

 {
 title:
 'Total Work Orders',

 value:
 totalWorkOrders,

 icon:
 FiBriefcase,

 change:
 12,

 color:
 COLORS.accent,

 colorRgb:
 COLORS.accentRgb
 },

 {
 title:
 'Total Checks',

 value:
 totalChecks,

 icon:
 FiSearch,

 change:
 8,

 color:
 COLORS.indigo,

 colorRgb:
 COLORS.indigoRgb
 },

 {
 title:
 'Completed',

 value:
 completed,

 icon:
 FiCheckCircle,

 change:
 24,

 color:
 COLORS.success,

 colorRgb:
 COLORS.successRgb
 },

 {
 title:
 'In Progress',

 value:
 inProgress,

 icon:
 FiClock,

 change:
 -4,

 color:
 COLORS.amber,

 colorRgb:
 COLORS.amberRgb
 },

 {
 title:
 'Discrepancies',

 value:
 discrepancies,

 icon:
 FiAlertCircle,

 change:
 2,

 color:
 COLORS.error,

 colorRgb:
 COLORS.errorRgb
 }

 ]);


 /* ========================================================
 CLIENT DATA
 ======================================================== */

 const clients = {};

data.forEach((wo) => {
 const clientName =
 getClientName(wo) ||
 'Unknown Client';

 const candidateName =
 wo.fullName ||
 'Unknown Candidate';

 const key = `${clientName}-${candidateName}`;

 if (!clients[key]) {
 clients[key] = {
 client: clientName,
 candidate: candidateName,
 wos: 0,
 checks: 0
 };
 }

 clients[key].wos += 1;

 clients[key].checks +=
 Array.isArray(wo.checks)
 ? wo.checks.length
 : 0;
});

const finalTableData =
 Object.values(clients).map((c) => ({
 ...c,
 amount: '—',
 status: 'Active'
 }));


 setTableData(
 finalTableData
 );


 setChartData(
 finalTableData
 );


 /* ========================================================
 PIE DATA
 ======================================================== */

 const types = {};


 const pieColors = {

 Address:
 COLORS.accent,

 Education:
 COLORS.indigo,

 Employment:
 COLORS.amber,

 Criminal:
 COLORS.error,

 Court:
 '#8B5CF6'

 };


 data.forEach(
 (wo) => {

 (
 Array.isArray(
 wo.checks
 )
 ? wo.checks
 : []
 ).forEach(
 (check) => {

 const t =
 check.checkType ||
 'Other';


 types[t] =
 (
 types[t] || 0
 ) + 1;

 }
 );

 }
 );


 setPieData(

 Object.entries(
 types
 ).map(
 ([name, value]) => ({

 name,

 value,

 color:
 pieColors[name] ||
 '#64748B'

 })
 )

 );

 };


 /* ============================================================
 GET DATA FROM BACKEND
============================================================ */

 const getData =
 async (
 isRefresh = false
 ) => {

 if (isRefresh) {

 setIsRefreshing(
 true
 );

 } else {

 setIsLoading(
 true
 );

 }


 setIsOffline(
 false
 );

 setErrorMessage(
 ""
 );


 try {

 const response =
 await axios.get(
 'https://backend-r6xl.onrender.com/api/workorders'
 );


 const resData =
 response.data;


 const data =
 resData.workorders ||
 [];


 /* ======================================================
 DEBUG BACKEND DATA
 ====================================================== */

 console.log(
 '===================================='
 );

 console.log(
 'WORKORDERS FROM BACKEND:',
 data
 );

 console.log(
 'CLIENT VALUES:',
 data.map(
 (wo) => ({

 client:
 wo.client,

 clientName:
 wo.clientName,

 client_name:
 wo.client_name

 })
 )
 );

 console.log(
 'CLIENT OPTIONS:',
 data
 .map(
 (wo) =>
 getClientName(wo)
 )
 .filter(Boolean)
 );

 console.log(
 '===================================='
 );


 if (
 data.length === 0
 ) {

 setIsOffline(
 true
 );

 setErrorMessage(
 'Backend connected, but the database is empty (returned 0 records).'
 );

 setAllWorkorders(
 []
 );

 return;

 }


 /* ======================================================
 STORE ALL DATA
 ====================================================== */

 setAllWorkorders(
 data
 );
 if (isRefresh) {
 setRefreshKey(
 prev => prev + 1
 );
} 

 } catch (
 error
 ) {

 console.error(
 'Axios fetch failed:',
 error
 );


 setIsOffline(
 true
 );


 if (
 error.response
 ) {

 setErrorMessage(
 `HTTP Status: ${error.response.status}`
 );

 }

 else if (
 error.request
 ) {

 setErrorMessage(
 'Network Error / CORS blocked: Ensure app.use(cors()) is in server.js.'
 );

 }

 else {

 setErrorMessage(
 error.message
 );

 }

 } finally {

 setIsLoading(
 false
 );

 setIsRefreshing(
 false
 );

 }

 };


 /* ============================================================
 INITIAL LOAD
============================================================ */

 useEffect(
 () => {

 getData();

 },
 []
 );


 /* ============================================================
 FILTER CHANGE
============================================================ */

 useEffect(
 () => {

 const filteredData =
 getFilteredData();


 updateDashboard(
 filteredData
 );

 },
 [
 allWorkorders,
 clientFilter,
 candidateFilter,
 dateFilter,
 customStartDate,
 customEndDate
 ]
 );


 /* ============================================================
 LOADING
============================================================ */

 if (
 isLoading
 ) {

 return (

 <div
 className="min-h-screen flex items-center justify-center"
 style={{
 background:
 '#f8fefd'
 }}
 >

 <div className="text-center">

 <FiLoader
 className="animate-spin mx-auto mb-4"
 size={40}
 style={{
 color:
 COLORS.indigo
 }}
 />

 <p>
 Loading...
 </p>

 </div>

 </div>

 );

 }


 /* ============================================================
 RETURN
============================================================ */

 return (

 <div
 className="space-y-8 min-h-screen -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8"
 style={{
 background:
 '#f8fefd'
 }}
 >

 {/* ======================================================
 HEADER
 ====================================================== */}

 <div
 className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
 >

 <div
 className="flex items-center gap-4"
 >

 <div
 className="w-11 h-11 rounded-2xl flex items-center justify-center text-3xl"
 style={{
 background:
 'linear-gradient(135deg, #8B5CF6, #EC4899)'
 }}
 >
 🛡️
 </div>


 <div>

 <h1
 className="text-3xl font-bold tracking-tight"
 style={{
 color:
 theme.colors.textPrimary,

 fontFamily:
 theme.fonts.display
 }}
 >

 <span
 style={{
 color:
 '#e899f3'
 }}
 >
 Dashboard
 </span>

 </h1>


 <div
 className="flex items-center gap-2 text-sm"
 style={{
 color:
 isOffline
 ? COLORS.error
 : theme.colors.textSecondary
 }}
 >

 <div
 className={`w-2 h-2 rounded-full ${
 isOffline
 ? 'bg-red-500'
 : 'bg-green-500 animate-pulse'
 }`}
 />

 {isOffline
 ? 'Connection Failed'
 : 'Live • Connected'
 }

 </div>

 </div>

 </div>


 <div
 className="flex items-center gap-3"
 >

 <button
 type="button"
 onClick={() => {
 if (!isRefreshing) {
 getData(true);
 }
 }}
 disabled={isRefreshing}
 className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-medium transition-all hover:scale-105 disabled:opacity-50"
 style={{
 background:
 'linear-gradient(135deg, #8B5CF6, #EC4899)',
 color: 'white',
 cursor: isRefreshing
 ? 'not-allowed'
 : 'pointer'
 }}
>
 <FiRefreshCw
 className={
 isRefreshing
 ? 'animate-spin'
 : ''
 }
 size={18}
 />

 {isRefreshing
 ? 'Refreshing...'
 : 'Refresh'
 }
</button>

 <div
 className="px-5 py-2.5 rounded-2xl text-sm font-medium flex items-center gap-2 font-mono tracking-widest"
 style={{
 background:
 theme.colors.bgSecondary,

 border:
 `1px solid ${theme.colors.border}`,

 color:
 '#080808'
 }}
 >

 <div
 className="w-2 h-2 rounded-full bg-green-500 animate-pulse"
 />

 {liveTime}

 </div>

 </div>

 </div>


 {/* ======================================================
 ERROR
 ====================================================== */}

 {isOffline && (

 <div
 className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl"
 >

 <h3
 className="text-red-800 font-bold flex items-center gap-2"
 >

 <FiAlertCircle />

 Why is my data showing 0?

 </h3>


 <p
 className="text-red-600 text-xs mt-2 font-mono bg-red-100 p-2 rounded"
 >
 Error:
 {' '}
 {errorMessage}
 </p>

 </div>

 )}


 {/* ======================================================
 FILTERS
 ====================================================== */}

 <div
 className="rounded-3xl p-6"
 style={{
 background:
 '#f8fefd',

 border:
 '1px solid #E2E8F0'
 }}
 >

 <div
 className="flex items-center gap-3 mb-5"
 >

 <div
 className="w-8 h-8 rounded-2xl flex items-center justify-center"
 style={{
 background:
 'rgba(139, 92, 246, 0.15)'
 }}
 >

 <FiUsers
 size={20}
 style={{
 color:
 '#C026D3'
 }}
 />

 </div>


 <h3
 className="font-semibold text-lg"
 style={{
 color:
 '#0F172A'
 }}
 >
 Filters
 </h3>

 </div>


 <div
 className="grid grid-cols-1 md:grid-cols-3 gap-6"
 >

 {/* ==================================================
 CLIENT FILTER
 ================================================== */}

 <div>

 <label
 className="block text-xs font-medium mb-2 tracking-widest"
 style={{
 color:
 '#64748B'
 }}
 >
 CLIENT
 </label>


 <select
 value={
 clientFilter
 }
 onChange={(e) => {

 setClientFilter(
 e.target.value
 );

 }}
 className="w-full rounded-2xl px-4 py-3 text-sm focus:outline-none"
 style={{
 background:
 '#f8fefd',

 border:
 '1px solid #CBD5E1',

 color:
 '#0F172A'
 }}
 >

 <option value="all">
 All Clients
 </option>


 {clientOptions.map(
 (client) => (

 <option
 key={client}
 value={client}
 >
 {client}
 </option>

 )
 )}

 </select>


 {/* DEBUG MESSAGE */}

 {clientOptions.length === 0 &&
 allWorkorders.length > 0 && (

 <p
 className="text-xs mt-2"
 style={{
 color:
 COLORS.error
 }}
 >
 No client names found in
 backend data.
 </p>

 )}

 </div>


 {/* ==================================================
 DATE RANGE
 ================================================== */}

 <div>

 <label
 className="block text-xs font-medium mb-2 tracking-widest"
 style={{
 color:
 '#64748B'
 }}
 >
 DATE RANGE
 </label>


 <select
 value={
 dateFilter
 }
 onChange={(e) => {

 const value =
 e.target.value;


 setDateFilter(
 value
 );


 if (
 value !==
 'custom'
 ) {

 setCustomStartDate(
 ''
 );

 setCustomEndDate(
 ''
 );

 }

 }}
 className="w-full rounded-2xl px-4 py-3 text-sm focus:outline-none"
 style={{
 background:
 '#f8fefd',

 border:
 '1px solid #CBD5E1',

 color:
 '#0F172A'
 }}
 >

 <option value="all">
 All
 </option>

 <option value="today">
 Today
 </option>

 <option value="yesterday">
 Yesterday
 </option>

 <option value="thisMonth">
 This Month
 </option>

 <option value="pastMonth">
 Past Month
 </option>

 <option value="custom">
 Custom Date
 </option>

 </select>

 </div>


 {/* ==================================================
 CANDIDATE
 ================================================== */}

 <div>

 {/* <label
 className="block text-xs font-medium mb-2 tracking-widest"
 style={{
 color:
 '#64748B'
 }}
 >
 CANDIDATE
 </label> */}


 {/* {/* <select
 value={
 candidateFilter
 }
 onChange={(e) => {

 setCandidateFilter(
 e.target.value
 );

 }}
 className="w-full rounded-2xl px-4 py-3 text-sm focus:outline-none"
 style={{
 background:
 '#f8fefd',

 border:
 '1px solid #CBD5E1',

 color:
 '#0F172A'
 }}
 >

 <option value="all">
 All Candidates
 </option>


 {candidateOptions.map(
 (candidate) => (

 <option
 key={candidate}
 value={candidate}
 >
 {candidate}
 </option>

 )
 )} 

 </select> */}

 </div>

 </div>


 {/* ======================================================
 CUSTOM DATE INPUTS
 ====================================================== */}

 {dateFilter ===
 'custom' && (

 <div
 className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5"
 >

 <div>

 <label
 className="block text-xs font-medium mb-2 tracking-widest"
 style={{
 color:
 '#64748B'
 }}
 >
 START DATE
 </label>


 <input
 type="date"
 value={
 customStartDate
 }
 onChange={(e) =>
 setCustomStartDate(
 e.target.value
 )
 }
 className="w-full rounded-2xl px-4 py-3 text-sm focus:outline-none"
 style={{
 background:
 '#f8fefd',

 border:
 '1px solid #CBD5E1',

 color:
 '#0F172A'
 }}
 />

 </div>


 <div>

 <label
 className="block text-xs font-medium mb-2 tracking-widest"
 style={{
 color:
 '#64748B'
 }}
 >
 END DATE
 </label>


 <input
 type="date"
 value={
 customEndDate
 }
 min={
 customStartDate ||
 undefined
 }
 onChange={(e) =>
 setCustomEndDate(
 e.target.value
 )
 }
 className="w-full rounded-2xl px-4 py-3 text-sm focus:outline-none"
 style={{
 background:
 '#f8fefd',

 border:
 '1px solid #CBD5E1',

 color:
 '#0F172A'
 }}
 />

 </div>

 </div>

 )}

 </div>


 {/* ======================================================
 ACTIVE FILTER INFO
 ====================================================== */}

 {(clientFilter !== 'all' ||
 candidateFilter !== 'all' ||
 dateFilter !== 'all') && (

 <div
 className="flex flex-wrap items-center gap-2"
 >

 <span
 className="text-xs font-semibold"
 style={{
 color:
 COLORS.muted
 }}
 >
 Active filters:
 </span>


 {clientFilter !==
 'all' && (

 <span
 className="px-3 py-1 rounded-full text-xs font-medium"
 style={{
 background:
 'rgba(139,92,246,0.1)',

 color:
 COLORS.accent
 }}
 >
 Client: {clientFilter}
 </span>

 )}


 {candidateFilter !==
 'all' && (

 <span
 className="px-3 py-1 rounded-full text-xs font-medium"
 style={{
 background:
 'rgba(99,102,241,0.1)',

 color:
 COLORS.indigo
 }}
 >
 Candidate:
 {' '}
 {candidateFilter}
 </span>

 )}


 {dateFilter !==
 'all' && (

 <span
 className="px-3 py-1 rounded-full text-xs font-medium"
 style={{
 background:
 'rgba(16,185,129,0.1)',

 color:
 COLORS.success
 }}
 >
 Date:
 {' '}
 {dateFilter}
 </span>

 )}


 <button
 onClick={() => {

 setClientFilter(
 'all'
 );

 setCandidateFilter(
 'all'
 );

 setDateFilter(
 'all'
 );

 setCustomStartDate(
 ''
 );

 setCustomEndDate(
 ''
 );

 }}
 className="text-xs font-semibold px-3 py-1 rounded-full"
 style={{
 color:
 COLORS.error
 }}
 >
 Clear Filters
 </button>

 </div>

 )}


 {/* ======================================================
 OVERVIEW
 ====================================================== */}

 <h2
 className="text-2xl font-semibold"
 style={{
 color:
 theme.colors.textPrimary
 }}
 >
 Overview
 </h2>


 {/* ======================================================
 STATS
 ====================================================== */}

 <div
 className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
 >

 {statsData.map(
 (stat, i) => (

 <StatCard
 key={`${i}-${refreshKey}`}
 {...stat}
 delay={i}
 refreshKey={refreshKey}
 />

 )
)}

 </div>


 {/* ======================================================
 CHARTS
 ====================================================== */}

 <div
 className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
 >

 <div
 className="lg:col-span-2"
 >

 <ChartCard
 title="Verification Trends"
 >

 <div
 className="h-[300px]"
 >

 <ResponsiveContainer
 width="100%"
 height="100%"
 >

 <AreaChart
 data={[
 {

 month:
 dateFilter ===
 'all'
 ? 'All'
 : dateFilter ===
 'today'
 ? 'Today'
 : dateFilter ===
 'yesterday'
 ? 'Yesterday'
 : dateFilter ===
 'thisMonth'
 ? 'This Month'
 : dateFilter ===
 'pastMonth'
 ? 'Past Month'
 : 'Custom',

 checks:
 statsData[1].value,

 wos:
 statsData[0].value

 }

 ]}
 >

 <defs>

 <linearGradient
 id="g1"
 x1="0"
 y1="0"
 x2="0"
 y2="1"
 >

 <stop
 offset="5%"
 stopColor={
 COLORS.accent
 }
 stopOpacity={
 0.3
 }
 />

 <stop
 offset="95%"
 stopColor={
 COLORS.accent
 }
 stopOpacity={
 0
 }
 />

 </linearGradient>

 </defs>


 <CartesianGrid
 strokeDasharray="3 3"
 stroke={
 theme.colors.border
 }
 vertical={
 false
 }
 />


 <XAxis
 dataKey="month"
 axisLine={
 false
 }
 tickLine={
 false
 }
 tick={{
 fill:
 COLORS.muted,
 fontSize:
 12
 }}
 />


 <YAxis
 axisLine={
 false
 }
 tickLine={
 false
 }
 tick={{
 fill:
 COLORS.muted,
 fontSize:
 12
 }}
 />


 <Tooltip
 content={
 <CustomTooltip />
 }
 />


 <Area
 type="monotone"
 dataKey="checks"
 stroke={
 COLORS.accent
 }
 strokeWidth={
 3
 }
 fill="url(#g1)"
 name="Checks"
 />


 <Area
 type="monotone"
 dataKey="wos"
 stroke={
 COLORS.indigo
 }
 strokeWidth={
 3
 }
 fill="url(#g1)"
 name="Work Orders"
 />

 </AreaChart>

 </ResponsiveContainer>

 </div>

 </ChartCard>

 </div>


 {/* ====================================================
 PIE
 ==================================================== */}

 <ChartCard
 title="Check Breakdown"
 >

 <div
 className="h-[300px] relative flex items-center justify-center"
 >

 {pieData.length >
 0 ? (

 <>

 <ResponsiveContainer
 width="100%"
 height="85%"
 >

 <PieChart>

 <Pie
 data={
 pieData
 }
 cx="50%"
 cy="50%"
 innerRadius={
 68
 }
 outerRadius={
 95
 }
 paddingAngle={
 6
 }
 dataKey="value"
 >

 {pieData.map(
 (
 entry,
 index
 ) => (

 <Cell
 key={
 index
 }
 fill={
 entry.color
 }
 />

 )
 )}

 </Pie>


 <Tooltip
 content={
 <CustomTooltip />
 }
 />

 </PieChart>

 </ResponsiveContainer>


 <div
 className="absolute text-center pointer-events-none"
 >

 <div
 className="text-4xl font-bold"
 style={{
 color:
 theme.colors.textPrimary
 }}
 >
 {
 statsData[1]
 .value
 }
 </div>


 <div
 className="text-xs tracking-widest"
 style={{
 color:
 COLORS.muted
 }}
 >
 TOTAL
 </div>

 </div>

 </>

 ) : (

 <p
 className="text-sm"
 style={{
 color:
 COLORS.muted
 }}
 >
 0 Checks
 </p>

 )}

 </div>

 </ChartCard>

 </div>


 {/* ======================================================
 BOTTOM ROW
 ====================================================== */}

 <div
 className="grid grid-cols-1 lg:grid-cols-3 gap-6"
 >

 {/* ====================================================
 CLIENT WORK ORDERS
 ==================================================== */}

 <ChartCard
 title="Client Work Orders"
 >

 <div
 className="h-[280px]"
 >

 {chartData.length >
 0 ? (

 <ResponsiveContainer
 width="100%"
 height="100%"
 >

 <BarChart
 data={
 chartData
 }
 barSize={
 26
 }
 >

 <CartesianGrid
 strokeDasharray="3 3"
 stroke={
 theme.colors.border
 }
 horizontal={
 false
 }
 />


 <XAxis
 dataKey="client"
 axisLine={
 false
 }
 tickLine={
 false
 }
 tick={{
 fill:
 COLORS.muted,
 fontSize:
 11
 }}
 />


 <YAxis
 axisLine={
 false
 }
 tickLine={
 false
 }
 tick={{
 fill:
 COLORS.muted,
 fontSize:
 11
 }}
 />


 <Tooltip
 content={
 <CustomTooltip />
 }
 />


 <Bar
 dataKey="wos"
 fill={
 COLORS.indigo
 }
 radius={[
 6,
 6,
 0,
 0
 ]}
 />

 </BarChart>

 </ResponsiveContainer>

 ) : (

 <div
 className="h-full flex items-center justify-center text-sm"
 style={{
 color:
 COLORS.muted
 }}
 >
 0 Clients
 </div>

 )}

 </div>

 </ChartCard>


 {/* ====================================================
 TABLE
 ==================================================== */}

 <div
 className="lg:col-span-2"
 >

 <div
 className="rounded-2xl p-6 h-full"
 style={{
 background:
 theme.colors.glassBg,

 border:
 `1px solid ${theme.colors.glassBorder}`
 }}
 >

 <div className="flex items-center justify-between mb-6">

 <h3
 className="text-sm font-semibold"
 style={{
 color:
 theme.colors.textPrimary
 }}
 >
 Candidates Overview
 </h3>

 <button
 type="button"
 onClick={() =>
 navigate('/employee-workorder-dashboard')
 }
 className="px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 hover:scale-105"
 style={{
 background:
 'linear-gradient(135deg, #8B5CF6, #EC4899)',
 color: '#ffffff',
 boxShadow:
 '0 4px 12px rgba(139,92,246,0.20)'
 }}
 >
 View All
 </button>

</div>

 

 <div
 className="overflow-x-auto"
 >

 <table
 className="w-full min-w-[500px]"
 >

 <thead>

 <tr
 className="border-b"
 style={{
 borderColor:
 theme.colors.border
 }}
 >

 {[
 'CLIENT',
 'CANDIDATE NAME',
 'CHECKS',
 'STATUS',
 'REFERENCE'
].map(
 (h, index) => (

 <th
 key={
 `${h}-${index}`
 }
 className="pb-4 text-left text-xs font-semibold tracking-widest"
 style={{
 color:
 COLORS.muted
 }}
 >
 {h}
 </th>

 )
 )}

 </tr>

 </thead>


 <tbody>

 {tableData.length >
 0

 ? tableData.map(
 (
 row,
 i
 ) => {

 return (

 <tr
 key={i}
 className="border-b last:border-0"
 style={{
 borderColor:
 theme.colors.border
 }}
 >

 <td
 className="py-5"
 >

 <div
 className="flex items-center gap-3"
 >

 <div
 className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold"
 style={{
 background:
 `rgba(${COLORS.indigoRgb},0.15)`,

 color:
 COLORS.indigo
 }}
 >
 {row.client
 ? row.client.charAt(
 0
 )
 : '?'}
 </div>


 <span
 className="font-medium"
 style={{
 color:
 theme.colors.textPrimary
 }}
 >
 {row.client}
 </span>

 </div>

 </td>


 <td
 className="py-5 text-sm"
 style={{
 color:
 theme.colors.textSecondary
 }}
 >
 {row.candidate}
 </td>


 <td
 className="py-5 text-sm"
 style={{
 color:
 theme.colors.textSecondary
 }}
 >
 {row.checks}
 </td>


 <td
 className="py-5"
 >

 <span
 className="inline-flex px-4 py-1 rounded-2xl text-xs font-semibold"
 style={{
 background:
 'rgba(16,185,129,0.1)',

 color:
 COLORS.success
 }}
 >
 Active
 </span>

 </td>


 <td
 className="py-5 font-medium"
 style={{
 color:
 theme.colors.textPrimary
 }}
 >
 —
 </td>

 </tr>

 );

 }
 )

 : (

 <tr>

 <td
 colSpan="5"
 className="py-10 text-center text-sm"
 style={{
 color:
 COLORS.muted
 }}
 >
 0 Work Orders Found
 </td>

 </tr>

 )}

 </tbody>

 </table>

 </div>

 </div>

 </div>

 </div>

 </div>

 );

}
