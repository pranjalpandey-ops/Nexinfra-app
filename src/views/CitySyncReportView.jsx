import React, { useState } from "react";
import {
  Camera,
  MapPin,
  Sparkles,
  Send,
  LayoutDashboard,
  Map,
  Bell,
  FileText,
  CheckCircle2,
} from "lucide-react";

import { auth } from "../firebase";
import { createComplaint } from "../services/complaintService";
import { uploadImage } from "../services/imageService";
import LeafletMap from "../components/LeafletMap";

export default function CitySyncReportView({
  setActivePage,
  viewMode = "auto",
}) {
  const isPhoneFrame = viewMode === "phone";

  const [selectedImage, setSelectedImage] = useState(null);
  const [description, setDescription] = useState(
    "There is a large pothole near the intersection causing traffic slowdowns."
  );
  const [category] = useState("Road Damage/Pothole");
  const [priority, setPriority] = useState("Medium");

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [location, setLocation] = useState("Location not selected");

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        setLatitude(lat);
        setLongitude(lon);

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
          );

          const data = await response.json();

          setLocation(data.display_name || "Current Location");
        } catch {
          setLocation(`${lat.toFixed(6)}, ${lon.toFixed(6)}`);
        }
      },
      () => alert("Location permission denied.")
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      let imageUrl = null;

      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      const result = await createComplaint({
        title: description.slice(0, 50) || category,
        category,
        description,
        priority,
        latitude,
        longitude,
        address: location,
        imageUrl,
        createdBy: auth.currentUser?.email || "Unknown User",
      });

      if (result.success) {
        setSubmitted(true);

        alert(`Complaint Submitted!\nComplaint ID: ${result.id}`);

        setTimeout(() => {
          setSubmitted(false);
          setActivePage("citysync-map");
        }, 1500);
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert(error.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#090C13] text-slate-100 flex justify-center py-8 px-4">
      <div
        className={`w-full ${
          isPhoneFrame
            ? "max-w-md bg-[#0D121D] border border-slate-800 rounded-2xl overflow-hidden"
            : "max-w-6xl bg-[#0D121D] border border-slate-800 rounded-2xl p-8"
        }`}
      >
        {/* Header */}

        <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-cyan-400">
              CitySync AI Portal
            </h1>

            <p className="text-sm text-slate-400">
              Citizen Reporting Node
            </p>
          </div>

          <span className="px-3 py-1 bg-cyan-950 border border-cyan-500 rounded-lg text-xs text-cyan-300">
            {isPhoneFrame ? "Mobile View" : "Desktop View"}
          </span>
        </div>

        {submitted ? (
          <div className="text-center py-16">
            <CheckCircle2 className="w-20 h-20 text-cyan-400 mx-auto mb-4" />

            <h2 className="text-3xl font-bold mb-2">
              Complaint Submitted
            </h2>

            <p className="text-slate-400">
              Your report has been sent successfully.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="grid lg:grid-cols-2 gap-8"
          >
            {/* LEFT COLUMN */}

            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold">
                  Report an Issue
                </h2>

                <p className="text-slate-400 mt-1">
                  Upload evidence and location.
                </p>
              </div>

              {/* Image Upload */}

              <div>
                <label className="block text-xs uppercase text-slate-400 mb-2">
                  Upload Image
                </label>

                <label className="cursor-pointer block border-2 border-dashed border-slate-700 rounded-2xl p-6 hover:border-cyan-400 transition">
                  <div className="flex flex-col items-center gap-3">
                    <Camera className="w-10 h-10 text-cyan-400" />

                    <span className="text-center">
                      {selectedImage
                        ? selectedImage.name
                        : "Click to choose an image"}
                    </span>
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      setSelectedImage(e.target.files[0])
                    }
                  />
                </label>

                {selectedImage && (
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Preview"
                    className="mt-4 rounded-xl w-full h-52 object-cover border border-slate-700"
                  />
                )}
              </div>

              {/* GPS */}

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs uppercase text-slate-400">
                    Current Location
                  </label>

                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="text-cyan-400 text-sm hover:underline"
                  >
                    📍 Use Current Location
                  </button>
                </div>

                <div className="rounded-xl overflow-hidden border border-slate-700">
                  <LeafletMap
                    latitude={latitude}
                    longitude={longitude}
                    address={location}
                  />
                </div>

                <div className="mt-3 bg-slate-900 border border-slate-700 rounded-xl p-3 flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-cyan-400" />

                  <span className="text-sm">{location}</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}

            <div className="space-y-6">
              {/* Description */}

              <div>
                <label className="block text-xs uppercase text-slate-400 mb-2">
                  Description
                </label>

                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  className="w-full bg-[#070A12] border border-slate-700 rounded-xl p-4 text-white resize-none"
                />
              </div>

              {/* AI Category */}

              <div className="bg-[#070A12] border border-cyan-500 rounded-xl p-4 flex items-center gap-3">
                <Sparkles className="text-cyan-400" />

                <div>
                  <p className="text-xs text-slate-400">
                    AI Detected Category
                  </p>

                  <p className="font-semibold">{category}</p>
                </div>
              </div>

              {/* Priority */}

              <div>
                <label className="block text-xs uppercase text-slate-400 mb-3">
                  Priority
                </label>

                <div className="grid grid-cols-3 gap-3">
                  {["Low", "Medium", "High"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-3 rounded-xl border transition ${
                        priority === p
                          ? "border-amber-400 bg-amber-950 text-amber-300"
                          : "border-slate-700 bg-[#070A12]"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-300 text-black font-bold flex justify-center items-center gap-2 disabled:opacity-60"
              >
                <Send className="w-5 h-5" />

                {loading
                  ? "Submitting..."
                  : "Analyze & Submit Report"}
              </button>
            </div>
          </form>
        )}

        {/* Mobile Navigation */}

        {isPhoneFrame && (
          <div className="grid grid-cols-4 border-t border-slate-800 mt-6">
            <button
              onClick={() => setActivePage("dashboard")}
              className="py-3 flex flex-col items-center text-xs"
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </button>

            <button
              onClick={() => setActivePage("citysync-map")}
              className="py-3 flex flex-col items-center text-xs"
            >
              <Map className="w-5 h-5" />
              Map
            </button>

            <button
              onClick={() => setActivePage("maintenance")}
              className="py-3 flex flex-col items-center text-xs"
            >
              <Bell className="w-5 h-5" />
              Alerts
            </button>

            <button
              onClick={() => setActivePage("report-issue")}
              className="py-3 flex flex-col items-center text-xs bg-cyan-400 text-black"
            >
              <FileText className="w-5 h-5" />
              Reports
            </button>
          </div>
        )}
      </div>
    </div>
  );
}