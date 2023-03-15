import "./App.css";
import NoteInput from "./NoteInput/index.js";
import NoteView from "./NoteView/index.js";
import FelixStatus from "./FelixStatus/index.js";
import SnakeView from "./SnakeView/index.js";
import { useEffect, useState } from "react";
import { Synth } from "tone";

export default function App() {
  const style = {
    width: "80vw",
    height: "30vh",
    border: "white dashed 3px",
    margin: "0.5rem",
    borderRadius: "1rem",
    overflow: 'hidden'
  };
  const scoreStyle = {
    borderRadius: "5px",
    background: 'ivory',
    color:'black',
    border: 'black solid 3px',
    fontSize: "2rem", 
    padding:'0.1rem',
  }

  const [debug, setDebug] = useState(false);
  const toggleDebug = () => setDebug(!debug);

  const [noise, setNoise] = useState(null);
  useEffect(() => {
    const n = new Synth().toDestination();
    n.oscillator.type = "sine";
    setNoise(n);
  }, []);

  const [felixState, setFelixState] = useState('idle');
  const [gameStats, setGameStats] = useState({
    target:0,
    correct:0,
    remain:0,
  });
  const [noteData, setNoteData] = useState();
  //     [
  //     { clef: "treble", meter: [4, 4], notes: ["G4-4n"] },
  //     { clef: "alto", key: 4, notes: ["G4-4n"] },
  //     { clef: "bass", key: 4, notes: ["G4-4n"] }
  //   ]
  // );

  const newGuess = () => {
    const generate = ()=>{    
      setFelixState('idle')
      const n = 2 + Math.floor(Math.random() * 6);
      setGameStats({remain: n, target:n, correct:0})
      const arr = [];
      for (let i = 0; i < n; i++) {
        const nt = Math.floor(Math.random() * 7);
        const acc = Math.floor(Math.random() * 2 - 1);
        const str = String.fromCharCode("A".charCodeAt(0) + nt) + "4-8n";
        arr.push(str);
      }
      setNoteData([{ clef: "treble", notes: arr }]);
    }

    if(noteData){
      setNoteData(null)
      setTimeout(generate,500)
    }
    else{
      generate()
    }
  };
  const noteOff = (n) => {
    noise.triggerRelease();
    if (!gameStats.remain) return;

    const arrLen = noteData[0].notes.length;
    const nr = gameStats.remain - 1;
    const ng = arrLen - (nr + 1);
    const noteToGuess = noteData[0].notes[ng].split("-")[0];
    const isOk = n === noteToGuess;
    const cr = isOk ? gameStats.correct+1 : gameStats.correct
    setGameStats({...gameStats, remain: nr, correct: cr})
    let guessData = JSON.parse(JSON.stringify(noteData));
    guessData[0].notes[ng] += isOk ? "-ok" : "-x";
    setNoteData(guessData);
    if (!nr) {
      if(cr === gameStats.target){
        setFelixState('happy')
      }
      else{
        setFelixState('tired')
      }
      setTimeout(() => {
        setFelixState('idle')
        setNoteData(null);
      }, 1500);
    }
  };

  const felixBG = felixState === 'idle' ? (noteData ? 'Wheat' : 'ivory') : ( felixState === 'happy' ? 'YellowGreen' : 'Tomato')

  const [gameStatus, setGameStatus] = useState(false)
  const toggleGame = ()=>{setGameStatus(!gameStatus)}

  return (
    <div className="App">
      <button onClick={toggleDebug}>Debug {debug}</button>
      
      <div>
        <button
          onClick={newGuess}
          style={{...scoreStyle, background:'yellow'}}
        >
          New Guess
        </button>

        {noteData && <>
          <span style={scoreStyle}>Note: {gameStats.target-gameStats.remain}/{gameStats.target} </span>
          <span style={scoreStyle}>Correct: {gameStats.correct} </span>
        </>}

      </div>

      <div style={{display:'flex'}}>
        <NoteView
          data={noteData}
          style={{...style,width:'60vw'}}
          stavesExtra={1}
          showDebug={debug}
        />
        <FelixStatus 
          animType={felixState} 
          style={{...style,width:'20vw', backgroundColor: felixBG} }
          showDebug={debug}/>
      </div>
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
      <button onClick={toggleGame}>{gameStatus ? 'Pause' : 'Play'}</button>
      <SnakeView isPlaying={gameStatus}/>
    </div>
  );
}
