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
  CheckCircle2,
  Phone,
  MapPin,
  BadgeAlert
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
  const [accountType, setAccountType] = useState("citizen"); // "citizen" | "officer" | "admin"

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    organization: "Municipal Corporation Infrastructure Authority",
    department: "Road Works & Asphalt Pavement Division",
    ward: "Central District - Ward 4 (Civic Centre)",
    badgeNo: "",
    phone: "",
    clearance: "Municipal Zonal Engineering Officer",
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

    if (accountType !== "citizen" && !formData.justification.trim()) {
      alert("Please provide an official justification for Officer / Admin access.");
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

      if (accountType === "officer") {
        // Create user with pending officer status
        const pendingProfile = {
          uid: userCredential.user.uid,
          name: formData.fullName,
          email: formData.email,
          organization: formData.organization || "Municipal Corporation",
          department: formData.department || "Road Works & Infrastructure",
          ward: formData.ward || "Central District - Ward 4",
          badgeNo: formData.badgeNo || `MCD-OFF-${Date.now().toString().slice(-4)}`,
          phone: formData.phone,
          clearance: "Municipal Zonal Engineering Officer",
          role: "pending_officer",
        };

        await createOrUpdateUserProfile(userCredential.user.uid, pendingProfile);

        // Submit formal request for admin approval
        await createAdminRequest({
          uid: userCredential.user.uid,
          email: formData.email,
          name: formData.fullName,
          organization: formData.organization,
          department: formData.department,
          ward: formData.ward,
          badgeNo: formData.badgeNo,
          phone: formData.phone,
          clearance: "Municipal Zonal Engineering Officer",
          justification: formData.justification,
          requestType: "officer",
        });

        alert(
          `🏛️ Municipal Officer Request Submitted!\n\nYour account has been registered with PENDING status. A System Administrator will review and approve your officer badge and department assignment.`
        );

        if (onLoginSuccess) {
          onLoginSuccess(pendingProfile);
        }
      } else if (accountType === "admin") {
        // Create user with pending admin status
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

        await createAdminRequest({
          uid: userCredential.user.uid,
          email: formData.email,
          name: formData.fullName,
          organization: formData.organization,
          department: formData.department,
          clearance: formData.clearance,
          justification: formData.justification,
          requestType: "admin",
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

        setActivePage("dashboard");
      }
    } catch (error) {
      let message = "Registration failed.";
      switch (error.code) {
        case "auth/email-already-in-use":
          message = "An account with this email already exists.";
          break;
        case "auth/invalid-email":
          message = "Invalid email format.";
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
          
          {/* Header */}
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

          {/* Account Type Selection Toggle (3 Options) */}
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#070A10] border border-slate-800 rounded-xl font-mono-tech text-xs">
            <button
              type="button"
              onClick={() => setAccountType("citizen")}
              className={`py-2.5 px-2 rounded-lg font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                accountType === "citizen"
                  ? "bg-emerald-950/70 border border-emerald-500/70 text-emerald-300 shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Citizen</span>
            </button>

            <button
              type="button"
              onClick={() => setAccountType("officer")}
              className={`py-2.5 px-2 rounded-lg font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                accountType === "officer"
                  ? "bg-amber-950/70 border border-amber-500/70 text-amber-300 shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Municipal Officer</span>
            </button>

            <button
              type="button"
              onClick={() => setAccountType("admin")}
              className={`py-2.5 px-2 rounded-lg font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                accountType === "admin"
                  ? "bg-cyan-950/70 border border-cyan-500/70 text-cyan-300 shadow-md cyan-glow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Admin Request</span>
            </button>
          </div>

          {/* Notice Banner */}
          {accountType === "officer" ? (
            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/50 text-xs text-amber-300 font-mono-tech flex items-start gap-2.5">
              <Building className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Municipal Officer Authorization:</span> Requests are forwarded to the Admin Command desk for official badge & zonal jurisdiction verification.
              </div>
            </div>
          ) : accountType === "admin" ? (
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
                  Full Name / Officer Title
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    placeholder="e.g. Er. Rajesh Mehra"
                    className="w-full bg-[#070A10] border border-slate-800 rounded-xl pl-10 pr-3 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 text-slate-200 font-bold">
                  Official Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="officer.mehra@mcd.gov.in"
                    className="w-full bg-[#070A10] border border-slate-800 rounded-xl pl-10 pr-3 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Officer Specific Fields */}
            {accountType === "officer" && (
              <div className="space-y-4 pt-2 border-t border-slate-800/80">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5 text-slate-200 font-bold">
                      Municipal Department
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => handleChange("department", e.target.value)}
                      className="w-full bg-[#070A10] border border-slate-800 rounded-xl p-3 text-white text-xs"
                    >
                      <option value="Road Works & Asphalt Pavement Division">Road Works & Asphalt Pavement Division</option>
                      <option value="Municipal Hydro & Water Supply Grid">Municipal Hydro & Water Supply Grid</option>
                      <option value="Sanitation & Solid Waste Logistics Unit">Sanitation & Solid Waste Logistics Unit</option>
                      <option value="Municipal Power & Street Lighting Grid">Municipal Power & Street Lighting Grid</option>
                      <option value="Structural Engineering & Bridge Safety Division">Structural Engineering & Bridge Safety Division</option>
                      <option value="Urban Forestry & Public Parks Department">Urban Forestry & Public Parks Department</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1.5 text-slate-200 font-bold">
                      Assigned Municipal Ward / Zone
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.ward}
                      onChange={(e) => handleChange("ward", e.target.value)}
                      placeholder="e.g. Central District - Ward 4"
                      className="w-full bg-[#070A10] border border-slate-800 rounded-xl p-3 text-white text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5 text-slate-200 font-bold">
                      Govt Badge / Officer ID No.
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.badgeNo}
                      onChange={(e) => handleChange("badgeNo", e.target.value)}
                      placeholder="e.g. MCD-OFF-8842"
                      className="w-full bg-[#070A10] border border-slate-800 rounded-xl p-3 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-slate-200 font-bold">
                      Direct Contact Phone
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="+91 98112-XXXXX"
                      className="w-full bg-[#070A10] border border-slate-800 rounded-xl p-3 text-white text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Admin / Officer Justification */}
            {accountType !== "citizen" && (
              <div>
                <label className="block mb-1.5 text-slate-200 font-bold">
                  Official Operational Justification
                </label>
                <textarea
                  rows="2"
                  required
                  value={formData.justification}
                  onChange={(e) => handleChange("justification", e.target.value)}
                  placeholder="State municipal role, zonal responsibilities, and department authorization..."
                  className="w-full bg-[#070A10] border border-slate-800 rounded-xl p-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 text-xs"
                />
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block mb-1.5 text-slate-200 font-bold">
                Security Password (Min 6 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#070A10] border border-slate-800 rounded-xl pl-10 pr-3 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 text-xs"
                />
              </div>
            </div>

            {/* Agreement Checkbox */}
            <div className="flex items-start gap-2.5 pt-2">
              <input
                type="checkbox"
                id="agreed"
                checked={formData.agreed}
                onChange={(e) => handleChange("agreed", e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-400 focus:ring-cyan-400 cursor-pointer"
              />
              <label htmlFor="agreed" className="text-[11px] text-slate-400 cursor-pointer">
                I hereby declare that the information provided is accurate and agree to abide by the Municipal Cyber-Security & Field Operations Protocol.
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl font-extrabold text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 transition-all uppercase cursor-pointer shadow-xl active:scale-95 disabled:opacity-60 ${
                  accountType === "officer"
                    ? "bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                    : accountType === "admin"
                    ? "bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 text-black cyan-glow-sm hover:cyan-glow-lg"
                    : "bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 text-black shadow-lg"
                }`}
              >
                <span>
                  {loading
                    ? "SUBMITTING CREDENTIALS..."
                    : accountType === "officer"
                    ? "🏛️ SUBMIT MUNICIPAL OFFICER APPLICATION"
                    : accountType === "admin"
                    ? "🛡️ SUBMIT COMMAND ADMIN REQUEST"
                    : "⚡ REGISTER CITIZEN ACCOUNT"}
                </span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center text-xs text-slate-400 pt-2">
              Already have an authorized credential?{" "}
              <button
                type="button"
                onClick={() => setActivePage("login")}
                className="text-cyan-400 hover:underline font-bold cursor-pointer"
              >
                Return to Login Portal
              </button>
            </div>

          </form>
        </div>
      </div>

      <footer className="text-center text-slate-500 text-xs font-mono-tech uppercase pt-4">
        © 2024 NEXINFRA INFRASTRUCTURE INTELLIGENCE • ALL OPERATIONAL PROTOCOLS ACTIVE
      </footer>
    </div>
  );
}
