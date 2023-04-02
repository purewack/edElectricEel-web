import useResizeObserver from "@react-hook/resize-observer";
import { useRef, useState } from "react";

export default function useOnResizeComponent() {
  const sizeRef = useRef(null);
  const [rect, setRect] = useState({ width: 1, height: 1 });
  useResizeObserver(sizeRef, (entry) => {
    const r = window.getComputedStyle(entry.target);
    const rr = { width: parseFloat(r.width), height: parseFloat(r.height) }
    //console.log(rr,entry.target)
    setRect(rr);
  });
  return [sizeRef, rect];
}
