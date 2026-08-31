import React, { useState } from 'react';
import { X, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function WorkOrderModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    department: 'Road Maintenance',
    priority: 'HIGH',
    description: '',
    assignedTeam: 'Field Dispatch Unit 1',
  });

  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0B0F19] border border-cyan-500/40 rounded-xl p-6 max-w-full sm:max-w-lg mx-4 w-full cyan-glow-lg relative space-y-5 max-h-[92vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-cyan-400 cyan-glow-sm">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-heading">
              Generate Digital Work Order
            </h3>
            <p className="text-xs text-cyan-400 font-mono-tech uppercase">
              Predictive Maintenance Protocol
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3 font-mono-tech text-emerald-400">
            <CheckCircle2 className="w-12 h-12 mx-auto animate-bounce" />
            <p className="text-sm font-bold">DIGITAL WORK ORDER DISPATCHED</p>
            <p className="text-xs text-slate-400">Assigned to {formData.department} (WRK-004)</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 font-mono-tech text-xs">
            
            <div className="space-y-1.5">
              <label className="block text-slate-300">Work Order Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Highway 401 Bridge Cable Repair"
                className="w-full bg-[#070A10] border border-slate-800 rounded p-2.5 text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-slate-300">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full bg-[#070A10] border border-slate-800 rounded p-2.5 text-white focus:border-cyan-400 focus:outline-none"
                >
                  <option value="Road Maintenance">Road Maintenance</option>
                  <option value="Sanitation">Sanitation</option>
                  <option value="Emergency Response">Emergency Response</option>
                  <option value="Electrical Grid">Electrical Grid</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-300">Priority Level</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full bg-[#070A10] border border-slate-800 rounded p-2.5 text-white focus:border-cyan-400 focus:outline-none"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-300">Description & Telemetry Target</label>
              <textarea
                rows="3"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe failure mode or sensor anomaly details..."
                className="w-full bg-[#070A10] border border-slate-800 rounded p-2.5 text-white focus:border-cyan-400 focus:outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded border border-slate-800 bg-[#070A10] text-slate-300 hover:text-white"
              >
                CANCEL
              </button>
              
              <button
                type="submit"
                className="px-5 py-2 rounded bg-[#00F0FF] hover:bg-cyan-300 text-black font-bold uppercase cyan-glow-sm"
              >
                ISSUE WORK ORDER
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
