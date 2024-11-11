import { CHECKBOXES_SIDE } from "./constants";

export function BoxContainer({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={
        {
          "--side": `repeat(${CHECKBOXES_SIDE}, minmax(0, 1fr))`,
        } as React.CSSProperties
      }
      className="relative grid grid-cols-[--side] gap-2"
    >
      {children}
    </div>
  );
}
