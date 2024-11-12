"use client";

import { shallow } from "@liveblocks/react";
import { COLORS } from "./constants";
import { useMeasure } from "@/hooks/useMeasure";
import { useRef } from "react";
import { useOther, useOthers } from "@liveblocks/react/suspense";

export function CursorsOptimized() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const measurements = useMeasure(containerRef);

  const width = measurements?.width ?? 0;
  const height = measurements?.height ?? 0;

  const others = useOthers(
    (others) =>
      others.map((other) => ({
        connectionId: other.connectionId,
      })),
    shallow
  );

  return (
    <div className="absolute inset-0 pointer-events-none" ref={containerRef}>
      {
        /**
         * Iterate over other users and display a cursor based on their presence
         */
        others.map(({ connectionId }) => {
          return (
            <Cursor
              key={`cursor-${connectionId}`}
              connectionId={connectionId}
              color={COLORS[connectionId % COLORS.length]}
              width={width}
              height={height}
            />
          );
        })
      }
    </div>
  );
}

type CursorProps = {
  connectionId: number;
  width: number;
  height: number;
  color: string;
};

function Cursor({ connectionId, color, width, height }: CursorProps) {
  const cursor = useOther(
    connectionId,
    (other) => other.presence.cursor,
    shallow
  );

  if (!cursor) return null;

  const { x, y } = cursor;

  return (
    <svg
      style={{
        transform: `translateX(${x * width}px) translateY(${y * height}px)`,
      }}
      className="absolute left-0 top-0 w-8 transition-transform duration-[50]"
      viewBox="0 0 24 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
        fill={color}
        stroke="black"
        strokeWidth="6"
        strokeLinejoin="round"
        strokeLinecap="round"
        paintOrder="stroke fill"
      />
    </svg>
  );
}
