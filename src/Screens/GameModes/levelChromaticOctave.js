import * as Tone from "tone";
import { useCallback, useEffect, useState, useContext} from "react";

import { prepareSound, newBassLine, endSound, playSound } from "../../Sound";
import { newNote, guessRange } from "../../NoteGuess";

import "./levelChromaticOctave.css";
import levelData from './levelChromaticOctave.json'

import arrowSVG from '../../img/icons/arrow.svg'
import heartSVG from '../../img/icons/heart.svg'

import NoteInput from "../../NoteInput/index.js";
import NoteView from "../../NoteView/index.js";
import {Snake, SnakeView} from "../../SnakeView/index.js";
import Item from "../../SnakeView/Item";


export default function LevelChromaticOctave({settings}) {
 
  const noteStyle = {
    position: 'absolute',
    width: '10vh',
    height: '10vh',
    border: 'solid orange 0.25rem',
    background: 'ivory',
    boxSizing: 'content-box'
  }
  const statusStyle ={
    width: 'min-content',
    padding: 0,
    width:'10rem',
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
  

  const generateNewGuess = (n)=>{
    const range = guessRange(levelData.guessData, (n)=>Tone.Frequency(n).toMidi())
    const notes = [
      Tone.Midi(range.root).toNote(),
      Tone.Midi(range.root+range.count).toNote()
    ]
    const pool = [...Array(range.count)].map((n,i)=>{
      return Tone.Midi(range.root + i).toNote();
    })
    
    const cn = n ? n : notes[0] 
    const nn = newNote(pool,cn)
    setNoteData(nn)
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
    prepareSound(levelData,setInstruments,setSoundSeq,()=>{ 
      setGameTick(tt=>tt+1)
    })

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
    // console.log([n,nt1,nt2])
    if(nt1 === n || nt2 === n){
      if(nt1 === n && isHorizontal) setDirection('up')
      else if(nt2 === n && isHorizontal) setDirection('down')
      else if(nt1 === n && !isHorizontal) setDirection('left')
      else if(nt2 === n && !isHorizontal) setDirection('right')
      setIsHorizontal(h=>!h)
      generateNewGuess(n)
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
    let collision = false;
    const head = pos[0]
    if(head.x === item[0] && head.y === item[1]){
      playSound(instruments.sampler, levelData.music.sounds["item"])
      newItem(levelData.levelSize)
      setLength(l=>l+1)
    }
    else if(head.x < 0 || head.y < 0 || head.x >= levelData.levelSize[0] || head.y >= levelData.levelSize[1]){
      collision = true
    }
    else{
      pos.forEach((p,i)=>{
        if(i !== 0){
          if(head.x === p.x && head.y === p.y) {
            collision = true;
            return;
          }
        }        
      })
    }

    if(collision){
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
    <>
      <section className="Frame Snake" style={{ marginBottom:0, position: "relative" }}>
        <SnakeView
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
            stavesExtra={1}
            slide={-0.5}
            viewStyle={{
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
            stavesExtra={1}
            slide={-0.5}
            viewStyle={{
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
                setIsStarted(true)
                Tone.Transport.start(Tone.now())
              }}
            >
              Ready
            </button>
          </>}
      </section>

      <section style={{display:'flex'}}>
        <div className="Frame Input" >
          {pianoStats && <NoteInput
            root={pianoStats.root-12}
            count={pianoStats.count}
            onNoteOff={(n)=>{
            }}
            onNoteOn={(n)=>{
              onSelectNote(n)
              instruments.piano.triggerAttackRelease(n,'8n','@8n')
            }}
            allowDragging={false}
          />}
        </div>
        <div className="Frame Status" style={statusStyle}>
          <img className={'statusArrow'}  src={arrowSVG} alt='statusArrow' style={{
            transition:'transform 250ms',
            transform:`rotateZ(${90 * (1+dirToIdx[direction])}deg)`,
            height:'40%', 
            margin: '0.5rem',
          }} />
          {/* <div style={{
            width:'4vh',
            margin: '0.5rem',
          }}>
            {[...Array(health)].map((e,i)=>{
              return <img key={`heart_${i}`} className={'statusHeart'} src={heartSVG} alt='statusHeart' /> 
            })}
          </div> */}
        </div>
      </section>
    </>
  );
}
