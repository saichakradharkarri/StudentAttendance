"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  User, 
  Mail, 
  Phone, 
  Users,
  Home,
  Filter,
  Trash2,
  Edit3,
  GraduationCap,
  IdCard
} from "lucide-react";

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
}

interface FilterOptions {
  department: string;
  year: string;
  division: string;
  studentId: string;
  search: string;
}

export default function UpdateStudentDetails() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState("");
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);
  const [userType, setUserType] = useState<"student" | "teacher">("student");
  const [userEmail, setUserEmail] = useState("");

  // Teacher filter states
  const [filters, setFilters] = useState<FilterOptions>({
    department: "",
    year: "",
    division: "",
    studentId: "",
    search: ""
  });

  // Role-aware dashboard path
  const dashboardPath = useMemo(
    () => (userType === "teacher" ? "/teacher/dashboard" : "/dashboard"),
    [userType]
  );

  const departments = [
    "Computer Science", "Information Technology", "Electronics", 
    "Mechanical", "Civil", "Electrical", "Chemical", "Biotechnology"
  ];
  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const divisions = ["A", "B", "C", "D"];
  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];

  useEffect(() => {
    // Auth + role check
    try {
      const loggedIn = localStorage.getItem("isLoggedIn") === "true";
      const email = localStorage.getItem("userEmail") || "";
      const utype = (localStorage.getItem("userType") as "student" | "teacher") || "student";
      
      setUserType(utype);
      setUserEmail(email);

      if (!loggedIn || !email) {
        setIsAuthed(false);
        router.replace("/signin");
        return;
      }
      
      setIsAuthed(true);
      fetchStudents(email, utype);
    } catch {
      setIsAuthed(false);
      router.replace("/signin");
    }
  }, [router]);

  const fetchStudents = async (email: string, type: "student" | "teacher") => {
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001"}/api/students`;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-User-Type": type
      };

      if (type === "student") {
        // For students: only get their own record
        headers["X-User-Email"] = email;
      } else {
        // For teachers: get all students (admin access)
        url = `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001"}/api/admin/students`;
        headers["X-User-Email"] = email;
      }

      const res = await fetch(url, { headers });
      const data = await res.json();
      
      if (data.success) {
        setStudents(data.students);
        if (type === "teacher") {
          setAllStudents(data.students); // Keep original list for filtering
        }
        if (data.students.length === 0 && type === "student") {
          setStatus("No student record found for your email. Please register first.");
        }
      } else {
        setStatus(data.error || "Error fetching student records");
      }
    } catch {
      setStatus("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  // Teacher: Apply filters to student list
  useEffect(() => {
    if (userType === "teacher" && allStudents.length > 0) {
      let filtered = allStudents;

      if (filters.department) {
        filtered = filtered.filter(s => s.department === filters.department);
      }
      if (filters.year) {
        filtered = filtered.filter(s => s.year === filters.year);
      }
      if (filters.division) {
        filtered = filtered.filter(s => s.division === filters.division);
      }
      if (filters.studentId) {
        filtered = filtered.filter(s => s.studentId.toLowerCase().includes(filters.studentId.toLowerCase()));
      }
      if (filters.search) {
        filtered = filtered.filter(s => 
          s.studentName.toLowerCase().includes(filters.search.toLowerCase()) ||
          s.email.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      setStudents(filtered);
    }
  }, [filters, allStudents, userType]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const clearFilters = () => {
    setFilters({
      department: "",
      year: "",
      division: "",
      studentId: "",
      search: ""
    });
  };

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent({ ...student });
    setStatus("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (selectedStudent) {
      setSelectedStudent(prev => ({
        ...prev!,
        [e.target.name]: e.target.value
      }));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    setUpdating(true);
    setStatus("Updating student details...");

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-User-Type": userType
      };

      // For students, include their email for authorization
      if (userType === "student") {
        headers["X-User-Email"] = userEmail;
      } else {
        // For teachers, include teacher email for audit trail
        headers["X-User-Email"] = userEmail;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001"}/api/students/${selectedStudent._id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          studentName: selectedStudent.studentName,
          studentId: selectedStudent.studentId,
          department: selectedStudent.department,
          year: selectedStudent.year,
          division: selectedStudent.division,
          semester: selectedStudent.semester,
          email: selectedStudent.email,
          phoneNumber: selectedStudent.phoneNumber,
          user_email: userEmail // Backup authorization
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setStatus(`✅ ${userType === "teacher" ? "Student" : "Your"} details updated successfully!`);
        fetchStudents(userEmail, userType); // Refresh data
      } else {
        if (res.status === 403) {
          setStatus("❌ Unauthorized: You can only update permitted records");
        } else {
          setStatus(`❌ ${data.error}`);
        }
      }
    } catch {
      setStatus("❌ Error connecting to server");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (studentId: string, studentName: string) => {
    const confirmMessage = userType === "teacher" 
      ? `Are you sure you want to delete ${studentName}? This action cannot be undone.`
      : `Are you sure you want to delete your student record (${studentName})? This action cannot be undone.`;
      
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001"}/api/students/${studentId}`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          "X-User-Email": userEmail,
          "X-User-Type": userType
        }
      });
      
      const data = await res.json();
      
      if (data.success) {
        setStatus(`✅ Student ${studentName} deleted successfully!`);
        fetchStudents(userEmail, userType); // Refresh list
        if (selectedStudent?._id === studentId) {
          setSelectedStudent(null); // Clear selection if deleted student was selected
        }
      } else {
        if (res.status === 403) {
          setStatus("❌ Unauthorized: You can only delete permitted records");
        } else {
          setStatus(`❌ ${data.error}`);
        }
      }
    } catch {
      setStatus("❌ Error connecting to server");
    }
  };

  if (isAuthed === null) {
    return (
      <div className="flex items-center justify-center w-full h-screen min-h-screen relative">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-foreground/90">Checking access...</p>
        </div>
      </div>
    );
  }

  if (isAuthed === false) {
    return null;
  }

  return (
    <div className="min-h-screen min-h-screen relative">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
        
        
      </div>

      {/* Header */}
      <header className="glass-card border-b border-white/5 border-b border-white/20 sticky top-0 z-20 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl">
                <Edit3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">
                  {userType === "teacher" ? "Manage Student Details" : "Update Student Details"}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {userType === "teacher" 
                    ? "View and update student information" 
                    : "Update your student information"
                  }
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push(dashboardPath)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
          </div>
        </div>
      </header>

      <main className="p-3 h-[calc(100vh-80px)] overflow-hidden relative z-10">
        <div className="max-w-7xl mx-auto h-full flex flex-col gap-3">
          {/* Teacher Filters */}
          {userType === "teacher" && (
            <div className="glass-card rounded-xl p-4 border border-white/20 shadow-lg flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary" />
                  Filter Students
                </h3>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300 shadow-lg text-sm"
                >
                  Clear All Filters
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <select
                    name="department"
                    value={filters.department}
                    onChange={handleFilterChange}
                    className="w-full glass-input border border-white/10 rounded-lg px-3 py-2 text-foreground/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    name="year"
                    value={filters.year}
                    onChange={handleFilterChange}
                    className="w-full glass-input border border-white/10 rounded-lg px-3 py-2 text-foreground/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="">All Years</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    name="division"
                    value={filters.division}
                    onChange={handleFilterChange}
                    className="w-full glass-input border border-white/10 rounded-lg px-3 py-2 text-foreground/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="">All Divisions</option>
                    {divisions.map(div => (
                      <option key={div} value={div}>Division {div}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <input
                    name="studentId"
                    type="text"
                    placeholder="Search by Student ID"
                    value={filters.studentId}
                    onChange={handleFilterChange}
                    className="w-full glass-input border border-white/10 rounded-lg px-3 py-2 text-foreground/90 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <div>
                  <input
                    name="search"
                    type="text"
                    placeholder="Search by name or email"
                    value={filters.search}
                    onChange={handleFilterChange}
                    className="w-full glass-input border border-white/10 rounded-lg px-3 py-2 text-foreground/90 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-green-600" />
                Showing {students.length} of {allStudents.length} students
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 overflow-hidden">
            {/* Student List */}
            <div className="glass-card rounded-xl p-4 border border-white/20 shadow-lg flex flex-col">
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                {userType === "teacher" ? "Students" : "Student Record"}
              </h3>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading student records...</p>
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4 text-muted-foreground/70">📚</div>
                  <p className="text-muted-foreground mb-4">
                    {userType === "teacher" 
                      ? "No students found with current filters."
                      : "No student record found for your email."
                    }
                  </p>
                  {userType === "student" && (
                    <button
                      onClick={() => router.push("/student/registrationform")}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Register as Student
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2 overflow-y-auto flex-1">
                  {students.map(student => (
                    <div
                      key={student._id}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-300 relative hover:shadow-md group hover:-translate-y-0.5 ${
                        selectedStudent?._id === student._id
                          ? "bg-primary/10 border-2 border-primary"
                          : "glass-card hover:glass-card border border-white/10"
                      }`}
                    >
                      <div 
                        onClick={() => handleStudentSelect(student)}
                        className="flex-1"
                      >
                        <div className="font-medium text-foreground group-hover:text-primary transition-colors">{student.studentName}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {student.studentId} | {student.department}
                        </div>
                        <div className="text-xs text-muted-foreground/70">
                          {student.year} - Division {student.division} | {student.email}
                        </div>
                      </div>
                      
                      {/* Delete Button */}
                      {(userType === "teacher" || (userType === "student" && student.email === userEmail)) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(student._id, student.studentName);
                          }}
                          className="absolute top-3 right-3 p-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          title="Delete Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Update Form */}
            <div className="glass-card rounded-xl p-4 border border-white/20 shadow-lg flex flex-col">
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-green-600" />
                {userType === "teacher" ? "Update Student Details" : "Update Student Details"}
              </h3>
              {selectedStudent ? (
                <form onSubmit={handleUpdate} className="space-y-4 flex-1 overflow-y-auto">
                  {/* Personal Information */}
                  <div className="glass-card rounded-lg p-3 border border-white/10">
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-primary" />
                      Personal Information
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-foreground/90 text-sm font-medium mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                          <input
                            name="studentName"
                            type="text"
                            value={selectedStudent.studentName}
                            onChange={handleInputChange}
                            className="w-full glass-card border border-white/10 rounded-lg pl-10 pr-4 py-2 text-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-foreground/90 text-sm font-medium mb-2">
                          Student ID
                        </label>
                        <div className="relative">
                          <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                          <input
                            name="studentId"
                            type="text"
                            value={selectedStudent.studentId}
                            onChange={handleInputChange}
                            className="w-full glass-card border border-white/10 rounded-lg pl-10 pr-4 py-2 text-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-foreground/90 text-sm font-medium mb-2">
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                          <input
                            name="email"
                            type="email"
                            value={selectedStudent.email}
                            onChange={handleInputChange}
                            className={`w-full border rounded-lg pl-10 pr-4 py-2 placeholder-gray-500 focus:outline-none transition-all duration-300 ${
                              userType === "student" 
                                ? "glass-card/5 text-muted-foreground/70 border-white/20 cursor-not-allowed" 
                                : "glass-card border-white/10 text-foreground focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            }`}
                            disabled={userType === "student"}
                            title={userType === "student" ? "Email cannot be changed for security reasons" : ""}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-foreground/90 text-sm font-medium mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                          <input
                            name="phoneNumber"
                            type="tel"
                            value={selectedStudent.phoneNumber}
                            onChange={handleInputChange}
                            className="w-full glass-card border border-white/10 rounded-lg pl-10 pr-4 py-2 text-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Academic Information */}
                  <div className="glass-card rounded-lg p-3 border border-white/10">
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2 text-sm">
                      <GraduationCap className="w-4 h-4 text-purple-600" />
                      Academic Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-foreground/90 text-sm font-medium mb-2">
                          Department
                        </label>
                        <select
                          name="department"
                          value={selectedStudent.department}
                          onChange={handleInputChange}
                          className="w-full glass-card border border-white/10 rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                          required
                        >
                          {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-foreground/90 text-sm font-medium mb-2">
                          Year
                        </label>
                        <select
                          name="year"
                          value={selectedStudent.year}
                          onChange={handleInputChange}
                          className="w-full glass-card border border-white/10 rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                          required
                        >
                          {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-foreground/90 text-sm font-medium mb-2">
                          Division
                        </label>
                        <select
                          name="division"
                          value={selectedStudent.division}
                          onChange={handleInputChange}
                          className="w-full glass-card border border-white/10 rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                          required
                        >
                          {divisions.map(div => (
                            <option key={div} value={div}>Division {div}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-foreground/90 text-sm font-medium mb-2">
                          Semester
                        </label>
                        <select
                          name="semester"
                          value={selectedStudent.semester}
                          onChange={handleInputChange}
                          className="w-full glass-card border border-white/10 rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                          required
                        >
                          {semesters.map(sem => (
                            <option key={sem} value={sem}>Semester {sem}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={updating}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {updating ? "Updating..." : 
                     userType === "teacher" ? "Update Student Details" : "Update My Details"}
                  </button>
                </form>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {students.length > 0 
                    ? `Select a student${userType === "student" ? " record" : ""} from the list to update details`
                    : "No student record available to edit"
                  }
                </div>
              )}
            </div>
          </div>

          {/* Status Display */}
          {status && (
            <div className={`mt-6 p-4 rounded-lg text-center border transition-all duration-300 ${
              status.includes("✅") 
                ? "bg-green-100 text-green-800 border-green-300" 
                : "bg-red-100 text-red-800 border-red-300"
            }`}>
              {status}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}