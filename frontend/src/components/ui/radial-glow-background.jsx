import React from 'react';
import { cn } from "@/lib/utils";
import { useState } from "react";

export const RadialGlowBackground = ({ children, className }) => {
  const [count, setCount] = useState(0);

  return (
    <div className={cn("min-h-screen w-full bg-[#020617] relative overflow-hidden", className)}>
      {/* Dark Radial Glow Background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle 500px at 50% 200px, #1e152a, transparent)`,
        }}
      />
      <div className="relative z-10 w-full min-h-screen">
        {children}
      </div>
    </div>
  );
};

export default RadialGlowBackground;
