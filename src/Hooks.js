import useResizeObserver from "@react-hook/resize-observer";
import { useRef, useState } from "react";

export default function useOnResizeComponent() {
  const sizeRef = useRef(null);
  const [rect, setRect] = useState({ width: 1, height: 1 });
  useResizeObserver(sizeRef, (entry) => {
    const r = entry.contentRect;
    setRect({ width: r.width, height: r.height });
  });
  return [sizeRef, rect];
}
