import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import LandingView from "./views/LandingView";
import SignUpView from "./views/SignUpView";
import LoginView from "./views/LoginView";
import DashboardView from "./views/DashboardView";
import MaintenanceView from "./views/MaintenanceView";
import LiveMapView from "./views/LiveMapView";
import DroneFleetView from "./views/DroneFleetView";
import AnalyticsView from "./views/AnalyticsView";

import CCTVMonitor from "./components/CCTVMonitor";
import CitySyncReportView from "./views/CitySyncReportView";
import CitySyncMapView from "./views/CitySyncMapView";
import IncidentDetailView from "./views/IncidentDetailView";

import DispatchDroneModal from "./components/DispatchDroneModal";
import WorkOrderModal from "./components/WorkOrderModal";
import SettingsModal from "./components/SettingsModal";

export default function App() {
  const [activePage, setActivePage] = useState("landing");
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState("auto");

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("nexinfra-theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("nexinfra-theme", theme);
  }, [theme]);

  // Firebase Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          name: firebaseUser.displayName || "Operator",
          email: firebaseUser.email,
          clearance: "Level 3 Executive Command",
        });

        if (
          activePage === "landing" ||
          activePage === "login" ||
          activePage === "signup"
        ) {
          setActivePage("dashboard");
        }
      } else {
        setUser(null);
        setActivePage("landing");
      }
    });

    return unsubscribe;
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setActivePage("dashboard");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  // Theme / View Settings
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const isPublicPage =
    activePage === "landing" ||
    activePage === "signup" ||
    activePage === "login";

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">

      {/* Navbar */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        isAuth={!!user}
        user={user}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Public Pages */}
      {isPublicPage ? (
        <div className="flex-1">

          {activePage === "landing" && (
            <LandingView setActivePage={setActivePage} />
          )}

          {activePage === "signup" && (
            <SignUpView
              setActivePage={setActivePage}
              onLoginSuccess={handleLoginSuccess}
            />
          )}

          {activePage === "login" && (
            <LoginView
              setActivePage={setActivePage}
              onLoginSuccess={handleLoginSuccess}
            />
          )}

        </div>

      ) : activePage === "report-issue" ||
        activePage === "citysync-map" ||
        activePage === "incident-detail" ? (

        <div className="flex-1 bg-[#07090E] flex flex-col justify-center items-center py-4">

          {activePage === "report-issue" && (
            <CitySyncReportView
              setActivePage={setActivePage}
              viewMode={viewMode}
            />
          )}

          {activePage === "citysync-map" && (
            <CitySyncMapView
              setActivePage={setActivePage}
              viewMode={viewMode}
            />
          )}

          {activePage === "incident-detail" && (
            <IncidentDetailView
              setActivePage={setActivePage}
              viewMode={viewMode}
            />
          )}

        </div>

      ) : (

        <div className="flex min-h-screen w-full overflow-hidden">

          {/* Sidebar */}
          <Sidebar
            activePage={activePage}
            setActivePage={setActivePage}
            onOpenDispatchModal={() => setIsDispatchModalOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />

          {/* Main Console */}
          <main className="flex-1 flex flex-col min-w-0 bg-[#070A10] h-screen overflow-hidden">

            {/* Console Header */}
            <div className="h-14 bg-[#090D16] border-b border-slate-800/80 px-6 flex items-center justify-between font-mono-tech text-xs shrink-0">

              <div className="flex items-center gap-3">
                <span className="text-cyan-400 font-bold uppercase tracking-wider text-sm">
                  NEXINFRA COMMAND CONSOLE
                </span>

                <span className="text-slate-600">/</span>

                <span className="text-white capitalize text-sm font-bold">
                  {activePage.replace("-", " ")}
                </span>
              </div>

              <div className="flex items-center space-x-4">

                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer text-xs font-bold"
                >
                  ⚙ Settings
                </button>

                <button
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-red-400 transition-colors cursor-pointer text-xs font-bold"
                >
                  Logout
                </button>

                <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-sm">
                  {user?.name ? user.name[0] : "O"}
                </div>

              </div>
            </div>

            {/* Active Console Views */}
            <div className="flex-1 overflow-y-auto flex flex-col">

              {activePage === "dashboard" && (
                <DashboardView
                  setActivePage={setActivePage}
                  onOpenDispatchModal={() => setIsDispatchModalOpen(true)}
                />
              )}

              {activePage === "maintenance" && (
                <MaintenanceView
                  onOpenWorkOrderModal={() => setIsWorkOrderModalOpen(true)}
                />
              )}

              {activePage === "live-map" && (
                <LiveMapView
                  onOpenDispatchModal={() => setIsDispatchModalOpen(true)}
                />
              )}

              {activePage === "drone-fleet" && (
                <DroneFleetView
                  onOpenDispatchModal={() => setIsDispatchModalOpen(true)}
                />
              )}

              {activePage === "analytics" && <AnalyticsView />}

              {activePage === "cctv" && <CCTVMonitor />}

            </div>

          </main>

        </div>

      )}

      {/* Global Modals */}

      <DispatchDroneModal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
      />

      <WorkOrderModal
        isOpen={isWorkOrderModalOpen}
        onClose={() => setIsWorkOrderModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        viewMode={viewMode}
        setViewMode={setViewMode}
        theme={theme}
        setTheme={setTheme}
      />

    </div>
  );
}