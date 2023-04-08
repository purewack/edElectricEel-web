import '../Styles//SelectDifficulty.css'
import '../Styles/dice.css'
import '../Styles/metronome.css'

import * as Tone from "tone";
import { useRef, useEffect, useState } from "react";
import { isBrowser } from 'react-device-detect';
import { prepareSound, newBassLine, endSound, playSound } from "../Sound";
import { newNote, guessRange } from "../NoteGuess";

import NoteInput from "../NoteInput/index"
import NoteView from "../NoteView/index"
import {SnakeLoadbar} from "../SnakeView/index"

import arrowSVG from "../img/icons/arrow.svg"
import heartSVG from "../img/icons/heart.svg"
import noteSVG from "../NoteView/svg/8n.svg"
import sharpSVG from "../NoteView/svg/sharp.svg"
import flatSVG from "../NoteView/svg/flat.svg"
import metroSVG from "../img/metro/metro.svg"
import metroNeedleSVG from "../img/metro/metro_needle.svg"


export function SelectDifficulty({onPresent}){
    const [sounds, setSounds] = useState()
    
    const [difficulty, setDifficulty] = useState({level:'easy'});

    const rangeEasy = ['C4','D4','E4']
    const rangeMed = ['C4','D4','E4','F4','G4','A4','B4']
    const rangeHard = ['C4','D4','E4','F4','G4','A4','B4','D#4','C#4','F#4','G#4','A#4']
    const [showRange, setShowRange] = useState(rangeEasy)
    const [clefs, setClefs] = useState({bass:false, alto:false, treble:true})
    const [bpm, setBPM] = useState(100);
    const [movePerBeat, setMovePerBeat] = useState(4);
    const [hearts, setHearts] = useState(5)
    const [length, setLength] = useState(3)
    
    useEffect(()=>{
        if(!sounds){
            const s = new Tone.Sampler(
                {C4: 'sound/hat8bit1.wav'}
            ).toDestination();
            s.volume.value = -18

            const p = new Tone.Synth().toDestination();
            p.oscillator.type = "triangle";
            p.volume.value = -18

            setSounds({piano:p, sampler: s})
            Tone.Transport.start();
        }
        
        return ()=>{
            Tone.Transport.stop();
            Tone.Transport.cancel();
            if(sounds){
                for(const i in sounds){
                    console.log(i)
                    sounds[i].dispose();
                }
            }
        }
    },[])
    

    const newBPM = (inc)=>{
        setBPM(b => {
            if(b <= 30 || b >= 180) return b 
            const bb = b+inc;
            Tone.Transport.bpm.value = bb;
            Tone.Transport.position = '0:0:0'
            return bb
        });
    }

    const newSettings = (type)=>{
        setClefs({bass:false, alto:false, treble:true})
        setLength(3)
        switch(type){
            default:
                setShowRange(rangeEasy)
                setBPM(100)
                setHearts(5)
                break;
            case 'medium':
                setShowRange(rangeMed)
                setBPM(120)
                setHearts(5)
                break;
            case 'hard':
                setShowRange(rangeHard)
                setBPM(140)
                setHearts(4)
                break;
        }
    }

    const newClef = (type)=>{
        const active = (clefs.bass && 1) + (clefs.alto && 1) + (clefs.treble && 1) + 0
        if(clefs[type] && active === 1) return
        setClefs(c => {
            let cc = {...c}
            cc[type] = !cc[type]
            return cc
        })
    }

    const randomize = ()=>{
        const rand = (min,max) => min + Math.floor(Math.random() * (max-min))
        
        setHearts(rand(1,5))
        setLength(rand(2,5))
        setBPM(Math.floor(rand(100,150)/2) * 2)

        setClefs({
            treble:true,
            alto: Math.random() > 0.8,
            bass: Math.random() > 0.4
        })

        setShowRange(rangeHard.map(e=>{
            if(Math.random() > 0.5) return e
            return null
        }))
        setShowRange(r => {
            const rr = r.filter(e => e!==null)
            if(rr.length === 0) return ['C4', 'A4']
            return rr
        })
    }

    const noteon = (n)=>{
        let add = true
        showRange.forEach(e => {
            if(e === n) {
                add = false
                return
            }
        })

        if(add) setShowRange(r => [...r, n])
        else setShowRange(r => r.filter((e)=>e !== n))

        sounds.piano.triggerAttackRelease(n,'4n',Tone.now());
    }

    const isTweaking = difficulty?.custom

    return (<div className="SelectDifficulty ">
        
        <h1 className={!isTweaking ? 'SettingsTitle' : 'TweakTitle'}>
            {!isTweaking
        ? 'Select Difficulty:'
        : 'Tweak Settings:'
        }</h1>

        <section className='Difficulties'>
            <div className='Frame'>
                <button className='btnDifficulty' onClick={()=>{newSettings('easy')}}>
                    <span>Beginner</span><br/>
                    <img alt="note" src={noteSVG} />
                </button>
                <button className='btnDifficulty' onClick={()=>{newSettings('medium')}}>
                    <span>Learner</span><br/>
                    <img alt="note" src={noteSVG} />
                    <img alt="note" src={noteSVG} />
                </button>
                <button className='btnDifficulty' onClick={()=>{newSettings('hard')}}>
                    <span>Experienced</span><br/>
                    <img alt="note" src={noteSVG} />
                    <img alt="note" src={noteSVG} />
                    <img alt="note" src={noteSVG} />
                </button>
            </div>
        </section>

        
        {difficulty?.custom && 
        <>
        <div className='Frame'>
        <section className='CustomOptions SelectionFlex'>

            <NoteInput 
                allowDragging={isBrowser} 
                showRange={showRange} 
                showOctave={false}
                onNoteOn={noteon}
            />
            <div className='Clefs'>
                <ClefButton type='bass' selected={clefs.bass} onClick={()=>{
                    newClef('bass')
                }}/>
                <ClefButton type='alto' selected={clefs.alto} onClick={()=>{
                    newClef('alto')
                }}/>
                <ClefButton type='treble' selected={clefs.treble} onClick={()=>{
                    newClef('treble')
                }}/>
            </div>

            <div className='Frame'>
            <section className='SelectBPM SelectionFlex'>
                <div className='GalleryFlex'>
                    <button onClick={()=>{newBPM(-2)}}>-</button>
                    <MetronomeIndicator bpm={bpm}/>
                    <button onClick={()=>{newBPM(2)}}>+</button>
                </div>
                <span>BPM: {bpm}</span>
            </section>
            </div>

            <button className='btnHealth'
                onClick={()=>{
                    setHearts(h => {
                        if(h===1) return 5
                        return h-1
                    })
                }}
            >
                <span>Starting Health</span>
                <span className='Hearts GalleryFlex'>
                    {[...Array(hearts)].map((e,i)=>{
                return <img key={`heart_${i}`} className={'pickHeart'} src={heartSVG} alt='heart' /> 
                })}
                </span>
            </button>
            
            <button className='btnLength'
                onClick={()=>{
                    setLength(h => {
                        if(h===3) return 6
                        return h-1
                    })
                }}
            >
                <span>Starting Length</span>
                
                <SnakeLoadbar length={length} type={'line'} area={6} tick={0}/>
            </button>


            <button className='btnRandom GalleryFlex' onClick={randomize}>
                <span>Pick for Me!</span>
                <Dice3D />
            </button>
        </section>
        </div>
        </>}
        
        {!difficulty?.custom && 
            <button className='btnCustom GalleryFlex'
                onClick={()=>{
                    setDifficulty(d => {
                        return {...d, custom: true}
                    })
                }}
            >
                <img alt="note" src={flatSVG} />
                <span>Customize</span>
                <img alt="note" src={sharpSVG} />
            </button>
        }
        <section className='Navigation GalleryFlex'>
            <button className='btnBack GalleryFlex'
            onClick={()=>{
                onPresent('title')
            }}>
                <img alt="arrow" src={arrowSVG} />
                <span>Back</span> 
            </button>
            <button className='btnGo GalleryFlex'
            onClick={()=>{
                onPresent('game')
            }}>
                <span>Lets Go!</span> 
                <img alt="arrow" src={arrowSVG} />
            </button>
        </section>
        
    </div>)
}

function ClefButton({type,onClick,selected}){

    return ( 
        <button 
            className={'btnClef ' + type + (selected ? ' btnSelected' : '')}
            onClick={onClick}
        >
        <span>{type}</span>
        <NoteView 
            slide={-1.5}
            data={[{clef:type,notes:[]}]}
            noBarStart
        />
    </button>)
}

export function Dice3D (){
    return <div className="scene">
        <div className="cube t3d" >
            <div className="cube-obj t3d">
                <div className="cube-face"></div>
                <div className="cube-face"></div>
                <div className="cube-face"></div>
                <div className="cube-face"></div>
                <div className="cube-face"></div>
                <div className="cube-face"></div>
            </div> 
        </div >
    </div>
}

export function MetronomeIndicator({bpm = 60}){
    return <div className='MetronomeIndicator'>
        <img alt='body' className='body' src={metroSVG}/>
        <img alt='needle' className='needle' src={metroNeedleSVG}
            style={{animationDuration: (60/(bpm/2)) + 's'}}
        />
    </div>
}