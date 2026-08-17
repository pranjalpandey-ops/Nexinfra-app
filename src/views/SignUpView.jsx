import React, { useState } from "react";
import {
  Shield,
  User,
  Mail,
  Building,
  Lock,
  ChevronDown,
  ArrowRight,
} from "lucide-react";

import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase";

export default function SignUpView({ setActivePage, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    organization: "",
    clearance: "",
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
      alert("Please accept the Terms of Service.");
      return;
    }

    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters.");
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

      if (onLoginSuccess) {
        onLoginSuccess({
          name: formData.fullName,
          email: formData.email,
          clearance: formData.clearance || "Level 2 Supervisor",
        });
      }

      alert("Account created successfully!");

      setActivePage("dashboard");
    } catch (error) {
      let message;

      switch (error.code) {
        case "auth/email-already-in-use":
          message = "Email already registered.";
          break;
        case "auth/invalid-email":
          message = "Invalid email address.";
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

        <div className="bg-[#0D121F]/95 border border-cyan-500/40 rounded-2xl p-8 sm:p-10 shadow-2xl backdrop-blur-md space-y-8">

          <div className="flex flex-col items-center text-center space-y-3">

            <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-cyan-400">
              <Shield className="w-8 h-8" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-white">
                NexInfra System
              </h1>

              <p className="text-cyan-400 text-xs sm:text-sm tracking-widest uppercase font-bold mt-1">
                CREATE OPERATOR ACCOUNT
              </p>
            </div>

          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label className="block mb-2 text-sm font-bold">
                  Full Name
                </label>

                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />

                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) =>
                      handleChange("fullName", e.target.value)
                    }
                    placeholder="Operator Name"
                    className="w-full bg-[#070A10] border border-slate-800 rounded-xl pl-10 py-3 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-bold">
                  Work Email
                </label>

                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />

                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      handleChange("email", e.target.value)
                    }
                    placeholder="operator@nexinfra.gov"
                    className="w-full bg-[#070A10] border border-slate-800 rounded-xl pl-10 py-3 text-white"
                  />
                </div>
              </div>

            </div>

            <div>
              <label className="block mb-2 text-sm font-bold">
                Organization
              </label>

              <div className="relative">
                <Building className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />

                <input
                  type="text"
                  required
                  value={formData.organization}
                  onChange={(e) =>
                    handleChange("organization", e.target.value)
                  }
                  placeholder="Municipal Authority"
                  className="w-full bg-[#070A10] border border-slate-800 rounded-xl pl-10 py-3 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-bold">
                Security Clearance
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />

                <select
                  required
                  value={formData.clearance}
                  onChange={(e) =>
                    handleChange("clearance", e.target.value)
                  }
                  className="w-full bg-[#070A10] border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-white appearance-none"
                >
                  <option value="">Select Clearance</option>
                  <option>Level 1 - Tactical Field Operator</option>
                  <option>Level 2 - Regional Grid Supervisor</option>
                  <option>Level 3 - Executive Command Authority</option>
                </select>

                <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-bold">
                Security Password
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />

                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    handleChange("password", e.target.value)
                  }
                  placeholder="Minimum 6 characters"
                  className="w-full bg-[#070A10] border border-slate-800 rounded-xl pl-10 py-3 text-white"
                />
              </div>
            </div>

            <label className="flex items-start gap-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={formData.agreed}
                onChange={(e) =>
                  handleChange("agreed", e.target.checked)
                }
                className="mt-1"
              />

              <span>
                I acknowledge the Terms of Service and Data Privacy Protocol.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 text-black font-extrabold tracking-wider flex items-center justify-center gap-2 uppercase disabled:opacity-60"
            >
              {loading ? "CREATING ACCOUNT..." : "🚀 CREATE ACCOUNT"}

              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="text-center text-sm text-slate-400">
              Already have an account?

              <button
                type="button"
                onClick={() => setActivePage("login")}
                className="ml-2 text-cyan-400 hover:underline"
              >
                Sign In
              </button>
            </div>

          </form>

        </div>

      </div>
      <footer className="text-center text-slate-400 text-xs uppercase pt-6">
        © 2024 NEXINFRA INFRASTRUCTURE INTELLIGENCE. ALL SYSTEMS OPERATIONAL.
      </footer>
      </div>
  );
}