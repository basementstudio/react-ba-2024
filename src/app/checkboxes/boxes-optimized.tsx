"use client";

import { shallow, useMutation, useStorage } from "@liveblocks/react/suspense";
import { BoxContainer } from "./box-container";

export function Boxes() {
  const ids = useStorage(
    ({ checkboxes }) => checkboxes.map((c) => c.id),
    shallow
  );

  return (
    <BoxContainer>
      {ids.map((id) => (
        <Box id={id} key={id} />
      ))}
    </BoxContainer>
  );
}

function Box({ id }: { id: number }) {
  const isChecked = useStorage(({ checkboxes }) => checkboxes[id].checked);

  const setChecked = useMutation(
    (context, checked: boolean) => {
      context.storage.get("checkboxes").get(id)?.set("checked", checked);
    },
    [id]
  );

  return (
    <input
      className="aspect-square relative"
      type="checkbox"
      checked={isChecked}
      onChange={(e) => setChecked(e.target.checked)}
    />
  );
}
