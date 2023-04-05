import anime from "animejs";
import { Clef, Meter, Key, Note } from "./NoteViewElements.js";
import useOnResizeComponent from "../Hooks.js";

export default function NoteView({
  data,
  slide,
  viewStyle,
  stavesExtra,
  noBarStart,
  showDebug
}) {
  const [sizeRef, size] = useOnResizeComponent();

  // unit size for scaling up (distance between ledger lines)
  const udiv = 6 + (stavesExtra ? stavesExtra * 2 : 0);
  const u = size.height && Math.floor(size.height / udiv);
  let lastBarU = slide ? -slide : 0;
  let lastClef = null;
  let lastKey = 0;

  return (
  <div className='View NoteView' style={viewStyle}>
    <svg ref={sizeRef} >
      {showDebug && <text className="debugLabel">{JSON.stringify(size)}</text>}
      <g
        transform={`
            translate(0 ${size.height / 2})
          `}
      >
        {/* stave lines */}
        <Staves u={u} />

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
              <g key={`Bar${bar_i}`}>
                {/* bar symbols */}
                {bar.clef && (
                  <Clef key={`clef_${pos.clefX}`} pos={pos} type={bar.clef} />
                )}
                {bar.key && (
                  <Key
                    key={`key_${pos.keyX}`}
                    pos={pos}
                    accidentals={bar.key}
                  />
                )}
                {bar.meter && (
                  <Meter
                    key={`meter_${pos.meterX}`}
                    pos={pos}
                    value={bar.meter}
                  />
                )}

                {showDebug && (
                  <NoteViewSpaces key={`spaces_${bar_i}`} pos={pos} />
                )}

                {/* notes / rests */}
                {bar.notes.map((note, note_i) => {
                  return (
                    <Note
                      key={`note_${bar_i}_${note_i}`}
                      pos={pos}
                      bar={bar_i}
                      n={note_i}
                      noteString={note}
                      clef={bar.clef ? bar.clef : "treble"}
                      debug={showDebug}
                    />
                  );
                })}

                {/* barline at start*/}
                {!noBarStart && <line
                  strokeWidth={u / 8}
                  stroke={"green"}
                  y1={u * -2}
                  y2={u * 2}
                  x1={barStartX}
                  x2={barStartX}
                />}
              </g>
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
        <rect
          x={"30%"}
          y={"-50%"}
          width={"70%"}
          height={"100%"}
          fill="url(#0)"
        /> */}
      </g>
    </svg>
  </div>);
}

function Staves({ u }) {
  return (
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
