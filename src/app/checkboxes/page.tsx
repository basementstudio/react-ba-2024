"use client";

import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react/suspense";
import { ErrorBoundary } from "react-error-boundary";
import { Boxes } from "./boxes";
import { CHECKBOXES_TOTAL } from "./constants";
import { LiveList, LiveObject } from "@liveblocks/client";
import { CursorTracker } from "./cursor-tracker";
import { CursorsOptimized } from "./cursors-optimized";

if (!process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_API_KEY) {
  throw new Error("NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_API_KEY is not set");
}

function getInitialStorage() {
  const checkboxes = new LiveList(
    Array(CHECKBOXES_TOTAL)
      .fill(null)
      .map(
        (_, i) =>
          new LiveObject({
            id: i,
            checked: false,
          })
      )
  );

  return { checkboxes };
}

export default function Page() {
  return (
    <div className="w-full h-full p-4">
      <ErrorBoundary fallback={<div>Error</div>}>
        <LiveblocksProvider
          throttle={75}
          publicApiKey={process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_API_KEY!}
        >
          <RoomProvider
            id="checkboxes-example-ad2"
            initialStorage={getInitialStorage()}
            initialPresence={{
              cursor: null,
            }}
          >
            <ClientSideSuspense fallback={<div>Loading…</div>}>
              <div id="game-container" className="relative">
                <Boxes />
                <CursorTracker />
                <CursorsOptimized />
              </div>
            </ClientSideSuspense>
          </RoomProvider>
        </LiveblocksProvider>
      </ErrorBoundary>
    </div>
  );
}
