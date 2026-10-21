import React from "react";
import { PupBuddy } from "./PupBuddy";

export function PupStop({
  pose = "sit",
  facing = "right",
  act,
  behind = false,
  lane = false,
  className = "",
  style,
  label,
}: {
  pose?: string;
  facing?: "left" | "right";
  act?: string;
  behind?: boolean;
  lane?: boolean;
  className?: string;
  style?: React.CSSProperties;
  label?: string;
}) {
  return (
    <div
      data-pup-stop="true"
      data-pose={pose}
      data-facing={facing}
      data-act={act}
      data-behind={behind ? "true" : undefined}
      data-lane={lane ? "true" : undefined}
      className={`pup-stop ${className}`}
      style={style}
    >
      <PupBuddy pose={pose} facing={facing} label={label} asStop />
    </div>
  );
}
