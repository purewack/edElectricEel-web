import * as PIXI from "pixi.js";
import {
  useEffect,
  useRef,
  useState,
  useCallback,
  Children,
  isValidElement,
  cloneElement,
  useContext
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
import { DebugContext } from "../App.js";

PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;
const isSafari = window.safari !== undefined;
if(isSafari){
    PIXI.settings.PREFER_ENV = PIXI.ENV.WEBGL;
}

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

export function SnakeView({ style, options, gameTick, children}) {
  const showDebug = useContext(DebugContext)
  const [parentDiv, parentSize] = useOnResizeComponent();
  const textureLoaded = useRef(false);
  const [sprites, setSprites] = useState(null);
  const [scenery, setScenery] = useState([]);
  const [visuals, setVisuals] = useState({ u: 1, uu: 1});
  
  useEffect(() => {
    // console.log(parentSize);
    const [lwwU, lhhU] = options.levelSize || [14,10]
    const shipAreaU = options?.levelMarginTop || 2;
    const floorAreaU = options?.levelMarginBot || 1;
    const totalFieldWidthU = lwwU
    const totalFieldHeightU = lhhU + shipAreaU + floorAreaU

    const tileSize = 8;
    const tilesHeights = tileSize * totalFieldHeightU
    const tilesWidths = tileSize * totalFieldWidthU
    const uHeight = parentSize.height / tilesHeights
    const uWidth = parentSize.width / tilesWidths

    const u = Math.min(uWidth,uHeight);
    const uu = u * tileSize;
    const tilesHeightsPXU = lhhU * uu
    const tilesWidthsPXU = lwwU * uu

    const left = 0.5*(parentSize.width - tilesWidthsPXU)
    const top = floorAreaU * uu + 0.5*(parentSize.height - tilesHeightsPXU)

    const vis = {
      u,
      uu,
      pxMarginTop: top,
      pxMarginLeft: left,
      pxMarginRight: left + tilesWidthsPXU,
      pxMarginBot: top + tilesHeightsPXU,
      pxArea: [tilesWidthsPXU,tilesHeightsPXU], 
      uArea:[lwwU,lhhU], 
    }
    setVisuals(vis)
    // console.log(vis)
  }, [parentSize, options.levelSize]);

  const u = visuals.u
  const uu = visuals.uu
  const top = visuals.pxMarginTop
  const bot = visuals.pxMarginBot
  const left = visuals.pxMarginLeft
  const right = visuals.pxMarginRight

  const advanceScenery = (spawn) => {
    if (spawn) {
      let arr = [];
      for (let i = 0; i < options.levelSize[0]; i++) {
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
          if (e.x < 0) return { 
            ...e, 
            x: Math.floor(options.levelSize[0]), 
            n: Math.floor(Math.random() * 6) 
          };
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
          const _sprites = { snake: s[0], scene: s[1], items: s[2], entity: s[3]}
          setSprites(_sprites);
          advanceScenery(true);
          console.log("sprites loaded");
          console.log(_sprites);
        }
      );


    }
  }, []);

  useEffect(()=>{
    advanceScenery(false);
  },[gameTick])



  return (
    <div
      style={style}
      ref={parentDiv}
      className="View SnakeView"
    >
      {sprites && (
        <Stage
          width={parentSize.width || 0}
          height={parentSize.height || 0} 
          options={{
            backgroundAlpha: 0,
          }}
        >

          <TilingSprite
            texture={sprites.scene.water}
            scale={{ x: u, y: u }}
            height={8}
            width={parentSize.width + uu}
            y={top - uu}
            x={gameTick % 2 ? -uu : 0}
          />
          <TilingSprite
            texture={sprites.scene.sand}
            scale={{ x: u * 2, y: u * 2 }}
            height={parentSize.height}
            width={parentSize.width + uu}
            y={bot}
            x={options?.scrolling && gameTick % 2 ? -uu/2 : 0}
          />
          <TilingSprite
            texture={sprites.scene.gravel}
            scale={{ x: -u, y: u }}
            width={left/u}
            height={parentSize.height}
            y={0}
            x={left}
          />
          <TilingSprite
            texture={sprites.scene.gravel}
            scale={{ x: u, y: u }}
            width={left/u}
            height={parentSize.height}
            y={0}
            x={right}
          />
          
          {scenery.map((e, i, a) => {
            if (e.type === "seaweed") {
              return (
                <Container
                  key={`snr_${i}`}
                  y={bot}
                  x={left + e.x * uu}
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

          <Container 
            x={left}
            y={top}
          >
            {children && Children.map(children, child => {
              // Checking isValidElement is the safe way and avoids a
              // typescript error too.
              if (isValidElement(child)) {
                return cloneElement(child, { 
                  visuals:{
                    u: uu,
                    sprites: sprites,
                    scrolling: options?.scrolling,
                  }
                });
              }
              return child;
            })}
          </Container>

          {showDebug && (
            <>
              {options.levelSize && <Graphics draw={(g)=>{
                g.clear()
                g.lineStyle(2,0xff0000,1)
                g.drawRect(
                  left,
                  top,
                  visuals.pxArea[0],
                  visuals.pxArea[1]
                )
              }} />}
  
              <DebugGrid 
                u={uu / 2} 
                ux={left}
                uy={top}
                uw={visuals.uArea[0]*2}  
                uh={visuals.uArea[1]*2} 
              />
            </>
          )}
        </Stage>
      )}
      {showDebug &&<div className="debugInfo">
        <p>{JSON.stringify({
          gameTick, 
          pxMarginLeft:visuals.pxMarginLeft, 
          pxMarginLeft:visuals.pxMarginTop, 
          areaPx:JSON.stringify(visuals.pxArea)})}</p>
      </div>}
    </div>
  );
}

export function Snake({ where, length, direction, onAdvance, tick, options, visuals, selfSprite = false}) {
  const [path, setPath] = useState(null);

  //spawn
  useEffect(() => {
    // if (path) return;
    const spawn = where;
    const dd = direction;
    const px = dd === "right" ? -1 : dd === "left" ? 1 : 0;
    const py = dd === "up" ? 1 : dd === "down" ? -1 : 0;
    let poss = [];
    for (let i = 0; i < length; i++)
      poss.push({
        x: spawn[0] + px * i,
        y: spawn[1] + py * i,
        d: dirToIdx[dd],
      });
    console.log("new spawn", poss);
    setPath(poss);
  }, [where]);

  // //turn
  // useEffect(() => {
  //   if(dir === 'left' && direction === 'right') return;
  //   if(dir === 'right' && direction === 'left') return;
  //   if(dir === 'down' && direction === 'up') return;
  //   if(dir === 'up' && direction === 'down') return;
  //   setDir(direction);
  // }, [direction]);

  // //grow
  // useEffect(() => {
  //   if (!visuals) return;
  //   const ll = length;
  //   if (len >= 3) {
  //     const tailGrow = { ...path[ll - 2], d: path[ll - 3].d };
  //     const nextPath = [...path, tailGrow];
  //     setPath(nextPath);
  //   }
  // }, [length]);

  //advance @ tick
  useEffect(() => {
    if (!path) return;
    if(tick.speed === 0) return;
    if(tick.value % tick.speed) return;
    //offsets for next move based on direction
    const pxx = options?.scrolling ? -(1/tick.speed) : 0;
    const px = direction === "right" ? 1 : direction === "left" ? -1 : 0;
    const py = direction === "down" ? 1 : direction === "up" ? -1 : 0;

    //snake segments from head to just before tail
    const tailMove = { ...path[length - 2], d: path[length - 3].d };
    const interMove = path.slice(0, length - 2);
    const nextPos = {
      x: path[0].x + px,
      y: path[0].y + py,
      d: dirToIdx[direction],
    };
    const nn = [nextPos, ...interMove, tailMove];
    const nextMove = nn.map((p) => {
      return { ...p, x: p.x + pxx };
    });
    setPath(nextMove);

    // console.log(nextMove);
    if (onAdvance) onAdvance(nextMove);
  }, [tick.value]);

  const uu = visuals.u;
  const [sprites,setSprites] = useState(null)
  const textureLoaded = useRef(false)

  useEffect(()=>{
    if (selfSprite) {
      if(!textureLoaded.current){
        console.log("load sprites snake")
        textureLoaded.current = true;
        const tex = PIXI.BaseTexture.from(tiles_img);
        const snake_SS = new PIXI.Spritesheet(tex, snake_atlas);
        snake_SS.parse().then((r)=>{
          setSprites(r)
        })
      } 
    }
    else {
      setSprites(visuals.sprites.snake)
    }
  },[selfSprite])

 
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
      {path && sprites &&
        path.map((p, i, a) => {
          const i_p = i - 1 < 0 ? null : i - 1;
          const isCorner =
            i_p === null ? false : i === length - 1 ? false : p.d !== a[i_p].d;
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
              : idxToSprite(i, length);

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
        g.lineStyle(2, yy % 2 ? 0xff0000 : 0x0000ff, 0.3);
        g.moveTo(ux, uy + yy * u);
        g.lineTo(ux + uw * u, uy + yy * u);
      }
      //vert
      for (let xx = 0; xx < uw; xx++) {
        g.lineStyle(2, xx % 2 ? 0xff0000 : 0x0000ff, 0.3);
        g.moveTo(ux + xx * u, uy);
        g.lineTo(ux + xx * u, uy + uh * u);
      }
    },
    [u, ux, uy, uw, uh]
  );

  return <Graphics draw={draw} />;
}

export function SnakeLoadbar ({type='circle', tick = null, autoTickSpeed = 200, length = 8, area=5}){
  const showDebug = useContext(DebugContext)
  
  const [ref, cvSize] = useOnResizeComponent()
  const u = Math.floor(cvSize.width / area);

  const [_tick, setTick] = useState(0)
  const [dir, setDir] = useState('right');
  const [spawn, setSpawn] = useState([0,0])

  const intervalId = useRef(null)
  const [onAdvance,setOnAdvance] = useState()
  
  useEffect(()=>{
    const field = [
      Math.max(1 , Math.floor(cvSize.width/u)), 
      Math.max(1 , Math.floor(cvSize.height/u))
    ]
    setDir('right')

    if(tick === null){
      setTick(0)
      intervalId.current = setInterval(()=>{
        setTick(t => t+1)
      },autoTickSpeed)
    }
    
    setOnAdvance(()=>{
      return (poss)=>{
        const head = poss[0]
        if(idxToDir[head.d] === 'right'){
          if(head.x >= field[0]-1) setDir('down')
        }
        else if(idxToDir[head.d] === 'down'){
          if(head.y >= field[1]-1) setDir('left')
        }
        else if(idxToDir[head.d] === 'left'){
          if(head.x <= 0) setDir('up')
        }
        else if(idxToDir[head.d] === 'up'){
          if(head.y <= 0) setDir('right')
        }
      }
    })

    setSpawn(type === 'line' 
    ? [field[0]-1,0] 
    : [0,0])

    return (()=>{
      clearInterval(intervalId.current)
    })
  },[cvSize,length,area,autoTickSpeed])


  return <div ref={ref} className='View SnakeLoadbar'>
        <Stage
          width={cvSize.width}
          height={cvSize.height}
          options={{backgroundAlpha: 0}}>
            <Snake 
                where={spawn} 
                length={length} 
                direction={dir}
                visuals={{u}}
                tick={{value:tick !== null ? tick : _tick, speed: type ==='circle' ? 1 : 0}}
                onAdvance={onAdvance}
                selfSprite={true}
            />
            
            {showDebug && <DebugGrid u={u}/>}
        </Stage>
       
        {showDebug &&<div className="debugInfo">
        <p>{JSON.stringify({
          size:cvSize, spawn, length, direction:dir})}</p>
      </div>}
    </div>
}