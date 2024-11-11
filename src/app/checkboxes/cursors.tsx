"use client";

import { useOthers } from "@liveblocks/react";
import { COLORS } from "./constants";
import { useMeasure } from "@/hooks/useMeasure";
import { useRef } from "react";

export function Cursors() {
  const others = useOthers();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const measurements = useMeasure(containerRef);

  const width = measurements?.width ?? 0;
  const height = measurements?.height ?? 0;

  return (
    <div className="absolute inset-0 pointer-events-none" ref={containerRef}>
      {
        /**
         * Iterate over other users and display a cursor based on their presence
         */
        others.map(({ connectionId, presence }) => {
          if (presence.cursor === null) {
            return null;
          }

          return (
            <Cursor
              key={`cursor-${connectionId}`}
              color={COLORS[connectionId % COLORS.length]}
              x={presence.cursor.x * width}
              y={presence.cursor.y * height}
            />
          );
        })
      }
    </div>
  );
}

type CursorProps = {
  color: string;
  x: number;
  y: number;
};

function Cursor({ color, x, y }: CursorProps) {
  return (
    <svg
      style={{
        transform: `translateX(${x}px) translateY(${y}px)`,
      }}
      className="absolute left-0 top-0 w-8"
      viewBox="0 0 24 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
        fill={color}
        stroke="black"
        strokeWidth="4"
        strokeLinejoin="round"
        strokeLinecap="round"
        paintOrder="stroke fill"
      />
    </svg>
  );
}
