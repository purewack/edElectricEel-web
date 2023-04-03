import useResizeObserver from "@react-hook/resize-observer";
import { useRef, useState } from "react";

export default function useOnResizeComponent(externalRef) {
  const sizeRef = useRef(null);
  const [rect, setRect] = useState({ width: 1, height: 1 });
  const ref = externalRef ? externalRef : sizeRef
  useResizeObserver(ref, (entry) => {
    const r = window.getComputedStyle(entry.target);
    const rr = { width: parseFloat(r.width), height: parseFloat(r.height) }
    //console.log(rr,entry.target)
    setRect(rr);
  });
  return [ref, rect];
}
