import React, { useRef, useState } from "react";

export default function TiltCard({
  children,
  className = "",
  maxAngle = 12,
  glare = true,
  scale = 1.03,
  onClick,
  ...props
}) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const normalizedX = (x - centerX) / centerX;
    const normalizedY = (y - centerY) / centerY;

    const rotateX = -normalizedY * maxAngle;
    const rotateY = normalizedX * maxAngle;

    setTilt({ rotateX, rotateY });

    if (glare) {
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;
      setGlarePos({ x: glareX, y: glareY, opacity: 0.35 });
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rotateX: 0, rotateY: 0 });
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-2xl transition-all duration-300 ${className}`}
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d",
        transform: isHovered
          ? `perspective(1000px) rotateX(${tilt.rotateX.toFixed(2)}deg) rotateY(${tilt.rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`
          : "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
        transition: isHovered
          ? "transform 0.1s ease-out, box-shadow 0.2s ease"
          : "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.3s ease",
      }}
      {...props}
    >
      {/* Specular Radial Glare Reflection */}
      {glare && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 z-20 overflow-hidden"
          style={{
            opacity: glarePos.opacity,
            background: `radial-gradient(circle 220px at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.4), transparent 70%)`,
          }}
        />
      )}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
