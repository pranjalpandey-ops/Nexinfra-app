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

import DispatchDroneModal from "./components/DispatchDroneModal";
import WorkOrderModal from "./components/WorkOrderModal";
import SettingsModal from "./components/SettingsModal";
import AdminApprovalModal from "./components/AdminApprovalModal";
import AlertsDrawerModal from "./components/AlertsDrawerModal";
import LiveAlertToast from "./components/LiveAlertToast";

const ADMIN_ONLY_PAGES = ["live-map", "maintenance", "drone-fleet", "analytics", "cctv"];

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
          setActivePage("dashboard");
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
    if (ADMIN_ONLY_PAGES.includes(targetPage)) {
      if (!user || user.role !== "admin") {
        alert("Access Restricted: This module requires Command Administrator clearance.");
        setActivePage("dashboard");
        return;
      }
    }
    setActivePage(targetPage);
  };

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
      ) : (
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
                <span className="text-cyan-400 font-bold uppercase tracking-wider text-sm">
                  NEXINFRA {user?.role === "admin" ? "COMMAND CONSOLE" : "CITIZEN PORTAL"}
                </span>

                <span className="text-slate-600">/</span>

                <span className="text-white capitalize text-sm font-bold">
                  {activePage.replace("-", " ")}
                </span>

                {user?.role && (
                  <span
                    className={`ml-2 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                      user.role === "admin"
                        ? "bg-cyan-950 border border-cyan-500 text-cyan-300"
                        : user.role === "pending_admin"
                        ? "bg-amber-950 border border-amber-500 text-amber-300"
                        : "bg-emerald-950 border border-emerald-500 text-emerald-300"
                    }`}
                  >
                    {user.role === "admin"
                      ? "ADMIN"
                      : user.role === "pending_admin"
                      ? "PENDING VERIFICATION"
                      : "PUBLIC"}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-4">
                {/* Emergency Alert Indicator */}
                <button
                  onClick={() => setIsAlertsOpen(true)}
                  className="text-red-400 hover:text-red-300 transition-colors cursor-pointer text-xs font-bold font-mono-tech flex items-center gap-1.5"
                  title="Open Live Alert Center"
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span>🚨 Live Alerts ({alerts.filter(a => a.level === "CRITICAL").length})</span>
                </button>

                {user?.role === "admin" && (
                  <button
                    onClick={handleOpenApproval}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer text-xs font-bold font-mono-tech flex items-center gap-1"
                    title="Review Admin Applications"
                  >
                    <span>🛡️ Approvals</span>
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
              {activePage === "dashboard" && (
                <DashboardView
                  setActivePage={handleNavigate}
                  user={user}
                  onOpenDispatchModal={handleOpenDispatch}
                />
              )}

              {activePage === "maintenance" && user?.role === "admin" && (
                <MaintenanceView
                  onOpenWorkOrderModal={handleOpenWorkOrder}
                  onOpenDispatchModal={handleOpenDispatch}
                />
              )}

              {activePage === "live-map" && user?.role === "admin" && (
                <LiveMapView
                  onOpenDispatchModal={handleOpenDispatch}
                />
              )}

              {activePage === "drone-fleet" && user?.role === "admin" && (
                <DroneFleetView
                  onOpenDispatchModal={handleOpenDispatch}
                />
              )}

              {activePage === "analytics" && user?.role === "admin" && <AnalyticsView />}

              {activePage === "cctv" && user?.role === "admin" && <CCTVMonitor />}
            </div>
          </main>
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
