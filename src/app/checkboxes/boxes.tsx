"use client";

import { BoxContainer } from "./box-container";
import { CHECKBOXES_TOTAL } from "./constants";

/**
 * store: {
 *   checkboxes: [
 *     { id: 0, checked: false },
 *     { id: 1, checked: true },
 *     { id: 2, checked: false },
 *   ]
 * }
 */

const staticBoxes = Array(CHECKBOXES_TOTAL)
  .fill(null)
  .map((_, i) => ({
    id: i,
    checked: false,
  }));

export function Boxes() {
  return (
    <BoxContainer>
      {staticBoxes.map((box) => (
        <Box key={box.id} id={box.id} checked={box.checked} />
      ))}
    </BoxContainer>
  );
}

interface BoxProps {
  id: number;
  checked: boolean;
}

function Box({ id, checked }: BoxProps) {
  return (
    <input
      className="aspect-square relative"
      type="checkbox"
      checked={checked}
      onChange={(e) => e.target.checked}
    />
  );
}
