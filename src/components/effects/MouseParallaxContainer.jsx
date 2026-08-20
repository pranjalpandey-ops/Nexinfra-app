import React, { useEffect, useState, useRef } from "react";

export default function MouseParallaxContainer({
  children,
  className = "",
  intensity = 25,
}) {
  const containerRef = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let animationFrameId;

    const handleMouseMove = (e) => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        const { innerWidth, innerHeight } = window;
        const normX = (e.clientX - innerWidth / 2) / (innerWidth / 2);
        const normY = (e.clientY - innerHeight / 2) / (innerHeight / 2);
        setOffset({
          x: normX * intensity,
          y: normY * intensity,
        });
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        const depth = child.props["data-depth"] || 1;
        const childX = offset.x * depth;
        const childY = offset.y * depth;

        return React.cloneElement(child, {
          style: {
            ...child.props.style,
            transform: `${child.props.style?.transform || ""} translate3d(${childX.toFixed(2)}px, ${childY.toFixed(2)}px, 0)`,
            transition: "transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)",
          },
        });
      })}
    </div>
  );
}
