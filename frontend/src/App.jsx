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
import { HardHat, ShieldCheck, Sparkles, Loader2 } from "lucide-react";

/**
 * CENTRAL ROLE PERMISSIONS CONFIGURATION
 * Strict role-based route mapping.
 */
export const ROLE_PAGES = {
  admin: [
    "dashboard",
    "live-map",
    "citysync-map",
    "report-issue",
    "incident-detail",
    "maintenance",
    "cctv",
    "drone-fleet",
    "analytics"
  ],
  officer: [
    "municipal-dashboard",
    "officer-map",
    "teams-laid-to-work",
    "task-allotment",
    "team-details",
    "add-member",
    "team-analytics",
    "analytics",
    "maintenance",
    "cctv",
    "live-map",
    "citysync-map",
    "report-issue",
    "incident-detail"
  ],
  public: [
    "dashboard",
    "citysync-map",
    "report-issue",
    "incident-detail",
    "analytics",
    "cctv"
  ]
};

export function getRoleLandingPage(role) {
  if (role === "admin") return "dashboard";
  if (role === "officer") return "municipal-dashboard";
  return "dashboard";
}

export function canAccessPage(role, targetPage) {
  if (targetPage === "landing" || targetPage === "login" || targetPage === "signup") {
    return true;
  }
  const allowed = ROLE_PAGES[role] || ROLE_PAGES.public;
  return allowed.includes(targetPage);
}

export default function App() {
  const [activePage, setActivePage] = useState("landing");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [viewMode, setViewMode] = useState("auto");

  // Alert System States
  const [alerts, setAlerts] = useState([]);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [activeAlertToast, setActiveAlertToast] = useState(null);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("nexinfra-theme") || "dark";
  });

  useEffect(() => {
    localStorage.setItem("nexinfra-theme", theme);
  }, [theme]);

  // Firebase Authentication State & Firestore Role Synchronization
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthLoading(true);
      if (firebaseUser) {
        try {
          const resolvedProfile = await resolveUserWithRole(firebaseUser);
          setUser(resolvedProfile);

          // Route to role-specific landing page if currently on auth/landing screens
          setActivePage((prev) => {
            if (prev === "landing" || prev === "login" || prev === "signup") {
              return getRoleLandingPage(resolvedProfile?.role);
            }
            // If on a page not allowed for their resolved role, redirect appropriately
            if (!canAccessPage(resolvedProfile?.role, prev)) {
              return getRoleLandingPage(resolvedProfile?.role);
            }
            return prev;
          });
        } catch (err) {
          console.error("Role resolution error:", err);
          setUser(null);
        }
      } else {
        setUser(null);
        setActivePage((prev) => (prev === "login" || prev === "signup" ? prev : "landing"));
      }
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  // Live Database Alert Ingestion
  useEffect(() => {
    const unsubscribe = subscribeToLiveAlerts((liveAlerts) => {
      setAlerts(liveAlerts);

      const latestCritical = liveAlerts.find(
        (a) => (a.level === "CRITICAL" || a.priority === "P1") && !a.acknowledged
      );

      if (latestCritical && !activeAlertToast) {
        setActiveAlertToast(latestCritical);
      }
    });

    return unsubscribe;
  }, []);

  // Protected Navigation Guard
  const handleNavigate = (targetPage) => {
    if (!user && targetPage !== "landing" && targetPage !== "login" && targetPage !== "signup") {
      setActivePage("login");
      return;
    }

    if (user) {
      // Municipal Officer redirect mapping
      if (user.role === "officer" && targetPage === "dashboard") {
        setActivePage("municipal-dashboard");
        return;
      }

      if (!canAccessPage(user.role, targetPage)) {
        setActivePage(getRoleLandingPage(user.role));
        return;
      }
    }

    setActivePage(targetPage);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setActivePage(getRoleLandingPage(userData?.role));
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setActivePage("landing");
      localStorage.removeItem("selectedComplaint");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  // Modals state
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);

  const handleOpenDispatch = () => setIsDispatchModalOpen(true);
  const handleOpenWorkOrder = () => setIsWorkOrderModalOpen(true);
  const handleOpenApproval = () => setIsApprovalModalOpen(true);

  // Authentication Loading Screen
  if (authLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#070A10] text-slate-100 font-mono">
        <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-[#0B0F19] border border-slate-800 shadow-2xl animate-pulse">
          <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-500/60 flex items-center justify-center text-cyan-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-base font-bold text-white tracking-wider">NEXINFRA SECURE GATEWAY</h3>
            <p className="text-xs text-slate-400">Authenticating Credentials & Resolving Role Clearance...</p>
          </div>
        </div>
      </div>
    );
  }

  // 1. PUBLIC UN-AUTHENTICATED LANDING & AUTH PAGES
  if (activePage === "landing") {
    return (
      <div className="min-h-screen flex flex-col bg-[#04050c] text-slate-100">
        <Navbar
          activePage={activePage}
          setActivePage={handleNavigate}
          isAuth={Boolean(user)}
          user={user}
          theme={theme}
          setTheme={setTheme}
          onLogout={handleLogout}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAlerts={() => setIsAlertsOpen(true)}
        />
        <div className="flex-1">
          <LandingView
            setActivePage={handleNavigate}
            user={user}
            onLoginSuccess={handleLoginSuccess}
            onLogout={handleLogout}
            theme={theme}
            setTheme={setTheme}
          />
        </div>
      </div>
    );
  }

  if (activePage === "login") {
    return (
      <div className="min-h-screen flex flex-col bg-[#070A10] text-slate-100">
        <Navbar
          activePage={activePage}
          setActivePage={handleNavigate}
          isAuth={Boolean(user)}
          user={user}
          theme={theme}
          setTheme={setTheme}
          onLogout={handleLogout}
        />
        <div className="flex-1">
          <LoginView
            setActivePage={handleNavigate}
            onLoginSuccess={handleLoginSuccess}
          />
        </div>
      </div>
    );
  }

  if (activePage === "signup") {
    return (
      <div className="min-h-screen flex flex-col bg-[#070A10] text-slate-100">
        <Navbar
          activePage={activePage}
          setActivePage={handleNavigate}
          isAuth={Boolean(user)}
          user={user}
          theme={theme}
          setTheme={setTheme}
          onLogout={handleLogout}
        />
        <div className="flex-1">
          <SignUpView
            setActivePage={handleNavigate}
            onSignUpSuccess={handleLoginSuccess}
          />
        </div>
      </div>
    );
  }

  // 2. REPORTING, CITYSYNC MAP & TRACKING PORTAL (CLEAN FULL-PAGE VIEW FOR ALL USERS)
  const isCitizenOnlyView =
    activePage === "citysync-map" ||
    activePage === "report-issue" ||
    activePage === "incident-detail";

  if (isCitizenOnlyView) {
    return (
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#070A10] text-slate-100 font-sans">
        <Navbar
          activePage={activePage}
          setActivePage={handleNavigate}
          isAuth={Boolean(user)}
          user={user}
          theme={theme}
          setTheme={setTheme}
          onLogout={handleLogout}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAlerts={() => setIsAlertsOpen(true)}
        />

        <main className="flex-1 min-h-0 overflow-y-auto flex flex-col">
          {activePage === "citysync-map" && (
            <CitySyncMapView
              setActivePage={handleNavigate}
              user={user}
            />
          )}

          {activePage === "report-issue" && (
            <CitySyncReportView
              setActivePage={handleNavigate}
              user={user}
            />
          )}

          {activePage === "incident-detail" && (
            <IncidentDetailView
              setActivePage={handleNavigate}
              user={user}
            />
          )}
        </main>
      </div>
    );
  }

  // 3. MAIN CONSOLE INTERFACE (ADMIN & MUNICIPAL OFFICER PORTALS)
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#070A10] text-slate-100 font-sans">
      <Navbar
        activePage={activePage}
        setActivePage={handleNavigate}
        isAuth={Boolean(user)}
        user={user}
        theme={theme}
        setTheme={setTheme}
        onLogout={handleLogout}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAlerts={() => setIsAlertsOpen(true)}
      />

      {user ? (
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Role-Aware Sidebar */}
          <Sidebar
            activePage={activePage}
            setActivePage={handleNavigate}
            user={user}
            theme={theme}
            onOpenDispatchModal={handleOpenDispatch}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenApprovalModal={handleOpenApproval}
          />

          {/* Main Console Body */}
          <main className="flex-1 flex flex-col min-w-0 bg-[#070A10] h-full overflow-hidden">
            
            {/* Top Console Header Status */}
            <div className="h-14 bg-[#090D16] border-b border-slate-800/80 px-6 flex items-center justify-between font-mono-tech text-xs shrink-0">
              <div className="flex items-center gap-3">
                <span className={`font-bold uppercase tracking-wider text-sm ${
                  user.role === "officer"
                    ? "text-amber-400"
                    : user.role === "admin"
                    ? "text-cyan-400"
                    : "text-emerald-400"
                }`}>
                  NEXINFRA {user.role === "officer" ? "MUNICIPAL DESK" : user.role === "admin" ? "COMMAND CONSOLE" : "CITIZEN PORTAL"}
                </span>

                <span className="text-slate-600">/</span>

                <span className="text-white capitalize text-sm font-bold">
                  {activePage.replace("-", " ")}
                </span>

                <span
                  className={`ml-2 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                    user.role === "officer"
                      ? "bg-amber-950 border border-amber-500 text-amber-300"
                      : user.role === "admin"
                      ? "bg-cyan-950 border border-cyan-500 text-cyan-300"
                      : "bg-emerald-950 border border-emerald-500 text-emerald-300"
                  }`}
                >
                  {user.role === "officer" ? "OFFICER" : user.role === "admin" ? "ADMIN" : "CITIZEN"}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsAlertsOpen(true)}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span>Live Alerts ({alerts.filter((a) => !a.acknowledged).length})</span>
                </button>

                {user.role === "admin" && (
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
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border ${
                    user.role === "officer"
                      ? "bg-amber-950 border-amber-500/50 text-amber-300"
                      : user.role === "admin"
                      ? "bg-cyan-950 border-cyan-500/50 text-cyan-300"
                      : "bg-emerald-950 border-emerald-500/50 text-emerald-300"
                  }`}
                  title={`${user.name || "User"} (${user.role})`}
                >
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </div>
              </div>
            </div>

            {/* Active Views Area */}
            <div className="flex-1 overflow-y-auto flex flex-col">
              
              {/* ADMIN DASHBOARD */}
              {activePage === "dashboard" && user.role === "admin" && (
                <DashboardView
                  setActivePage={handleNavigate}
                  user={user}
                  onOpenDispatchModal={handleOpenDispatch}
                />
              )}

              {/* CITIZEN DASHBOARD */}
              {activePage === "dashboard" && user.role === "public" && (
                <DashboardView
                  setActivePage={handleNavigate}
                  user={user}
                  onOpenDispatchModal={handleOpenDispatch}
                />
              )}

              {/* MUNICIPAL OFFICER PORTAL VIEWS */}
              {(activePage === "municipal-dashboard" ||
                activePage === "officer-map" ||
                activePage === "teams-laid-to-work" ||
                activePage === "task-allotment" ||
                activePage === "team-details" ||
                activePage === "add-member" ||
                activePage === "team-analytics" ||
                activePage === "analytics") && user.role === "officer" && (
                <div className="p-6">
                  <MunicipalOfficerView
                    user={user}
                    activePage={activePage}
                    setActivePage={handleNavigate}
                  />
                </div>
              )}

              {/* INCIDENT LOGS (ACCESSIBLE TO BOTH ADMIN & OFFICER - SEPARATED INSIDE COMPONENT) */}
              {activePage === "maintenance" && (user.role === "admin" || user.role === "officer") && (
                <MaintenanceView
                  user={user}
                  setActivePage={handleNavigate}
                  onOpenWorkOrderModal={handleOpenWorkOrder}
                  onOpenDispatchModal={handleOpenDispatch}
                />
              )}

              {/* LIVE GIS MAP (ADMIN & OFFICER) */}
              {activePage === "live-map" && (user.role === "admin" || user.role === "officer") && (
                <LiveMapView
                  onOpenDispatchModal={handleOpenDispatch}
                  setActivePage={handleNavigate}
                  user={user}
                />
              )}

              {/* CCTV MONITOR (ACCESSIBLE TO ALL CLEARANCE ROLES) */}
              {activePage === "cctv" && (
                <CCTVMonitor
                  user={user}
                  setActivePage={handleNavigate}
                />
              )}

              {/* DRONE FLEET (STRICTLY ADMIN ONLY) */}
              {activePage === "drone-fleet" && user.role === "admin" && (
                <DroneFleetView
                  onOpenDispatchModal={handleOpenDispatch}
                />
              )}

              {/* ANALYTICS */}
              {activePage === "analytics" && (
                <AnalyticsView
                  setActivePage={handleNavigate}
                />
              )}

              {/* CITYSYNC MAP (ACCESSIBLE TO ADMIN & ALL ROLES WITH DRONES, HEATMAP, INCIDENTS) */}
              {activePage === "citysync-map" && (
                <CitySyncMapView
                  setActivePage={handleNavigate}
                  user={user}
                />
              )}

              {/* REPORT ISSUE (ACCESSIBLE TO ADMIN & ALL ROLES) */}
              {activePage === "report-issue" && (
                <CitySyncReportView
                  setActivePage={handleNavigate}
                  user={user}
                />
              )}

              {/* INCIDENT INSPECTOR / DETAIL VIEW */}
              {activePage === "incident-detail" && (
                <IncidentDetailView
                  setActivePage={handleNavigate}
                  user={user}
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

      {/* Global Admin Modals */}
      {user?.role === "admin" && (
        <>
          <DispatchDroneModal
            isOpen={isDispatchModalOpen}
            onClose={() => setIsDispatchModalOpen(false)}
          />
          <AdminApprovalModal
            isOpen={isApprovalModalOpen}
            onClose={() => setIsApprovalModalOpen(false)}
          />
        </>
      )}

      <WorkOrderModal
        isOpen={isWorkOrderModalOpen}
        onClose={() => setIsWorkOrderModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
      />

      <AlertsDrawerModal
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        alerts={alerts}
        onAcknowledge={(alertId) => {
          setAlerts((prev) =>
            prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
          );
        }}
      />

      {activeAlertToast && (
        <LiveAlertToast
          alert={activeAlertToast}
          onClose={() => setActiveAlertToast(null)}
          onDismiss={() => setActiveAlertToast(null)}
          onInspect={(alertData) => {
            const dataToInspect = alertData || activeAlertToast;
            setActiveAlertToast(null);
            if (dataToInspect) {
              try {
                localStorage.setItem("selectedComplaint", JSON.stringify(dataToInspect));
              } catch (e) {
                console.error("Storage error:", e);
              }
              // Route to incident-detail or maintenance
              handleNavigate("incident-detail");
            } else {
              handleNavigate("maintenance");
            }
          }}
          onViewIncident={(alertData) => {
            const dataToInspect = alertData || activeAlertToast;
            setActiveAlertToast(null);
            if (dataToInspect) {
              try {
                localStorage.setItem("selectedComplaint", JSON.stringify(dataToInspect));
              } catch (e) {}
              handleNavigate("incident-detail");
            } else {
              handleNavigate("maintenance");
            }
          }}
        />
      )}
    </div>
  );
}
