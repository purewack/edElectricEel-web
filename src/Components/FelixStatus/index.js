import body from "./felix/body.png";
import arm from "./felix/arm.png";
import foot from "./felix/foot1.png";
import eye from "./felix/eye.png";
import helm from "./felix/helmet.png";
import tongue from "./felix/tongue.png";
import mouthO from "./felix/mouthO.png";
import mouthS from "./felix/mouthStress.png";
import mouthH from "./felix/mouthHappy.png";
import { useContext, useEffect, useRef, useState } from "react";


import { DebugContext } from "../App";

export default function FelixStatus({ style, animType = "idle" }) {
  const showDebug = useContext(DebugContext)
  const ref = useRef(null);
  const container = useRef(null);
  const sprites = useRef(null);
  const states = useRef({});
  const animId = useRef({});

  const onDrawSprite = (ctx, sprite, scale, pos, rot) => {
    ctx.save();
    ctx.scale(scale[0], scale[1]);
    ctx.translate(pos[0], pos[1]);
    ctx.rotate(rot);
    ctx.drawImage(sprite, -sprite.width * pos[2], -sprite.height * pos[3]);
    ctx.restore();
  };

  const onFrameStart = (dt, cv, ctx) => {
    const cvr = getComputedStyle(container.current);
    cv.width = parseFloat(cvr.width);
    cv.height = parseFloat(cvr.height);
    ctx.clearRect(0, 0, cv.width, cv.height);

    const s =
      Math.min(
        cv.width / sprites.current.body.width,
        cv.height / sprites.current.body.height
      ) / 1.5;
    ctx.imageSmoothingEnabled = false;

    ctx.translate(cv.width / 2, cv.height / 2);

    return s;
  };
  const onFrameEnd = (dt, cv, ctx, stats) => {
    if(showDebug) {
      ctx.translate(-cv.width / 2, -cv.height / 2 + 12);
      ctx.font = "12px Courier new";
      ctx.fillStyle = "red";
      ctx.fillText(`timer: ${stats.timer}, ${stats.type} :${dt}`, 0, 0);
    }
  };

  useEffect(() => {
    if (!sprites.current) {
      const spriteImg = [body, arm, foot, eye, helm, tongue, mouthO, mouthS, mouthH];
      const collection = Array(0);
      for (let i = 0; i < spriteImg.length; i++) {
        const im = new Image();
        im.src = spriteImg[i];
        collection.push(im);
      }
      sprites.current = {
        body: collection[0],
        arm: collection[1],
        leg: collection[2],
        eye: collection[3],
        helm: collection[4],
        tongue: collection[5],
        mouthO: collection[6],
        mouthS: collection[7],
        mouthH: collection[8]
      };
      console.log("sprites loaded");
      console.log(sprites.current);
    }
  }, []);

  useEffect(() => {
    switch (animType) {
      default:
        states.current = {
          type: "idle",
          timer: 400,
          blink: false,
          dt: 0,
          onTick: (ctx, s, stats) => {
            stats.blink = false;
            if (Math.random() > 0.9) {
              stats.blink = true;
            }
            const dt = (stats.dt += 1);
            const img = sprites.current;
            onDrawSprite(ctx, img.body, [s, s], [0, 0, 0.5, 0.5], 0);
            onDrawSprite(ctx, img.arm, [s, s], [-9.5, 1.5, 0.5, 0.1], 0);
            onDrawSprite(ctx, img.arm, [s, s], [9.5, 1.5, 0.5, 0.1], 0);
            onDrawSprite(
              ctx,
              img.leg,
              [s, s],
              [-12, 15 + Math.floor(Math.sin(dt) / 2), 0.5, 0.1],
              0
            );
            onDrawSprite(
              ctx,
              img.leg,
              [-s, s],
              [-12, 15 + Math.floor(Math.cos(dt) / 2), 0.5, 0.1],
              0
            );
            if (!stats.blink) {
              onDrawSprite(ctx, img.eye, [s, s], [-6.5, -8, 0.5, 0.5], 0);
              onDrawSprite(ctx, img.eye, [s, s], [6.5, -8, 0.5, 0.5], 0);
            }
          }
        };
        break;

        case "happy":
          states.current = {
            type: "happy",
            timer: 60,
            dt: 0,
            onTick: (ctx, s, stats) => {
              const dt = stats.dt;
              stats.dt += 1
              const img = sprites.current;
              onDrawSprite(ctx, img.body, [s, s], [0, 0, 0.5, 0.5], 0);
              onDrawSprite(ctx, img.leg, [s, s], [-12, 15, 0.5, 0.1], 0);
              onDrawSprite(ctx, img.leg, [-s, s], [-12, 15, 0.5, 0.1], 0);
              onDrawSprite(ctx, img.mouthH, [s, s], [0, -6, 0.5, 0], 0);
              onDrawSprite(ctx, img.arm, [s, s], [-9.5, 1.5, 0.5, 0.1], Math.PI*0.5 + Math.sin(dt/3));
              onDrawSprite(ctx, img.arm, [s, s], [9.5, 1.5, 0.5, 0.1],  -Math.PI*0.5 - Math.sin(dt/3));
              if((dt/3) % 15){
              onDrawSprite(ctx, img.eye, [s, s], [-6.5, -8, 0.5, 0.5],0);
              onDrawSprite(ctx, img.eye, [s, s], [6.5, -8, 0.5, 0.5],0);
              }
            }
          };
        break;

        case "tired":
        case "dazed":
          states.current = {
            type: "tired",
            timer: 80,
            rot: [0, 0],
            dt: 15,
            onTick: (ctx, s, stats) => {
              stats.rot[0] += 0.3;
              stats.rot[1] -= 0.33;

              const img = sprites.current;
              onDrawSprite(ctx, img.body, [s, s], [0, 0, 0.5, 0.5], 0);
              onDrawSprite(ctx, img.arm, [s, s], [-9.5, 1.5, 0.5, 0.1], -0.3);
              onDrawSprite(ctx, img.arm, [s, s], [9.5, 1.5, 0.5, 0.1], 0.3);
              onDrawSprite(ctx, img.leg, [s, s], [-12, 15, 0.5, 0.1], 0.3);
              onDrawSprite(ctx, img.leg, [-s, s], [-12, 15, 0.5, 0.1], 0.3);

              onDrawSprite(
                ctx,
                img.eye,
                [s, s],
                [-6.5, -8, 0.5, 0.5],
                stats.rot[0]
              );
              onDrawSprite(
                ctx,
                img.eye,
                [s, s],
                [6.5, -8, 0.5, 0.5],
                stats.rot[1]
              );
              onDrawSprite(ctx, img.tongue, [s, s], [0.5, -5, 0.5, 0], 0);
              if(animType !== 'tired'){
                onDrawSprite(
                  ctx,
                  img.helm,
                  [s, s],
                  [0, stats.dt * 2 - 42, 0.5, 1.0],
                  0
                );
                if (stats.dt) stats.dt -= 1;
              }
            }
          };
          break;

        case "extract_begin":
          states.current = {
            type: "extract_begin",
            timer: 150,
            dt: 10,
            onTick: (ctx, s, stats) => {
              const dt = stats.dt;

              const img = sprites.current;
              onDrawSprite(ctx, img.body, [s, s], [0, 0, 0.5, 0.5], 0);
              onDrawSprite(ctx, img.arm, [s, s], [-9.5, 1.5, 0.5, 0.1], 0);
              onDrawSprite(ctx, img.arm, [s, s], [9.5, 1.5, 0.5, 0.1], 0);
              onDrawSprite(ctx, img.leg, [s, s], [-12, 15, 0.5, 0.1], 0);
              onDrawSprite(ctx, img.leg, [-s, s], [-12, 15, 0.5, 0.1], 0);
              onDrawSprite(ctx, img.eye, [s, s], [-6.5, -8, 0.5, 0.5], -0.5);
              onDrawSprite(ctx, img.eye, [s, s], [6.5, -8, 0.5, 0.5], -0.9);
              // onDrawSprite(ctx, img.tongue, [s, s], [0.5, -5, 0.5, 0], 0);
              onDrawSprite(ctx, img.helm, [s, s], [0, -12 - dt * 2, 0.5, 1.0], 0);
              if (dt) stats.dt -= 1;
            }
          };
          break;

        case "extract_low":
        case "extract_mid":
        case "extract_high":
          const p =
            animType === "extract_mid" ? 1 : animType === "extract_high" ? 2 : 0;
          states.current = {
            type: "extract " + p,
            timer: 80,
            power: p,
            dt: 0,
            onTick: (ctx, s, stats) => {
              stats.dt += 1;
              const dt = stats.dt;
              const img = sprites.current;
              const pwr = stats.power;
              onDrawSprite(ctx, img.body, [s, s], [0, 0, 0.5, 0.5], 0);
              onDrawSprite(
                ctx,
                img.arm,
                [s, s],
                [-9.5, 1.5, 0.5, 0.1],
                pwr > 0 ? Math.sin(dt / (pwr === 2 ? 2 : 5)) / 3 + 0.5 : 0
              );
              onDrawSprite(
                ctx,
                img.arm,
                [s, s],
                [9.5, 1.5, 0.5, 0.1],
                pwr > 0 ? -Math.sin(dt / (pwr === 2 ? 3 : 6)) / 3.5 - 0.5 : 0
              );
              onDrawSprite(
                ctx,
                img.leg,
                [s, s],
                [-12, 15 + (pwr === 2 ? Math.sin(dt) / 2 : 0), 0.5, 0.1],
                0
              );
              onDrawSprite(
                ctx,
                img.leg,
                [-s, s],
                [-12, 15 + (pwr === 2 ? Math.cos(dt) / 2 : 0), 0.5, 0.1],
                0
              );
              if (pwr > 0) {
                onDrawSprite(
                  ctx,
                  img.eye,
                  [s, s],
                  [-6.5, -8, 0.5, 0.5],
                  pwr === 2 ? dt / 4 : 3 + Math.sin(dt / 3) / 2
                );
                onDrawSprite(
                  ctx,
                  img.eye,
                  [s, s],
                  [6.5, -8, 0.5, 0.5],
                  -0.3 + Math.sin(dt / 2) / 2
                );
              }
              if (pwr === 2) {
                onDrawSprite(ctx, img.mouthO, [-s, s], [0, -6, 0.5, 0], 0);
                onDrawSprite(
                  ctx,
                  img.tongue,
                  [dt & 4 ? s : -s, s],
                  [0.5, -5, 0.5, 0],
                  0
                );
              } else {
                onDrawSprite(ctx, img.mouthS, [-s, s], [0, -6, 0.5, 0], 0);
              }
              onDrawSprite(
                ctx,
                img.helm,
                [s, s],
                [
                  pwr > 1 ? Math.floor(-Math.sin(dt) + 0.5) : 0,
                  Math.floor(Math.cos(pwr === 0 ? dt / 3 : dt) / 2 - 12),
                  0.5,
                  1.0
                ],
                0
              );
            }
          };
          break;
    }

    if (animId.current.interval) clearInterval(animId.current.interval);
    animId.current.interval = setInterval(() => {
      const cv = ref.current;
      const ctx = cv.getContext("2d");
      animId.current.frame = window.requestAnimationFrame((dt) => {
        const s = onFrameStart(dt, cv, ctx);
        if (states.current.onTick)
          states.current.onTick(ctx, s, states.current);
        onFrameEnd(dt, cv, ctx, states.current);
      });
    }, states.current.timer);
  }, [animType,showDebug]);

  return (
    <div className='View FelixStatus' ref={container} style={style} >
      <canvas ref={ref} />
    </div>
  );
}
