import "./App.css";
import arrowSVG from './img/icons/arrow.svg'
import heartSVG from './img/icons/heart.svg'

import * as Tone from "tone";
import { useCallback, useEffect, useState } from "react";

import { prepareSound, newBassLine, endSound, playSound } from "./sound";
import { newGuess } from "./NoteGuess";
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
    width: '60vw',
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

  useEffect(()=>{
    if(isStarted) return;
    //new game
    setNoteData(newGuess(0))
    setHealth(levelData.startHealth);
    setDirection(levelData.startDirection);
    setLength(levelData.startLength);
    setIsHorizontal(levelData.startDirection === 'left' || levelData.startDirection === 'right')
    setGameTick(-1);
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
        setNoteData(newGuess(0))
    };
    window.addEventListener("keydown", keyHandle);
    return ()=>{window.removeEventListener("keydown", keyHandle)}
  }, []);


  const [noteData, setNoteData] = useState()
  const [currentNote, setCurrentNote] = useState(null)
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
      setNoteData(newGuess(n))
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

    const notes = levelData.guessData.notes

    //find required midi range
    let range;
    let whiteKeys = 0;
    if(levelData.guessData.type === 'selection'){
      let low = notes[0];
      let high = notes[0];
      notes.forEach((n)=>{
        const note = Tone.Frequency(n).toMidi()
        if(note < low) low = note
        else if(note > high) high = note

        if(!n.includes('#')) whiteKeys+=1;
      })
      range = [low, high]
    }
    else{
      const lowMidi = Tone.Frequency(notes[0]).toMidi();
      const highMidi = Tone.Frequency(notes[1]).toMidi();
      const count = highMidi - lowMidi

      const isBlackKey = (m)=>{
        const midiBlackKeys = [1,3,6,8,10];
        for(let i=0; i<midiBlackKeys.length; i++)
          if(m%12 === midiBlackKeys[i]) return true;
        return false;
      }

      [...Array(count)].forEach((k,i)=>{
        if(!isBlackKey(i + lowMidi)) whiteKeys+=1;
      })
    }

    //calculate keys and NoteView params

  },[])

  return (
    <NoteInput 
    style={{width:'100%', height:'100%'}}
    root={Tone.Frequency('F4').toMidi()}
    count={12}
    allowDragging={false}
    showDebug={true}
    />
  )


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
            data={[noteData[0]]}
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
          <NoteInput
            style={{width:'100%', height:'100%'}}
            keys={pianoStats?.keys}
            range={pianoStats?.range}
            onNoteOff={(n)=>{
            }}
            onNoteOn={(n)=>{
              onSelectNote(n)
              instruments.piano.triggerAttackRelease(n,'8n','@8n')
            }}
            allowDragging={false}
            showDebug={debug}
          />
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
