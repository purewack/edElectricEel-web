import '../../Styles/index.css'
import { useCallback, useEffect, useState, useContext, useRef} from "react";
import { useLocation } from 'react-router-dom';

import { startPitchGameSong, endGameSong, playGameInput, setGameSongPitch, playSoundEffect, setGameSongParts, toggleGameTick } from "../../Helpers/Sound";
import {Snake, SnakeView} from "../../Components/SnakeView/index.js";
import NoteInput from "../../Components/NoteInput/index.js";
import NoteView from "../../Components/NoteView/index.js";
import Item from "../../Components/SnakeView/Item";
import { DebugContext, MidiContext } from '../../App';
import { getMidi, getRandomFrom, leadingZeros, respellPitch } from "../../Helpers/Hooks";
import { generateNewGuessPitch2 } from "../../Helpers/NoteGuess";
import HintedDiv from '../../Components/Hint';
import Bubble from '../../Components/Bubble';
import { HelpGamePitchRange } from '../Learn';


export const defaultData = {
  startHealth:5,
  startLength:5,
  ticksPerMove:4,
  tempo : 100,
  showInputNoteNames: true,
  guessData:{
      type : "range",
      notes: ["C4","B4"],
      clefs : {treble: 1},
      accidentalPreference: 'sharp'
  },
  gameTickInterval:"8n",
  startDirection:"right",
  startPoint:[10,7],
  levelSize:[20,15],
  levelMarginTop:3,
  levelMarginBot:3,
  song: "pitch_game.mid",
  canOverlapSelf : false,
  enemies:[]
}

const multipliers = {low: 5, mid: 15, high: 30}

export default function LevelBasePitch ({onPresent}) {
  const midiPlayer = useContext(MidiContext)
  const showDebug = useContext(DebugContext)
  
  const [info, setInfo] = useState(null)
  const [isStarted, setIsStarted] = useState(false)
  const [gameActive, setGameActive] = useState(false)
  const [paused, setPaused] = useState(false)
  const [debugFreeze, setDebugFreeze] = useState(false)

  const [countDown, setCountDown] = useState()

  const [guessData, setGuessData] = useState()
  const [currentKey, setCurrentKey] = useState('C4')
  const [score, setScore] = useState({value: null, multiplier: 1, streak: 0})
  const [health, setHealth] = useState();
  const [direction, setDirection] = useState();
  const [length, setLength] = useState();
  const [gameTick, setGameTick] = useState(0);
  const [isHorizontal, setIsHorizontal] = useState()
  const [item, setItem] = useState({pos:[6,4],type:'pizza'})

  const level = useRef(defaultData)
  const loc = useLocation()
  useState(()=>{
    const options = loc.state
    console.log('Game options data: ', options)
    if(options?.level) level.current =  options.level
    else onPresent('/')

    const menuKeyHandle = (ev) => {
      if (ev.key === "Esc") setPaused(p => !p)
    }
    window.addEventListener("keydown", menuKeyHandle);
    return ()=>{window.removeEventListener("keydown", menuKeyHandle)}
  },[loc])
  const levelData = level.current

  
  const newGuess = (n)=>{
    const data = generateNewGuessPitch2({...levelData.guessData, avoidNote: n})
    setGuessData(data)
    setGameSongPitch(midiPlayer,data.avoidNote,false);
    setCurrentKey(data.avoidNote);
  }

  const backGame = ()=>{
    onPresent('/pitch',undefined,undefined,{level: {...levelData}})
  }

  const newGame = ()=>{
    endGameSong(midiPlayer, true)
    setScore({value: 0, multiplier: 1, streak: 0});
    setHealth(levelData.startHealth);
    setDirection(levelData.startDirection);
    setLength(levelData.startLength);
    setIsHorizontal(levelData.startDirection === 'left' || levelData.startDirection === 'right')
    setGameTick(-1);
    newGuess();
    setGameSongPitch(midiPlayer, currentKey,true);
    setGameSongParts(midiPlayer,['drums','bass'])
    startPitchGameSong(midiPlayer, levelData, ()=>{ 
      setGameTick(t => t+1) 
    },undefined,(n)=>{
      const text = n === 4 ? 'Go' : `${4-n}`
      setCountDown(text)
    }).then(()=>{
      setGameActive(true)
      setCountDown(null)
      console.log("new pitch game begin");
    })
    setIsStarted(true)
    console.log("New pitch game", guessData, isStarted, gameTick)
  }

  const endGame = ()=>{
    playSoundEffect(midiPlayer, 'explode.wav');
    setGameActive(false);
    setScore({value: null, multiplier: 1, streak: 0})
    endGameSong(midiPlayer).then(()=>{
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

  const onSelectNote = useCallback((n)=>{
    //check chosen directon
    const gn = getMidi(n)%12
    const nt1 = getMidi(guessData.notes[0],'sharp')%12
    const nt2 = getMidi(guessData.notes[1],'sharp')%12

    console.log(gn,nt1,nt2, guessData)
    // console.log([n,nt1,nt2])
    if(nt1 === gn || nt2 === gn){
      setIsHorizontal(h=>{
        if(nt1 === gn && h) setDirection('up')
        else if(nt2 === gn && h) setDirection('down')
        else if(nt1 === gn && !h) setDirection('left')
        else if(nt2 === gn && !h) setDirection('right')
        return !h
      })
      
      newGuess(n)
      playGameInput(midiPlayer, n)
      addScore(50)
      if(score.streak+1 === multipliers.mid){
        setGameSongParts(midiPlayer, ['drums','bass','melody','lead'])
      }
      else if(score.streak+1 === multipliers.low){
        setGameSongParts(midiPlayer, ['drums','bass','melody'])
      }    
    }
    else{
      playSoundEffect(midiPlayer,'wrong');
      setHealth(h => h-1)
      setGameSongParts(midiPlayer,['drums','bass'])
      setScore(s => {
        return {
          ...s,
          streak:0,
          multiplier:0
        }
      })
    }
  },[guessData, levelData])

  const newItem = (field, snake)=>{
    let freeSlots = [] 
    for(let y=0; y<field[1]; y++){
      for(let x=0; x<field[0]; x++){
        let free = true
        snake.forEach(s => {
          if(y === s.y && x === s.x) free = false
        })
        if(free) freeSlots.push([x,y])
      }
    }
    const types = ['pizza','sushi','apple']
    // console.log('New item', freeSlots)
    setItem({
      pos: getRandomFrom(freeSlots),
      type: getRandomFrom(types)
    }) 
  }

  const onSnakeMove = useCallback((pos)=>{
 
    const head = pos[0]
    if(head.x === item.pos[0] && head.y === item.pos[1]){
      playSoundEffect(midiPlayer,'ok.wav');
      addScore(100)
      setHealth(h => (h<5 ? h+1 : 5))
      setLength(l=>l+1)
      newItem(levelData.levelSize, pos)
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
  },[debugFreeze,item])

  useEffect(()=>{
    if(isStarted){
      if(!health){
        endGame()
      }
    }
  },[health,isStarted])

  useEffect(()=>{
    if(isStarted){
      if(paused && midiPlayer.state === 'playing') midiPlayer.pause()
      else if(!paused && midiPlayer.state === 'paused') midiPlayer.resume()
    }
  },[paused, isStarted])

  //computer keyboard input
  useEffect(() => {
    const keyHandle = (ev) => {
      if (ev.key === "ArrowUp") setDirection("up");
      if (ev.key === "ArrowDown") setDirection("down");
      if (ev.key === "ArrowLeft") setDirection("left");
      if (ev.key === "ArrowRight") setDirection("right");
      if (ev.key === "+") setLength((l) => l + 1);
      if (ev.key === ",")
        setGameTick(t => t + 1)
      if (ev.key === "."){
        setDebugFreeze(d => !d)
        toggleGameTick()
      }
      if(ev.key === '?') 
        newGuess()
    };
    if(showDebug) window.addEventListener("keydown", keyHandle);
    return ()=>{window.removeEventListener("keydown", keyHandle)}
  }, [showDebug]);

  const btnHelpClass = !levelData.guessData.difficulty.custom && levelData.guessData.difficulty.level === 'easy' ? 'btnHelpHowTo Attention' : 'btnHelpHowTo'
  // const btnHelpClass = 'btnHelpHowTo Attention'

  return (<>
  
    {!isStarted && !info && <div className="GameOverlayMenu Ready">
      <div className='Topdown'>
        <button className={'btn Go'} onClick={newGame}>Ready</button>
        <button className={'btn Back Orange'} onClick={backGame}>Back</button>
        <button className={btnHelpClass} onClick={()=>{setInfo('info_game')}}>How to play?</button>
      </div>
    </div>}

    {info && <div className={'HowToPlayInfo'}><Bubble className={'Topdown'}>
      { info === 'info_game' ? <>
        <h1>How to play</h1>
        <br/>
        <ul>
          <li>You will be shown 2 notes, the notes point in which way <b>Sneel</b> can turn.</li>
          <li>Press the correct <b>piano note</b> to guide the <b>Sneel</b> to food.</li>
          <li>You will loose a life when you press a wrong note.</li>
        </ul>
        <br/>
        <i>Hint: dont worry about octaves, i.e. you can press any C key for any C note you see </i>
        <br/>
        <button  onClick={()=>{setInfo('info_range')}}>Show me note names!</button>
      
      </> : <>
      
        <h1>Preset note ranges:</h1>
        <HelpGamePitchRange />
      </>} 
      <button  onClick={()=>{setInfo(null)}}>OK</button>
    </Bubble></div>}

    {/* {info === 'info_notes' && <div className={'HowToNotesInfo'}><Bubble className={'Topdown'}>
      <h1>Note Identification help</h1>
      <br/>
      <ul>
        <li>You will be shown 2 notes, the notes point in which way Sneel can turn.</li>
        <li>Press the correct piano note to guide the snake to food.</li>
        <li>You will loose a life when you press a wrong note.</li>
      </ul>
      <i>Hint: dont worry about octaves, i.e. you can press any C key for any C note you see </i>
      <br/>
      <button  onClick={()=>{setInfo(null)}}>OK</button>
    </Bubble></div>} */}


    {paused && !info && <div className="GameOverlayMenu Pause Topdown Frame">
      <h1>Paused</h1>
      <button className='btn Go' onClick={()=>{setPaused(false)}}>Resume</button>
      <button className='btn Back Orange' onClick={backGame}>Pick New Settings</button>  
      <button className='btn Config' disabled={true} onClick={()=>{setPaused(true)}}>Input Config</button>       
      <button className={btnHelpClass} onClick={()=>{setInfo('info_game')}}>How to play?</button>
      <button onClick={()=>{onPresent('/')}}>Quit</button>    
    </div>}

    <div className={'GameBasePitch ' + (paused || !isStarted ? 'Fade' : '')}>
      

      <section>
        <StatusBar ready={gameActive} onPause={()=>{setPaused(true)}} score={score.value} currentKey={currentKey?.slice(0,-1)} streak={score.streak} health={health} direction={direction}/>
      </section>
      
      <section className="Frame Snake">
        
        {countDown && <section className='Countdown'>
          <h1>{countDown}</h1>
        </section>}
        
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
          {(isStarted) && <Snake 
              where={levelData.startPoint} 
              length={length} 
              direction={direction} 
              tick={{value:gameTick, speed:levelData.ticksPerMove}} 
              onAdvance={onSnakeMove}
            />}
          {(isStarted) && <Item where={item.pos} type={item.type}/>}
        </SnakeView>

        {guessData && !paused && <>
          <NoteView 
            className={'GuessA ' + (isHorizontal ? 'GuessHorizontal' : '')}
            data={[{clef:guessData.clefs[0], notes:[guessData.notes[0]+'-4n']}]}
            stavesExtra={1}
            slide={-0.5}
          />
          <NoteView  
            className={'GuessB ' + (isHorizontal ? 'GuessHorizontal' : '')}
            data={[{clef:guessData.clefs[0], notes:[guessData.notes[1]+'-4n']}]}
            stavesExtra={1}
            slide={-0.5}
          />
        </>}

      </section>

      <section className="InputControls">
        <div className="InputMethod" >
          <NoteInput
            root={getMidi('C4')}
            count={12}
            onNoteOff={(n)=>{
              gameActive && onSelectNote(n)
            }}
            showOctave={false}
            showName={levelData.guessData?.showName}
            allowDragging={false}
          />
        </div>
      </section>
    </div>
  </>);
}


function StatusBar({score = 0, health, streak, currentKey, onPause, ready, ...restProps}){
  const _streak =  (
    streak >= multipliers.high ? 'streak high' 
    : streak >= multipliers.mid ? 'streak mid' 
    : streak >= multipliers.low ? 'streak low' 
  : '')
  const _score = score === null ? '-----' : leadingZeros(score,5); 
  return (
  <div className=" Status" >
    <button className='btn Back' onClick={onPause} disabled={!ready}></button>
   
    <div className='HealthBar'>
      {[...Array(5)].map((e,i)=>{
        return <img key={`heart_${i}`} className={'statusHeart ' + (!health || i>(health-1) ? 'empty' : '') } alt='heal' /> 
      })}
    </div>

    <div>
      {/* <span>Score: </span><br/> */}
      <span className={'Score ' + _streak}>{_score}</span>
    </div>
    {/* <span className='Key'>Key: {currentKey}</span> */}
    {/* <img className={'statusArrow' + (pending ? ' pending' : '')} alt='dir' style={{
      transform:`rotateZ(${90 * (1+dirToIdx[direction])}deg)`,
    }} /> */}
  </div>
  )
}