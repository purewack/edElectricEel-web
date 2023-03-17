import * as PIXI from "pixi.js";
import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useLayoutEffect,
} from "react";
import {
  Stage,
  Sprite,
  TilingSprite,
  Text,
  Graphics,
  Container,
} from "@pixi/react";
import useOnResizeComponent from "../Hooks.js";
import Item from "./Item.js";
import Boat from './Boat.js'

import snake_atlas from "./img/snake.json";
import scene_atlas from "./img/scene.json";
import items_atlas from "./img/items.json";
import entity_atlas from "./img/entity.json";
import tiles_img from "./img/tiles64.png";
import "./style.css";

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

export default function SnakeView({ style, options, showDebug, direction, length, gameTick }) {
  const [parentDiv, parentSize] = useOnResizeComponent();
  const textureLoaded = useRef(false);
  const [sprites, setSprites] = useState(null);
  const [scenery, setScenery] = useState([]);
  const [visuals, setVisuals] = useState({ u: 1, uu: 1, preferredHeightU: 1 });
  
  useEffect(() => {
    // console.log(parentSize);
    const shipAreaU = 2;
    const minPlayableHeightU = 14; //playable area height
    const ww = parentSize.width/128
    const hh = parentSize.height/(minPlayableHeightU+shipAreaU)/8
    const u = Math.min(ww,hh);
    const uu = u * 8;
    const gw = parentSize.width / uu;
    const gh = parentSize.height / uu;
    const vv = {u,uu,preferredHeightU:minPlayableHeightU, grid:[gw,gh]}
    console.log(vv)
    setVisuals(vv)
  }, [parentSize]);
  const u = visuals.u
  const uu = visuals.uu
  const preferredHeightU = visuals.preferredHeightU

  const advanceScenery = (spawn) => {
    if (spawn) {
      let arr = [];
      for (let i = 0; i < 24; i++) {
        const r = Math.random();
        if (r < 0.6 || i % 3) continue;
        arr.push({
          type: "seaweed",
          x: i,
          n: Math.floor(r * 8),
          speed: 0.25,
        });
      }
      console.log("new scenery");
      console.log(arr);
      setScenery(arr);
    } else if(options?.scrolling) {
      setScenery((ss) =>
        ss.map((e, i, a) => {
          if (e.x < 0) return { ...e, x: Math.floor(visuals.grid[0]), n: Math.floor(Math.random() * 6) };
          return { ...e, x: e.x - e.speed };
        })
      );
    }
  };
  useEffect(() => {

    if (!textureLoaded.current) {
      textureLoaded.current = true;
      const tex = PIXI.BaseTexture.from(tiles_img);
      const snake_SS = new PIXI.Spritesheet(tex, snake_atlas);
      const scene_SS = new PIXI.Spritesheet(tex, scene_atlas);
      const items_SS = new PIXI.Spritesheet(tex, items_atlas);
      const entity_SS = new PIXI.Spritesheet(tex, entity_atlas);

      Promise.all([snake_SS.parse(), scene_SS.parse(), items_SS.parse(), entity_SS.parse()]).then(
        (s) => {
          setSprites({ snake: s[0], scene: s[1], items: s[2], entity: s[3]});
          advanceScenery(true);
          console.log("sprites loaded");
          console.log(s);
        }
      );
    }
  }, []);

  useEffect(()=>{
    advanceScenery(false);
  },[gameTick])


  return (
    <div
      ref={parentDiv}
      style={style ? style : {
        width: "90vw",
        height: "70vh"
      }}
      className="View SnakeView"
    >
      {sprites && (
        <Stage
          options={{
            backgroundAlpha: 0,
            resizeTo: parentDiv.current
          }}
        >

          <TilingSprite
            texture={sprites.scene.water}
            scale={{ x: u, y: u }}
            height={8}
            width={parentSize.width + uu}
            y={uu * 2}
            x={gameTick % 2 ? -uu : 0}
          />
          <TilingSprite
            texture={sprites.scene.sand}
            scale={{ x: u * 2, y: u * 2 }}
            height={parentSize.height}
            width={parentSize.width + uu}
            y={preferredHeightU * uu}
            x={options?.scrolling && gameTick % 2 ? -uu/2 : 0}
          />
          {scenery.map((e, i, a) => {
            if (e.type === "seaweed") {
              return (
                <Container
                  key={`snr_${i}`}
                  y={preferredHeightU * uu}
                  x={e.x * uu}
                >
                  {[...Array(e.n)].map((ee, ii, aa) => {
                    const ss = {y:u, x: Math.random() > 0.7 ? -u : u}
                    return (
                      <Sprite
                        key={`snr_${i}_${ii}`}
                        texture={sprites.scene.seaweed}
                        scale={ss}
                        anchor={{ x: 0.5, y: 1 }}
                        y={-ii * uu}
                        x={uu/2}
                      />
                    );
                  })}
                </Container>
              );
            }
            return null;
          })}

          {/* <Item
            visuals={{
              u: uu,
              x: Math.floor(visuals.grid[0]-1),
              y: 4,
              sprite: sprites.items.noteblock,
            }}
          />

          <Boat sprites={sprites} visuals={{...visuals, chainLength:2, chainType:'chain'}}/> */}

          <Snake
            visuals={{
              u: uu,
              sprites: sprites.snake,
              length,
              direction,
              spawn: [4, 4],
              respawn: true,
              scrolling: options?.scrolling,
            }}
            range={{left:0, right:0, top:2, bottom:2}}
            tick={{value:gameTick, tickPerMove:4}}
          />

          {showDebug && (
            <>
              <DebugGrid u={uu / 2} uw={parentSize.height}  uh={parentSize.width} />
              <Text
                text={`gameTick:${gameTick} length:${length} direction: ${direction}`}
                style={
                  new PIXI.TextStyle({
                    fontFamily: "courier",
                    fill: "green",
                    fontSize: 16,
                  })
                }
              />
            </>
          )}
        </Stage>
      )}
    </div>
  );
}

function Snake({ visuals, tick, onAdvance }) {
  const [len, setLen] = useState(0);
  const [dir, setDir] = useState("right");
  const [path, setPath] = useState(null);

  //spawn
  useEffect(() => {
    if (!visuals) return;
    if (path) return;
    if (!visuals?.respawn) return;
    const spawn = visuals.spawn;
    const dd = visuals.direction;
    const px = dd === "right" ? -1 : dd === "left" ? 1 : 0;
    const py = dd === "up" ? 1 : dd === "down" ? -1 : 0;
    let poss = [];
    for (let i = 0; i < visuals.length; i++)
      poss.push({
        x: spawn[0] + px * i,
        y: spawn[1] + py * i,
        d: dirToIdx[dd],
      });
    console.log("new spawn");
    console.log(poss);
    setPath(poss);
    if (onAdvance) onAdvance(poss);
  }, [visuals.respawn]);

  //turn
  useEffect(() => {
    if (!visuals) return;
    if(dir === 'left' && visuals.direction === 'right') return;
    if(dir === 'right' && visuals.direction === 'left') return;
    if(dir === 'down' && visuals.direction === 'up') return;
    if(dir === 'up' && visuals.direction === 'down') return;
    setDir(visuals.direction);
  }, [visuals.direction]);

  //grow
  useEffect(() => {
    if (!visuals) return;
    setLen(visuals.length);
    const ll = visuals.length;
    if (len >= 3) {
      const tailGrow = { ...path[ll - 2], d: path[ll - 3].d };
      const nextPath = [...path, tailGrow];
      setPath(nextPath);
    }
  }, [visuals.length]);

  //advance @ tick
  useEffect(() => {
    if (!path) return;
    if(tick.value % tick.tickPerMove) return
    //offsets for next move based on direction
    const pxx = visuals.scrolling ? -(1/tick.tickPerMove) : 0;
    const px = dir === "right" ? 1 : dir === "left" ? -1 : 0;
    const py = dir === "down" ? 1 : dir === "up" ? -1 : 0;

    //snake segments from head to just before tail
    const tailMove = { ...path[len - 2], d: path[len - 3].d };
    const interMove = path.slice(0, len - 2);
    const nextPos = {
      x: path[0].x + px,
      y: path[0].y + py,
      d: dirToIdx[dir],
    };
    const nn = [nextPos, ...interMove, tailMove];
    const nextMove = nn.map((p) => {
      return { ...p, x: p.x + pxx };
    });
    setPath(nextMove);

    // console.log(nextMove);
    if (onAdvance) onAdvance(nextMove);
  }, [tick.value]);

  const uu = visuals?.u;
  const sprites = visuals?.sprites;

  //helpers
  const idxToDir = {
    0: "right",
    1: "down",
    2: "left",
    3: "up",
  };
  const dirToIdx = {
    right: 0,
    down: 1,
    left: 2,
    up: 3,
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

  return (
    <>
      {path &&
        path.map((p, i, a) => {
          const i_p = i - 1 < 0 ? null : i - 1;
          const isCorner =
            i_p === null ? false : i === len - 1 ? false : p.d !== a[i_p].d;
          const cornerDir = isCorner ? cornerRot(a[i_p].d, p.d) : null;
          const altTick = tick.value % 2;
          //clockwise, starting at 3oclock === 0
          let elemDir = p.d + 1;
          if (cornerDir !== null) elemDir = cornerDir + 4;
          let elemScale = [uu / 8, uu / 8];
          if (altTick && !isCorner) elemScale[0] *= -1;

          const tex =
            cornerDir !== null
              ? altTick
                ? sprites.sTurnBotRightAlt
                : sprites.sTurnBotRight
              : idxToSprite(i, len);

          return (
            <SnakeSeg
              key={`sk_${i}`}
              piece={i}
              texture={tex}
              scale={{ x: elemScale[0], y: elemScale[1] }}
              anchor={{ x: 0.5, y: 0.5 }}
              rotation={(Math.PI / 2) * elemDir}
              x={uu / 2 + uu * p.x}
              y={uu / 2 + uu * p.y}
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

  return (
    <Sprite
      {...props}
      // tint={tint}
    />
  );
}

function DebugGrid({ u, ux = 0, uy = 0, uw = 32, uh = 32 }) {
  const draw = useCallback(
    (g) => {
      g.clear();
      //horiz
      for (let yy = 0; yy < uw; yy++) {
        g.lineStyle(1, yy % 2 ? 0xffff00 : 0xaa0000, 0.3);
        g.moveTo(ux, yy * u);
        g.lineTo(uw * u, yy * u);
      }
      //vert
      for (let xx = 0; xx < uw; xx++) {
        g.lineStyle(1, xx % 2 ? 0xffff00 : 0xaa0000, 0.3);
        g.moveTo(xx * u, uy);
        g.lineTo(xx * u, uh * u);
      }
    },
    [u, ux, uy, uw, uh]
  );

  return <Graphics draw={draw} />;
}
