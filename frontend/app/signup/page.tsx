"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  GraduationCap, 
  BookOpen,
  ArrowLeft,
  ChevronRight,
  LogIn,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    userType: "student",
    employeeId: "",
    department: ""
  });
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.userType === "teacher") {
      if (!formData.employeeId || !formData.department) {
        setStatus("Employee ID and Department are required for Teachers");
        return;
      }
    }

    setIsLoading(true);
    setStatus("Registering...");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001"}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        setStatus("Registration successful! Redirecting...");
        setTimeout(() => router.push("/signin"), 1500);
      } else {
        setStatus(data.error || "Registration failed");
      }
    } catch {
      setStatus("Error connecting to server");
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.push("/")}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 glass rounded-full text-sm font-medium hover:bg-white/10 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </motion.button>

      <div className="w-full max-w-xl relative mt-12 mb-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="glass-card rounded-3xl p-8 sm:p-10"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div 
              variants={itemVariants}
              className="inline-flex p-3 rounded-2xl bg-primary/20 text-primary mb-4"
            >
              <UserPlus className="w-8 h-8" />
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-3xl sm:text-4xl font-bold font-outfit text-gradient mb-2">
              Create Account
            </motion.h1>
            <motion.p variants={itemVariants} className="text-muted-foreground font-medium">
              Join the next generation of attendance tracking
            </motion.p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Type Selection */}
            <motion.div variants={itemVariants} className="space-y-3">
              <label className="text-sm font-semibold text-foreground/80 ml-1">I am a:</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, userType: "student" }))}
                  className={`relative p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-2 group ${
                    formData.userType === "student" 
                      ? "border-primary bg-primary/10 text-primary shadow-[0_0_20px_rgba(139,92,246,0.15)]" 
                      : "border-white/5 bg-white/5 text-muted-foreground hover:border-white/10 hover:bg-white/10"
                  }`}
                >
                  <GraduationCap className={`w-6 h-6 ${formData.userType === "student" ? "animate-bounce-gentle" : ""}`} />
                  <span className="text-sm font-bold">Student</span>
                  {formData.userType === "student" && (
                    <motion.div layoutId="active-tab" className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[10px] text-white">
                      <CheckCircle2 className="w-3 h-3" />
                    </motion.div>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, userType: "teacher" }))}
                  className={`relative p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-2 group ${
                    formData.userType === "teacher" 
                      ? "border-primary bg-primary/10 text-primary shadow-[0_0_20px_rgba(139,92,246,0.15)]" 
                      : "border-white/5 bg-white/5 text-muted-foreground hover:border-white/10 hover:bg-white/10"
                  }`}
                >
                  <BookOpen className={`w-6 h-6 ${formData.userType === "teacher" ? "animate-bounce-gentle" : ""}`} />
                  <span className="text-sm font-bold">Teacher</span>
                  {formData.userType === "teacher" && (
                    <motion.div layoutId="active-tab" className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[10px] text-white">
                      <CheckCircle2 className="w-3 h-3" />
                    </motion.div>
                  )}
                </button>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Username Input */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-sm font-semibold text-foreground/80 ml-1">Username</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    name="username"
                    type="text"
                    placeholder="johndoe"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full glass-input rounded-2xl pl-12 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground/80 focus:outline-none"
                  />
                </div>
              </motion.div>

              {/* Email Input */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-sm font-semibold text-foreground/80 ml-1">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    name="email"
                    type="email"
                    placeholder="name@university.edu"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full glass-input rounded-2xl pl-12 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground/80 focus:outline-none"
                  />
                </div>
              </motion.div>
            </div>

            {/* Password Input */}
            <motion.div variants={itemVariants} className="space-y-2">
              <label className="text-sm font-semibold text-foreground/80 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full glass-input rounded-2xl pl-12 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground/80 focus:outline-none"
                />
              </div>
            </motion.div>

            {/* Conditional Teacher Fields */}
            <AnimatePresence mode="wait">
              {formData.userType === "teacher" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-6 pt-4 border-t border-white/5 overflow-hidden"
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/80">Professional Verification</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground/80 ml-1">Employee ID</label>
                      <input
                        name="employeeId"
                        type="text"
                        placeholder="EMP-12345"
                        required={formData.userType === "teacher"}
                        value={formData.employeeId}
                        onChange={handleChange}
                        className="w-full glass-input rounded-2xl px-4 py-3.5 text-foreground placeholder:text-muted-foreground/80 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground/80 ml-1">Department</label>
                      <input
                        name="department"
                        type="text"
                        placeholder="Computer Science"
                        required={formData.userType === "teacher"}
                        value={formData.department}
                        onChange={handleChange}
                        className="w-full glass-input rounded-2xl px-4 py-3.5 text-foreground placeholder:text-muted-foreground/80 focus:outline-none"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sign Up Button */}
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full relative py-4 rounded-2xl font-bold text-white bg-primary hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(139,92,246,0.2)] flex items-center justify-center gap-2 overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
              ) : (
                <>
                  <span>Create {formData.userType === "teacher" ? "Teacher" : "Student"} Account</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          {/* Status Message */}
          <AnimatePresence>
            {status && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mt-8 p-4 rounded-2xl text-center flex items-center justify-center gap-2 ${
                  status.includes("successful") 
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                    : status.includes("Error") || status.includes("failed")
                    ? "bg-destructive/10 text-destructive-foreground border border-destructive/20"
                    : "bg-primary/10 text-primary border border-primary/20"
                }`}
              >
                {status.includes("successful") ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <span className="text-sm font-semibold">{status}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sign In Link */}
          <motion.div 
            variants={itemVariants}
            className="mt-10 pt-8 border-t border-white/5 text-center"
          >
            <p className="text-muted-foreground text-sm">
              Already have an account?{" "}
              <button
                onClick={() => router.push("/signin")}
                className="text-primary hover:text-primary/80 font-bold transition-colors inline-flex items-center gap-1 group"
              >
                Sign in here
                <LogIn className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </p>
          </motion.div>
        </motion.div>


      </div>
    </div>
  );
}