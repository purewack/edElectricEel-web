import "./App.css";
import NoteInput from "./NoteInput/index.js";
import NoteView from "./NoteView/index.js";
import FelixStatus from "./FelixStatus/index.js";
import {Snake, SnakeView} from "./SnakeView/index.js";
import { prepareSound, newBassLine } from "./sound";
import { useCallback, useEffect, useState } from "react";
import * as Tone from "tone";
import levelData from './level1.json'
import arrowSVG from './img/icons/arrow.svg'
import heartSVG from './img/icons/heart.svg'
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
  const [isReady, setIsReady] = useState(false)
  const [instruments, setInstruments] = useState(null);
  const [currentBassLine, setCurrentBassLine] = useState(null)
  
  const [health, setHelath] = useState(levelData.startHealth);
  const [direction, setDirection] = useState(levelData.startDirection);
  const [length, setLength] = useState(levelData.startLength);
  const [gameTick, setGameTick] = useState(-1);

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
    }while(nr === r)
    const data = [];
    const nt1 = String.fromCharCode("A".charCodeAt(0) + r) + "4";
    const nt2 = String.fromCharCode("A".charCodeAt(0) + nr) + "4";
    data.push(nt1, nt2);
    return data
  }

  useEffect(()=>{
    newGuess()
  },[])

  const dirToIdx = {
    right: 0,
    down: 1,
    left: 2,
    up: 3,
  };

  const [item, setItem] = useState([6,4])
  const [grid, setGrid] = useState([1,1])
  const newItem = (g)=>{
    setItem([
      Math.floor(Math.random()*g[0]),
      Math.floor(Math.random()*g[1])
    ]) 
  }
  const newGrid = (g)=>{
    setGrid(g) 
    newItem(g)
  }
  const onSnakeMove = (pos)=>{
    const head = pos[0]
    if(head.x === item[0] && head.y === item[1]){
      newItem(grid)
      setLength(l=>l+1)
    }
  }

  return (
    <div className="App">
      <section className="Frame" style={{ marginBottom:0, position: "relative" }}>
        <SnakeView
          style={gameStyle}
          showDebug={debug}
          options={{ scrolling: false }}
          direction={direction}
          length={length}
          gameTick={gameTick}
          onGrid={newGrid}
        >
          <Snake where={[5,5]} length={length} direction={direction} tick={{value:gameTick, speed:levelData.ticksPerMove}} onAdvance={onSnakeMove}/>
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
                prepareSound(levelData,setInstruments,()=>{ 
                  setGameTick(tt=>tt+1)
                })
                setIsStarted(true)
            }}>
              Ready
            </button>
          </>}
      </section>

      <section style={{display:'flex'}}>
        <div className="Frame" style={inputStyle}>
          <NoteInput
            style={{width:'100%', height:'100%'}}
            keys={7}
            onNoteOff={(n)=>{
            }}
            onNoteOn={(n)=>{
              onSelectNote(n)
              Tone.Transport.scheduleOnce((t)=>{
                instruments.piano.triggerAttackRelease(n,'8n',t)
              },'@8n')
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
