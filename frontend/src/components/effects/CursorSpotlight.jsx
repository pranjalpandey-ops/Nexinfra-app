import React, { useEffect, useState } from "react";

export default function CursorSpotlight({ radius = 550, opacity = 0.15 }) {
  const [position, setPosition] = useState({ x: -1000, y: -1000 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let animationFrameId;

    const handleMouseMove = (e) => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        setPosition({ x: e.clientX, y: e.clientY });
        if (!isVisible) setIsVisible(true);
      });
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.body.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-30 transition-opacity duration-500 overflow-hidden"
      style={{ opacity: isVisible ? 1 : 0 }}
      aria-hidden="true"
    >
      <div
        className="absolute rounded-full blur-[100px] pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${radius}px`,
          height: `${radius}px`,
          background: `radial-gradient(circle, var(--nx-accent-glow) 0%, rgba(0, 240, 255, 0.04) 50%, transparent 80%)`,
        }}
      />
    </div>
  );
}
