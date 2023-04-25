import levelData from './BasePitch.json'
import arrowSVG from '../../AssetsImport/icons/arrow.svg'

import * as Tone from "tone";
import { useCallback, useEffect, useState, useContext, useRef} from "react";
import { startPitchGameSong, newBassLine, endGameSong, playSound, playGameInput, midiPlayer, setGameSongPitch, playSoundEffect, setGameSongParts } from "../../Components/Sound";
import { newNote, guessRange } from "../../Components/NoteGuess";

import NoteInput from "../../Components/NoteInput/index.js";
import NoteView from "../../Components/NoteView/index.js";
import {Snake, SnakeView, dirToIdx} from "../../Components/SnakeView/index.js";
import Item from "../../Components/SnakeView/Item";
import { DebugContext } from '../../App';


const multipliers = {low: 5, mid: 15, high: 30}

export default function LevelBasePitch ({settings}) {
  const showDebug = useContext(DebugContext)
 
  const [isStarted, setIsStarted] = useState(false)
  const [gameActive, setGameActive] = useState(false)

  const [guessData, setGuessData] = useState()
  const [currentKey, setCurrentKey] = useState('C4')
  const [score, setScore] = useState({value: null, multiplier: 1, streak: 0})
  const [health, setHealth] = useState();
  const [direction, setDirection] = useState();
  const [actionPending, setActionPending] = useState();
  const [length, setLength] = useState();
  const [gameTick, setGameTick] = useState(0);
  const [isHorizontal, setIsHorizontal] = useState()


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
    setGuessData(nn)
  }


  const newGame = ()=>{
    setScore({value: 0, multiplier: 1, streak: 0});
    setHealth(levelData.startHealth);
    setDirection(levelData.startDirection);
    setLength(levelData.startLength);
    setIsHorizontal(levelData.startDirection === 'left' || levelData.startDirection === 'right')
    setGameTick(-1);
    generateNewGuess();
    setGameSongPitch('C4',true);
    setCurrentKey('C4');
    startPitchGameSong(levelData, ()=>{ 
      setGameTick(t => t+1) 
      setActionPending(false);
    }).then(()=>{
      setGameActive(true)
      console.log("new pitch game begin");
    })
    setIsStarted(true)
    console.log("New pitch game", guessData, isStarted, gameTick)
  }

  const endGame = ()=>{
    setGameActive(false);
    setScore({value: null, multiplier: 1, streak: 0})
    endGameSong().then(()=>{
      setIsStarted(false);
    })
  }

  const addScore =(add)=>{
    setScore(s => {
      const mult = (
        s.streak >= multipliers.high ? 4
        : s.streak >= multipliers.mid ? 3
        : s.streak >= multipliers.low ? 2
      : 1)

      return{
      ...s,
      value:s.value+(add*mult),
      streak:s.streak + 1,
      multiplier: mult
      }
    })
  }

  useEffect(()=>{
    console.log('new multiplier ',score.multiplier)
    if(score.multiplier === 2) setGameSongParts(['drums','bass','melody'])
    else if(score.multiplier >= 3) setGameSongParts(['drums','bass','melody','lead'])
    else setGameSongParts(['drums','bass'])
  },[score.multiplier])

  const onSelectNote = useCallback((n)=>{
    //check chosen directon
    const nt1 = guessData[0]
    const nt2 = guessData[1]
    // console.log([n,nt1,nt2])
    if(nt1 === n || nt2 === n){
      if(nt1 === n && isHorizontal) setDirection('up')
      else if(nt2 === n && isHorizontal) setDirection('down')
      else if(nt1 === n && !isHorizontal) setDirection('left')
      else if(nt2 === n && !isHorizontal) setDirection('right')
      setIsHorizontal(h=>!h)
      generateNewGuess(n)
      setCurrentKey(n)
      setGameSongPitch(n)
      setActionPending(true);
      playGameInput(n)
      addScore(50)
    }
    else{
      playSoundEffect('wrong');
      setHealth(h => h-1)
      setScore(s => {
        return {
          ...s,
          streak:0,
          multiplier:0
        }
      })
    }
  },[guessData, levelData])

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
      playSoundEffect('item');
      addScore(100)
      setHealth(h => (h<5 ? h+1 : 5))
      setLength(l=>l+1)
      newItem(levelData.levelSize)
    }
    else if(head.x < 0 || head.y < 0 || head.x >= levelData.levelSize[0] || head.y >= levelData.levelSize[1]){
      setHealth(null)
    }
    else{
      pos.forEach((p,i)=>{
        if(i !== 0){
          if(head.x === p.x && head.y === p.y) {
            setHealth(null)
            return;
          }
        }        
      })
    }

  }

  useEffect(()=>{
    if(isStarted){
      if(!health){
        endGame()
      }
    }
  },[health,isStarted])

  const [pianoStats,setPianoStats] = useState(null)
  useEffect(()=>{
    if(pianoStats) return

    const range = guessRange(levelData.guessData, (n)=>Tone.Frequency(n).toMidi())
    //calculate keys and NoteView params
    setPianoStats(range);
  },[])


  //computer keyboard input
  useEffect(() => {
    const keyHandle = (ev) => {
      if (ev.key === "ArrowUp") setDirection("up");
      if (ev.key === "ArrowDown") setDirection("down");
      if (ev.key === "ArrowLeft") setDirection("left");
      if (ev.key === "ArrowRight") setDirection("right");
      if (ev.key === "+") setLength((l) => l + 1);
      if (ev.key === ".")
        setGameTick((t) => {
          return t + 1;
        });
      if(ev.key === '?') 
        generateNewGuess()
    };
    if(showDebug)
    window.addEventListener("keydown", keyHandle);
    return ()=>{window.removeEventListener("keydown", keyHandle)}
  }, [showDebug]);

  return (
    <div className='GameBasePitch'>
      
      <section>
        <StatusBar score={score.value} currentKey={currentKey?.slice(0,-1)} streak={score.streak} health={health} direction={direction} pending={actionPending}/>
      </section>
      
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
          {isStarted && <Snake 
              where={levelData.startPoint} 
              length={length} 
              direction={direction} 
              tick={{value:gameTick, speed:levelData.ticksPerMove}} 
              onAdvance={onSnakeMove}
            />}
          {isStarted && <Item where={item} type='pizza'/>}
        </SnakeView>

        {guessData && <>
          <NoteView 
            className={'GuessA ' + (isHorizontal ? 'GuessHorizontal' : '')}
            data={[{clef:'treble', notes:[guessData[0]+'-4n']}]}
            stavesExtra={1}
            slide={-0.5}
          />
          <NoteView  
            className={'GuessB ' + (isHorizontal ? 'GuessHorizontal' : '')}
            data={[{clef:'treble', notes:[guessData[1]+'-4n']}]}
            stavesExtra={1}
            slide={-0.5}
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
              onClick={newGame}
            >
              Ready
            </button>
          </>}
      </section>

      <section >
        <div className=" Input" >
          {pianoStats && <NoteInput
            root={pianoStats.root-12}
            count={pianoStats.count}
            onNoteOff={(n)=>{
            }}
            onNoteOn={(n)=>{
              gameActive && onSelectNote(n)
            }}
            allowDragging={false}
          />}
        </div>
      </section>
    </div>
  );
}


function StatusBar({score = 0, health, pending, streak, currentKey}){
  const _streak =  (
    streak >= multipliers.high ? 'streak high' 
    : streak >= multipliers.mid ? 'streak mid' 
    : streak >= multipliers.low ? 'streak low' 
  : '')
  const leadingZeros = (num, size)=>{
      var s = num+"";
      while (s.length < size) s = "0" + s;
      return s;
  }
  const _score = score === null ? '-----' : leadingZeros(score,5); 
  return (
  <div className=" Status" >
    <div>
      {/* <span>Score: </span><br/> */}
      <span className={'Score ' + _streak}>{_score}</span>
    </div>
    <div className='Frame HealthBar'>
      {[...Array(5)].map((e,i)=>{
        return <img key={`heart_${i}`} className={'statusHeart ' + (!health || i>(health-1) ? 'empty' : '') } alt='heal' /> 
      })}
    </div>
    <span className='Key'>Key: {currentKey}</span>
    {/* <img className={'statusArrow' + (pending ? ' pending' : '')} alt='dir' style={{
      transform:`rotateZ(${90 * (1+dirToIdx[direction])}deg)`,
    }} /> */}
  </div>
  )
}