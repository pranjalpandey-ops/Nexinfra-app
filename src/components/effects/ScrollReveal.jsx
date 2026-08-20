import React, { useEffect, useRef, useState } from "react";

export default function ScrollReveal({
  children,
  className = "",
  variant = "fade-up", // fade-up | fade-in | zoom-in | slide-left | slide-right
  delayMs = 0,
  threshold = 0.15,
  once = true,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, once]);

  const getVariantStyles = () => {
    if (isVisible) {
      return "opacity-100 translate-y-0 translate-x-0 scale-100";
    }

    switch (variant) {
      case "fade-up":
        return "opacity-0 translate-y-10 scale-[0.98]";
      case "zoom-in":
        return "opacity-0 scale-90";
      case "slide-left":
        return "opacity-0 -translate-x-12";
      case "slide-right":
        return "opacity-0 translate-x-12";
      case "fade-in":
      default:
        return "opacity-0";
    }
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] transform will-change-transform ${getVariantStyles()} ${className}`}
      style={{
        transitionDelay: `${delayMs}ms`,
      }}
    >
      {children}
    </div>
  );
}
