import "./App.css";
import arrowSVG from './img/icons/arrow.svg'
import heartSVG from './img/icons/heart.svg'

import * as Tone from "tone";
import { useCallback, useEffect, useState } from "react";

import { prepareSound, newBassLine, endSound, playSound } from "./sound";
import { newNote, guessRange } from "./NoteGuess";
import levelData from './level1.json'

import NoteInput from "./NoteInput/index.js";
import NoteView from "./NoteView/index.js";
import FelixStatus from "./FelixStatus/index.js";
import {Snake, SnakeView} from "./SnakeView/index.js";
import Item from "./SnakeView/Item";

export default function App() {
  const [debug, setDebug] = useState(false);

  const gameStyle = {
    width: "90vw",
    height: "60vh",
  };
  const noteStyle = {
    position: 'absolute',
    width: '10vh',
    height: '10vh',
    border: 'solid orange 0.25rem',
    background: 'ivory'
  }
  const inputStyle ={
    width: '80vw',
    height: '30vh'
  }
  const statusStyle ={
    width: 'min-content',
    height: '30vh',
    padding: 0,
    background: 'black',
    display:'flex',
    alignItems:'center',
    justifyContent:'space-around'
  }
  
  const [isStarted, setIsStarted] = useState(false)
  const [instruments, setInstruments] = useState(null);
  const [soundSeq, setSoundSeq] = useState(null)
  
  const [health, setHealth] = useState();
  const [direction, setDirection] = useState();
  const [length, setLength] = useState();
  const [gameTick, setGameTick] = useState(-1);
  const [isHorizontal, setIsHorizontal] = useState()


  const [noteData, setNoteData] = useState()
  const [currentNote, setCurrentNote] = useState(null)
  

  const generateNewGuess = ()=>{
    const range = guessRange(levelData.guessData, (n)=>Tone.Frequency(n).toMidi())
    const notes = [
      Tone.Midi(range.root).toNote(),
      Tone.Midi(range.root+range.count).toNote()
    ]
    const pool = [...Array(range.count)].map((n,i)=>{
      return Tone.Midi(range.root + i).toNote();
    })
      
    setNoteData(newNote(pool,currentNote ? currentNote : notes[0]))
  }

  useEffect(()=>{
    if(isStarted) return;
    //new game
    setHealth(levelData.startHealth);
    setDirection(levelData.startDirection);
    setLength(levelData.startLength);
    setIsHorizontal(levelData.startDirection === 'left' || levelData.startDirection === 'right')
    setGameTick(-1);
    generateNewGuess();
    console.log("new game")

  },[isStarted])


  //computer keyboard input
  useEffect(() => {
    const keyHandle = (ev) => {
      if (ev.key === "w") setDirection("up");
      if (ev.key === "s") setDirection("down");
      if (ev.key === "a") setDirection("left");
      if (ev.key === "d") setDirection("right");
      if (ev.key === "g") setLength((l) => l + 1);
      if (ev.key === "t")
        setGameTick((t) => {
          return t + 1;
        });
      if(ev.key === 'n') 
        generateNewGuess()
    };
    window.addEventListener("keydown", keyHandle);
    return ()=>{window.removeEventListener("keydown", keyHandle)}
  }, []);

  const onSelectNote = useCallback((n)=>{
    //check chosen directon
    const nt1 = noteData[0]
    const nt2 = noteData[1]
    console.log({n,nt1,nt2})
    // console.log([n,nt1,nt2])
    if(nt1 === n || nt2 === n){
      if(nt1 === n && isHorizontal) setDirection('up')
      else if(nt2 === n && isHorizontal) setDirection('down')
      else if(nt1 === n && !isHorizontal) setDirection('left')
      else if(nt2 === n && !isHorizontal) setDirection('right')
      setIsHorizontal(h=>!h)
      generateNewGuess()
      setCurrentNote(n)
      newBassLine(n,instruments.bass,levelData.music.bass,soundSeq,setSoundSeq)
    }
  },[noteData, instruments, levelData])


  const dirToIdx = {
    right: 0,
    down: 1,
    left: 2,
    up: 3,
  };

  const [item, setItem] = useState([6,4])
  const newItem = (g)=>{
    setItem([
      Math.floor(Math.random()*g[0]),
      Math.floor(Math.random()*g[1])
    ]) 
  }
  const onSnakeMove = (pos)=>{
    const head = pos[0]
    if(head.x === item[0] && head.y === item[1]){
      playSound(instruments.sampler, levelData.music.sounds["item"])
      newItem(levelData.levelSize)
      setLength(l=>l+1)
    }
    else if(head.x < 0 || head.y < 0 || head.x >= levelData.levelSize[0] || head.y >= levelData.levelSize[1]){
      setIsStarted(false);
      endSound(soundSeq,setSoundSeq)
    }
  }

  const [pianoStats,setPianoStats] = useState(null)
  useEffect(()=>{
    if(pianoStats) return

    const range = guessRange(levelData.guessData, (n)=>Tone.Frequency(n).toMidi())
    //calculate keys and NoteView params
    setPianoStats(range);
  },[])

  return (
    <div className="App">
      <section className="Frame" style={{ marginBottom:0, position: "relative" }}>
        <SnakeView
          style={gameStyle}
          showDebug={debug}
          direction={direction}
          length={length}
          gameTick={gameTick}
          options={{ 
            scrolling: levelData?.scrolling, 
            levelSize: levelData.levelSize, 
            levelMarginTop: levelData?.levelMarginTop, 
            levelMarginBot: levelData?.levelMarginBot, 
          }}
        >
          {isStarted && 
            <Snake 
              where={levelData.startPoint} 
              length={length} 
              direction={direction} 
              tick={{value:gameTick, speed:levelData.ticksPerMove}} 
              onAdvance={onSnakeMove}
            />
          }
          <Item where={item} type='pizza'/>
        </SnakeView>

        {noteData && isStarted && <>
          <NoteView 
            data={[{clef:'treble', notes:[noteData[0]+'-4n']}]}
            stavesExtra={0}
            slide={-0.5}
            style={{
              left: isHorizontal ? '50%' : 0,
              top: isHorizontal ? 0 : '50%',
              transform: isHorizontal
              ? 'translate(-50%, 0)'
              : 'translate(0, -50%)',
              ...noteStyle,
            }}
          />
          <NoteView 
            data={[{clef:'treble', notes:[noteData[1]+'-4n']}]}
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

          {!isStarted && <>
            <div style={{
                position:'absolute',
                left: 0,
                top: 0,
                width:'100%',
                height: '100%',
                background: 'rgba(0,0,0,0.6)'
              }}/>
            <button 
              style={{
                position:'absolute',
                left: '50%',
                top:  '50%',
                transform: 'translate(-50%, -50%)'
              }}
              onClick={()=>{
                prepareSound(levelData,setInstruments,setSoundSeq,()=>{ 
                  setGameTick(tt=>tt+1)
                })
                setIsStarted(true)
              }}
            >
              Ready
            </button>
          </>}
      </section>

      <section style={{display:'flex'}}>
        <div className="Frame" style={inputStyle}>
          {pianoStats && <NoteInput
            style={{width:'100%', height:'100%'}}
            root={pianoStats.root-12}
            count={pianoStats.count}
            onNoteOff={(n)=>{
            }}
            onNoteOn={(n)=>{
              onSelectNote(n)
              instruments.piano.triggerAttackRelease(n,'8n','@8n')
            }}
            allowDragging={false}
            showDebug={debug}
          />}
        </div>
        <div className="Frame" style={statusStyle}>
          <img src={arrowSVG} className={'statusArrow'} style={{
            transition:'transform 250ms',
            transform:`rotateZ(${90 * (1+dirToIdx[direction])}deg)`,
            height:'50%', 
            margin: '0.5rem',
          }} />
          <div style={{
            width:'4vh',
            margin: '0.5rem',
          }}>
            {[...Array(health)].map((e,i)=>{
              return <img key={`heart_${i}`} src={heartSVG} className={'statusHeart'} /> 
            })}
          </div>
        </div>
      </section>

      <section>
        <button onClick={() => setDebug(!debug)}>Debug</button>
      </section>
    </div>
  );
}
