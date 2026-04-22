"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Edit3, 
  Camera, 
  BarChart3, 
  LogOut, 
  Menu,
  X,
  ChevronRight,
  GraduationCap,
  Sparkles
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [username, setUsername] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCard, setActiveCard] = useState<number | null>(null);

  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const loggedIn = localStorage.getItem("isLoggedIn");
        const storedUsername = localStorage.getItem("username");
        
        if (!loggedIn || loggedIn !== "true") {
          setIsLoggedIn(false);
          router.push("/signin");
        } else {
          setIsLoggedIn(true);
          setUsername(storedUsername || "User");
        }
      } catch {
        console.error("localStorage not available");
        setIsLoggedIn(false);
        router.push("/signin");
      }
    };

    const timeoutId = setTimeout(checkAuthStatus, 100);
    return () => clearTimeout(timeoutId);
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001"}/api/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      console.log("Logout API call failed, but continuing with local logout");
    }

    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    
    router.push("/");
  };




  if (isLoggedIn === null) {
    return (
      <div className="flex items-center justify-center w-full h-screen min-h-screen relative">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-xl text-foreground/90 font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (isLoggedIn === false) {
    return (
      <div className="flex items-center justify-center w-full h-screen min-h-screen relative">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-500 mx-auto mb-4"></div>
          <p className="text-xl text-foreground/90 font-medium">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  const cardDefs = [
    {
      title: "Student Registration",
      description: "Register new students with complete details and face recognition setup",
      icon: <Users className="w-7 h-7" />,
      path: "/student/registrationform",
      gradient: "from-indigo-500 to-blue-600",
      glow: "group-hover:shadow-indigo-500/20",
      badge: "Register"
    },
    {
      title: "Update Details",
      description: "Modify existing student information and profile settings",
      icon: <Edit3 className="w-7 h-7" />,
      path: "/student/updatedetails",
      gradient: "from-emerald-500 to-teal-600",
      glow: "group-hover:shadow-emerald-500/20",
      badge: "Edit"
    },
    {
      title: "Face Recognition Demo",
      description: "Test and demonstrate live face recognition capabilities",
      icon: <Camera className="w-7 h-7" />,
      path: "/student/demo-session",
      gradient: "from-violet-500 to-purple-600",
      glow: "group-hover:shadow-violet-500/20",
      badge: "Demo"
    },
    {
      title: "Attendance Records",
      description: "View comprehensive attendance statistics and reports",
      icon: <BarChart3 className="w-7 h-7" />,
      path: "/student/view-attendance",
      gradient: "from-orange-500 to-red-500",
      glow: "group-hover:shadow-orange-500/20",
      badge: "View"
    }
  ];

  return (
    <main className="min-h-screen relative bg-slate-950 text-slate-100 overflow-hidden">
      {/* Ambient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-indigo-600/10 blur-[130px]"></div>
        <div className="absolute bottom-[-15%] left-[-10%] w-[45%] h-[45%] rounded-full bg-violet-600/10 blur-[130px]"></div>
        <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] rounded-full bg-blue-600/5 blur-[100px]"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-slate-900/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 border border-white/5 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-slate-300" /> : <Menu className="w-5 h-5 text-slate-300" />}
              </button>
              <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl shadow-lg shadow-indigo-500/20">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-100">Student Dashboard</h1>
                <p className="text-slate-500 text-xs">Welcome back, <span className="text-indigo-400 font-semibold">{username}</span></p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 transition-all duration-300 font-medium text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="lg:hidden relative z-10 border-b border-white/5 bg-slate-900/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 grid grid-cols-2 gap-3">
            {cardDefs.map((c, i) => (
              <button key={i} onClick={() => { router.push(c.path); setMobileMenuOpen(false); }}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-white/5 hover:bg-slate-700/60 transition-all text-left">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${c.gradient} shadow-sm flex-shrink-0`}>
                  <div className="text-white w-4 h-4">{c.icon}</div>
                </div>
                <span className="text-slate-200 font-semibold text-sm">{c.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Hero Welcome */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Attendance Intelligence
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-100 mb-4 tracking-tight">
            Student{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">Management</span>
            {" "}Hub
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
            Your all-in-one workspace for face recognition attendance and student record management.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cardDefs.map((option, index) => (
            <div
              key={index}
              onMouseEnter={() => setActiveCard(index)}
              onMouseLeave={() => setActiveCard(null)}
              onClick={() => router.push(option.path)}
              className={`relative p-6 rounded-2xl border border-white/[0.07] bg-slate-900/50 backdrop-blur-sm cursor-pointer group overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${option.glow} ${
                activeCard === index ? '-translate-y-2 shadow-2xl' : ''
              }`}
            >
              {/* Top gradient shine */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%)' }}
              />

              {/* Icon */}
              <div className={`p-4 rounded-xl bg-gradient-to-br ${option.gradient} w-fit mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <div className="text-white">{option.icon}</div>
              </div>

              {/* Badge */}
              <span className={`absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-gradient-to-r ${option.gradient} text-white opacity-60`}>
                {option.badge}
              </span>

              <h4 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-white transition-colors">{option.title}</h4>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed line-clamp-3">{option.description}</p>

              <div className={`inline-flex items-center gap-2 text-sm font-semibold bg-gradient-to-r ${option.gradient} bg-clip-text text-transparent group-hover:gap-3 transition-all duration-300`}>
                Get Started <ChevronRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform bg-gradient-to-r ${option.gradient} rounded-full text-white p-0.5`} />
              </div>

              {/* Decorative orb */}
              <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full opacity-5 group-hover:opacity-10 transition-opacity bg-white"></div>
            </div>
          ))}
        </div>
      </main>
    </main>
  );
}