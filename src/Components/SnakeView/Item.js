import { useEffect, useRef, useState, useCallback } from "react";
import { Sprite } from "@pixi/react";

export default function Item({ where, type='noteblock', visuals }) {
  useEffect(() => {
    // console.log("new item spawn");
  }, []);

  const uu = visuals.u;
  const xx = where[0] * uu;
  const yy = where[1] * uu;
  const ss = { x: uu / 8, y: uu / 8 };
  const tex = visuals.sprites.items[type]
  return tex && <Sprite x={xx} y={yy} scale={ss} texture={tex} />;
}
