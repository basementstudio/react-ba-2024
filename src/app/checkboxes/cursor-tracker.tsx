import { useUpdateMyPresence } from "@liveblocks/react";
import { useEffect, useRef } from "react";

export function CursorTracker() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const updateMyPresence = useUpdateMyPresence();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const parent = container.closest("#game-container") as HTMLDivElement;

    if (!parent) return;

    parent.addEventListener("pointermove", (e) => {
      const rect = parent.getBoundingClientRect();
      updateMyPresence({
        cursor: {
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        },
      });
    });
  }, [containerRef, updateMyPresence]);

  return <div className="w-0 h-0 pointer-events-none" ref={containerRef} />;
}
