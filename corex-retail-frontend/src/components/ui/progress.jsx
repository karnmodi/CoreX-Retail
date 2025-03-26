"use client";

import React, { useEffect, useState } from "react";

// Simple utility function to join classnames
const cn = (...classes) => classes.filter(Boolean).join(" ");

const Progress = React.forwardRef(({ 
  className, 
  value = 0, 
  max = 100,
  ...props 
}, ref) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setProgress(value);
    }, 50);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={progress}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ 
          transform: `translateX(-${100 - ((progress / max) * 100)}%)`,
        }}
      />
    </div>
  );
});

Progress.displayName = "Progress";

export { Progress };