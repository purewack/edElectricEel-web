import { useEffect, useRef, useState, useCallback } from "react";
import { Sprite } from "@pixi/react";

export default function Item({ onCollect, visuals }) {
  useEffect(() => {
    console.log("new item spawn");
  }, []);

  const uu = visuals.u;
  const xx = visuals.x * uu;
  const yy = visuals.y * uu;
  const ss = { x: uu / 8, y: uu / 8 };
  return <Sprite x={xx} y={yy} scale={ss} texture={visuals.sprite} />;
}
