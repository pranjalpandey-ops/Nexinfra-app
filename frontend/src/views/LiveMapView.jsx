import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Activity,
  ShieldAlert,
  Zap,
  Layers,
  Plane,
  Radio,
  Clock,
  ThumbsUp,
  Search,
  Flame,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Send,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Eye,
  Maximize2
} from 'lucide-react';

import LeafletMap from '../components/LeafletMap';
import DisasterBroadcastModal from '../components/DisasterBroadcastModal';
import { getLocalCivicIssues, upvoteIssue, updateCivicIssueStatus } from '../services/civicDb';
import { subscribeToComplaints } from '../services/getComplaints';

export default function LiveMapView({ onOpenDispatchModal, setActivePage, user }) {
  const [issues, setIssues] = useState([]);
  const [selectedPin, setSelectedPin] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL | P1 | DRONE | IN_PROGRESS | RESOLVED
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showUavFleet, setShowUavFleet] = useState(true);
  const [tileMode, setTileMode] = useState('dark'); // dark | satellite | light
  const [isDisasterModalOpen, setIsDisasterModalOpen] = useState(false);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);

  // Active Tactical Drone Fleet coordinates in New Delhi / NCR Grid
  const [uavFleet, setUavFleet] = useState([
    {
      id: 'UAV-ALPHA-09',
      title: 'Tactical Recon UAV Alpha',
      type: 'DRONE',
      category: 'Autonomous UAV Recon',
      priority: 'P1',
      priorityLabel: 'UAV Active Patrol',
      status: 'In Progress',
      latitude: 28.6195,
      longitude: 77.2115,
      altitude: 120,
      speedKmh: 48,
      battery: 88,
      address: 'Central District Air Corridor A',
      ward: 'Ward 4 Airspace',
      description: 'LiDAR and optical payload active. Streaming high-resolution defect telemetry to command center.',
      imageUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
      slaHours: 1,
      upvotes: 42
    },
    {
      id: 'UAV-BRAVO-02',
      title: 'Thermal Pipeline Drone Bravo',
      type: 'DRONE',
      category: 'Thermal Plume Scan',
      priority: 'P2',
      priorityLabel: 'UAV Active Patrol',
      status: 'In Progress',
      latitude: 28.6260,
      longitude: 77.2185,
      altitude: 95,
      speedKmh: 35,
      battery: 74,
      address: 'Sector 18 Hydro Substation',
      ward: 'Zone A Airspace',
      description: 'Thermal infrared camera active. Inspecting subsurface waterline stress and pressure anomalies.',
      imageUrl: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80',
      slaHours: 2,
      upvotes: 29
    },
    {
      id: 'UAV-DELTA-04',
      title: 'Emergency Rapid UAV Delta',
      type: 'DRONE',
      category: 'Emergency Dispatch',
      priority: 'P1',
      priorityLabel: 'UAV En Route',
      status: 'AI Verified',
      latitude: 28.6080,
      longitude: 77.1990,
      altitude: 140,
      speedKmh: 62,
      battery: 92,
      address: 'Greenway Corridor Express Route',
      ward: 'Ward 2 Airspace',
      description: 'Dispatched to P1 Road Breach. Estimating crater volume and evacuation geofence radius.',
      imageUrl: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=800&q=80',
      slaHours: 1,
      upvotes: 56
    }
  ]);

  // Load Civic Defect issues from database
  useEffect(() => {
    const local = getLocalCivicIssues();
    setIssues(local);
    if (local.length > 0) {
      setSelectedPin(local[0]);
    }

    const unsubscribe = subscribeToComplaints((firestoreData) => {
      if (Array.isArray(firestoreData) && firestoreData.length > 0) {
        const merged = [...firestoreData, ...local.filter((l) => !firestoreData.some((f) => f.id === l.id))];
        setIssues(merged);
      }
    });

    return unsubscribe;
  }, []);

  // Animate UAV Fleet micro-movements for live telemetry simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setUavFleet((prev) =>
        prev.map((drone) => ({
          ...drone,
          latitude: drone.latitude + (Math.random() - 0.5) * 0.0004,
          longitude: drone.longitude + (Math.random() - 0.5) * 0.0004,
          speedKmh: Math.floor(40 + Math.random() * 25),
          battery: Math.max(15, drone.battery - (Math.random() > 0.8 ? 1 : 0))
        }))
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleUpvote = (pinId, e) => {
    if (e) e.stopPropagation();
    const updated = upvoteIssue(pinId, user?.email || 'admin.console@nexinfra.org');
    setIssues(updated);
    if (selectedPin && selectedPin.id === pinId) {
      const found = updated.find((i) => i.id === pinId);
      if (found) setSelectedPin(found);
    }
  };

  const handleStatusUpdate = (pinId, newStatus, e) => {
    if (e) e.stopPropagation();
    const updated = updateCivicIssueStatus(pinId, newStatus);
    setIssues(updated);
    if (selectedPin && selectedPin.id === pinId) {
      const found = updated.find((i) => i.id === pinId);
      if (found) setSelectedPin(found);
    }
  };

  // Combine civic issues and UAV fleet
  const allMapEntities = [
    ...issues,
    ...(showUavFleet ? uavFleet : [])
  ];

  // Filtering
  const filteredEntities = allMapEntities.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (item.title || '').toLowerCase().includes(q) ||
      (item.category || '').toLowerCase().includes(q) ||
      (item.address || '').toLowerCase().includes(q) ||
      (item.id || '').toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (filterType === 'P1') return item.priority === 'P1' || item.priority === 'High';
    if (filterType === 'DRONE') return item.type === 'DRONE';
    if (filterType === 'IN_PROGRESS') return item.status === 'In Progress' || item.status === 'AI Verified';
    if (filterType === 'RESOLVED') return item.status === 'Resolved';

    return true;
  });

  const activeEntity =
    selectedPin && filteredEntities.some((e) => e.id === selectedPin.id)
      ? selectedPin
      : filteredEntities[0] || null;

  const mapCenter =
    activeEntity && activeEntity.latitude && activeEntity.longitude
      ? [activeEntity.latitude, activeEntity.longitude]
      : [28.6139, 77.209];

  // Tile URL mapping
  const tileUrls = {
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
  };

  // Build Leaflet Markers
  const markers = filteredEntities
    .filter((e) => e.latitude && e.longitude)
    .map((e) => {
      const isDrone = e.type === 'DRONE';
      const isCritical = e.priority === 'P1' || e.priority === 'High';
      const isResolved = e.status === 'Resolved';
      const color = isDrone ? '#00F0FF' : isResolved ? '#10B981' : isCritical ? '#EF4444' : '#F97316';

      return {
        position: [e.latitude, e.longitude],
        color,
        data: e,
        popup: `
          <div style="font-family:'JetBrains Mono',monospace; min-width:210px; color:#0F172A; font-size:12px; padding:2px;">
            <div style="font-weight:800; font-size:13px; margin-bottom:4px; color:#0F172A;">${isDrone ? '🚁 ' : '📍 '}${e.title}</div>
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
              <span style="color:#0284C7; font-weight:bold;">${e.id}</span>
              <span style="font-weight:bold; color:${color};">${e.priorityLabel || e.priority}</span>
            </div>
            <div style="font-size:11px; color:#475569; margin-bottom:6px;">📍 ${e.address || ''}</div>
            <div style="font-size:11px; color:#047857; font-weight:bold;">
              ${isDrone ? `Altitude: ${e.altitude}m • Speed: ${e.speedKmh} km/h` : `Status: ${e.status} • SLA: ${e.slaHours || 4}h`}
            </div>
          </div>
        `
      };
    });

  const handleQuickDispatchToPin = () => {
    if (onOpenDispatchModal) {
      onOpenDispatchModal();
    } else {
      alert(`Tactical UAV squadron dispatched to target coordinate: ${activeEntity?.latitude?.toFixed(4)}, ${activeEntity?.longitude?.toFixed(4)}`);
    }
  };

  return (
    <div className="flex-1 bg-[#070A10] text-slate-100 p-4 sm:p-6 space-y-4 font-sans flex flex-col justify-between overflow-hidden select-none">
      
      {/* 1. Command Header Bar */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 shrink-0">
        
        {/* Title & Live Status Indicator */}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-white tracking-tight">
              Geospatial Infrastructure Live Map
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-[10px] font-mono-tech font-bold uppercase flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE TELEMETRY • RTK FIXED</span>
            </span>
          </div>
          <p className="text-xs font-mono-tech text-cyan-400 mt-1">
            Real-time Telemetry Grid & Active UAV Positioning • Autonomous Spatial AI
          </p>
        </div>

        {/* Action Controls & Tile Selectors */}
        <div className="flex flex-wrap items-center gap-2.5 font-mono-tech text-xs w-full xl:w-auto justify-between xl:justify-end">
          
          {/* Tile Layer Selector */}
          <div className="flex items-center bg-[#090D16] border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setTileMode('dark')}
              className={`px-3 py-1 rounded-lg transition font-bold ${
                tileMode === 'dark' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Dark GIS
            </button>
            <button
              onClick={() => setTileMode('satellite')}
              className={`px-3 py-1 rounded-lg transition font-bold ${
                tileMode === 'satellite' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setTileMode('light')}
              className={`px-3 py-1 rounded-lg transition font-bold ${
                tileMode === 'light' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Light
            </button>
          </div>

          {/* Heatmap Toggle */}
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition cursor-pointer font-bold ${
              showHeatmap
                ? 'bg-amber-950/80 border-amber-400 text-amber-300 cyan-glow-sm shadow-md'
                : 'bg-[#090D16] border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${showHeatmap ? 'text-amber-400 animate-pulse' : ''}`} />
            <span>Heatmap</span>
          </button>

          {/* UAV Fleet Toggle */}
          <button
            onClick={() => setShowUavFleet(!showUavFleet)}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition cursor-pointer font-bold ${
              showUavFleet
                ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 cyan-glow-sm shadow-md'
                : 'bg-[#090D16] border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Plane className="w-3.5 h-3.5 text-cyan-400" />
            <span>UAVs ({uavFleet.length})</span>
          </button>

          {/* Level 5 Early Warning Broadcast Trigger */}
          <button
            onClick={() => setIsDisasterModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-red-950/90 border border-red-500 text-red-300 hover:bg-red-900 font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400 animate-bounce" />
            <span>🚨 LEVEL 5 WARNING</span>
          </button>

          {/* Dispatch UAV Button (Matching uploaded design button) */}
          <button
            onClick={handleQuickDispatchToPin}
            className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold font-mono-tech text-xs tracking-wider uppercase cyan-glow-sm hover:cyan-glow-lg flex items-center gap-1.5 cursor-pointer active:scale-95 transition shadow-xl"
          >
            <Zap className="w-4 h-4 fill-black" />
            <span>DISPATCH UAV TO PIN</span>
          </button>
        </div>

      </div>

      {/* 2. Main Live Map Canvas & Split Interactive Workspace */}
      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden relative">
        
        {/* Left Telemetry & Incident Queue Sidebar */}
        <div
          className={`h-full bg-[#0D121D] border border-slate-800 rounded-2xl flex flex-col shrink-0 transition-all duration-300 z-10 overflow-hidden ${
            isLeftPanelOpen ? 'w-80 sm:w-88' : 'w-0 border-0 p-0'
          }`}
        >
          {/* Search & Filter Pills */}
          <div className="p-3 border-b border-slate-800 space-y-2 bg-[#090D16]">
            <div className="flex items-center gap-2 bg-[#070A10] border border-slate-800 rounded-xl px-3 py-1.5">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search live pins, UAVs, wards..."
                className="bg-transparent flex-1 outline-none text-white placeholder:text-slate-500 text-xs font-mono-tech"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[10px] text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 font-mono-tech text-[10px] overflow-x-auto pb-1">
              {[
                { id: 'ALL', label: 'All Active' },
                { id: 'P1', label: '🔴 Critical P1' },
                { id: 'DRONE', label: '🚁 UAV Fleet' },
                { id: 'IN_PROGRESS', label: '🟠 In Progress' },
                { id: 'RESOLVED', label: '🟢 Resolved' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterType(tab.id)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                    filterType === tab.id
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500'
                      : 'bg-[#070A10] text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Stream List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 font-mono-tech text-xs">
            <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span>LIVE TELEMETRY STREAM ({filteredEntities.length})</span>
              <span className="text-cyan-400 font-bold">10K+ SENSORS</span>
            </div>

            {filteredEntities.map((item) => {
              const isSelected = activeEntity?.id === item.id;
              const isDrone = item.type === 'DRONE';
              const isCritical = item.priority === 'P1' || item.priority === 'High';

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedPin(item)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-400 cyan-glow-sm shadow-md'
                      : 'bg-[#090D16] border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-bold flex items-center gap-1.5 ${isDrone ? 'text-cyan-400' : 'text-slate-200'}`}>
                      {isDrone ? <Plane className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> : <MapPin className="w-3.5 h-3.5 text-amber-400" />}
                      <span>{item.id}</span>
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isDrone
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-500'
                          : isCritical
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : 'bg-orange-950 text-orange-300 border border-orange-800'
                      }`}
                    >
                      {isDrone ? `UAV • ${item.battery}%` : item.priorityLabel || item.priority}
                    </span>
                  </div>

                  <h4 className="text-white font-sans font-bold text-xs line-clamp-1">
                    {item.title}
                  </h4>

                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="truncate max-w-[160px]">
                      {item.ward || item.address}
                    </span>
                    <span className="text-cyan-300 font-bold">
                      {isDrone ? `${item.speedKmh} km/h` : `SLA: ${item.slaHours || 4}h`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Left Panel Toggle Button */}
        <button
          onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
          className="absolute top-4 left-4 z-[450] p-2 rounded-xl bg-[#090D16]/90 border border-slate-700 text-slate-300 hover:text-cyan-400 backdrop-blur-md shadow-lg cursor-pointer"
          title={isLeftPanelOpen ? 'Collapse Queue' : 'Expand Queue'}
        >
          {isLeftPanelOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {/* Center: Leaflet Interactive Map Viewport */}
        <div className="flex-1 h-full bg-[#0A0E1A] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
          <LeafletMap
            center={mapCenter}
            zoom={13}
            markers={markers}
            showHeatmap={showHeatmap}
            tileUrl={tileUrls[tileMode] || tileUrls.dark}
            onMarkerClick={(data) => setSelectedPin(data)}
          />

          {/* Floating Severity Legend Overlay */}
          <div className="absolute top-4 right-4 z-[400] bg-[#070A12]/90 backdrop-blur-md border border-slate-700 rounded-xl p-3 text-xs space-y-1.5 font-mono-tech shadow-2xl hidden md:block">
            <div className="text-slate-300 font-bold mb-1 border-b border-slate-800 pb-1">
              Live Map Telemetry Pins
            </div>
            <div className="flex items-center gap-2 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span>🚁 Autonomous UAV Drone</span>
            </div>
            <div className="flex items-center gap-2 text-red-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>🔴 P1: Critical Safety Hazard</span>
            </div>
            <div className="flex items-center gap-2 text-orange-400">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span>🟠 P2: High Priority Defect</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>🟢 Resolved / Verified</span>
            </div>
          </div>
        </div>

        {/* Right Tactical Inspector Drawer */}
        {activeEntity && (
          <div className="hidden lg:flex w-88 h-full bg-[#0D121D] border border-slate-800 rounded-2xl flex-col shrink-0 overflow-hidden font-mono-tech text-xs">
            {/* Header Inspector */}
            <div className="p-3.5 border-b border-slate-800 bg-[#090D16] flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Activity className="w-4 h-4 animate-pulse" />
                <span className="text-white uppercase">{activeEntity.type === 'DRONE' ? 'UAV Flight HUD' : 'Defect Telemetry'}</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold">
                {activeEntity.id}
              </span>
            </div>

            {/* Scrollable Telemetry Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              
              {/* Photo Preview / Aerial Feed */}
              {activeEntity.imageUrl && (
                <div className="relative rounded-xl overflow-hidden border border-cyan-500/50 h-36 bg-black shadow-lg">
                  <img
                    src={activeEntity.imageUrl}
                    alt={activeEntity.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-cyan-300 font-bold border border-cyan-500">
                    {activeEntity.type === 'DRONE' ? 'UAV HD FEED' : 'YOLOv9-CivicNet (96.8%)'}
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 flex justify-between text-[10px] text-slate-300">
                    <span>GPS: {activeEntity.latitude?.toFixed(4)}, {activeEntity.longitude?.toFixed(4)}</span>
                    <span className="text-cyan-400 font-bold">{activeEntity.type === 'DRONE' ? `${activeEntity.speedKmh} km/h` : '142ms Latency'}</span>
                  </div>
                </div>
              )}

              {/* Title & Status */}
              <div className="space-y-1">
                <h3 className="font-bold text-white text-sm font-sans">
                  {activeEntity.title}
                </h3>
                <p className="text-slate-400 text-xs font-sans">
                  {activeEntity.description || 'Live anomaly registered in city GIS grid.'}
                </p>
              </div>

              {/* Drone Flight Parameters or SLA Timer */}
              {activeEntity.type === 'DRONE' ? (
                <div className="p-3 rounded-xl bg-[#090D16] border border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Flight Altitude:</span>
                    <span className="text-cyan-300 font-bold">{activeEntity.altitude} meters AGL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Telemetry Speed:</span>
                    <span className="text-cyan-300 font-bold">{activeEntity.speedKmh} km/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Battery Level:</span>
                    <span className="text-emerald-400 font-bold">{activeEntity.battery}% Nominal</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[#090D16] border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-1 text-cyan-400 font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>SLA Window Clock</span>
                    </span>
                    <span className="text-emerald-400 font-bold">
                      {activeEntity.slaHours || 4}h Target
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full w-[65%]" />
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleQuickDispatchToPin}
                  className="w-full py-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500 hover:bg-cyan-900 text-cyan-300 font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Plane className="w-3.5 h-3.5" />
                  <span>🚀 Dispatch UAV to Coordinates</span>
                </button>

                {activeEntity.type !== 'DRONE' && (
                  <button
                    onClick={(e) => handleStatusUpdate(activeEntity.id, 'Resolved', e)}
                    className="w-full py-2 rounded-xl bg-emerald-950/80 border border-emerald-500 hover:bg-emerald-900 text-emerald-300 font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>✅ Mark Defect Resolved</span>
                  </button>
                )}

                <button
                  onClick={() => setIsDisasterModalOpen(true)}
                  className="w-full py-2 rounded-xl bg-red-950/80 border border-red-500/80 hover:bg-red-900 text-red-300 font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                  <span>🚨 Level 5 Warning Broadcast</span>
                </button>

                {activeEntity.type !== 'DRONE' && (
                  <button
                    onClick={(e) => handleUpvote(activeEntity.id, e)}
                    className="w-full py-2 rounded-xl bg-[#090D16] border border-slate-800 hover:border-cyan-500 text-slate-300 hover:text-cyan-300 font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <ThumbsUp className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Citizen Verification ({activeEntity.upvotes || 0})</span>
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Level 5 Early Warning Broadcast Modal */}
      <DisasterBroadcastModal
        isOpen={isDisasterModalOpen}
        onClose={() => setIsDisasterModalOpen(false)}
        initialIncident={activeEntity}
        user={user}
      />

    </div>
  );
}
