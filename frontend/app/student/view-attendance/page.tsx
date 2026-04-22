"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  FileSpreadsheet, 
  ArrowLeft, 
  Calendar, 
  GraduationCap, 
  Users, 
  BookOpen, 
  Layout, 
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  BarChart3,
  Filter
} from "lucide-react";
// XLSX is dynamically imported in the browser-only export function to avoid
// bundling issues on the server (e.g. "fs" not found). Do not import at module top-level.

interface AttendanceRecord {
  _id: string;
  studentId: string;
  studentName: string;
  date: string;
  time: string;
  status: "present" | "absent";
  confidence: number;
  department?: string;
  year?: string;
  division?: string;
}

export default function ViewAttendance() {
  const router = useRouter();
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterDivision, setFilterDivision] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterStudentId] = useState("");
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    attendanceRate: 0,
  });
  const [searched, setSearched] = useState(false);

  const fetchAttendanceData = async () => {
    if (!selectedDate && !filterDepartment) {
      alert("Please select at least one filter.");
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDate) params.set("date", selectedDate);
      if (filterDepartment) params.set("department", filterDepartment);
      if (filterYear) params.set("year", filterYear);
      if (filterDivision) params.set("division", filterDivision);
      if (filterSubject) params.set("subject", filterSubject);
      if (filterStudentId) params.set("student_id", filterStudentId);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001"}/api/attendance?${params.toString()}`);
      const raw = await res.text();
      let data: { success: boolean; attendance: AttendanceRecord[]; stats: { totalStudents: number; presentToday: number; absentToday: number; attendanceRate: number }; date?: string };
      try {
        data = JSON.parse(raw);
      } catch (err) {
        console.error("Failed to parse /api/attendance response as JSON. status=", res.status, "body=", raw);
        throw err;
      }

      if (data && data.success) {
        const mappedData: AttendanceRecord[] = data.attendance.map((record: AttendanceRecord & { student_id?: string; student_name?: string; markedAt?: string; time?: string; confidence?: number }, idx: number) => ({
          _id: record.studentId || `row-${idx}`,
          studentId: record.studentId || record.student_id || "-",
          studentName: record.studentName || record.student_name || "-",
          date: record.date || data.date || selectedDate,
          time: record.markedAt || record.time || "-",
          status: record.status || "present",
          confidence: record.confidence || 0,
        }));
        setAttendanceData(mappedData);
        setStats(data.stats);
      }
      setSearched(true);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedDate) params.set("date", selectedDate);
      if (filterDepartment) params.set("department", filterDepartment);
      if (filterYear) params.set("year", filterYear);
      if (filterDivision) params.set("division", filterDivision);
      if (filterSubject) params.set("subject", filterSubject);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001"}/api/attendance/export?${params.toString()}`);
      const raw = await res.text();
      let data: { success: boolean; data: Array<{ studentId: string; name: string; subject: string; date: string; status: string }> };
      try {
        data = JSON.parse(raw);
      } catch (err) {
        console.error("Failed to parse /api/attendance/export response as JSON. status=", res.status, "body=", raw);
        throw err;
      }
      if (data && data.success) {
        // Dynamic import so bundlers (Next.js SSR) don't try to include node-only deps
        const XLSX = await import("xlsx");
        const worksheet = XLSX.utils.json_to_sheet(data.data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
        XLSX.writeFile(workbook, `attendance_${selectedDate || "export"}.xlsx`);
      }
    } catch (error) {
      console.error("Error exporting excel:", error);
    }
  };

  const departments = [
    "Computer Science", "Information Technology", "Electronics", 
    "Mechanical", "Civil", "Electrical", "Chemical", "Biotechnology"
  ];
  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const divisions = ["A", "B", "C", "D"];

  return (
    <main className="min-h-screen relative bg-slate-950 text-slate-100 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-600/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-red-600/10 blur-[120px]"></div>
      </div>

      <div className="relative z-10 p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl shadow-black/20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Attendance Records</h1>
                <p className="text-slate-400 mt-1">Comprehensive student attendance analytics and reporting</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/teacher/dashboard")}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl border border-white/5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </button>
          </div>

          {/* Search & Filters Grid */}
          <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-12 bg-slate-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl">
              <div className="flex items-center gap-3 mb-6 pb-2 border-b border-white/5">
                <Filter size={20} className="text-orange-400" />
                <h3 className="text-lg font-semibold text-slate-100">Filters</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Calendar size={12} /> Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/10 px-4 py-2.5 rounded-xl text-slate-200 focus:ring-2 focus:ring-orange-500/50 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <GraduationCap size={12} /> Department
                  </label>
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/10 px-4 py-2.5 rounded-xl text-slate-200 focus:ring-2 focus:ring-orange-500/50 outline-none transition-all appearance-none"
                  >
                    <option value="">All Depts</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Layout size={12} /> Year
                  </label>
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/10 px-4 py-2.5 rounded-xl text-slate-200 focus:ring-2 focus:ring-orange-500/50 outline-none transition-all appearance-none"
                  >
                    <option value="">All Years</option>
                    {years.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Users size={12} /> Division
                  </label>
                  <select
                    value={filterDivision}
                    onChange={(e) => setFilterDivision(e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/10 px-4 py-2.5 rounded-xl text-slate-200 focus:ring-2 focus:ring-orange-500/50 outline-none transition-all appearance-none"
                  >
                    <option value="">All Divisions</option>
                    {divisions.map(d => (
                      <option key={d} value={d}>Division {d}</option>
                    ))}
                  </select>
                </div>



                <div className="flex items-end gap-2">
                  <button
                    onClick={fetchAttendanceData}
                    disabled={loading}
                    className="flex-1 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-medium rounded-xl disabled:opacity-50 transition-all duration-300 shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
                  >
                    <Search size={16} /> {loading ? "..." : "Search"}
                  </button>
                  <button
                    onClick={exportExcel}
                    className="p-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl transition-all"
                  >
                    <FileSpreadsheet size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          {attendanceData.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Total Students</p>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-white">{stats.totalStudents}</span>
                  <Users className="w-8 h-8 text-blue-400 opacity-20" />
                </div>
              </div>
              <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Present</p>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-emerald-400">{stats.presentToday}</span>
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 opacity-20" />
                </div>
              </div>
              <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Absent</p>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-red-400">{stats.absentToday}</span>
                  <XCircle className="w-8 h-8 text-red-400 opacity-20" />
                </div>
              </div>
              <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-400/20 to-red-400/0 rounded-bl-full"></div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Attendance Rate</p>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-orange-400">{stats.attendanceRate}%</span>
                  <ClipboardCheck className="w-8 h-8 text-orange-400 opacity-20" />
                </div>
              </div>
            </div>
          )}

          {/* Results Table */}
          <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-100 flex items-center gap-3">
                <ClipboardCheck size={22} className="text-orange-400" />
                Student Roster 
                {selectedDate && <span className="text-sm font-normal text-slate-500 ml-2">({new Date(selectedDate).toLocaleDateString()})</span>}
              </h3>
            </div>

            {loading ? (
              <div className="p-20 flex flex-col items-center justify-center text-slate-500">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
                <p className="text-lg font-medium">Accessing records...</p>
              </div>
            ) : !searched ? (
              <div className="p-24 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 ring-1 ring-white/10">
                  <Search size={32} className="text-slate-500" />
                </div>
                <p className="text-xl font-medium text-slate-300 mb-2">Apply filters to start</p>
                <p className="text-slate-500 max-w-sm">Select a date or department and click search to pull up the student attendance data.</p>
              </div>
            ) : attendanceData.length === 0 ? (
              <div className="p-24 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 ring-1 ring-white/10">
                  <XCircle size={32} className="text-slate-500" />
                </div>
                <p className="text-xl font-medium text-slate-300 mb-2">No Records Found</p>
                <p className="text-slate-500">We couldn&apos;t find any attendance data matching those filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-800/50 border-b border-white/5">
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Student ID</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Department / Class</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Marked At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {attendanceData.map((record) => (
                      <tr key={record._id} className="group hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-300">{record.studentId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-base font-semibold text-slate-100 group-hover:text-orange-400 transition-colors">{record.studentName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm text-slate-300">{record.department}</span>
                            <span className="text-xs text-slate-500">{record.year} • Div {record.division}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                            record.status === "present"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border-red-500/20 shadow-[inset_0_0_10px_rgba(239,68,68,0.1)]"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${record.status === "present" ? "bg-emerald-400" : "bg-red-400"}`}></span>
                            {record.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                          {record.time && record.time !== "-" ? (
                             new Date(record.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </main>
  );
}
