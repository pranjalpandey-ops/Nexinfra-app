import React, { useEffect, useState } from "react";

export default function WordByWordReveal({
  text,
  baseDelayMs = 480,
  staggerMs = 85,
  durationMs = 720,
  translateY = 26,
  className = "",
  as = "h1",
  ...props
}) {
  const [mounted, setMounted] = useState(false);
  const words = (text || "").trim().split(/\s+/);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const Component = as;

  return (
    <Component className={className} {...props}>
      {words.map((word, index) => {
        const delay = baseDelayMs + index * staggerMs;
        return (
          <React.Fragment key={index}>
            <span
              className="inline-block will-change-transform"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : `translateY(${translateY}px)`,
                transitionProperty: "opacity, transform",
                transitionDuration: `${durationMs}ms`,
                transitionTimingFunction: "cubic-bezier(0.215, 0.61, 0.355, 1)",
                transitionDelay: `${delay}ms`,
              }}
            >
              {word}
            </span>
            {index < words.length - 1 && " "}
          </React.Fragment>
        );
      })}
    </Component>
  );
}
