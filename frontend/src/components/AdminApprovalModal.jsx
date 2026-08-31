import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Building,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  MapPin,
  Phone,
  BadgeAlert
} from 'lucide-react';

import {
  subscribeToAdminRequests,
  approveAdminRequest,
  rejectAdminRequest
} from '../services/adminRequestService';

export default function AdminApprovalModal({ isOpen, onClose, user }) {
  if (!isOpen) return null;

  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('pending'); // 'pending' | 'officers' | 'admins' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToAdminRequests((data) => {
      setRequests(data);
    });
    return unsubscribe;
  }, []);

  const handleApprove = async (request) => {
    const isOfficer = request.requestType === 'officer';
    const roleTitle = isOfficer ? 'Municipal Officer Clearance' : 'Command Administrator Clearance';

    if (!confirm(`Are you sure you want to GRANT ${roleTitle} to ${request.name} (${request.email})?`)) {
      return;
    }

    setActionLoading(request.id);
    const res = await approveAdminRequest(
      request.id,
      request.uid,
      user?.email || 'System Admin',
      request.requestType || 'admin',
      request
    );

    if (res.success) {
      alert(`✅ ${roleTitle} successfully granted to ${request.name}!`);
    } else {
      alert(`Failed to approve: ${res.error}`);
    }
    setActionLoading(null);
  };

  const handleReject = async (request) => {
    if (!confirm(`Are you sure you want to REJECT the access request from ${request.name}?`)) {
      return;
    }

    setActionLoading(request.id);
    const res = await rejectAdminRequest(request.id, request.uid, user?.email || 'System Admin');
    if (res.success) {
      alert(`Request rejected for ${request.name}. User will retain public citizen status.`);
    } else {
      alert(`Failed to reject: ${res.error}`);
    }
    setActionLoading(null);
  };

  const filteredRequests = requests.filter((req) => {
    if (filter === 'pending' && req.status !== 'pending') return false;
    if (filter === 'officers' && req.requestType !== 'officer') return false;
    if (filter === 'admins' && req.requestType === 'officer') return false;

    const q = searchQuery.toLowerCase();
    return (
      (req.name || '').toLowerCase().includes(q) ||
      (req.email || '').toLowerCase().includes(q) ||
      (req.organization || '').toLowerCase().includes(q) ||
      (req.department || '').toLowerCase().includes(q) ||
      (req.ward || '').toLowerCase().includes(q)
    );
  });

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const pendingOfficerCount = requests.filter((r) => r.status === 'pending' && r.requestType === 'officer').length;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0B0F19] border border-cyan-500/40 rounded-2xl p-6 sm:p-8 max-w-full sm:max-w-4xl mx-4 w-full cyan-glow-lg relative space-y-6 max-h-[90vh] flex flex-col overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-cyan-400 cyan-glow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-heading">
                Personnel Access & Officer Authorization Desk
              </h3>
              <p className="text-xs text-cyan-400 font-mono-tech uppercase">
                Admin Command & Municipal Officer Onboarding Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pr-6">
            <span className="px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500 text-cyan-300 font-mono-tech text-xs font-bold">
              {pendingCount} Pending Review ({pendingOfficerCount} Officers)
            </span>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between font-mono-tech text-xs">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, department, ward..."
              className="w-full bg-[#070A10] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-2 rounded-lg font-bold transition cursor-pointer ${
                filter === 'pending'
                  ? 'bg-cyan-950 border border-cyan-400 text-cyan-300'
                  : 'bg-[#070A10] border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Pending ({pendingCount})
            </button>

            <button
              onClick={() => setFilter('officers')}
              className={`px-3 py-2 rounded-lg font-bold transition cursor-pointer ${
                filter === 'officers'
                  ? 'bg-amber-950 border border-amber-400 text-amber-300'
                  : 'bg-[#070A10] border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              🏛️ Officers Only
            </button>

            <button
              onClick={() => setFilter('admins')}
              className={`px-3 py-2 rounded-lg font-bold transition cursor-pointer ${
                filter === 'admins'
                  ? 'bg-cyan-950 border border-cyan-400 text-cyan-300'
                  : 'bg-[#070A10] border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              🛡️ Admins Only
            </button>

            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-2 rounded-lg font-bold transition cursor-pointer ${
                filter === 'all'
                  ? 'bg-cyan-950 border border-cyan-400 text-cyan-300'
                  : 'bg-[#070A10] border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All Records ({requests.length})
            </button>
          </div>
        </div>

        {/* Applications List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-16 text-slate-400 font-mono-tech text-sm space-y-2">
              <ShieldCheck className="w-10 h-10 text-cyan-400/50 mx-auto" />
              <p>No {filter === 'pending' ? 'pending' : ''} access applications found.</p>
            </div>
          ) : (
            filteredRequests.map((req) => {
              const isOfficer = req.requestType === 'officer';

              return (
                <div
                  key={req.id}
                  className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition ${
                    req.status === 'pending'
                      ? isOfficer
                        ? 'bg-[#0E1218] border-amber-500/50 hover:border-amber-400'
                        : 'bg-[#070A12] border-cyan-500/40 hover:border-cyan-400'
                      : req.status === 'approved'
                      ? 'bg-[#070A12] border-emerald-500/30 opacity-90'
                      : 'bg-[#070A12] border-red-500/30 opacity-70'
                  }`}
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-bold text-white text-base font-sans">
                        {req.name || 'Applicant'}
                      </span>
                      <span className="text-xs text-slate-400 font-mono-tech">
                        ({req.email})
                      </span>

                      {/* Request Type Badge */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono-tech uppercase flex items-center gap-1 ${
                        isOfficer
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/60'
                          : 'bg-cyan-950 text-cyan-300 border border-cyan-500/60'
                      }`}>
                        {isOfficer ? <Building className="w-3 h-3 text-amber-400" /> : <ShieldAlert className="w-3 h-3 text-cyan-400" />}
                        <span>{isOfficer ? '🏛️ Municipal Officer' : '🛡️ Command Admin'}</span>
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono-tech uppercase ${
                          req.status === 'pending'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                            : req.status === 'approved'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-red-950 text-red-300 border border-red-800'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 font-mono-tech flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1 text-cyan-400">
                        <Building className="w-3.5 h-3.5" />
                        <span>{req.organization} • {req.department}</span>
                      </span>

                      {req.ward && (
                        <span className="flex items-center gap-1 text-amber-300">
                          <MapPin className="w-3.5 h-3.5 text-amber-400" />
                          <span>Zone: <strong>{req.ward}</strong></span>
                        </span>
                      )}

                      {req.badgeNo && (
                        <span className="text-slate-400">
                          Badge ID: <strong className="text-slate-200">{req.badgeNo}</strong>
                        </span>
                      )}

                      {req.phone && (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <Phone className="w-3 h-3" />
                          <span>{req.phone}</span>
                        </span>
                      )}
                    </div>

                    {req.justification && (
                      <div className="p-2.5 rounded-lg bg-[#070A10] border border-slate-800 text-xs text-slate-300 font-sans">
                        <strong className="text-cyan-400 font-mono-tech">Operational Statement: </strong>
                        {req.justification}
                      </div>
                    )}

                    {req.approvedBy && (
                      <div className="text-[11px] text-emerald-400 font-mono-tech">
                        ✓ Approved by {req.approvedBy}
                      </div>
                    )}
                    {req.rejectedBy && (
                      <div className="text-[11px] text-red-400 font-mono-tech">
                        ✗ Rejected by {req.rejectedBy}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {req.status === 'pending' && (
                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        onClick={() => handleReject(req)}
                        disabled={actionLoading === req.id}
                        className="px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-500/60 text-red-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => handleApprove(req)}
                        disabled={actionLoading === req.id}
                        className={`px-4 py-2 rounded-xl text-black font-extrabold text-xs tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50 ${
                          isOfficer
                            ? 'bg-amber-400 hover:bg-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                            : 'bg-cyan-400 hover:bg-cyan-300 cyan-glow-sm'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isOfficer ? 'Authorize Officer' : 'Authorize Admin'}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
