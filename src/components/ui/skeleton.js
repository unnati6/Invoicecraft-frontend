import { cn } from "../../lib/utils"; // Assuming your cn utility is in this path
import * as React from "react"; // Assuming React is needed for HTMLAttributes

function Skeleton({
  className,
  ...props
}) {
  return (
    React.createElement("div", {
      className: cn("animate-pulse rounded-md bg-muted", className),
      ...props
    })
  );
}

export {
  Skeleton
};