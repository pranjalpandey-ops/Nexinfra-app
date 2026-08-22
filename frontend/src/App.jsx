import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import { resolveUserWithRole } from "./services/userService";
import { subscribeToLiveAlerts } from "./services/alertService";

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
import MunicipalOfficerView from "./views/MunicipalOfficerView";

import DispatchDroneModal from "./components/DispatchDroneModal";
import WorkOrderModal from "./components/WorkOrderModal";
import SettingsModal from "./components/SettingsModal";
import AdminApprovalModal from "./components/AdminApprovalModal";
import AlertsDrawerModal from "./components/AlertsDrawerModal";
import LiveAlertToast from "./components/LiveAlertToast";

const ADMIN_ONLY_PAGES = ["live-map", "maintenance", "drone-fleet", "cctv"];

export default function App() {
  const [activePage, setActivePage] = useState("landing");
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState("auto");

  // Alert System States
  const [alerts, setAlerts] = useState([]);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [activeAlertToast, setActiveAlertToast] = useState(null);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("nexinfra-theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("nexinfra-theme", theme);
  }, [theme]);

  // Firebase Authentication State & Role Synchronization
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const resolvedProfile = await resolveUserWithRole(firebaseUser);
        setUser(resolvedProfile);

        if (
          activePage === "landing" ||
          activePage === "login" ||
          activePage === "signup"
        ) {
          if (resolvedProfile.role === "officer") {
            setActivePage("municipal-dashboard");
          } else {
            setActivePage("dashboard");
          }
        }
      } else {
        setUser(null);
        setActivePage("landing");
      }
    });

    return unsubscribe;
  }, []);

  // Live Database Alert Ingestion
  useEffect(() => {
    const unsubscribe = subscribeToLiveAlerts((liveAlerts) => {
      setAlerts(liveAlerts);

      // Trigger toast for most recent unacknowledged critical alert
      const latestCritical = liveAlerts.find(
        (a) => (a.level === "CRITICAL" || a.priority === "P1") && !a.acknowledged
      );

      if (latestCritical && !activeAlertToast) {
        setActiveAlertToast(latestCritical);
      }
    });

    return unsubscribe;
  }, []);

  // Protected Route Handler with Role Based Access Control
  const handleNavigate = (targetPage) => {
    if (!user && targetPage !== "landing" && targetPage !== "login" && targetPage !== "signup") {
      setActivePage("login");
      return;
    }

    // 1. Municipal Officer Account Route Isolation
    if (user?.role === "officer") {
      const officerAllowedPages = [
        "municipal-dashboard",
        "maintenance",
        "live-map",
        "cctv",
        "landing",
        "login",
        "signup"
      ];
      if (!officerAllowedPages.includes(targetPage)) {
        setActivePage("municipal-dashboard");
        return;
      }
    }

    // 2. Public Citizen Account Route Isolation
    if (user?.role === "public") {
      const publicAllowedPages = [
        "dashboard",
        "citysync-map",
        "report-issue",
        "incident-detail",
        "analytics",
        "landing",
        "login",
        "signup"
      ];
      if (!publicAllowedPages.includes(targetPage)) {
        setActivePage("dashboard");
        return;
      }
    }

    // 3. Admin-Only Modules
    if (ADMIN_ONLY_PAGES.includes(targetPage)) {
      if (!user || user.role !== "admin") {
        alert("Access Restricted: This module requires Command Administrator clearance.");
        setActivePage(user?.role === "officer" ? "municipal-dashboard" : user ? "dashboard" : "login");
        return;
      }
    }

    setActivePage(targetPage);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    if (userData?.role === "officer") {
      setActivePage("municipal-dashboard");
    } else {
      setActivePage("dashboard");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  // Inspect Incident directly from Alert
  const handleInspectAlert = (alertItem) => {
    setActiveAlertToast(null);
    if (alertItem.incidentId) {
      localStorage.setItem("selectedComplaint", JSON.stringify({
        id: alertItem.incidentId,
        title: alertItem.title,
        description: alertItem.message,
        ward: alertItem.location,
        priority: "P1",
        status: "AI Verified"
      }));
    }
    setActivePage("incident-detail");
  };

  // Modals & Controls
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);

  const handleOpenDispatch = () => {
    if (user?.role !== "admin") {
      alert("Administrator Clearance required to dispatch Tactical UAVs.");
      return;
    }
    setIsDispatchModalOpen(true);
  };

  const handleOpenWorkOrder = () => {
    if (user?.role !== "admin") {
      alert("Administrator Clearance required to generate official work orders.");
      return;
    }
    setIsWorkOrderModalOpen(true);
  };

  const handleOpenApproval = () => {
    if (user?.role !== "admin") {
      alert("Only Predefined Administrators can review personnel clearance applications.");
      return;
    }
    setIsApprovalModalOpen(true);
  };

  const isPublicPage =
    activePage === "landing" ||
    activePage === "signup" ||
    activePage === "login";

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Navbar */}
      <Navbar
        activePage={activePage}
        setActivePage={handleNavigate}
        isAuth={!!user}
        user={user}
        theme={theme}
        setTheme={setTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAlerts={() => setIsAlertsOpen(true)}
      />

      {/* Public Unauthenticated Views */}
      {isPublicPage ? (
        <div className="flex-1">
          {activePage === "landing" && (
            <LandingView setActivePage={handleNavigate} />
          )}

          {activePage === "signup" && (
            <SignUpView
              setActivePage={handleNavigate}
              onLoginSuccess={handleLoginSuccess}
            />
          )}

          {activePage === "login" && (
            <LoginView
              setActivePage={handleNavigate}
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
              setActivePage={handleNavigate}
              viewMode={viewMode}
              user={user}
            />
          )}

          {activePage === "citysync-map" && (
            <CitySyncMapView
              setActivePage={handleNavigate}
              viewMode={viewMode}
              user={user}
            />
          )}

          {activePage === "incident-detail" && (
            <IncidentDetailView
              setActivePage={handleNavigate}
              viewMode={viewMode}
              user={user}
            />
          )}
        </div>
      ) : user ? (
        <div className="flex min-h-screen w-full overflow-hidden">
          {/* Sidebar */}
          <Sidebar
            activePage={activePage}
            setActivePage={handleNavigate}
            user={user}
            theme={theme}
            onOpenDispatchModal={handleOpenDispatch}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenApprovalModal={handleOpenApproval}
          />

          {/* Main Console */}
          <main className="flex-1 flex flex-col min-w-0 bg-[#070A10] h-screen overflow-hidden">
            {/* Console Header */}
            <div className="h-14 bg-[#090D16] border-b border-slate-800/80 px-6 flex items-center justify-between font-mono-tech text-xs shrink-0">
              <div className="flex items-center gap-3">
                <span className={`font-bold uppercase tracking-wider text-sm ${
                  user?.role === "officer" || activePage === "municipal-dashboard"
                    ? "text-amber-400"
                    : user?.role === "admin"
                    ? "text-cyan-400"
                    : "text-emerald-400"
                }`}>
                  NEXINFRA {user?.role === "officer" || activePage === "municipal-dashboard" ? "MUNICIPAL DESK" : user?.role === "admin" ? "COMMAND CONSOLE" : "CITIZEN PORTAL"}
                </span>

                <span className="text-slate-600">/</span>

                <span className="text-white capitalize text-sm font-bold">
                  {activePage.replace("-", " ")}
                </span>

                {user?.role && (
                  <span
                    className={`ml-2 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                      user.role === "officer" || activePage === "municipal-dashboard"
                        ? "bg-amber-950 border border-amber-500 text-amber-300"
                        : user.role === "admin"
                        ? "bg-cyan-950 border border-cyan-500 text-cyan-300"
                        : user.role === "pending_admin" || user.role === "pending_officer"
                        ? "bg-amber-950 border border-amber-500 text-amber-300"
                        : "bg-emerald-950 border border-emerald-500 text-emerald-300"
                    }`}
                  >
                    {user.role === "officer" || activePage === "municipal-dashboard"
                      ? "OFFICER"
                      : user.role === "admin"
                      ? "ADMIN"
                      : user.role === "pending_admin" || user.role === "pending_officer"
                      ? "PENDING"
                      : "CITIZEN"}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4">
                {/* Live Alert Status Indicator in Header */}
                <button
                  onClick={() => setIsAlertsOpen(true)}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span>Live Alerts ({alerts.filter((a) => !a.acknowledged).length})</span>
                </button>

                {user?.role === "admin" && activePage !== "municipal-dashboard" && (
                  <button
                    onClick={handleOpenApproval}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
                  >
                    🛡️ Approvals
                  </button>
                )}

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

                <div
                  className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-sm"
                  title={`${user?.name || "User"} (${user?.role || "public"})`}
                >
                  {user?.name ? user.name[0].toUpperCase() : "U"}
                </div>
              </div>
            </div>

            {/* Active Console Views */}
            <div className="flex-1 overflow-y-auto flex flex-col">
              {activePage === "dashboard" && user?.role !== "officer" && (
                <DashboardView
                  setActivePage={handleNavigate}
                  user={user}
                  onOpenDispatchModal={handleOpenDispatch}
                />
              )}

              {activePage === "municipal-dashboard" && (
                <div className="p-6">
                  <MunicipalOfficerView
                    user={user}
                    setActivePage={handleNavigate}
                  />
                </div>
              )}

              {activePage === "maintenance" && (user?.role === "admin" || user?.role === "officer") && (
                <MaintenanceView
                  onOpenWorkOrderModal={handleOpenWorkOrder}
                  onOpenDispatchModal={handleOpenDispatch}
                />
              )}

              {activePage === "live-map" && (user?.role === "admin" || user?.role === "officer") && (
                <LiveMapView
                  onOpenDispatchModal={handleOpenDispatch}
                  setActivePage={handleNavigate}
                  user={user}
                />
              )}

              {activePage === "drone-fleet" && user?.role === "admin" && (
                <DroneFleetView
                  onOpenDispatchModal={handleOpenDispatch}
                />
              )}

              {activePage === "cctv" && (user?.role === "admin" || user?.role === "officer") && (
                <CCTVMonitor user={user} setActivePage={handleNavigate} />
              )}

              {activePage === "analytics" && (
                <AnalyticsView
                  setActivePage={handleNavigate}
                />
              )}
            </div>
          </main>
        </div>
      ) : (
        <div className="flex-1">
          <LoginView
            setActivePage={handleNavigate}
            onLoginSuccess={handleLoginSuccess}
          />
        </div>
      )}

      {/* Global Modals & Live Alerts */}
      {user?.role === "admin" && (
        <>
          <DispatchDroneModal
            isOpen={isDispatchModalOpen}
            onClose={() => setIsDispatchModalOpen(false)}
          />

          <WorkOrderModal
            isOpen={isWorkOrderModalOpen}
            onClose={() => setIsWorkOrderModalOpen(false)}
          />

          <AdminApprovalModal
            isOpen={isApprovalModalOpen}
            onClose={() => setIsApprovalModalOpen(false)}
            user={user}
          />
        </>
      )}

      <AlertsDrawerModal
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        alerts={alerts}
        onSelectIncident={(incId) => {
          handleInspectAlert({ incidentId: incId });
        }}
      />

      <LiveAlertToast
        alert={activeAlertToast}
        onInspect={handleInspectAlert}
        onDismiss={() => setActiveAlertToast(null)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        viewMode={viewMode}
        setViewMode={setViewMode}
        theme={theme}
        setTheme={setTheme}
        user={user}
        onOpenApprovalModal={handleOpenApproval}
      />
    </div>
  );
}
