import img_symbols from "./img/notes.png";

import { Time } from "tone";
import { useEffect } from "react";
import { useElementSize } from "usehooks-ts";
import anime from "animejs";

function Note({ pos, n, note, len, clef, debug }) {
  const u = pos.u;
  const uu = u * 2;

  //Middle C4:
  const clefOffsets = {
    treble: -2,
    alto: 4,
    bass: 10
  };
  const clefOffset = clefOffsets[clef ? clef : "treble"];

  const isRest = note === "r";
  const isSharp = note[1] === "#";
  const isFlat = note[1] === "b";
  const isAcc = isSharp || isFlat;
  const octave = isAcc ? note[2] : note[1];
  const letter = note[0];

  const noteCode = letter.charCodeAt(0) - "a".charCodeAt(0);

  const octaveStartOffset = -2; //octave boundry is on c not a, go back 2
  const ocvateEndOffset = noteCode < 2 ? 1 : 0; //octave boundry is on c not a, go back 2

  const stave = isRest
    ? 4
    : noteCode +
      octaveStartOffset +
      clefOffset +
      7 * (octave - 4 + ocvateEndOffset);

  const length = Time(len).toFrequency() * 2;

  const xx = pos.noteX + n * u * 2.5;
  const yy = -uu + u / 2 + u * 2 - (u / 2) * stave;
  const xxo = xx + u / 2;
  const yyo = yy + u + u / 2;

  const lowLedgerN = stave < 0 ? Math.ceil(stave / 2) : 0;
  const highLedgerN = stave > 8 ? Math.floor((stave - 8) / 2) : 0;

  const lenToType = {
    1: 0,
    2: 1,
    4: 2,
    8: 3,
    16: 4
  };
  const id = `note_${xx}_${n}`;
  const idAnim = id + "_anim";
  const idAcc = id + "_acc";

  // useEffect(() => {
  //   //console.log({ sig: idAnim, ...pos });
  //   anime({
  //     targets: "." + idAnim,
  //     easing: "easeInOutSine",
  //     direction: "reverse",
  //     duration: 500,
  //     delay: 100
  //   });
  // }, []);

  return (
    <>
      {highLedgerN &&
        [...Array(highLedgerN)].map((e, i) => (
          <line
            x1={xx - u * 0.5}
            x2={xx + u * 1.5}
            y1={u * (-3 - i)}
            y2={u * (-3 - i)}
            strokeWidth={u / 8}
            stroke="gray"
          />
        ))}
      {lowLedgerN &&
        [...Array(-lowLedgerN)].map((e, i) => (
          <line
            x1={xx - u * 0.5}
            x2={xx + u * 1.5}
            y1={u * (3 + i)}
            y2={u * (3 + i)}
            strokeWidth={u / 8}
            stroke="gray"
          />
        ))}
      <defs>
        <clipPath id={id}>
          <rect x={0} y={0} width={uu} height={uu} />
        </clipPath>
        <clipPath id={idAcc}>
          <rect x={0} y={0} width={u * 2} height={u * 4} />
        </clipPath>
      </defs>
      <g className={idAnim}>
        <image
          style={{
            imageRendering: "pixelated",
            transformOrigin: `
            ${xxo}px 
            ${yyo}px 
          `,
            transform: `
            rotateZ(${stave > 4 ? 180 : 0}deg)
            translateY(${isRest ? yy + 2 : yy - 1}px)
            translateX(${xx}px)
          `
          }}
          clipPath={`url(#${id})`}
          href={img_symbols}
          height={uu * 8}
          x={-uu * lenToType[length]}
          y={isRest ? -uu * 2 : stave > 4 ? -uu : 0}
        />
        {isAcc && (
          <image
            style={{
              imageRendering: "pixelated",
              transform: `
            translateY(${yy}px)
            translateX(${xx - u * 0.75}px)
          `
            }}
            clipPath={`url(#${idAcc})`}
            href={img_symbols}
            height={uu * 8}
            x={-uu * (isSharp ? 1 : 2)}
            y={-uu * 4}
          />
        )}
      </g>
      {debug && (
        <>
          <text x={xx} y={0} fill={"red"} fontSize={u}>
            {lowLedgerN + highLedgerN}
          </text>
          <rect
            x={xx}
            y={yy + u}
            width={u}
            height={u}
            stroke="green"
            fill="none"
          />
          <rect
            x={xxo}
            y={yyo}
            width={2}
            height={2}
            stroke="yellow"
            fill="none"
          />
        </>
      )}
    </>
  );
}

function Clef({ pos, type }) {
  const staffToType = {
    treble: 0,
    alto: 1,
    bass: 2
  };

  const u = pos.u;
  const space = pos.clef;
  const yy = u * -2;
  const xx = pos.clefX;

  const style = {
    imageRendering: "pixelated",
    transform: `
      translateY(${yy}px)
      translateX(${xx}px)
    `
  };
  const id = `clef_${xx}`;
  return (
    <>
      <defs>
        <clipPath id={id}>
          <rect
            x={0}
            y={0}
            width={u * 4}
            height={u * (type === "treble" ? 5 : 4)}
          />
        </clipPath>
      </defs>

      <rect
        x={xx}
        y={yy}
        width={space * u}
        height={u * 4}
        stroke="red"
        fill="none"
      />

      <image
        style={style}
        clipPath={`url(#${id})`}
        href={img_symbols}
        height={u * 16 * 2}
        x={-u * 4 * staffToType[type]}
        y={-u * 12}
      />
    </>
  );
}

function Key({ pos, accidentals, key }) {
  const isSharp = accidentals > 0;
  const count = Math.abs(accidentals);
  const flatPattern = [0, 3, -1, 2, -2, 1, -3];
  const sharpPattern = [0, -3, 1, -2, -5, -1, -4];
  const pattern = isSharp
    ? sharpPattern.slice(0, count)
    : flatPattern.slice(0, count);

  const u = pos.u;
  const uu = u * 2;

  const id = `key_${pos.x}`;
  return (
    <>
      <defs>
        <clipPath id={id}>
          <rect x={0} y={0} width={uu} height={uu} />
        </clipPath>
      </defs>
      {pattern.map((p, i) => {
        const pp = p - (isSharp ? -8 : -4);
        const yy = u / 2 - (pp * u) / 2;
        const xx = pos.keyX + (i * u) / 2 - u / 2;
        return (
          <image
            style={{
              imageRendering: "pixelated",
              transform: `
                translateY(${yy}px)
                translateX(${xx}px)
              `
            }}
            clipPath={`url(#${id})`}
            href={img_symbols}
            height={uu * 8}
            x={-uu * (isSharp ? 1 : 2)}
            y={-uu * 4}
          />
        );
      })}
    </>
  );
}

function Meter({ pos, value }) {
  const [bar_beat, bar_len] = value;
  const u = pos.u;
  const x = pos.meterX + u / 4;
  return (
    <>
      <text fontSize={u * 3} y={u * -2} x={x}>
        {bar_beat}
      </text>
      <text fontSize={u * 3} y={u * 0} x={x}>
        {bar_len}
      </text>
    </>
  );
}

function NoteViewSpaces({ pos }) {
  const u = pos.u;
  return (
    <g>
      <line
        strokeWidth={u / 8}
        stroke={"red"}
        y1={0}
        y2={0}
        x1={pos.x}
        x2={pos.x + (pos.barU - 0.25) * u}
      />
      <line
        strokeWidth={u / 8}
        stroke={"green"}
        y1={u * 0.2}
        y2={u * 0.2}
        x1={pos.clefX}
        x2={pos.clefX + pos.clefU * u}
      />
      <line
        strokeWidth={u / 8}
        stroke={"blue"}
        y1={u * 0.4}
        y2={u * 0.4}
        x1={pos.keyX}
        x2={pos.keyX + pos.keyU * u}
      />
      <line
        strokeWidth={u / 8}
        stroke={"green"}
        y1={u * 0.6}
        y2={u * 0.6}
        x1={pos.meterX}
        x2={pos.meterX + pos.meterU * u}
      />
      <line
        strokeWidth={u / 8}
        stroke={"purple"}
        y1={u * 0.8}
        y2={u * 0.8}
        x1={pos.noteX}
        x2={pos.noteX + (pos.noteU - 0.25) * u}
      />
      <line
        strokeWidth={u / 8}
        stroke={"orange"}
        strokeDasharray={u}
        y1={u * -0.2}
        y2={u * -0.2}
        x1={0}
        x2={"100%"}
      />
    </g>
  );
}

export default function NoteView({ data, slide, style, showDebug }) {
  const [sizeRef, { width, height }] = useElementSize();

  // unit size for scaling up (distance between ledger lines)
  const u = height && Math.floor(height / 12);
  let lastBarU = -slide;
  let lastClef = null;
  let lastKey = 0;

  return (
    <div ref={sizeRef}>
      <svg style={style}>
        <g
          transform={`
            translate(0 ${height / 2})
          `}
        >
          {/* stave lines */}
          <g>
            <line
              strokeWidth={u / 8}
              stroke={"gray"}
              y1={u * -2}
              y2={u * -2}
              x1={0}
              x2={"100%"}
            />
            <line
              strokeWidth={u / 8}
              stroke={"gray"}
              y1={u * -1}
              y2={u * -1}
              x1={0}
              x2={"100%"}
            />
            <line
              strokeWidth={u / 8}
              stroke={"gray"}
              y1={u * 0}
              y2={u * 0}
              x1={0}
              x2={"100%"}
            />
            <line
              strokeWidth={u / 8}
              stroke={"gray"}
              y1={u * 1}
              y2={u * 1}
              x1={0}
              x2={"100%"}
            />
            <line
              strokeWidth={u / 8}
              stroke={"gray"}
              y1={u * 2}
              y2={u * 2}
              x1={0}
              x2={"100%"}
            />
          </g>

          {/* bars and bar notes + symbols */}
          {data &&
            data.map((bar, bar_i) => {
              const clefU = bar.clef ? 3 : 1;
              const meterU = bar.meter ? 2 : 0;
              const keyU = bar.key ? Math.abs(bar.key) / 2 : 0;

              const symbolU = clefU + meterU + keyU;
              const noteU = bar.notes.length * 2.5;
              const barU = symbolU + noteU;
              const barStartX = lastBarU * u;
              const noteStartX = barStartX + symbolU * u;
              lastBarU += barU;

              const pos = {
                u,
                x: barStartX,
                symbolU,
                noteU,
                barU,
                clefU,
                keyU,
                meterU,
                clefX: barStartX,
                keyX: barStartX + clefU * u,
                meterX: barStartX + (keyU + clefU) * u,
                noteX: noteStartX
              };

              return (
                <>
                  {/* bar symbols */}
                  {bar.clef && <Clef pos={pos} type={bar.clef} />}
                  {bar.key && <Key pos={pos} accidentals={bar.key} />}
                  {bar.meter && <Meter pos={pos} value={bar.meter} />}

                  {showDebug && <NoteViewSpaces pos={pos} />}

                  {/* notes / rests */}
                  {bar.notes.map((note, note_i) => {
                    const n = note.split("-");

                    return (
                      <Note
                        pos={pos}
                        n={note_i}
                        len={n[0]}
                        note={n[1]}
                        clef={bar.clef ? bar.clef : "treble"}
                        debug={showDebug}
                      />
                    );
                  })}

                  {/* barline at start*/}
                  <line
                    strokeWidth={u / 8}
                    stroke={"green"}
                    y1={u * -2}
                    y2={u * 2}
                    x1={barStartX}
                    x2={barStartX}
                  />
                </>
              );
            })}

          {/* bar fade effect */}
          {/* <defs>
            <linearGradient id="0" x1="0" y1="0.5" x2="1" y2="0.5">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
              <stop offset="33.33%" stopColor="rgba(184, 169, 179, 0.5)" />
              <stop offset="100%" stopColor="rgba(0, 0, 0, 0.8)" />
            </linearGradient>
          </defs> 
          <rect x={"30%"} width={"70%"} height={"100%"} fill="url(#0)" /> 
          */}
        </g>
      </svg>
    </div>
  );
}
