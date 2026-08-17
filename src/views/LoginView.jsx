import React, { useState } from "react";
import { User, Lock, ArrowRight, ShieldCheck, UserCheck } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { resolveUserWithRole } from "../services/userService";
import Logo from "../components/Logo";

export default function LoginView({ setActivePage, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [securityKey, setSecurityKey] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      alert("Please enter your email.");
      return;
    }

    if (!securityKey.trim()) {
      alert("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        securityKey
      );

      const firebaseUser = userCredential.user;
      const userProfile = await resolveUserWithRole(firebaseUser);

      if (onLoginSuccess) {
        onLoginSuccess(userProfile);
      }

      setActivePage("dashboard");
    } catch (error) {
      let message = "Login failed.";

      switch (error.code) {
        case "auth/invalid-credential":
          message = "Invalid email or password.";
          break;
        case "auth/user-not-found":
          message = "No account found with this email.";
          break;
        case "auth/wrong-password":
          message = "Incorrect password.";
          break;
        case "auth/invalid-email":
          message = "Invalid email address.";
          break;
        case "auth/too-many-requests":
          message = "Too many attempts. Try again later.";
          break;
        default:
          message = error.message;
      }

      alert(message);
    }

    setLoading(false);
  };

  const fillDemoAdmin = () => {
    setEmail("admin@nexinfra.gov");
    setSecurityKey("AdminPassword123!");
  };

  const fillDemoCitizen = () => {
    setEmail("citizen.demo@nexinfra.org");
    setSecurityKey("CitizenPassword123!");
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 bg-cyber-grid flex flex-col justify-between items-center py-10 px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-cyan-500/10 blur-[160px] pointer-events-none rounded-full" />

      <div className="my-auto w-full max-w-lg relative z-10">
        <div className="bg-[#0D121F]/95 border border-cyan-500/40 rounded-2xl p-8 sm:p-10 shadow-2xl backdrop-blur-md cyan-glow-sm space-y-6">
          
          <div className="flex flex-col items-center text-center space-y-3">
            <Logo size="lg" className="cyan-glow-sm" />

            <div>
              <h1 className="text-3xl font-bold text-white font-heading">
                NexInfra System
              </h1>

              <p className="text-cyan-400 font-mono-tech text-xs sm:text-sm tracking-widest uppercase font-bold mt-1">
                SECURE AUTHENTICATION PORTAL
              </p>
            </div>
          </div>

          {/* Quick Demo Fill Presets */}
          <div className="space-y-2 pt-1 font-mono-tech text-xs">
            <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider text-center">
              ⚡ Quick Fill Credentials for Testing:
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={fillDemoAdmin}
                className="py-2.5 px-3 rounded-xl bg-cyan-950/60 border border-cyan-500/70 hover:bg-cyan-900/60 text-cyan-300 font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Demo Admin</span>
              </button>

              <button
                type="button"
                onClick={fillDemoCitizen}
                className="py-2.5 px-3 rounded-xl bg-emerald-950/60 border border-emerald-500/70 hover:bg-emerald-900/60 text-emerald-300 font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Demo Citizen</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 font-mono-tech text-xs sm:text-sm">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-slate-200 font-bold">
                Account Email
              </label>

              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nexinfra.gov or citizen@domain.com"
                  className="w-full bg-[#070A10] border border-slate-800 rounded-xl pl-10 pr-3 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition-colors text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-slate-200 font-bold">
                  Security Password
                </label>

                <button
                  type="button"
                  onClick={() =>
                    alert("Password recovery link sent to registered email.")
                  }
                  className="text-slate-400 hover:text-cyan-400 text-xs transition-colors cursor-pointer"
                >
                  Forgot Key?
                </button>
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={securityKey}
                  onChange={(e) => setSecurityKey(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-[#070A10] border border-slate-800 rounded-xl pl-10 pr-3 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition-colors text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Login Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 hover:from-cyan-300 hover:to-cyan-200 text-black font-extrabold text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 transition-all cyan-glow-sm hover:cyan-glow-lg uppercase cursor-pointer shadow-xl active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span>
                  {loading ? "AUTHENTICATING..." : "⚡ ACCESS NEXINFRA PLATFORM"}
                </span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center text-xs text-slate-400 pt-2">
              Need a new account?{" "}
              <button
                type="button"
                onClick={() => setActivePage("signup")}
                className="text-cyan-400 hover:underline font-bold cursor-pointer"
              >
                Register Citizen / Admin Request
              </button>
            </div>

            {/* Footer */}
            <div className="pt-3 flex items-center justify-center gap-2 text-[11px] text-cyan-400/90 tracking-widest uppercase font-bold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>SECURE ENCRYPTED SESSION ACTIVE</span>
            </div>
          </form>
        </div>
      </div>

      <footer className="text-center text-slate-400 text-xs font-mono-tech uppercase pt-4">
        © 2024 NEXINFRA INFRASTRUCTURE INTELLIGENCE. ALL SYSTEMS OPERATIONAL.
      </footer>
    </div>
  );
}
