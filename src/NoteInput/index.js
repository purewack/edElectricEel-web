import piano_white from "./svg/piano_white.svg";
import piano_black from "./svg/piano_black.svg";
import piano_body from "./svg/piano_body.svg";

import { useState, useLayoutEffect, useEffect } from "react";
import useOnResizeComponent from "../Hooks.js";
import anime from "animejs";

export default function NoteInput({
  style,
  keys = 8,
  range = null,
  octave = 4,
  onNoteOn = null,
  onNoteOff = null,
  showDebug
}) {
  const [sizeRef, size] = useOnResizeComponent();
  const hh = Math.floor(size.height / 2) * 2;
  const ww = hh / 4;

  const avRange = range ? range[1] - range[0] : keys;
  const middleWhere =
    avRange === 0 || !range ? keys / 2 : (avRange - 2) / 2 + range[0];

  const middleNow = ww * middleWhere;
  const middleOffset = size.width / 2 - middleNow;
  const middleTransform = `translate(${middleOffset} 0)`;

  const naturals = ["C", "D", "E", "F", "G", "A", "B", "C"];
  const sharpsIndex = [-1, 1, 2, -1, 4, 5, 6, -1];

  const handleNoteSignal = (name, state) => {
    if (state && onNoteOn) onNoteOn(name);
    else if (!state && onNoteOff) onNoteOff(name);
  };

  const enabledIndexes = range ? range : [0, keys + 1];
  const shouldDisableWhite = (i) =>
    !(i + 1 >= enabledIndexes[0] && i + 1 < Math.floor(enabledIndexes[1]));
  const shouldDisableBlack = (i) =>
    !(i + 1 > enabledIndexes[0] && i + 1 < enabledIndexes[1]);
  const nameWhite = (i) => naturals[i % 7] + Math.floor(octave + i / 7);
  const nameBlack = (i) =>
    i !== -1
      ? naturals[(i - 1) % 7] + "#" + Math.floor(octave + (i - 1) / 7)
      : null;

  return (
    <svg
      ref={sizeRef}
      style={style}
      className="View NoteInput"
    >
      <g style={{ transition: "transform 1s" }} transform={middleTransform}>
        <image height={hh} x={-ww} href={piano_body} />
        <rect
          x={-size.width - ww / 2}
          width={size.width}
          height={hh}
          fill="#241100"
        />

        <image height={hh} x={ww * keys} href={piano_body} />
        <rect
          x={ww * keys + ww / 2}
          width={size.width}
          height={hh}
          fill="#241100"
        />
        {[...Array(keys)].map((e, i) => {
          return (
            <PianoKey
              key={`white_${i}`}
              index={i}
              disabled={shouldDisableWhite(i)}
              name={nameWhite(i)}
              size={size}
              whiteKey={true}
              noteSignal={handleNoteSignal}
            />
          );
        })}
        {[...Array(keys)].map((e, i) => {
          const ii = sharpsIndex[i % 7];
          return i % 7 === ii ? (
            <PianoKey
              key={`black_${i}`}
              index={i}
              name={nameBlack(i)}
              disabled={shouldDisableBlack(i)}
              size={size}
              whiteKey={false}
              noteSignal={handleNoteSignal}
            />
          ) : null;
        })}
      </g>
      {showDebug && <text className="debugLabel">{JSON.stringify(size)}</text>}
    </svg>
  );
}

function PianoKey({ index, name, whiteKey, disabled, size, noteSignal }) {
  const [active, setActive] = useState(false);
  const [hover, setHover] = useState(false);

  const hh = Math.floor(size.height / 2) * 2;
  const ww = hh / 4;
  const xx = index * ww - (!whiteKey ? ww / 2.25 : 0);

  const filter = disabled
    ? "contrast(0.3)"
    : hover
    ? `contrast(${active ? 0 : 0.5}) sepia(100%) hue-rotate(${
        active ? 90 : 10
      }deg)`
    : null;

  const styleText = {
    stroke: "none",
    fill: "black",
    userSelect: "none",
    dominantBaseline: "hanging"
  };

  const [cName, setCName] = useState("PianoKey spawn");
  useEffect(() => {
    anime({
      targets: ".PianoKey.spawn",
      easing: "easeInOutSine",
      transform: [`translate(0 ${-hh})`, "translate(0 0)"],
      delay: anime.stagger(30),
      duration: 250,
      complete: () => {
        setCName("PianoKey");
      }
    });
  });

  const onNoteOn = (e) => {
    if (disabled) return;
    //prevent animation retoggling mouse event by compensating hitbox
    // const hhh = (whiteKey ? hh : hh * (19 / 32)) * 0.87;
    // const yy = getPositionInElement(e.pageX, e.pageY, e.target).y;
    // if (yy < hhh) {
    noteSignal && noteSignal(name, true);
    setActive(true);
    // }
  };
  const onNoteOff = () => {
    if (disabled) return;
    noteSignal && noteSignal(name, false);
    setActive(false);
  };
  return (
    <g className={cName}>
      <image
        href={whiteKey ? piano_white : piano_black}
        y={0}
        x={xx}
        width={ww}
        filter={filter}
        transform={active ? "translate(0 0)" : "translate(0 -4)"}
        onMouseDown={onNoteOn}
        onMouseUp={onNoteOff}
        onMouseEnter={(ev) => {
          setHover(true);
          if (ev.buttons === 1 && !active) {
            onNoteOn(ev);
          }
        }}
        onMouseLeave={(ev) => {
          setHover(false);
          if (ev.buttons === 1 && active) {
            onNoteOff(ev);
          }
        }}
      />
      {whiteKey && (
        <text style={styleText} fontSize={ww / 2} y={hh - ww} x={xx + ww / 4}>
          {name}
        </text>
      )}
    </g>
  );
}

// const keyboardKeys = {
//   a: "C",
//   s: "D",
//   d: "E",
//   f: "F",
//   g: "G",
//   h: "A",
//   j: "B",
//   k: "C",

//   w: "C#",
//   e: "D#",
//   t: "F#",
//   y: "G#",
//   u: "A#"
// };

// useEffect(() => {
//   const handleDown = (ev) => {
//     const k = keyboardKeys[ev.key];
//     if (!k) return;
//     handleNoteSignal(k + octave.toString(), true);
//   };
//   const handleUp = (ev) => {
//     const k = keyboardKeys[ev.key];
//     if (!k) return;
//     handleNoteSignal(k + octave.toString(), false);
//   };
//   window.addEventListener("keydown", handleDown);
//   window.addEventListener("keyup", handleUp);

//   return () => {
//     window.removeEventListener("keydown", handleDown);
//     window.removeEventListener("keyup", handleUp);
//   };
// }, []);
