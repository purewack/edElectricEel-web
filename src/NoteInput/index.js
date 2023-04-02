import piano_white from "./svg/piano_white.svg";
import piano_black from "./svg/piano_black.svg";
import piano_body from "./svg/piano_body.svg";

import { useState, useEffect } from "react";
import useOnResizeComponent from "../Hooks.js";
import anime from "animejs";

export default function NoteInput({
  style,
  root = 48,
  count = 12,
  onNoteOn = null,
  onNoteOff = null,
  allowDragging = true,
  showDebug
}) {
  const [sizeRef, size] = useOnResizeComponent();
  const hh = Math.floor(size.height / 2) * 2;
  const ww = hh / 4;

  const rootMIDI = root;
  const naturals = ["C", "D", "E", "F", "G", "A", "B", "C"];
  const sharpsIndex = [-1, 1, 2, -1, 4, 5, 6, -1];
  const naturalRoot = (rootMIDI % 12);

  const rootLow = Math.floor(rootMIDI/12)*12;
  const octave = rootLow / 12
  const octaves = Math.ceil((naturalRoot + count)/12) ;
  const rangeWhite = octaves*7;
  const rangeActive = [naturalRoot, naturalRoot+count];

  const middleWhere = (rangeActive[1] - rangeActive[0]) / 2
  const middleNow = ww * middleWhere;
  const middleOffset = size.width / 2 - middleNow;
  const middleTransform = `translate(${middleOffset} 0)`;

  const midiNaturals = [
    0,
    0.5,
    1,
    1.5,
    2,
    3,
    3.5,
    4,
    4.5,
    5,
    5.5,
    6
  ];

  const shouldDisableWhite = (i) => {
    const ol = Math.floor(rangeActive[0]/12)*7
    const oh = Math.floor(rangeActive[1]/12)*7
    const rl = midiNaturals[rangeActive[0] % 12] + ol
    const rh = midiNaturals[rangeActive[1] % 12] + oh
    if(i >= rl && i < rh) return false
    return true
  }

  const shouldDisableBlack = (i) => {
    const ol = Math.floor(rangeActive[0]/12)*7
    const oh = Math.floor(rangeActive[1]/12)*7
    const rl = midiNaturals[rangeActive[0] % 12] + ol
    const rh = midiNaturals[rangeActive[1] % 12] + oh
    if(i > rl && i <= rh) return false
    return true
  }

  const nameWhite = (i) => naturals[i % 7] + Math.floor(octave + i / 7);
  const nameBlack = (i) =>
    i !== -1
      ? naturals[(i - 1) % 7] + "#" + Math.floor(octave + (i - 1) / 7)
      : null;

  const handleNoteSignal = (name, state) => {
    if (state && onNoteOn) onNoteOn(name);
    else if (!state && onNoteOff) onNoteOff(name);
  };

  return (
    <div ref={sizeRef} 
      style={style}>
    <svg
      height={'100%'}
      width={'100%'}
      className="View NoteInput"
    >
      <filter id='pianoKeyFilter_disabled'>
        <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="0.1 0 0 0 0
                      0 0.1 0 0 0
                      0 0 0.1 0 0
                      0 0 0 1 0" /> 
      </filter>
      <filter id='pianoKeyFilter_hover'>
        <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="0.1 0.1 0.1 0.5 0
                      0.1 0.1 0.1 0.5 0
                      0 0 0 0 0
                      0 0 0 1 0" /> 
      </filter>
      <filter id='pianoKeyFilter_press'>
        <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="0.1 0.1 0.1 0 0.1
                      0.8 1 0.8 0.5 0
                      0.1 0.1 0.1 0 0.1
                      0 0 0 1 0" /> 
      </filter>
      <g style={{ transition: "transform 1s" }} transform={middleTransform}>
        <image height={hh} x={-ww} href={piano_body} />
        <rect
          x={-size.width - ww / 2}
          width={size.width}
          height={hh}
          fill="#241100"
        />

        <image height={hh} x={ww * rangeWhite} href={piano_body} />
        <rect
          x={ww * rangeWhite + ww / 2}
          width={size.width}
          height={hh}
          fill="#241100"
        />
        {[...Array(rangeWhite)].map((e, i) => {
          return (
            <PianoKey
              key={`white_${i}`}
              index={i}
              disabled={shouldDisableWhite(i)}
              name={nameWhite(i)}
              size={size}
              whiteKey={true}
              noteSignal={handleNoteSignal}
              allowDragging={allowDragging}
            />
          );
        })}
        {[...Array(rangeWhite)].map((e, i) => {
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
              allowDragging={allowDragging}
            />
          ) : null;
        })}
      </g>
      {showDebug && <>
        <text className="debugLabel">{JSON.stringify({
          size
        })}
        </text>
        <text y={16} className="debugLabel">{JSON.stringify({
            octave,
            octaves,
            rootLow,
            naturalRoot
          })}
        </text>
        <text y={32} className="debugLabel">{JSON.stringify({
            rangeActive,
            rangeWhite
          })}
        </text>
      </>}
    </svg>
  </div>);
}

function PianoKey({ index, name, whiteKey, disabled, size, noteSignal,allowDragging }) {
  const [active, setActive] = useState(false);
  const [hover, setHover] = useState(false);

  const hh = Math.floor(size.height / 2) * 2;
  const ww = hh / 4;
  const xx = index * ww - (!whiteKey ? ww / 2.25 : 0);

  const filter = disabled
    ? "url(#pianoKeyFilter_disabled)"
      : hover
      ? `url(#pianoKeyFilter_${active ? 'press' : 'hover'})`
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
    if(disabled) return
    noteSignal && noteSignal(name, true, disabled);
    setActive(true);
  };
  const onNoteOff = () => {
    if(disabled) return
    noteSignal && noteSignal(name, false, disabled);
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
        onPointerDown={onNoteOn}
        onPointerUp={onNoteOff}
        onPointerEnter={(ev) => {
          setHover(true);
          if(!allowDragging) return
          if (ev.buttons === 1 && !active) {
            onNoteOn(ev);
          }
        }}
        onPointerLeave={(ev) => {
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
