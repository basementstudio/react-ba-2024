"use client";

import { shallow, useMutation, useStorage } from "@liveblocks/react/suspense";
import { BoxContainer } from "./box-container";
import { CHECKBOXES_TOTAL } from "./constants";

const staticBoxes = Array(CHECKBOXES_TOTAL)
  .fill(null)
  .map((_, i) => ({
    id: i,
    checked: false,
  }));

export function Boxes() {
  const checkboxes = useStorage((store) => {
    return store.checkboxes.map((c) => c.id);
  }, shallow);

  return (
    <BoxContainer>
      {checkboxes.map((boxId) => (
        <Box key={boxId} id={boxId} />
      ))}
    </BoxContainer>
  );
}

/**
 * checkboxes: [
 *   { id: 0, checked: false },
 *   { id: 1, checked: true },
 *   { id: 2, checked: false },
 * ]
 */

interface BoxProps {
  id: number;
}

function Box({ id }: BoxProps) {
  console.log("render", id);

  const checked = useStorage((store) => store.checkboxes[id].checked);

  const setChecked = useMutation((root, isChecked: boolean) => {
    root.storage.get("checkboxes").get(id)?.set("checked", isChecked);
  }, []);

  return (
    <input
      className="aspect-square relative"
      type="checkbox"
      checked={checked}
      onChange={(e) => setChecked(e.target.checked)}
    />
  );
}
