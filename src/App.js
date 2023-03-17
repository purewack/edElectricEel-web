import "./App.css";
import NoteInput from "./NoteInput/index.js";
import NoteView from "./NoteView/index.js";
import FelixStatus from "./FelixStatus/index.js";
import SnakeView from "./SnakeView/index.js";
import { prepareSound, newBassLine } from "./sound";
import { useCallback, useEffect, useState } from "react";
import * as Tone from "tone";
import levelData from './level1.json'

export default function App() {
  const [debug, setDebug] = useState(false);

  const gameStyle = {
    width: "90vw",
    height: "60vh",
  };
  const inputStyle ={
    width: '90vw',
    height: '30vh'
  }
  const noteStyle = {
    position: 'absolute',
    width: '10vh',
    height: '10vh',
    border: 'solid orange 0.25rem'
  }
  
  const [isStarted, setIsStarted] = useState(false)
  const [instruments, setInstruments] = useState(null);
  const [currentBassLine, setCurrentBassLine] = useState(null)
  

  const [gameTick, setGameTick] = useState(-1);
  const [direction, setDirection] = useState("right");
  const [length, setLength] = useState(3);

  useEffect(() => {
    const keyHandle = (ev) => {
      // console.log(ev)
      if (ev.key === "w") setDirection("up");
      if (ev.key === "s") setDirection("down");
      if (ev.key === "a") setDirection("left");
      if (ev.key === "d") setDirection("right");
      if (ev.key === "g") setLength((l) => l + 1);
      if (ev.key === "t")
        setGameTick((t) => {
          return t + 1;
        });
      if(ev.key === 'n') newGuess()
    };
    window.addEventListener("keydown", keyHandle);
    return ()=>{window.removeEventListener("keydown", keyHandle)}
  }, []);

  const [isHorizontal, setIsHorizontal] = useState(true)
  const [noteData, setNoteData] = useState()
  const onSelectNote = useCallback((n)=>{
    //check chosen directon
    const nt1 = noteData[0].notes[0].split('-')[0]
    const nt2 = noteData[1].notes[0].split('-')[0]
    // console.log([n,nt1,nt2])
    if(nt1 === n || nt2 === n){
      if(nt1 === n && isHorizontal) setDirection('up')
      else if(nt2 === n && isHorizontal) setDirection('down')
      else if(nt1 === n && !isHorizontal) setDirection('left')
      else if(nt2 === n && !isHorizontal) setDirection('right')
      setIsHorizontal(h=>!h)
      newGuess()
      newBassLine(n,instruments.bass,levelData.music.bass,currentBassLine,setCurrentBassLine)
    }
    //? apply chosen direction
    //generate new note set
  },[noteData, instruments, levelData])

  const newGuess = ()=>{
    const [nt1, nt2] = generateNoteData()
    setNoteData([
      {
        clef:'treble',
        notes:[nt1+'-4n']
      }, 
      {
        clef:'treble',
        notes:[nt2+'-4n']
      }
    ])
  }
  const generateNoteData = ()=>{
    const r = Math.floor(Math.random()*7)
    let nr
    do{
      nr = Math.floor(Math.random()*7)
    }while(nr == r)
    const data = [];
    const nt1 = String.fromCharCode("A".charCodeAt(0) + r) + "4";
    const nt2 = String.fromCharCode("A".charCodeAt(0) + nr) + "4";
    data.push(nt1, nt2);
    return data
  }

  useEffect(()=>{
    newGuess()
  },[])

  return (
    <div className="App">
      {!isStarted ? 
      <button onClick={()=>{
        prepareSound(levelData,setInstruments,()=>{ 
          setGameTick(tt=>tt+1)
        })
        setIsStarted(true)
      }}>Start</button>
      :
      <>
      <div className="Frame" style={{ marginBottom:0, position: "relative" }}>
        <SnakeView
          style={gameStyle}
          showDebug={debug}
          options={{ scrolling: false, ticksPerMove:levelData.ticksPerMove }}
          direction={direction}
          length={length}
          gameTick={gameTick}
        >
        </SnakeView>
        {noteData && <>
          <NoteView 
            data={[noteData[0]]}
            stavesExtra={0}
            slide={-0.5}
            style={{
              left: isHorizontal ? '50%' : 0,
              top: isHorizontal ? 0 : '50%',
              transform: isHorizontal
              ? 'translate(-50%, 0)'
              : 'translate(0, -50%)',
              ...noteStyle
            }}
          />
          <NoteView 
            data={[noteData[1]]}
            stavesExtra={0}
            slide={-0.5}
            style={{
              right: isHorizontal ? '50%' : 0,
              bottom: isHorizontal ? 0 : '50%',
              transform: isHorizontal
              ? 'translate(50%, 0)'
              : 'translate(0, 50%)',
              ...noteStyle
            }}
          />
          </>}
      </div>
      <div className="Frame" style={inputStyle}>
        <NoteInput
          style={{width:'100%', height:'100%'}}
          keys={7}
          onNoteOff={(n)=>{
            onSelectNote(n)
          }}
          onNoteOn={(n)=>{
            Tone.Transport.scheduleOnce((t)=>{
              instruments.piano.triggerAttackRelease(n,'8n',t)
            },'@8n')
          }}
          allowDragging={false}
          showDebug={debug}
        />
      </div>
      <div>
        <button onClick={() => setDebug(!debug)}>Debug</button>
      </div>
      </>}
    </div>
  );
}
