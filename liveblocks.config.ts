/* eslint-disable @typescript-eslint/no-empty-object-type */

import type { LiveList, LiveObject } from "@liveblocks/client";

declare global {
  interface Liveblocks {
    Presence: {
      cursor: { x: number; y: number } | null;

    };
    Storage: {
      checkboxes: LiveList<LiveObject<{ id: number; checked: boolean }>>;
    };
  }
}

export { };
