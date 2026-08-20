import React, { useState, useEffect } from 'react';
import {
  Activity,
  BarChart2,
  Plane,
  Cpu,
  ShieldCheck,
  Zap,
  Radio,
  ChevronRight,
  X,
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  Layers,
  Database,
  Lock,
  Compass,
  CheckCircle2
} from 'lucide-react';

import FluidCanvas from '../components/effects/FluidCanvas';
import CursorSpotlight from '../components/effects/CursorSpotlight';
import MagneticButton from '../components/effects/MagneticButton';
import TiltCard from '../components/effects/TiltCard';
import ScrollReveal from '../components/effects/ScrollReveal';
import MouseParallaxContainer from '../components/effects/MouseParallaxContainer';
import WordByWordReveal from '../components/effects/WordByWordReveal';

export default function LandingView({ setActivePage }) {
  const [showArchModal, setShowArchModal] = useState(false);
  const [activeTelemetry, setActiveTelemetry] = useState(true);
  const [emailInput, setEmailInput] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState(false);
  const [theme, setTheme] = useState(() => {
    return document.documentElement.getAttribute('data-theme') || localStorage.getItem('nexinfra-theme') || 'dark';
  });

  // Track Theme Changes from Navbar Toggle
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      setTheme(current);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  const isLight = theme === 'light';

  const handleWaitlistSubmit = (e) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubmittedEmail(true);
      setTimeout(() => setSubmittedEmail(false), 4000);
      setEmailInput('');
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden flex flex-col justify-between select-none transition-colors duration-300 ${
      isLight ? 'bg-[#F4F7FB] text-slate-900' : 'bg-[#04050c] text-slate-100'
    }`}>
      
      {/* 1. Full-Bleed WebGL Fluid Simulation Background (z-0) */}
      <FluidCanvas className="z-0" />

      {/* 2. Soft Radial Scrim for Text Legibility (z-1) */}
      <div 
        className="absolute inset-0 z-1 pointer-events-none transition-all duration-300"
        style={{
          background: isLight
            ? 'radial-gradient(115% 95% at 50% 46%, rgba(244,247,251,0.88) 0%, rgba(244,247,251,0.76) 30%, rgba(244,247,251,0.48) 58%, rgba(244,247,251,0.18) 100%)'
            : 'radial-gradient(115% 95% at 50% 46%, rgba(4,5,12,0.72) 0%, rgba(4,5,12,0.68) 28%, rgba(4,5,12,0.46) 55%, rgba(4,5,12,0.12) 100%)'
        }}
        aria-hidden="true"
      />

      {/* 3. Cursor Spotlight Interactive Effect (z-2) */}
      <CursorSpotlight radius={550} opacity={isLight ? 0.12 : 0.25} />

      {/* 4. Mouse Parallax Floating Cyber Telemetry Badges (z-2) */}
      <MouseParallaxContainer intensity={20} className="absolute inset-0 pointer-events-none z-2">
        <div
          data-depth={1.2}
          className={`hidden lg:flex absolute top-28 left-12 items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono-tech backdrop-blur-xl shadow-lg animate-float-slow transition-all ${
            isLight
              ? 'bg-white/80 border border-sky-200 text-sky-700 shadow-sky-100/50'
              : 'bg-white/5 border border-white/15 text-cyan-300'
          }`}
        >
          <span className={`w-2 h-2 rounded-full animate-ping ${isLight ? 'bg-sky-500' : 'bg-cyan-400'}`} />
          <span>LIVE TELEMETRY: 32 FPS ACTIVE</span>
        </div>

        <div
          data-depth={-1.1}
          className={`hidden lg:flex absolute top-36 right-16 items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono-tech backdrop-blur-xl shadow-lg animate-float-medium transition-all ${
            isLight
              ? 'bg-white/80 border border-emerald-200 text-emerald-700 shadow-emerald-100/50'
              : 'bg-white/5 border border-white/15 text-emerald-300'
          }`}
        >
          <CheckCircle2 className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
          <span>NEURAL AI CLUSTER: ONLINE</span>
        </div>
      </MouseParallaxContainer>

      {/* Main Content Column (z-10) */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-28 relative z-10 w-full">
        
        {/* Center Hero Column */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          
          {/* Badge Pill (Stagger delay 320ms) */}
          <div className="flex justify-center">
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium backdrop-blur-xl shadow-sm animate-stagger-1 transition-all ${
              isLight
                ? 'border border-slate-300/80 bg-white/80 text-slate-700 shadow-slate-200/50'
                : 'border border-white/16 bg-white/8 text-[#b9becf]'
            }`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${isLight ? 'bg-sky-500' : 'bg-cyan-400'}`} />
              <span>Next-Gen Infrastructure Intelligence • Autonomous Civic Defense</span>
            </div>
          </div>

          {/* Main 3-Line Heading with Word-by-Word Reveal */}
          <div className="space-y-1.5">
            <WordByWordReveal
              as="h1"
              text="Detect Today. Predict Tomorrow. Protect Everyone."
              baseDelayMs={480}
              staggerMs={85}
              durationMs={720}
              translateY={26}
              className={`text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.12] font-heading max-w-4xl mx-auto transition-colors ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            />
          </div>

          {/* Subtitle with Word-by-Word Reveal */}
          <WordByWordReveal
            as="p"
            text="The Intelligence Layer for Physical Infrastructure. Nexinfra unifies continuous AI monitoring, autonomous drone networks, and predictive analytics into a single command center for municipal authorities."
            baseDelayMs={1050}
            staggerMs={20}
            durationMs={600}
            translateY={14}
            className={`text-base sm:text-lg lg:text-xl leading-relaxed max-w-3xl mx-auto font-sans font-normal transition-colors ${
              isLight ? 'text-slate-600 font-medium' : 'text-slate-300'
            }`}
          />

          {/* Glass Subscribe Bar for Daily & Urgent Updates (Stagger delay 1450ms) */}
          <div className="pt-4 flex justify-center w-full animate-stagger-3">
            <form
              onSubmit={handleWaitlistSubmit}
              className="w-full max-w-xl"
            >
              <div className={`flex items-center h-14 sm:h-16 rounded-full pl-5 pr-2 transition-all shadow-lg backdrop-blur-xl ${
                isLight
                  ? 'border border-slate-300 bg-white/95 shadow-slate-200 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20'
                  : 'border border-white/16 bg-white/8 focus-within:border-cyan-400/80 focus-within:ring-2 focus-within:ring-cyan-400/20'
              }`}>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="For daily & urgent updates, please enter your email..."
                  className={`flex-1 min-w-0 h-full bg-transparent border-none text-xs sm:text-sm md:text-base focus:outline-none ${
                    isLight ? 'text-slate-900 placeholder:text-slate-400' : 'text-[#eef0f6] placeholder:text-[#b9becf]'
                  }`}
                />
                
                <MagneticButton
                  strength={12}
                  type="submit"
                  className={`h-10 sm:h-12 px-5 sm:px-7 rounded-full font-bold text-xs sm:text-sm tracking-wide shadow-md transition-all whitespace-nowrap ${
                    isLight
                      ? 'bg-slate-900 hover:bg-slate-800 text-white'
                      : 'bg-white hover:bg-white/85 text-[#2f2f33]'
                  }`}
                >
                  <span>{submittedEmail ? "✓ Subscribed!" : "Subscribe"}</span>
                </MagneticButton>
              </div>
            </form>
          </div>

          {/* Hero CTAs */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-4 animate-stagger-4">
            <MagneticButton
              strength={16}
              onClick={() => setActivePage('signup')}
              className={`px-8 py-3.5 rounded-full font-extrabold font-mono-tech text-xs sm:text-sm tracking-wider uppercase shadow-xl transition-all ${
                isLight
                  ? 'bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white shadow-sky-200'
                  : 'bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 hover:from-cyan-300 hover:to-cyan-200 text-black cyan-glow-sm hover:cyan-glow-lg'
              }`}
            >
              <span>🚀 INITIALIZE COMMAND ACCESS</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </MagneticButton>

            <MagneticButton
              strength={12}
              onClick={() => setShowArchModal(true)}
              className={`px-6 py-3.5 rounded-full border font-bold font-mono-tech text-xs sm:text-sm tracking-wider backdrop-blur-md transition-all ${
                isLight
                  ? 'border-slate-300 bg-white/85 hover:bg-white text-slate-800 shadow-sm'
                  : 'border-white/20 bg-white/5 hover:bg-white/10 text-cyan-300'
              }`}
            >
              <Cpu className={`w-4 h-4 mr-1 ${isLight ? 'text-sky-600' : 'text-cyan-400'}`} />
              <span>INSPECT PLATFORM ARCHITECTURE</span>
            </MagneticButton>
          </div>

        </div>

        {/* 3D Tilt Metric Cards Grid */}
        <div className="mt-20 sm:mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto font-mono-tech animate-stagger-4">
          
          <TiltCard
            maxAngle={14}
            scale={1.04}
            className={`p-6 text-center backdrop-blur-xl transition-all ${
              isLight
                ? 'bg-white/90 border border-slate-200/90 shadow-md hover:border-sky-400 hover:shadow-lg'
                : 'bg-white/5 border border-white/10 hover:border-cyan-400/50 cyan-glow-sm'
            }`}
          >
            <div className={`text-3xl sm:text-4xl font-extrabold ${isLight ? 'text-sky-600' : 'text-[#00F0FF]'}`}>
              99.9%
            </div>
            <div className={`text-xs sm:text-sm font-bold mt-1.5 tracking-wider ${isLight ? 'text-slate-600' : 'text-[#b9becf]'}`}>
              Uptime
            </div>
          </TiltCard>

          <TiltCard
            maxAngle={14}
            scale={1.04}
            className={`p-6 text-center backdrop-blur-xl transition-all ${
              isLight
                ? 'bg-white/90 border border-slate-200/90 shadow-md hover:border-sky-400 hover:shadow-lg'
                : 'bg-white/5 border border-white/10 hover:border-cyan-400/50 cyan-glow-sm'
            }`}
          >
            <div className={`text-3xl sm:text-4xl font-extrabold ${isLight ? 'text-sky-600' : 'text-[#00F0FF]'}`}>
              &lt;2ms
            </div>
            <div className={`text-xs sm:text-sm font-bold mt-1.5 tracking-wider ${isLight ? 'text-slate-600' : 'text-[#b9becf]'}`}>
              Latency
            </div>
          </TiltCard>

          <TiltCard
            maxAngle={14}
            scale={1.04}
            className={`p-6 text-center backdrop-blur-xl transition-all ${
              isLight
                ? 'bg-white/90 border border-slate-200/90 shadow-md hover:border-sky-400 hover:shadow-lg'
                : 'bg-white/5 border border-white/10 hover:border-cyan-400/50 cyan-glow-sm'
            }`}
          >
            <div className={`text-3xl sm:text-4xl font-extrabold ${isLight ? 'text-sky-600' : 'text-[#00F0FF]'}`}>
              10k+
            </div>
            <div className={`text-xs sm:text-sm font-bold mt-1.5 tracking-wider ${isLight ? 'text-slate-600' : 'text-[#b9becf]'}`}>
              Sensors
            </div>
          </TiltCard>

          <TiltCard
            maxAngle={14}
            scale={1.04}
            className={`p-6 text-center backdrop-blur-xl transition-all ${
              isLight
                ? 'bg-white/90 border border-slate-200/90 shadow-md hover:border-sky-400 hover:shadow-lg'
                : 'bg-white/5 border border-white/10 hover:border-cyan-400/50 cyan-glow-sm'
            }`}
          >
            <div className={`text-3xl sm:text-4xl font-extrabold ${isLight ? 'text-sky-600' : 'text-[#00F0FF]'}`}>
              24/7
            </div>
            <div className={`text-xs sm:text-sm font-bold mt-1.5 tracking-wider ${isLight ? 'text-slate-600' : 'text-[#b9becf]'}`}>
              Monitoring
            </div>
          </TiltCard>

        </div>

        {/* Scroll Reveal Section Header */}
        <ScrollReveal variant="fade-up" delayMs={100} className="mt-28 text-center">
          <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight font-heading ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Core Capabilities
          </h2>
          <p className={`text-xs sm:text-sm font-mono-tech mt-2 ${isLight ? 'text-slate-500 font-bold' : 'text-[#b9becf]'}`}>
            INTELLIGENT HARDWARE-SOFTWARE UNIFICATION FOR SMART INFRASTRUCTURE
          </p>
        </ScrollReveal>

        {/* Core Capabilities 3D Tilt Cards */}
        <div className="mt-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Capability 1 */}
            <ScrollReveal variant="slide-left" delayMs={150}>
              <TiltCard
                maxAngle={8}
                scale={1.02}
                className={`border-t-4 border-t-amber-500 p-8 rounded-2xl backdrop-blur-xl space-y-4 transition-all shadow-xl h-full ${
                  isLight
                    ? 'bg-white/95 border border-slate-200 shadow-slate-200 hover:shadow-2xl'
                    : 'bg-white/5 border border-white/10 hover:border-white/20'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isLight ? 'bg-amber-100 border border-amber-300 text-amber-700' : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                }`}>
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className={`text-2xl font-bold tracking-wide font-sans ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Continuous AI Monitoring
                </h3>
                <p className={`text-sm leading-relaxed font-sans ${isLight ? 'text-slate-600 font-medium' : 'text-slate-300'}`}>
                  Ingest real-time telemetry from thousands of endpoints. Our neural networks detect anomalies across stress sensors, flow meters, and structural monitors before human operators notice a deviation.
                </p>
              </TiltCard>
            </ScrollReveal>

            {/* Capability 2 */}
            <ScrollReveal variant="slide-right" delayMs={250}>
              <TiltCard
                maxAngle={8}
                scale={1.02}
                className={`border-t-4 p-8 rounded-2xl backdrop-blur-xl space-y-4 transition-all shadow-xl h-full ${
                  isLight
                    ? 'bg-white/95 border border-slate-200 border-t-sky-600 shadow-slate-200 hover:shadow-2xl'
                    : 'bg-white/5 border border-white/10 border-t-cyan-400 hover:border-white/20'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isLight ? 'bg-sky-100 border border-sky-300 text-sky-700' : 'bg-cyan-400/10 border border-cyan-400/30 text-cyan-400'
                }`}>
                  <BarChart2 className="w-6 h-6" />
                </div>
                <h3 className={`text-2xl font-bold tracking-wide font-sans ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Predictive Analytics
                </h3>
                <p className={`text-sm leading-relaxed font-sans ${isLight ? 'text-slate-600 font-medium' : 'text-slate-300'}`}>
                  Forecast failure modes using historical machine learning data and real-time digital twin simulations to schedule preventative maintenance before catastrophic breaches.
                </p>
              </TiltCard>
            </ScrollReveal>

          </div>

          {/* Capability 3 */}
          <ScrollReveal variant="fade-up" delayMs={200}>
            <TiltCard
              maxAngle={6}
              scale={1.015}
              className={`border-t-4 border-t-rose-500 p-8 rounded-2xl backdrop-blur-xl space-y-5 transition-all shadow-xl ${
                isLight
                  ? 'bg-white/95 border border-slate-200 shadow-slate-200 hover:shadow-2xl'
                  : 'bg-white/5 border border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isLight ? 'bg-rose-100 border border-rose-300 text-rose-700' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                }`}>
                  <Plane className="w-6 h-6" />
                </div>
                <span className={`px-3 py-1 rounded-full font-mono-tech text-xs font-bold ${
                  isLight ? 'bg-rose-100 border border-rose-300 text-rose-800' : 'bg-rose-950/80 border border-rose-500 text-rose-300'
                }`}>
                  TACTICAL UAV RECON
                </span>
              </div>
              <h3 className={`text-2xl font-bold tracking-wide font-sans ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Autonomous Drone Loop & Aerial GIS Verification
              </h3>
              <p className={`text-sm leading-relaxed max-w-4xl font-sans ${isLight ? 'text-slate-600 font-medium' : 'text-slate-300'}`}>
                When critical P1 anomalies or Level 5 disasters are detected, Nexinfra automatically dispatches rapid-response UAVs
                to the precise coordinates. High-resolution LiDAR, optical, and thermal imaging are streamed
                directly back to the command center in real-time.
              </p>

              <div className="pt-2">
                <MagneticButton
                  strength={10}
                  onClick={() => setActiveTelemetry(!activeTelemetry)}
                  className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full font-mono-tech text-xs font-bold transition-colors ${
                    isLight
                      ? 'bg-slate-100 border border-sky-500 text-sky-800 hover:bg-sky-50'
                      : 'bg-black/40 border border-cyan-500/50 text-[#00F0FF] hover:bg-cyan-950/60'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    activeTelemetry
                      ? isLight ? 'bg-sky-500 animate-ping' : 'bg-cyan-400 animate-ping'
                      : 'bg-slate-400'
                  }`} />
                  <span>● Live Telemetry Link Active</span>
                </MagneticButton>
              </div>
            </TiltCard>
          </ScrollReveal>
        </div>

      </main>

      {/* Architecture Modal */}
      {showArchModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-3xl w-full p-6 sm:p-8 relative space-y-5 animate-hero-entrance shadow-2xl ${
            isLight
              ? 'bg-white border border-slate-300 text-slate-900'
              : 'bg-[#0B0F19] border border-cyan-500/60 text-slate-100 cyan-glow-lg'
          }`}>
            <button
              onClick={() => setShowArchModal(false)}
              className={`absolute top-5 right-5 p-1 cursor-pointer ${isLight ? 'text-slate-500 hover:text-black' : 'text-slate-400 hover:text-white'}`}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isLight ? 'bg-sky-100 border border-sky-400 text-sky-700' : 'bg-cyan-950 border border-cyan-500 text-cyan-400'
              }`}>
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h3 className={`text-xl font-bold font-heading ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Nexinfra Platform Architecture
                </h3>
                <p className={`text-xs font-mono-tech ${isLight ? 'text-sky-700 font-bold' : 'text-cyan-400'}`}>
                  DISTRIBUTED EDGE-TO-CLOUD INFRASTRUCTURE INTELLIGENCE
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs font-mono-tech max-h-[65vh] overflow-y-auto pr-1">
              <div className={`p-4 rounded-xl border space-y-2 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-white/5 border-white/10 text-slate-300'
              }`}>
                <span className={`font-bold uppercase ${isLight ? 'text-sky-700' : 'text-cyan-400'}`}>1. Perception & Edge Telemetry</span>
                <p className={`text-xs font-sans ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Subsurface pressure sensors, IoT vibration monitors, optical CCTV feeds, and autonomous UAV reconnaissance telemetry ingested continuously via MQTT/WebSockets.
                </p>
              </div>

              <div className={`p-4 rounded-xl border space-y-2 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-white/5 border-white/10 text-slate-300'
              }`}>
                <span className={`font-bold uppercase ${isLight ? 'text-sky-700' : 'text-cyan-400'}`}>2. YOLOv9-CivicNet Neural Vision Triage</span>
                <p className={`text-xs font-sans ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Deep learning defect detection model estimating crater geometries, hazardous gas plume expansions, and automated municipal SLA assignment.
                </p>
              </div>

              <div className={`p-4 rounded-xl border space-y-2 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-white/5 border-white/10 text-slate-300'
              }`}>
                <span className={`font-bold uppercase ${isLight ? 'text-sky-700' : 'text-cyan-400'}`}>3. Level 5 Disaster Cellular Early Warning</span>
                <p className={`text-xs font-sans ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Spatial Haversine radial geofencing with multi-carrier SMS dispatch to registered citizen mobile numbers in evacuation corridors.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <MagneticButton
                strength={12}
                onClick={() => setShowArchModal(false)}
                className={`px-5 py-2.5 rounded-full font-bold font-mono-tech text-xs uppercase ${
                  isLight ? 'bg-slate-900 hover:bg-slate-800 text-white' : 'bg-cyan-400 text-black hover:bg-cyan-300'
                }`}
              >
                Close Architecture View
              </MagneticButton>
            </div>
          </div>
        </div>
      )}

      {/* Footer (z-20) */}
      <footer className={`border-t py-6 px-4 text-center text-xs font-mono-tech uppercase relative z-20 backdrop-blur-md transition-colors ${
        isLight ? 'border-slate-200 bg-white/90 text-slate-600' : 'border-white/10 bg-[#04050c]/90 text-slate-400'
      }`}>
        © 2026 NEXINFRA INFRASTRUCTURE INTELLIGENCE & DISASTER COMMAND • ALL SYSTEMS OPERATIONAL
      </footer>
    </div>
  );
}
