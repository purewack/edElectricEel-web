import '../Styles//SelectDifficulty.css'
import '../Styles/Dice.css'
import '../Styles/Metronome.css'

import arrowSVG from "../AssetsImport/icons/arrow.svg"
import heartSVG from "../AssetsImport/icons/heart.svg"
import noteSVG from "../Components/NoteView/svg/8n.svg"
import sharpSVG from "../Components/NoteView/svg/sharp.svg"
import flatSVG from "../Components/NoteView/svg/flat.svg"
import metroSVG from "../AssetsImport/metronome/metro.svg"
import metroNeedleSVG from "../AssetsImport/metronome/metro_needle.svg"

import * as Tone from "tone";
import { useRef, useEffect, useState } from "react";
import { isBrowser } from 'react-device-detect';

import NoteInput from "../Components/NoteInput/index"
import NoteView from "../Components/NoteView/index"
import {SnakeLoadbar} from "../Components/SnakeView"
import { midiPlayer } from '../Components/Sound'


export function SelectDifficulty({onPresent}){
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
        midiPlayer.play('classy.mid');
    },[])
    

    const newBPM = (inc, set=false)=>{
        setBPM(b => {
            if(b <= 30 || b >= 180) return b 
            const bb = set ? inc : b+inc;
            if(difficulty.custom){
                Tone.Transport.bpm.value = bb;
            }
            return bb
        });
    }

    const newSettings = (type)=>{
        setClefs({bass:false, alto:false, treble:true})
        setLength(3)
        switch(type){
            default:
                setShowRange(rangeEasy)
                newBPM(100,true)
                setHearts(5)
                break;
            case 'medium':
                setShowRange(rangeMed)
                newBPM(120,true)
                setHearts(5)
                break;
            case 'hard':
                setShowRange(rangeHard)
                newBPM(140,true)
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
        newBPM(Math.floor(rand(100,150)/2) * 2,true)

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

        midiPlayer.players.input.triggerAttackRelease(n,'4n',Tone.now());
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
                    midiPlayer.mute(null,1)
                    midiPlayer.unmute(['drums'],1)
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
            <button className='alt btnGo GalleryFlex'
            onClick={()=>{
                midiPlayer.stop(2)
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