"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, UserX, UserSearch, UserPen, RotateCcw, Save, Trash2, ArrowLeft } from "lucide-react";

interface Student {
  _id: string;
  studentId: string;
  studentName: string;
  department: string;
  year: string;
  division: string;
  semester: string;
  email: string;
  phoneNumber: string;
  status?: string;
  created_at?: number;
  updated_at?: number;
}

interface SearchFilters {
  studentId: string;
  department: string;
  year: string;
  division: string;
  studentName: string;
}

export default function TeacherUpdateStudentDetails() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [originalStudent, setOriginalStudent] = useState<Student | null>(null);
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [searching, setSearching] = useState(false);
  const [, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState("");
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);
  const [userType, setUserType] = useState<"student" | "teacher">("teacher");

  // Role-aware dashboard path
  const dashboardPath = useMemo(
    () => (userType === "teacher" ? "/teacher/dashboard" : "/dashboard"),
    [userType]
  );

  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    studentId: "",
    department: "",
    year: "",
    division: "",
    studentName: ""
  });

  const departments = [
    "Computer Science", "Information Technology", "Electronics", 
    "Mechanical", "Civil", "Electrical", "Chemical", "Biotechnology"
  ];
  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const divisions = ["A", "B", "C", "D"];
  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];

  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const loggedIn = localStorage.getItem("isLoggedIn") === "true";
        const utype = (localStorage.getItem("userType") as "student" | "teacher") || "student";
        
        if (!loggedIn || utype !== "teacher") {
          setIsAuthed(false);
          router.replace("/signin");
        } else {
          setIsAuthed(true);
          setUserType(utype);
        }
      } catch {
        setIsAuthed(false);
        router.replace("/signin");
      }
    };

    const timeoutId = setTimeout(checkAuthStatus, 100);
    return () => clearTimeout(timeoutId);
  }, [router]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSearchFilters(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const clearFilters = () => {
    setSearchFilters({
      studentId: "",
      department: "",
      year: "",
      division: "",
      studentName: ""
    });
    setSearchResults([]);
    setStatus("");
  };

  const searchStudents = async () => {
    setSearching(true);
    setStatus("");
    setSearchResults([]);

    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value.trim()) {
          params.append(key, value.trim());
        }
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001"}/api/teacher/students/search?${params}`, {
        headers: {
          "Content-Type": "application/json",
          "X-User-Type": "teacher",
          "X-User-Email": localStorage.getItem("userEmail") || ""
        }
      });

      const data = await res.json();

      if (data.success) {
        setSearchResults(data.students);
        if (data.students.length === 0) {
          setStatus("No students found matching your search criteria");
        } else {
          setStatus(`Found ${data.students.length} student(s)`);
        }
      } else {
        setStatus(`❌ ${data.error || "Search failed"}`);
        setSearchResults([]);
      }
    } catch {
      setStatus("❌ Error connecting to server");
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const selectStudent = async (selectedStudent: Student) => {
    setLoading(true);
    setStatus("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001"}/api/teacher/student/${selectedStudent._id}`, {
        headers: {
          "Content-Type": "application/json",
          "X-User-Type": "teacher",
          "X-User-Email": localStorage.getItem("userEmail") || ""
        }
      });

      const data = await res.json();

      if (data.success && data.student) {
        setStudent(data.student);
        setOriginalStudent({ ...data.student });
        setStatus(`Selected student: ${data.student.studentName}`);
      } else {
        setStatus(`❌ ${data.error || "Could not load student details"}`);
      }
    } catch {
      setStatus("❌ Error loading student details");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (student) {
      setStudent(prev => ({
        ...prev!,
        [e.target.name]: e.target.value
      }));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    setUpdating(true);
    setStatus("Updating student details...");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001"}/api/teacher/student/${student._id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "X-User-Type": "teacher",
          "X-User-Email": localStorage.getItem("userEmail") || ""
        },
        body: JSON.stringify({
          studentName: student.studentName,
          studentId: student.studentId,
          department: student.department,
          year: student.year,
          division: student.division,
          semester: student.semester,
          email: student.email,
          phoneNumber: student.phoneNumber
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setStatus("✅ Student details updated successfully!");
        setOriginalStudent({ ...student });
        // Update search results if student is in the list
        setSearchResults(prev => prev.map(s => s._id === student._id ? student : s));
      } else {
        setStatus(`❌ ${data.error}`);
      }
    } catch {
      setStatus("❌ Error connecting to server");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!student) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete student ${student.studentName} (ID: ${student.studentId})?\n\nThis action cannot be undone and will remove all face recognition data.`
    );
    
    if (!confirmed) return;

    setUpdating(true);
    setStatus("Deleting student...");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001"}/api/teacher/student/${student._id}`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          "X-User-Type": "teacher",
          "X-User-Email": localStorage.getItem("userEmail") || ""
        }
      });
      
      const data = await res.json();
      
      if (data.success) {
        setStatus(`✅ Student ${student.studentName} deleted successfully!`);
        setStudent(null);
        setOriginalStudent(null);
        // Remove from search results
        setSearchResults(prev => prev.filter(s => s._id !== student._id));
      } else {
        setStatus(`❌ ${data.error}`);
      }
    } catch {
      setStatus("❌ Error connecting to server");
    } finally {
      setUpdating(false);
    }
  };

  const resetForm = () => {
    if (originalStudent) {
      setStudent({ ...originalStudent });
      setStatus("");
    }
  };

  const hasChanges = () => {
    if (!student || !originalStudent) return false;
    return JSON.stringify(student) !== JSON.stringify(originalStudent);
  };

  if (isAuthed === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authorization...</p>
        </div>
      </div>
    );
  }

  if (isAuthed === false) {
    return null;
  }

  return (
    <main className="min-h-screen relative bg-slate-950 text-slate-100 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]"></div>
      </div>

      <div className="relative z-10 p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl shadow-black/20">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Update Student Details</h1>
              <p className="text-slate-400 mt-1">Search, manage, and update student information instantly</p>
            </div>
            <button
              onClick={() => router.push(dashboardPath)}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl border border-white/5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </button>
          </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Advanced Search Panel */}
          <div className="lg:col-span-3 bg-slate-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
              <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                <Search size={20} />
              </div>
              <h3 className="text-lg font-semibold text-slate-100">Find Student</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Student ID</label>
                <input type="text" name="studentId" placeholder="e.g. STU001" value={searchFilters.studentId} onChange={handleFilterChange}
                  className="w-full bg-slate-950/50 border border-white/10 px-4 py-2.5 rounded-xl text-slate-200 placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Student Name</label>
                <input type="text" name="studentName" placeholder="e.g. John Doe" value={searchFilters.studentName} onChange={handleFilterChange}
                  className="w-full bg-slate-950/50 border border-white/10 px-4 py-2.5 rounded-xl text-slate-200 placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Department</label>
                <select name="department" value={searchFilters.department} onChange={handleFilterChange}
                  className="w-full bg-slate-950/50 border border-white/10 px-4 py-2.5 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none">
                  <option value="">All Departments</option>
                  {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Year</label>
                <select name="year" value={searchFilters.year} onChange={handleFilterChange}
                  className="w-full bg-slate-950/50 border border-white/10 px-4 py-2.5 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none">
                  <option value="">All Years</option>
                  {years.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Division</label>
                <select name="division" value={searchFilters.division} onChange={handleFilterChange}
                  className="w-full bg-slate-950/50 border border-white/10 px-4 py-2.5 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none">
                  <option value="">All Divisions</option>
                  {divisions.map(div => <option key={div} value={div}>Division {div}</option>)}
                </select>
              </div>

              <div className="pt-4 space-y-3">
                <button onClick={searchStudents} disabled={searching}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl disabled:opacity-50 transition-all duration-300 shadow-lg shadow-blue-500/25">
                  <Search size={18} /> {searching ? "Searching..." : "Search"}
                </button>
                <button onClick={clearFilters}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-all duration-300 border border-white/5">
                  <RotateCcw size={18} /> Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Search Results */}
          <div className="lg:col-span-3 bg-slate-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl flex flex-col">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
              <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                <UserSearch size={20} />
              </div>
              <h3 className="text-lg font-semibold text-slate-100">Results</h3>
              <span className="ml-auto bg-slate-800 text-xs px-2.5 py-1 rounded-full text-slate-300 border border-white/10">{searchResults.length}</span>
            </div>
            
            {searchResults.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-slate-500">
                <UserX size={48} strokeWidth={1} className="mb-4 text-slate-600 opacity-50" />
                <p className="text-base font-medium text-slate-400">No students found</p>
                <p className="text-sm mt-1">Adjust filters to find students</p>
              </div>
            ) : (
              <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[500px]">
                {searchResults.map(studentItem => (
                  <div
                    key={studentItem._id}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border group ${
                      student?._id === studentItem._id
                        ? "bg-blue-500/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/50"
                        : "bg-slate-800/40 border-white/5 hover:bg-slate-700/50 hover:border-white/10"
                    }`}
                    onClick={() => selectStudent(studentItem)}
                  >
                    <div className={`font-semibold text-base mb-1 ${student?._id === studentItem._id ? "text-blue-400" : "text-slate-200 group-hover:text-blue-300"}`}>
                      {studentItem.studentName}
                    </div>
                    <div className="text-xs font-mono text-slate-400 mb-2">ID: {studentItem.studentId}</div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[10px] uppercase font-bold bg-slate-900/50 text-slate-300 px-2 py-0.5 rounded-md border border-white/5">{studentItem.department}</span>
                      <span className="text-[10px] uppercase font-bold bg-slate-900/50 text-slate-300 px-2 py-0.5 rounded-md border border-white/5">{studentItem.year.split(' ')[0]} / {studentItem.division}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Student Details Form */}
          <div className="lg:col-span-6 bg-slate-900/40 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-2xl shadow-xl">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/10">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                <UserPen size={22} />
              </div>
              <h3 className="text-xl font-semibold text-slate-100">Student Editor</h3>
            </div>
            
            {!student ? (
              <div className="flex flex-col items-center justify-center text-center py-20 px-6">
                <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 ring-1 ring-white/10">
                  <UserPen size={32} className="text-slate-500" />
                </div>
                <p className="text-xl font-medium text-slate-300 mb-2">No Content Selected</p>
                <p className="text-slate-500 max-w-sm">Select a student from the results list on the left to view, edit, or delete their full profile details.</p>
              </div>
            ) : (
              <form onSubmit={handleUpdate} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Active Student Card */}
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border border-blue-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl"></div>
                  <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl"></div>
                  
                  <div className="relative z-10 text-center md:text-left">
                    <p className="text-xs uppercase tracking-widest text-blue-300 font-bold mb-1">Active Profile</p>
                    <h4 className="text-2xl font-bold text-white mb-0.5">{originalStudent?.studentName}</h4>
                    <p className="text-blue-200/70 font-mono">ID: {originalStudent?.studentId}</p>
                  </div>

                  <div className="relative z-10 flex flex-col items-center md:items-end">
                    {hasChanges() ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                        Unsaved Changes
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Fully Synced
                      </span>
                    )}
                    <p className="text-xs text-slate-400 mt-2">
                       {originalStudent?.updated_at ? `Updated ${new Date(originalStudent.updated_at * 1000).toLocaleDateString()}` : 'Never manually updated'}
                    </p>
                  </div>
                </div>

                {/* Info Groups */}
                <div className="space-y-6">
                  <div>
                    <h4 className="flex items-center gap-2 font-semibold text-slate-300 mb-4 pb-2 border-b border-white/5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Primary Info
                    </h4>
                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider pl-1">Full Name</label>
                        <input name="studentName" type="text" value={student.studentName} onChange={handleInputChange} required
                          className="w-full bg-slate-900/50 border border-slate-700/50 px-4 py-3 rounded-xl text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider pl-1">Student ID</label>
                        <input name="studentId" type="text" value={student.studentId} onChange={handleInputChange} required
                          className="w-full bg-slate-900/50 border border-slate-700/50 px-4 py-3 rounded-xl text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                      </div>
                      <div className="space-y-1">
                         <label className="text-xs font-medium text-slate-400 uppercase tracking-wider pl-1">Email Address</label>
                        <input name="email" type="email" value={student.email} onChange={handleInputChange} required
                          className="w-full bg-slate-900/50 border border-slate-700/50 px-4 py-3 rounded-xl text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider pl-1">Phone Number</label>
                        <input name="phoneNumber" type="tel" value={student.phoneNumber} onChange={handleInputChange} required
                          className="w-full bg-slate-900/50 border border-slate-700/50 px-4 py-3 rounded-xl text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <h4 className="flex items-center gap-2 font-semibold text-slate-300 mb-4 pb-2 border-b border-white/5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Academic Profile
                    </h4>
                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider pl-1">Major / Dept</label>
                        <select name="department" value={student.department} onChange={handleInputChange} required
                          className="w-full bg-slate-900/50 border border-slate-700/50 px-4 py-3 rounded-xl text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer">
                          {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider pl-1">Year</label>
                        <select name="year" value={student.year} onChange={handleInputChange} required
                           className="w-full bg-slate-900/50 border border-slate-700/50 px-4 py-3 rounded-xl text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer">
                          {years.map(year => <option key={year} value={year}>{year}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider pl-1">Division Segment</label>
                        <select name="division" value={student.division} onChange={handleInputChange} required
                           className="w-full bg-slate-900/50 border border-slate-700/50 px-4 py-3 rounded-xl text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer">
                          {divisions.map(div => <option key={div} value={div}>Division {div}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider pl-1">Current Semester</label>
                        <select name="semester" value={student.semester} onChange={handleInputChange} required
                           className="w-full bg-slate-900/50 border border-slate-700/50 px-4 py-3 rounded-xl text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer">
                          {semesters.map(sem => <option key={sem} value={sem}>Semester {sem}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/5">
                  <button type="submit" disabled={updating || !hasChanges()}
                    className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-center disabled:opacity-50 disabled:grayscale transition-all duration-300 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2">
                    <Save size={18} /> {updating ? "Applying..." : "Save All Changes"}
                  </button>
                  <button type="button" onClick={resetForm} disabled={!hasChanges()}
                    className="py-4 px-6 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-white/5 disabled:border-transparent">
                    <RotateCcw size={18} /> Discard
                  </button>
                  <button type="button" onClick={handleDelete} disabled={updating}
                    className="py-4 px-6 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 hover:border-red-500/50 font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-2">
                    <Trash2 size={18} /> Delete Form
                  </button>
                </div>
              </form>
            )}
            
            {/* Action Status Output */}
            <div className={`mt-6 transition-all duration-300 overflow-hidden ${status ? "max-h-24 opacity-100" : "max-h-0 opacity-0"}`}>
               {status && (
                <div className={`p-4 rounded-xl text-sm font-medium border flex items-center justify-center ${
                  status.includes("✅") ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                  status.includes("❌") ? "bg-red-500/10 text-red-400 border-red-500/20" :
                  "bg-blue-500/10 text-blue-400 border-blue-500/20"
                }`}>
                  {status}
                </div>
              )}
            </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
