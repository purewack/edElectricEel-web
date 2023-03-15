import * as PIXI from "pixi.js";
import { useEffect, useRef, useState,BitmapText } from "react";
import {
  Stage,
  Sprite,
  Text
} from "@pixi/react";
import tiles_atlas from "./img/tiles64.json";
import tiles_img from "./img/tiles64.png";
import './style.css'

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

export default function SnakeView({ isPlaying }) {
  const parentDiv = useRef(null);
  const textureBusy = useRef(false);
  const [sprites, setSprites] = useState(null);
  const [gameTick, setGameTick] = useState(1);
  const gameTickId = useRef(0);

  useEffect(() => {
    if (sprites) return;
    if (textureBusy.current) return;
    const atlas = tiles_atlas;
    const spritesheet = new PIXI.Spritesheet(
      PIXI.BaseTexture.from(tiles_img),
      atlas
    );
    textureBusy.current = true;
    spritesheet.parse().then((s) => {
      setSprites(s);
      textureBusy.current = false;
      console.log(s);
      console.log(s.sHead)
    });
  }, []);

  useEffect(() => {
    clearInterval(gameTickId.current);
    if (!isPlaying) return;
    gameTickId.current = setInterval(() => {
      setGameTick((s) => s + 1);
    }, 750);
  }, [isPlaying]);

  return (
    <div ref={parentDiv} 
    style={{ 
      width: "90vw", 
      height: "70vh",
    }}
    className='View SnakeView'>
      {sprites && parentDiv.current && (
        <Stage
          options={{ backgroundColor: 0x10bb99, resizeTo: parentDiv.current }}
        >
          <Snake sprites={sprites} tick={gameTick} />
          <Text
            text={`gameTick:${gameTick}`}
            style={
              new PIXI.TextStyle({
                fontFamily: "courier",
                fill: isPlaying ? "green" : "red",
                fontSize: 16
              })
            }
          />
        </Stage>
      )}
    </div>
  );
}

function Snake({ sprites, tick, onAdvance }) {
  const u = 5;
  const [len, setLen] = useState(4);
  const [dir, setDir] = useState("right");
  const [path, setPath] = useState(null);
  const [altTick, setAltTick] = useState(false);

  //helpers
  const idxToDir = {
    0: "right",
    1: "down",
    2: "left",
    3: "up"
  };
  const dirToIdx = {
    right: 0,
    down: 1,
    left: 2,
    up: 3
  };
  const idxToSprite = (i, l) => {
    if (i === 0) return sprites.sHead;
    else if (i + 1 === l) return sprites.sTail;
    else if ((i + 1) % 2) return sprites.sBody2;
    else return sprites.sBody1;
  };
  const cornerRot = (prev, now) => {
    //return number of rotations for corner piece based on prev block and current block directions
    if (prev === dirToIdx["right"] && now === dirToIdx["up"]) return 0;
    else if (prev === dirToIdx["left"] && now === dirToIdx["up"]) return 1;
    else if (prev === dirToIdx["down"] && now === dirToIdx["right"]) return 1;
    else if (prev === dirToIdx["up"] && now === dirToIdx["right"]) return 2;
    else if (prev === dirToIdx["left"] && now === dirToIdx["down"]) return 2;
    else if (prev === dirToIdx["right"] && now === dirToIdx["down"]) return 3;
    else if (prev === dirToIdx["up"] && now === dirToIdx["left"]) return 3;
    else if (prev === dirToIdx["down"] && now === dirToIdx["left"]) return 0;
    else return null;
  };

  const respawn = () => {
    const spawn = [6, 6];
    const dd = Math.floor(Math.random() * 3);
    const px = dd === dirToIdx["right"] ? -1 : dd === dirToIdx["left"] ? 1 : 0;
    const py = dd === dirToIdx["up"] ? 1 : dd === dirToIdx["down"] ? -1 : 0;
    let poss = [];
    for (let i = 0; i < len; i++)
      poss.push({
        x: spawn[0] + px * i,
        y: spawn[1] + py * i,
        d: dd,
        id: path ? path[i].id * -1 : i + 1
      });
    console.log("path");
    setPath(poss);
    setDir(idxToDir[dd]);
  };

  //spawn
  useEffect(() => {
    if (path) return;
    respawn();
  }, []);

  //advance
  useEffect(() => {
    if (!path) return;
    setAltTick((s) => !s);

    //offsets for next move based on direction
    const px = dir === "right" ? 1 : dir === "left" ? -1 : 0;
    const py = dir === "down" ? 1 : dir === "up" ? -1 : 0;
    //snake segments from head to just before tail
    const tailMove = { ...path[len - 2], d: path[len - 3].d };
    const interMove = path.slice(0, len - 2);
    const nextPos = {
      x: path[0].x + px,
      y: path[0].y + py,
      d: dirToIdx[dir],
      id: -tailMove.id
    };
    if (nextPos.x < 0 || nextPos.y < 0 || nextPos.x > 16 || nextPos.y > 8) {
      respawn();
    } else {
      const nextMove = [nextPos, ...interMove, tailMove];
      setPath(nextMove);
      console.log(nextMove);
      if (onAdvance) onAdvance(nextMove);
    }

    if (tick === 2) setDir("down");
    if (tick === 4) setDir("left");
  }, [tick]);

  return (
    <>
      {path &&
        path.map((p, i, a) => {
          const i_p = i - 1 < 0 ? null : i - 1;
          const isCorner =
            i_p === null ? false : i === len - 1 ? false : p.d !== a[i_p].d;
          const cornerDir = isCorner ? cornerRot(a[i_p].d, p.d) : null;

          //clockwise, starting at 3oclock === 0
          let elemDir = p.d + 1;
          if (cornerDir !== null) elemDir = cornerDir + 4;
          let elemScale = [u, u];
          if (altTick && !isCorner) elemScale[0] *= -1;

          const tex =
            cornerDir !== null ? sprites.sTurnBotRight : idxToSprite(i, len);

          return (
            <SnakeSeg
              key={p.id}
              id={p.id}
              piece={i}
              texture={tex}
              scale={{x:elemScale[0],y:elemScale[1]}}
              anchor={{x:0.5,y:0.5}}
              rotation={(Math.PI / 2) * elemDir}
              x={u * 4 + u * p.x * 8}
              y={u * 4 + u * p.y * 8}
            />
          );
        })}
    </>
  );
}

function SnakeSeg(props) {
  // const [tint, setTint] = useState(0xffffff);
  // const [anims, setAnims] = useState();
  // useEffect(() => {
  //   if (props.piece !== 0) return;
  //   setTint(0xff0000);
  //   setAnims([props.scale[0] * 1.5, props.scale[1] * 1.5]);
  //   setTimeout(() => {
  //     setTint(0xffffff);
  //     setAnims([props.scale[0], props.scale[1]]);
  //   }, 250);
  // }, []);

  return <Sprite
    {...props}
    // tint={tint}
  />
}
