import { Time } from "tone";
import { useEffect, useState } from "react";
import anime from "animejs";

import note_1 from "./img/music/svg/1n.svg";
import note_2 from "./img/music/svg/2n.svg";
import note_4 from "./img/music/svg/4n.svg";
import note_8 from "./img/music/svg/8n.svg";
import note_16 from "./img/music/svg/16n.svg";
import note_1i from "./img/music/svg/1nn.svg";
import note_2i from "./img/music/svg/2nn.svg";
import note_4i from "./img/music/svg/4nn.svg";
import note_8i from "./img/music/svg/8nn.svg";
import note_16i from "./img/music/svg/16nn.svg";
import rest_1 from "./img/music/svg/1r.svg";
import rest_2 from "./img/music/svg/2r.svg";
import rest_4 from "./img/music/svg/4r.svg";
import rest_8 from "./img/music/svg/8r.svg";
import rest_16 from "./img/music/svg/16r.svg";
import clef_treble from "./img/music/svg/treble.svg";
import clef_alto from "./img/music/svg/alto.svg";
import clef_bass from "./img/music/svg/bass.svg";
import acc_nat from "./img/music/svg/nat.svg";
import acc_sharp from "./img/music/svg/sharp.svg";
import acc_flat from "./img/music/svg/flat.svg";

const tile_acc = {
  natural: acc_nat,
  sharp: acc_sharp,
  flat: acc_flat
};
const tile_clefs = {
  treble: clef_treble,
  alto: clef_alto,
  bass: clef_bass
};
const tile_rests = [rest_1, rest_2, rest_4, rest_8, rest_16];
const tile_ups = [note_1, note_2, note_4, note_8, note_16];
const tile_downs = [note_1i, note_2i, note_4i, note_8i, note_16i];


export function Note({ pos, bar, n, note, len, clef, debug }) {
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
  const isGuess = note[0] === "?" || note[1] === "?";
  const isSharp = note[1] === "#";
  const isFlat = note[1] === "b";
  const isAcc = isSharp || isFlat;
  const octave = isAcc ? note[2] : note[1];
  const letter = note[0];

  const noteCode = letter.charCodeAt(0) - "a".charCodeAt(0);

  const octaveStartOffset = -2; //octave boundry is on c not a, go back 2
  const ocvateEndOffset = noteCode < 2 ? 1 : 0; //octave boundry is on c not a, go back 2
  const stave =
    isRest || isGuess
      ? 4
      : noteCode +
        octaveStartOffset +
        clefOffset +
        7 * (octave - 4 + ocvateEndOffset);
  const isFilp = stave > 4;

  const length = isGuess ? 0 : Time(len).toFrequency() * 2;

  const lenToType = {
    1: 0,
    2: 1,
    4: 2,
    8: 3,
    16: 4
  };
  const li = lenToType[length];

  const tile_note = isRest
    ? tile_rests[li]
    : isFilp
    ? tile_downs[li]
    : tile_ups[li];

  const xx = pos.noteX + n * u * 2.5;
  const yy = -uu + u / 2 + u * 2 - (u / 2) * stave;
  const xxo = xx + u / 2;
  const yyo = yy + u + u / 2;
  const yyy = isRest ? -u * 1.4 : isFilp ? yy + u + u / 16 : yy - u / 16;

  const lowLedgerN = stave < 0 ? Math.ceil(stave / 2) : 0;
  const highLedgerN = stave > 8 ? Math.floor((stave - 8) / 2) : 0;

  const nm = `b${bar}_note`;
  const sName = nm + (isGuess ? " gEnter" : " enter");
  const [name, setName] = useState(sName);
  useEffect(() => {
    if (!debug) {
      anime({
        targets: `.${nm}.enter`,
        easing: "easeInOutSine",
        direction: "alternate",
        scale: 1.5,
        rotate: 15,
        delay: anime.stagger(20),
        duration: 150
      });
      anime({
        targets: `.${nm}.gEnter`,
        easing: "easeInOutSine",
        direction: "alternate",
        scale: 1.4,
        duration: 250
      });
    }
    setName(nm);
  });

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
      <g
        className={name}
        style={{
          transformOrigin: `
        ${xxo}px
        ${yyo}px
      `
        }}
      >
        {isGuess ? (
          <>
            <rect
              fill="none"
              stroke-width={u / 8}
              stroke-dasharray="4"
              stroke="blue"
              x={xx}
              y={yy - u / 2}
              width={u}
              height={u * 4}
            />
            <text fill="gray" x={xx} y={yy + u * 0.6} fontSize={u * 2.5}>
              ?
            </text>
          </>
        ) : (
          <>
            <image href={tile_note} width={uu} x={xx} y={yyy} />
            {isAcc && (
              <image
                href={isSharp ? tile_acc["sharp"] : tile_acc["flat"]}
                height={uu * 1}
                x={xx - u * 0.75}
                y={yy}
              />
            )}
          </>
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

export function Clef({ pos, type }) {
  const u = pos.u;
  const space = pos.clefU;
  const yy = -u * 2;
  const xx = pos.clefX;

  return (
    <image
      href={tile_clefs[type]}
      height={u * 4 * (type === "treble" ? 2 : 1)}
      x={xx}
      y={yy}
    />
  );
}

export function Key({ pos, accidentals, key }) {
  const isSharp = accidentals > 0;
  const count = Math.abs(accidentals);
  const flatPattern = [0, 3, -1, 2, -2, 1, -3];
  const sharpPattern = [0, -3, 1, -2, -5, -1, -4];
  const pattern = isSharp
    ? sharpPattern.slice(0, count)
    : flatPattern.slice(0, count);

  const u = pos.u;
  const uu = u * 2;
  const tile = tile_acc[isSharp ? "sharp" : "flat"];

  return (
    <>
      {pattern.map((p, i) => {
        const pp = p - (isSharp ? -8 : -4);
        const yy = u / 2 - (pp * u) / 2;
        const xx = pos.keyX + (i * u) / 2 - u / 2;
        return <image href={tile} height={uu} x={xx} y={yy} />;
      })}
    </>
  );
}

export function Meter({ pos, value }) {
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
