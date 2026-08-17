import React, { useState } from "react";
import {
  User,
  Mail,
  Building,
  Lock,
  ArrowRight,
  ShieldAlert,
  UserCheck,
  FileText,
  CheckCircle2
} from "lucide-react";

import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase";
import { createOrUpdateUserProfile } from "../services/userService";
import { createAdminRequest } from "../services/adminRequestService";
import Logo from "../components/Logo";

export default function SignUpView({ setActivePage, onLoginSuccess }) {
  const [accountType, setAccountType] = useState("citizen"); // "citizen" | "admin"

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    organization: "",
    department: "",
    clearance: "Level 2 - Regional Grid Supervisor",
    justification: "",
    password: "",
    agreed: false,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.agreed) {
      alert("Please acknowledge the Security & Data Privacy Protocol.");
      return;
    }

    if (formData.password.length < 6) {
      alert("Security password must be at least 6 characters.");
      return;
    }

    if (accountType === "admin" && !formData.justification.trim()) {
      alert("Please provide an official justification for Command Admin access.");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      await updateProfile(userCredential.user, {
        displayName: formData.fullName,
      });

      if (accountType === "admin") {
        // Create user with pending status
        const pendingProfile = {
          uid: userCredential.user.uid,
          name: formData.fullName,
          email: formData.email,
          organization: formData.organization || "Municipal Infrastructure Authority",
          department: formData.department || "Grid Operations",
          clearance: formData.clearance,
          role: "pending_admin",
        };

        await createOrUpdateUserProfile(userCredential.user.uid, pendingProfile);

        // Submit formal request for predefined admin approval
        await createAdminRequest({
          uid: userCredential.user.uid,
          email: formData.email,
          name: formData.fullName,
          organization: formData.organization,
          department: formData.department,
          clearance: formData.clearance,
          justification: formData.justification,
        });

        alert(
          `🛡️ Admin Access Request Submitted!\n\nYour account has been registered with PENDING clearance. A Predefined Administrator must verify and approve your credentials before Command Center privileges are granted.`
        );

        if (onLoginSuccess) {
          onLoginSuccess(pendingProfile);
        }
      } else {
        // Standard Citizen Profile
        const citizenProfile = {
          uid: userCredential.user.uid,
          name: formData.fullName,
          email: formData.email,
          organization: formData.organization || "Public Resident",
          clearance: "Public Citizen Level 1",
          role: "public",
        };

        await createOrUpdateUserProfile(userCredential.user.uid, citizenProfile);

        if (onLoginSuccess) {
          onLoginSuccess(citizenProfile);
        }

        alert("Public Citizen Account created successfully!");
      }

      setActivePage("dashboard");
    } catch (error) {
      let message;
      switch (error.code) {
        case "auth/email-already-in-use":
          message = "Email address is already registered.";
          break;
        case "auth/invalid-email":
          message = "Invalid email address formatting.";
          break;
        case "auth/weak-password":
          message = "Password must be at least 6 characters.";
          break;
        default:
          message = error.message;
      }
      alert(message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 bg-cyber-grid flex flex-col justify-between items-center py-12 px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-cyan-500/10 blur-[160px] pointer-events-none rounded-full" />

      <div className="my-auto w-full max-w-2xl relative z-10">
        <div className="bg-[#0D121F]/95 border border-cyan-500/40 rounded-2xl p-8 sm:p-10 shadow-2xl backdrop-blur-md space-y-7">
          
          {/* Header with Custom Theme Logo */}
          <div className="flex flex-col items-center text-center space-y-3">
            <Logo size="lg" className="cyan-glow-sm" />

            <div>
              <h1 className="text-3xl font-bold text-white font-heading">
                NexInfra Platform
              </h1>
              <p className="text-cyan-400 text-xs sm:text-sm tracking-widest uppercase font-bold mt-1 font-mono-tech">
                ACCESS CREDENTIAL REGISTRATION
              </p>
            </div>
          </div>

          {/* Account Type Selection Toggle */}
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-[#070A10] border border-slate-800 rounded-xl font-mono-tech text-xs">
            <button
              type="button"
              onClick={() => setAccountType("citizen")}
              className={`py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                accountType === "citizen"
                  ? "bg-emerald-950/70 border border-emerald-500/70 text-emerald-300 shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Public Citizen</span>
            </button>

            <button
              type="button"
              onClick={() => setAccountType("admin")}
              className={`py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                accountType === "admin"
                  ? "bg-cyan-950/70 border border-cyan-500/70 text-cyan-300 shadow-md cyan-glow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Command Admin Request</span>
            </button>
          </div>

          {/* Notice Banner */}
          {accountType === "admin" ? (
            <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/50 text-xs text-cyan-300 font-mono-tech flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Admin Permission Required:</span> Applications for Command Administrator access are placed in a verification queue and must be formally authorized by an existing Predefined Admin.
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-xs text-emerald-300 font-mono-tech flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Instant Citizen Access: Submit reports & monitor neighborhood infrastructure.</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 font-mono-tech text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-slate-200 font-bold">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    placeholder="e.g. Maya Lin"
                    className="w-full bg-[#070A10] border border-slate-800 rounded-xl pl-10 py-3 text-white focus:outline-none focus:border-cyan-400 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 text-slate-200 font-bold">
                  {accountType === "admin" ? "Official Government Email" : "Email Address"}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder={accountType === "admin" ? "officer@agency.gov" : "resident@domain.com"}
                    className="w-full bg-[#070A10] border border-slate-800 rounded-xl pl-10 py-3 text-white focus:outline-none focus:border-cyan-400 text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Extra Admin Fields */}
            {accountType === "admin" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5 text-slate-200 font-bold">
                      Authority / Organization
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={formData.organization}
                        onChange={(e) => handleChange("organization", e.target.value)}
                        placeholder="e.g. Municipal Road Works"
                        className="w-full bg-[#070A10] border border-slate-800 rounded-xl pl-10 py-3 text-white focus:outline-none focus:border-cyan-400 text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1.5 text-slate-200 font-bold">
                      Division / Department
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.department}
                      onChange={(e) => handleChange("department", e.target.value)}
                      placeholder="e.g. UAV & Drone Fleet"
                      className="w-full bg-[#070A10] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1.5 text-slate-200 font-bold">
                    Official Justification for Admin Clearance
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                    <textarea
                      required
                      rows={2}
                      value={formData.justification}
                      onChange={(e) => handleChange("justification", e.target.value)}
                      placeholder="Specify your operational duty, sector oversight, or emergency management role..."
                      className="w-full bg-[#070A10] border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-white focus:outline-none focus:border-cyan-400 text-xs sm:text-sm resize-none"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block mb-1.5 text-slate-200 font-bold">
                Security Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-[#070A10] border border-slate-800 rounded-xl pl-10 py-3 text-white focus:outline-none focus:border-cyan-400 text-xs sm:text-sm"
                />
              </div>
            </div>

            <label className="flex items-start gap-3 text-xs text-slate-300 pt-1">
              <input
                type="checkbox"
                checked={formData.agreed}
                onChange={(e) => handleChange("agreed", e.target.checked)}
                className="mt-0.5 cursor-pointer"
              />
              <span>
                I acknowledge the Nexinfra Security Governance & Data Protocol.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 text-black font-extrabold tracking-wider flex items-center justify-center gap-2 uppercase disabled:opacity-60 cursor-pointer shadow-lg hover:from-cyan-300 hover:to-cyan-200 active:scale-95 transition-all"
            >
              {loading
                ? "TRANSMITTING REGISTRATION..."
                : accountType === "admin"
                ? "🛡️ SUBMIT ADMIN CLEARANCE REQUEST"
                : "🚀 CREATE CITIZEN ACCOUNT"}
              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="text-center text-xs text-slate-400 pt-2">
              Already possess active authorization?
              <button
                type="button"
                onClick={() => setActivePage("login")}
                className="ml-2 text-cyan-400 hover:underline font-bold cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>

      <footer className="text-center text-slate-400 text-xs uppercase pt-6 font-mono-tech">
        © 2024 NEXINFRA INFRASTRUCTURE INTELLIGENCE. ALL SYSTEMS OPERATIONAL.
      </footer>
    </div>
  );
}
