import React from "react";

export default function Logo({ size = "md", theme = "dark", className = "" }) {
  const sizeClasses = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
    xl: "w-20 h-20",
  };

  const isLight = theme === "light";
  const logoSrc = isLight ? "/logo-light.png" : "/logo-dark.png";

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-xl overflow-hidden transition-all duration-300 ${
        sizeClasses[size] || sizeClasses.md
      } ${className}`}
    >
      <img
        src={logoSrc}
        alt="Nexinfra Logo"
        className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(0,240,255,0.4)] group-hover:scale-105 transition-transform"
      />
    </div>
  );
}
