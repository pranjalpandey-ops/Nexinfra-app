import React, { useRef, useState } from "react";

export default function MagneticButton({
  children,
  onClick,
  className = "",
  strength = 20,
  glowEffect = true,
  disabled = false,
  ...props
}) {
  const buttonRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    if (disabled || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) / (rect.width / 2);
    const deltaY = (e.clientY - centerY) / (rect.height / 2);

    setPosition({
      x: deltaX * strength,
      y: deltaY * strength,
    });

    const glareX = ((e.clientX - rect.left) / rect.width) * 100;
    const glareY = ((e.clientY - rect.top) / rect.height) * 100;
    setGlarePos({ x: glareX, y: glareY });
  };

  const handleMouseEnter = () => {
    if (!disabled) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden cursor-pointer transition-transform duration-200 ease-out select-none active:scale-95 ${className}`}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        transition: isHovered
          ? "transform 0.12s ease-out, box-shadow 0.2s ease"
          : "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.2s ease",
      }}
      {...props}
    >
      {/* Specular Glare Reflection Layer */}
      {glowEffect && isHovered && (
        <span
          className="absolute inset-0 pointer-events-none opacity-40 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 80px at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.6), transparent 70%)`,
          }}
        />
      )}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
}
