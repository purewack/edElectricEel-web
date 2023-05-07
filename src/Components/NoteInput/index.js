import piano_white from "./svg/piano_white.svg";
import piano_black from "./svg/piano_black.svg";
import piano_body from "./svg/piano_body.svg";

import { useState, useEffect, useContext, useCallback } from "react";
import useOnResizeComponent, { respellPitch } from "../../Helpers/Hooks";
import anime from "animejs";

import { DebugContext } from "../../App";

export default function NoteInput({
  root = 60,
  count = 12,
  showRange = null,
  showOctave = true,
  showName = true,
  onNoteOn = null,
  onNoteOff = null,
  allowNoteDragging = true,
  scrollPx = 0,
  noSpawnAnimation = undefined,
  className
}) {
  const showDebug = useContext(DebugContext);
  const [sizeRef, size] = useOnResizeComponent();
  const [scrollOffset, setScrollOffset] = useState(0)
  const [scrolling, setScrolling] = useState({willScroll: false, dx: 0})
  const hh = Math.floor(size.height / 2) * 2;
  const ww = hh / 4;

  const rootMIDI = root-12;
  const naturals = ["C", "D", "E", "F", "G", "A", "B", "C"];
  const sharpsIndex = [-1, 1, 2, -1, 4, 5, 6, -1];
  const naturalRoot = (rootMIDI % 12);

  const rootLow = Math.floor(rootMIDI/12)*12;
  const octave = rootLow / 12
  const octaves = Math.ceil((naturalRoot + count)/12) ;
  const rangeWhite = octaves*7;
  const rangeActive = [naturalRoot, naturalRoot+count];

  const middleWhere = naturalRoot + (rangeWhite / 2)
  const middleNow = ww * middleWhere;
  const middleOffset = (size.width / 2 - middleNow);
  const middleTransform = `translate(${middleOffset + scrollOffset + scrollPx} 0)`;

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

  const shouldHighlight = (nm) => {
    let state = true;
    showRange.forEach(e => {
      if(respellPitch(e,'sharp') === nm) {
        state = false
        return
      }
    });
    return state
  }

  const nameWhite = (i) => naturals[i % 7] + Math.floor(octave + i / 7);
  const nameBlack = (i) =>
    i !== -1
      ? naturals[(i - 1) % 7] + "#" + Math.floor(octave + (i - 1) / 7)
      : null;

  const handleNoteSignal = (name, state) => {
    if (state && onNoteOn) {
      onNoteOn(name);
    }
    else if (!state && onNoteOff) {
      onNoteOff(name, scrolling?.shouldScroll);
    }
    if(state) setScrolling({willScroll: true, dx:0})
  };

  const handleScroll = (ev)=>{
    if(!scrolling.willScroll) return
    if(!allowNoteDragging){
      let dx = ev.movementX
      setScrolling(s=>{
        let ss = {...s}
        ss.dx += dx
        if(Math.abs(ss.dx) > 3) ss.shouldScroll = true
        if(ss.shouldScroll) setScrollOffset(o => {return o+ev.movementX})
        return ss
      })
    }
  }
  const cancelScroll = (ev)=>{
    setScrolling({willScroll:false, dx:0, shouldScroll:false})
  }
  
  return (
    <div className={"View NoteInput " + className} 
      ref={sizeRef} 
    >
    <svg>
      <filter id='pianoKeyFilter_disabled'>
        <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="0.1 0 0 0 0.1
                      0 0.1 0 0 0.1
                      0 0 0.1 0 0.1
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
      <g transform={middleTransform} 
        onPointerMove={handleScroll} 
        onPointerCancel={cancelScroll}
        onPointerLeave={cancelScroll}
        onPointerUp={cancelScroll}
      >
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
              name={nameWhite(i)}
              disabled={ 
                showRange 
                ? shouldHighlight(nameWhite(i)) 
                : shouldDisableWhite(i)
              }
              size={size}
              whiteKey={true}
              noteSignal={handleNoteSignal}
              allowNoteDragging={allowNoteDragging}
              showOctave={showOctave}
              showName={showName}
              noSpawnAnimation
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
              disabled={ 
                showRange 
                ? shouldHighlight(nameBlack(i)) 
                : shouldDisableBlack(i)
              }
              size={size}
              whiteKey={false}
              noteSignal={handleNoteSignal}
              allowNoteDragging={allowNoteDragging}
              noSpawnAnimation
            />
          ) : null;
        })}
      </g>
    </svg>
    {showDebug &&<div className="debugInfo">
      <p>{JSON.stringify({size})}</p>
      <p>{JSON.stringify({
          octave,
          octaves,
          rootLow,
          naturalRoot
        })}</p>
      <p>{JSON.stringify({
          rangeActive,
          rangeWhite
        })}</p>
      <p>{JSON.stringify({
          middleWhere,
          middleNow,
          middleOffset
        })}</p>
    </div>}
  </div>);
}

function PianoKey({ index, name, whiteKey, disabled, size, noteSignal,allowNoteDragging, showOctave, showName=true, noSpawnAnimation=undefined }) {
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
    if(noSpawnAnimation) return
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
    // if(disabled) return
    noteSignal && noteSignal(name, true, disabled);
    setActive(true);
  };
  const onNoteOff = () => {
    // if(disabled) return
    noteSignal && noteSignal(name, false, disabled);
    setActive(false);
  };

  const endPointer = (ev) => {
    setHover(false);
    if (active) {
      onNoteOff(ev);
    }
  }

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
          if(!allowNoteDragging) return
          if (ev.buttons === 1 && !active) {
            onNoteOn(ev);
          }
        }}
        onPointerLeave={endPointer}
        onPointerCancel={endPointer}
        onPointerOut={endPointer}
        onLostPointerCapture={endPointer}
      />
      {whiteKey && (
        <text style={styleText} fontSize={ww / 2} y={hh - ww} x={xx + ww / 4 + (!showOctave && ww/8)}>
          {showName && (showOctave ? name : name.slice(0,-1))}
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
