import "./App.css";
import NoteInput from "./NoteInput/index.js";
import NoteView from "./NoteView/index.js";
import { useEffect, useState } from "react";
import { Frequency, Midi, Sampler, Synth } from "tone";

export default function App() {
  const style = {
    width: "80vw",
    height: "30vh",
    border: "black dashed 3px",
    margin: "0.5rem",
    borderRadius: "1rem"
  };

  const [debug, setDebug] = useState(false);
  const toggleDebug = () => setDebug(!debug);

  const [noise, setNoise] = useState(null);
  useEffect(() => {
    const n = new Synth().toDestination();
    n.oscillator.type = "sine";
    setNoise(n);
  }, []);

  const [notesRemain, setNotesRemain] = useState(0);
  const newGuess = () => {
    if (noteData) return;
    const n = 2 + Math.floor(Math.random() * 6);
    setNotesRemain(n);
    const arr = [];
    for (let i = 0; i < n; i++) {
      const nt = Math.floor(Math.random() * 7);
      const acc = Math.floor(Math.random() * 2 - 1);
      const str = String.fromCharCode("A".charCodeAt(0) + nt) + "4-8n";
      arr.push(str);
    }
    setNoteData([{ clef: "treble", notes: arr }]);
  };
  const noteOff = (n) => {
    noise.triggerRelease();
    if (!notesRemain) return;

    const arrLen = noteData[0].notes.length;
    const nr = notesRemain - 1;
    const ng = arrLen - (nr + 1);
    const noteToGuess = noteData[0].notes[ng].split("-")[0];
    const isOk = n === noteToGuess;

    setNotesRemain(nr);
    let guessData = JSON.parse(JSON.stringify(noteData));
    guessData[0].notes[ng] += isOk ? "-ok" : "-x";
    setNoteData(guessData);
    if (!nr) {
      setTimeout(() => {
        setNoteData(null);
      }, 1000);
    }
  };

  const [noteData, setNoteData] = useState();
  //     [
  //     { clef: "treble", meter: [4, 4], notes: ["G4-4n"] },
  //     { clef: "alto", key: 4, notes: ["G4-4n"] },
  //     { clef: "bass", key: 4, notes: ["G4-4n"] }
  //   ]
  // );

  return (
    <div className="App">
      <button onClick={toggleDebug}>Debug {debug}</button>
      <NoteView
        data={noteData}
        style={style}
        stavesExtra={1}
        showDebug={debug}
      />
      <NoteInput
        style={style}
        keys={20}
        octave={3}
        range={[8, 15]}
        middleKey={5}
        onNoteOn={(n) => {
          noise.triggerAttack(n);
        }}
        onNoteOff={noteOff}
        showDebug={debug}
      />
      <button
        onClick={newGuess}
        disabled={noteData}
        style={{ fontSize: "2rem" }}
      >
        {notesRemain ? `Remain: ${notesRemain}` : "New Guess"}
      </button>
    </div>
  );
}
