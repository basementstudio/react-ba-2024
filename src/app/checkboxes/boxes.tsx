"use client";

import { BoxContainer } from "./box-container";
import { CHECKBOXES_TOTAL } from "./constants";

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
        <Box key={box.id} />
      ))}
    </BoxContainer>
  );
}

function Box() {
  return <input className="aspect-square relative" type="checkbox" />;
}
