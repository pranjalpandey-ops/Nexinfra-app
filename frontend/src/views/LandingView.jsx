import React, { useState } from 'react';
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
  CheckCircle2,
  ExternalLink,
  Droplets
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

  const handleWaitlistSubmit = (e) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubmittedEmail(true);
      setTimeout(() => setSubmittedEmail(false), 4000);
      setEmailInput('');
    }
  };

  return (
    <div className="landing-root min-h-screen bg-[#04050c] text-slate-100 relative overflow-hidden flex flex-col justify-between select-none">
      
      {/* 1. Full-Bleed WebGL Fluid Simulation Background */}
      <FluidCanvas className="fixed inset-0 w-full h-full z-0 pointer-events-none" />

      {/* 2. Soft Radial Scrim for Text Legibility */}
      <div 
        className="landing-scrim fixed inset-0 z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(115% 95% at 50% 46%, rgba(4,5,12,0.42) 0%, rgba(4,5,12,0.36) 24%, rgba(4,5,12,0.20) 52%, rgba(4,5,12,0.05) 100%)'
        }}
        aria-hidden="true"
      />

      {/* 3. Cursor Spotlight Interactive Effect (z-2) */}
      <CursorSpotlight radius={550} opacity={0.25} />

      {/* 4. Mouse Parallax Floating Telemetry Badges (z-2) */}
      <MouseParallaxContainer intensity={20} className="absolute inset-0 pointer-events-none z-2">
        <div
          data-depth={1.2}
          className="hidden lg:flex absolute top-28 left-12 items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/15 text-cyan-300 text-xs font-mono-tech backdrop-blur-xl shadow-lg animate-float-slow landing-badge"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>GPU FLUID ENGINE: 512px DYE • ACTIVE</span>
        </div>

        <div
          data-depth={-1.1}
          className="hidden lg:flex absolute top-36 right-16 items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/15 text-emerald-300 text-xs font-mono-tech backdrop-blur-xl shadow-lg animate-float-medium landing-badge"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>AUTONOMOUS ORBIT: ACTIVE</span>
        </div>
      </MouseParallaxContainer>

      {/* Main Content Column (z-10) */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-28 relative z-10 w-full">
        
        {/* Center Hero Column */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          
          {/* Glass Badge Pill (Stagger delay 320ms) */}
          <div className="flex justify-center">
            <div className="landing-badge inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/8 px-4 py-1.5 text-xs sm:text-sm font-medium text-[#b9becf] backdrop-blur-xl shadow-sm animate-stagger-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>The Intelligence Layer for Physical Infrastructure</span>
            </div>
          </div>

          {/* Heading: Word-by-Word Reveal */}
          <WordByWordReveal
            as="h1"
            text="Detect Today. Predict Tomorrow. Protect Everyone."
            baseDelayMs={480}
            staggerMs={70}
            durationMs={720}
            translateY={26}
            className="landing-heading text-4xl sm:text-6xl lg:text-7xl font-medium tracking-tight leading-[1.1] text-[#eef0f6] font-heading max-w-4xl mx-auto"
          />

          {/* Sub-line: Word-by-Word Reveal */}
          <WordByWordReveal
            as="p"
            text="The Intelligence Layer for Physical Infrastructure. Nexinfra unifies continuous AI monitoring, autonomous drone networks, and predictive analytics into a single command center for municipal authorities."
            baseDelayMs={1150}
            staggerMs={18}
            durationMs={600}
            translateY={14}
            className="landing-subline text-[#b9becf] text-base sm:text-lg lg:text-xl leading-relaxed max-w-3xl mx-auto font-sans font-normal"
          />

          {/* Glass Waitlist & Update Form (Stagger delay 1450ms) */}
          <div className="pt-4 flex justify-center w-full animate-stagger-3">
            <form
              onSubmit={handleWaitlistSubmit}
              className="w-full max-w-xl"
            >
              <div className="landing-input-bar flex items-center h-14 sm:h-16 rounded-full border border-white/16 bg-white/8 backdrop-blur-xl shadow-lg pl-5 pr-2 transition-all focus-within:border-cyan-400/80 focus-within:ring-2 focus-within:ring-cyan-400/20">
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter email for daily updates & urgent alerts..."
                  className="landing-input flex-1 min-w-0 h-full bg-transparent border-none text-[#eef0f6] text-xs sm:text-sm md:text-base placeholder:text-[#b9becf] focus:outline-none"
                />
                
                <MagneticButton
                  strength={12}
                  type="submit"
                  className="landing-submit-btn h-10 sm:h-12 px-5 sm:px-7 rounded-full bg-white hover:bg-white/85 text-[#2f2f33] font-medium text-xs sm:text-sm tracking-wide shadow-md transition-all whitespace-nowrap"
                >
                  <span>{submittedEmail ? "✓ Subscribed!" : "Subscribe"}</span>
                </MagneticButton>
              </div>
            </form>
          </div>

          {/* Secondary Quick Action CTAs */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-4 animate-stagger-4">
            <MagneticButton
              strength={15}
              onClick={() => setActivePage('signup')}
              className="px-7 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-black font-extrabold font-mono-tech text-xs tracking-wider uppercase cyan-glow-sm shadow-xl"
            >
              <span>🚀 Get Started & Access Console</span>
            </MagneticButton>

            <button
              onClick={() => setShowArchModal(true)}
              className="landing-spec-btn px-5 py-3 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-[#b9becf] hover:text-white font-medium text-xs sm:text-sm backdrop-blur-md transition-all cursor-pointer"
            >
              <span>Platform Specs</span>
            </button>
          </div>

        </div>

        {/* 3D Tilt Metric Cards Grid */}
        <div className="mt-20 sm:mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto font-mono-tech animate-stagger-4">
          
          <TiltCard maxAngle={14} scale={1.04} className="landing-tilt-card bg-white/5 border border-white/10 p-6 text-center backdrop-blur-xl hover:border-cyan-400/50 cyan-glow-sm">
            <div className="metric-number text-3xl sm:text-4xl font-extrabold text-[#00F0FF]">
              99.9%
            </div>
            <div className="metric-label text-xs sm:text-sm text-[#b9becf] font-bold mt-1.5 tracking-wider">
              Uptime
            </div>
          </TiltCard>

          <TiltCard maxAngle={14} scale={1.04} className="landing-tilt-card bg-white/5 border border-white/10 p-6 text-center backdrop-blur-xl hover:border-cyan-400/50 cyan-glow-sm">
            <div className="metric-number text-3xl sm:text-4xl font-extrabold text-[#00F0FF]">
              &lt;2ms
            </div>
            <div className="metric-label text-xs sm:text-sm text-[#b9becf] font-bold mt-1.5 tracking-wider">
              Latency
            </div>
          </TiltCard>

          <TiltCard maxAngle={14} scale={1.04} className="landing-tilt-card bg-white/5 border border-white/10 p-6 text-center backdrop-blur-xl hover:border-cyan-400/50 cyan-glow-sm">
            <div className="metric-number text-3xl sm:text-4xl font-extrabold text-[#00F0FF]">
              10k+
            </div>
            <div className="metric-label text-xs sm:text-sm text-[#b9becf] font-bold mt-1.5 tracking-wider">
              Sensors
            </div>
          </TiltCard>

          <TiltCard maxAngle={14} scale={1.04} className="landing-tilt-card bg-white/5 border border-white/10 p-6 text-center backdrop-blur-xl hover:border-cyan-400/50 cyan-glow-sm">
            <div className="metric-number text-3xl sm:text-4xl font-extrabold text-[#00F0FF]">
              24/7
            </div>
            <div className="metric-label text-xs sm:text-sm text-[#b9becf] font-bold mt-1.5 tracking-wider">
              Monitoring
            </div>
          </TiltCard>

        </div>

        {/* Scroll Reveal Section Header */}
        <ScrollReveal variant="fade-up" delayMs={100} className="mt-28 text-center">
          <h2 className="section-heading text-3xl sm:text-4xl font-medium tracking-tight text-[#eef0f6] font-heading">
            Core Platform Capabilities
          </h2>
          <p className="section-subheading text-[#b9becf] text-xs sm:text-sm font-mono-tech mt-2">
            AI MONITORING • DIGITAL TWINS • AUTONOMOUS UAV RECON
          </p>
        </ScrollReveal>

        {/* Core Capabilities 3D Tilt Cards */}
        <div className="mt-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Capability 1 */}
            <ScrollReveal variant="slide-left" delayMs={150}>
              <TiltCard maxAngle={8} scale={1.02} className="capability-card bg-white/5 border border-white/10 border-t-4 border-t-amber-500 p-8 rounded-2xl backdrop-blur-xl space-y-4 hover:border-white/20 transition-all shadow-xl h-full">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="capability-title text-2xl font-medium text-white tracking-wide font-sans">
                  Continuous AI Monitoring
                </h3>
                <p className="capability-desc text-[#b9becf] text-sm leading-relaxed font-sans">
                  Ingest real-time telemetry from thousands of endpoints. Neural networks detect anomalies across stress sensors, flow meters, and structural monitors before human operators notice a deviation.
                </p>
              </TiltCard>
            </ScrollReveal>

            {/* Capability 2 */}
            <ScrollReveal variant="slide-right" delayMs={250}>
              <TiltCard maxAngle={8} scale={1.02} className="capability-card bg-white/5 border border-white/10 border-t-4 border-t-cyan-400 p-8 rounded-2xl backdrop-blur-xl space-y-4 hover:border-white/20 transition-all shadow-xl h-full">
                <div className="w-12 h-12 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
                  <BarChart2 className="w-6 h-6" />
                </div>
                <h3 className="capability-title text-2xl font-medium text-white tracking-wide font-sans">
                  Predictive Analytics
                </h3>
                <p className="capability-desc text-[#b9becf] text-sm leading-relaxed font-sans">
                  Forecast failure modes using historical machine learning data and real-time digital twin simulations to schedule preventative maintenance before catastrophic breaches.
                </p>
              </TiltCard>
            </ScrollReveal>

          </div>

          {/* Capability 3 */}
          <ScrollReveal variant="fade-up" delayMs={200}>
            <TiltCard maxAngle={6} scale={1.015} className="capability-card bg-white/5 border border-white/10 border-t-4 border-t-rose-500 p-8 rounded-2xl backdrop-blur-xl space-y-5 hover:border-white/20 transition-all shadow-xl">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <Plane className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500 text-rose-300 font-mono-tech text-xs font-bold">
                  TACTICAL UAV RECON
                </span>
              </div>
              <h3 className="capability-title text-2xl font-medium text-white tracking-wide font-sans">
                Autonomous Drone Loop & Aerial GIS Verification
              </h3>
              <p className="capability-desc text-[#b9becf] text-sm leading-relaxed max-w-4xl font-sans">
                When critical P1 anomalies or Level 5 disasters are detected, Nexinfra automatically dispatches rapid-response UAVs
                to the precise coordinates. High-resolution LiDAR, optical, and thermal imaging are streamed
                directly back to the command center in real-time.
              </p>

              <div className="pt-2">
                <MagneticButton
                  strength={10}
                  onClick={() => setActiveTelemetry(!activeTelemetry)}
                  className="telemetry-pill inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-black/40 border border-cyan-500/50 text-[#00F0FF] font-mono-tech text-xs font-bold hover:bg-cyan-950/60 transition-colors"
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${activeTelemetry ? 'bg-cyan-400 animate-ping' : 'bg-slate-500'}`} />
                  <span>● Live Telemetry Link Active</span>
                </MagneticButton>
              </div>
            </TiltCard>
          </ScrollReveal>
        </div>

      </main>

      {/* Architecture Modal */}
      {showArchModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B0F19] border border-cyan-500/60 rounded-2xl max-w-3xl w-full p-6 sm:p-8 cyan-glow-lg relative space-y-5 animate-hero-entrance">
            <button
              onClick={() => setShowArchModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-500 flex items-center justify-center text-cyan-400">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-white font-heading">
                  Nexinfra Platform Architecture
                </h3>
                <p className="text-xs text-cyan-400 font-mono-tech">
                  DISTRIBUTED EDGE-TO-CLOUD INFRASTRUCTURE INTELLIGENCE
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs font-mono-tech text-slate-300 max-h-[65vh] overflow-y-auto pr-1">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-cyan-400 font-bold uppercase">1. Perception & Edge Telemetry</span>
                <p className="text-slate-400 font-sans text-xs">
                  Subsurface pressure sensors, IoT vibration monitors, optical CCTV feeds, and autonomous UAV reconnaissance telemetry ingested continuously via MQTT/WebSockets.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-cyan-400 font-bold uppercase">2. YOLOv9-CivicNet Neural Vision Triage</span>
                <p className="text-slate-400 font-sans text-xs">
                  Deep learning defect detection model estimating crater geometries, hazardous gas plume expansions, and automated municipal SLA assignment.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-cyan-400 font-bold uppercase">3. Level 5 Disaster Cellular Early Warning</span>
                <p className="text-slate-400 font-sans text-xs">
                  Spatial Haversine radial geofencing with multi-carrier SMS dispatch to registered citizen mobile numbers in evacuation corridors.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <MagneticButton
                strength={12}
                onClick={() => setShowArchModal(false)}
                className="px-5 py-2.5 rounded-full bg-cyan-400 text-black font-bold font-mono-tech text-xs uppercase hover:bg-cyan-300"
              >
                Close Architecture View
              </MagneticButton>
            </div>
          </div>
        </div>
      )}

      {/* Footer (z-20) */}
      <footer className="border-t border-white/10 bg-[#04050c]/90 backdrop-blur-md py-6 px-4 text-center text-xs font-mono-tech text-[#b9becf] uppercase relative z-20">
        © 2026 FLOWSTATE & NEXINFRA • ENGINEERED FOR DEEP WORK & CIVIC RESILIENCE
      </footer>
    </div>
  );
}
