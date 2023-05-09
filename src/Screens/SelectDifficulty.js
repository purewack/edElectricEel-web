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
import { useEffect, useState, useReducer, useCallback, useContext } from "react";
import { isBrowser } from 'react-device-detect';

import Bubble from '../Components/Bubble'
import NoteInput from "../Components/NoteInput/index"
import NoteView from "../Components/NoteView/index"
import {SnakeLoadbar} from "../Components/SnakeView"
import HintedDiv from '../Components/Hint'
import { MidiContext } from '../App'
import { rangeReducer, rangeInit } from '../Reducers/pitchRange'
import { 
    getMidi, 
    limit, 
    rand, 
    makeSelectionFromRangeNotes
} from "../Helpers/Hooks";
import { useLocation } from 'react-router-dom'

const humanBoolean = bool=>bool ? 'Yes' : 'No'
 const exampleRangeTreble = makeSelectionFromRangeNotes('C4','C6').map(n => n === 'C4' ? 'C4-8n-ok' : n)
const exampleRangeAlto = makeSelectionFromRangeNotes('C3','C5').map(n => n === 'C4' ? 'C4-8n-ok' : n)
const exampleRangeBass = makeSelectionFromRangeNotes('C2','C4').map(n => n === 'C4' ? 'C4-8n-ok' : n)


export function SelectDifficulty({onPresent, theme}){
    const midiPlayer = useContext(MidiContext)
    const [difficulty, setDifficulty] = useState({level:'easy',custom:false});
    
    const [rangeState, rangeDispatch] = useReducer(rangeReducer,rangeInit)
    const [bpm, setBPMState] = useState(100);
    const [hearts, setHearts] = useState(5)
    const [length, setLength] = useState(4)
    const [ticksPerMove, setTicksPerMove] = useState(4);
    const [showName, setShowName] = useState(true);
    
    const [gameStats,setGameStats] = useState({})
    const [gameStatsSummary,setGameStatsSummary] = useState(false)
    const [ready, setReady] = useState(false)

    const [previewNotesSlide, setPreviewNotesSlide] = useState({adjusting:false, value:0})
    const movePreviewRange = useCallback((ev)=>{
        if(previewNotesSlide.adjusting){
            setPreviewNotesSlide(s => {
                return {...s, value: limit(s.value - ev.movementX/10, 0, rangeState.range.length * 2 + 6)
            }})
        }
    },[rangeState,previewNotesSlide.adjusting])
    const [clefInfo, setClefInfo] = useState(false)

    const playGame = ()=>{
        onPresent('/pitch/single',1000, undefined, {level:gameStats})
        midiPlayer.stop(1)
    }

    const setBPM = (inc, set=false)=>{
        setBPMState(b => {
            if(b <= 30 || b >= 180) return b 
            const bb = set ? inc : b+inc;
            Tone.Transport.bpm.value = bb;
            return bb
        });
    }
    
    useEffect(()=>{
        setPreviewNotesSlide({value: 0, adjusting: false})
        setGameStats({
            startHealth:hearts,
            startLength:length,
            ticksPerMove,
            tempo : bpm,
            showInputNoteNames: showName,
            guessData:{
                type : "selection",
                notes: [...rangeState.range],
                clefs : {...rangeState.clefs},
                accidentalPreference: rangeState.accidentals.use ? rangeState.accidentals.prefer : null,
                wasRangeChromatic: rangeState.rangeChromatic,
                difficulty: {...difficulty}
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
        })
    },[hearts,length,bpm,rangeState,showName,ticksPerMove,difficulty])
    
    const preset = (p)=>{
        rangeDispatch({type:'preset',difficulty:p})
        setDifficulty(d => {return {...d,level:p}})
        setTicksPerMove(4)
        setLength(4)
        switch(p){
            case 'easy':
            default:
                setHearts(5)
                setBPM(80,true)
                break;

            case 'medium':
                setHearts(5)
                setBPM(100,true)
                break;

            case 'hard':
                setHearts(4)
                setBPM(120,true)
                break;
        }
    }

  
    useEffect(()=>{
        midiPlayer.play(theme).then(()=>{
            setReady(true)
            preset('easy')
        });
        return ()=>{
            setReady(false)
        }
    },[])

    useEffect(()=>{
        if(difficulty.custom){
            midiPlayer.mute(null,1)
            midiPlayer.unmute(['drums'],1)
        }
        else
            midiPlayer.unmute(null,1)
    },[difficulty.custom])

    const loc = useLocation()
    useState(()=>{
        const options = loc.state
        console.log('Game options data: ', options)
        if(options?.level) {
            setDifficulty(d => {return {...d, custom:true}})
            setHearts(options.level.startHealth)
            setLength(options.level.startLength)
            setBPM(options.level.tempo,true)
            setTicksPerMove(options.level.ticksPerMove)
            setShowName(options.level.showInputNoteNames)
            rangeDispatch({type:'set',data: options.level.guessData})
        }
    },[loc])


    const chromaticString = `Using ${
        rangeState.rangeChromatic === undefined ? 'arbitrary' 
        : (rangeState.rangeChromatic ? 'chromatic' : 'natural')
    } notes`
    const isTweaking = difficulty?.custom
    const custom = isTweaking ? ' foreground' : '';

    return (<>
    
    <div className={gameStatsSummary ? "SelectDifficulty Fade" : 'SelectDifficulty'}>  

        <h1 className={'Title ' + (!isTweaking ? 'SettingsTitle' : 'TweakTitle')}>
            {!isTweaking
        ? 'Select Difficulty:'
        : 'Tweak Settings:'
        }</h1>

        <section className={'Difficulties' + (isTweaking ? ' custom' : '')}>
            <div className='Frame'>
                <div className={(difficulty.level === 'easy' && !custom ? 'selected' : '') }>
                    <button className='btnDifficulty' 
                        onClick={()=>{preset('easy')}}
                    >
                        <span>Beginner</span><br/>
                        <img alt="♪" src={noteSVG} />
                    </button>
                </div>
                <div className={(difficulty.level === 'medium' && !custom ? 'selected' : '') }>
                    <button className='btnDifficulty' 
                        onClick={()=>{preset('medium')}}
                    >
                        <span>Learner</span><br/>
                        <img alt="♪" src={noteSVG} />
                        <img alt="♪" src={noteSVG} />
                    </button>
                </div>
                <div className={(difficulty.level === 'hard' && !custom ? 'selected' : '')}>
                    <button className='btnDifficulty' 
                        onClick={()=>{preset('hard')}}
                    >
                        <span>Experienced</span><br/>
                        <img alt="♪" src={noteSVG} />
                        <img alt="♪" src={noteSVG} />
                        <img alt="♪" src={noteSVG} />
                    </button>
                </div>
            </div>
        </section>

        {difficulty?.custom ?
        <>
        <div className='Frame'>
        <section className='CustomOptions Topdown'>
  
            <h1>Tempo:</h1>
            <div className='Frame'>
            <section className='SelectBPM Topdown'>
                <div className='Leftright'>
                    <button onClick={()=>{setBPM(-2)}}>-</button>
                    <MetronomeIndicator bpm={bpm}/>
                    <button onClick={()=>{setBPM(2)}}>+</button>
                </div>
                <span>BPM: {bpm}</span>
            </section>
            </div>

            <h1>Pitches:</h1>
            <p>{chromaticString}</p>                
            <div className='NoteSelection Topdown'>
                <HintedDiv className={'RangeNoteButtons Leftright' + (rangeState.rangeChromatic ? ' CustomRange' : '')}
                    hide={rangeState.adjustingRange}
                    hintComponent={<Bubble stemDirection='up' className='RangeNoteButtonsHelp'>
                    <p>Drag up or down to adjust range</p>
                    </Bubble>}
                > 
                        <NoteButton label={'Lowest: ' + rangeState.noteLow}
                            note={rangeState.noteLow}
                            clef={(rangeState.start < getMidi('C4') ? 'bass' : 'treble')}
                            onPointerUp={(ev)=>{
                                ev.preventDefault()
                                rangeDispatch({type:'stopRangeAdjust'})
                            }}
                            onPointerDown={(ev)=>{
                                ev.preventDefault()
                                rangeDispatch({type:'startRangeAdjust'})
                            }}
                            onPointerMove={(ev)=>{
                                ev.preventDefault()
                                if(!rangeState.adjustingRange) return
                                rangeDispatch({type:'changeRangeMin', movement:(-ev.movementY)})
                            }}
                            onPointerLeave={(ev)=>{
                                rangeDispatch({type:'stopRangeAdjust'})
                            }}
                            onPointerCancel={(ev)=>{
                                rangeDispatch({type:'stopRangeAdjust'})
                            }}
                        />
                        
                        <div className='Topdown'>
                            {rangeState.rangeChromatic === undefined ? 
                                <p>...</p> 
                                :  rangeState.rangeChromatic === false ?
                                <img alt='[Arrow Right]' className='arrowRight'/> 
                                : 
                                <img alt='[Arrow Right]' className='arrowRight Alt'/> 
                            }
                        </div>
                        
                        <NoteButton label={'Highest: ' + rangeState.noteHigh}
                            note={rangeState.noteHigh}
                            clef={(rangeState.end < getMidi('C4') ? 'bass' : 'treble')}
                            stavesExtra={rangeState.end > getMidi('B5') ? 4 : undefined }
                            onPointerUp={(ev)=>{
                                ev.preventDefault()
                                rangeDispatch({type:'stopRangeAdjust'})
                            }}
                            onPointerDown={(ev)=>{
                                ev.preventDefault()
                                rangeDispatch({type:'startRangeAdjust'})
                            }}
                            onPointerMove={(ev)=>{
                                ev.preventDefault()
                                if(!rangeState.adjustingRange) return
                                rangeDispatch({type:'changeRangeMax', movement:(-ev.movementY)})
                            }}
                            onPointerLeave={(ev)=>{
                                rangeDispatch({type:'stopRangeAdjust'})
                            }}
                            onPointerCancel={(ev)=>{
                                rangeDispatch({type:'stopRangeAdjust'})
                            }}
                        />                    
                </HintedDiv>

                {!rangeState.fine && 
                <button className='RangeNoteAdjustButton' onClick={()=>{
                    rangeDispatch({type:'startFine'})
                }}><img alt='Fine tune' className='btnFineTune'/></button>}

                <div className='Exclusions'>
                    {rangeState.fine &&
                        <Bubble stemDirection='up' className={'InputFine Topdown'}>
                            
                            <div className='Leftright'>
                                <img alt='[Arrow Left]' className='arrowLeft'/>
                                <NoteInput 
                                    allowNoteDragging={false} 
                                    autoCenter={true}
                                    root={getMidi('C2')} 
                                    count={12*5} 
                                    showRange={rangeState.range}
                                    onNoteOff={(n,haveScrolled)=>{
                                        // console.log(n,rangeState.range)
                                        if(!haveScrolled){
                                            rangeDispatch({type:'keypress', key:n})
                                            midiPlayer.nodes.input.triggerAttackRelease(n,0.2);
                                        }
                                    }}
                                />
                                <img alt='[Arrow Rigth]' className='arrowRight'/>
                            </div>
                            
                            <div className='ExclusionsFineButtons Topdown'>
                            {rangeState.rangeChromatic !== undefined && <button onClick={()=>{
                                if(rangeState.accidentals.use)
                                rangeDispatch({type:'noAccidentals'})
                                else
                                rangeDispatch({type:'useAccidentals'})
                            }}> 
                                Accidentals (#/b): {rangeState.accidentals.use ? 'Yes' : 'No'}
                            </button>}

                            {(rangeState.accidentals.use || rangeState.rangeChromatic === undefined) && 
                            <button onClick={()=>{
                                rangeDispatch({type:'nextAccidentalPref'})
                            }}>{'Preferred Accidental: '}<span>{rangeState.accidentals.prefer}</span></button>}

                            <button onClick={()=>{
                                rangeDispatch({type:'endFine'})
                            }}>Done</button>
                            
                            </div>
                        </Bubble> 
                    }
                </div>
                
            </div>

            <h1 className='ClefTitle'>Clefs: 
                <Bubble stemDirection='up' className={clefInfo ? 'ClefInfoHelp' : 'ClefInfoHelp Hide'}>
                    <p>A minimum of 3 notes across all clefs is required to adjust the spawn chances</p>
                    <br/>
                    <p>Treble range: C4 onwards</p>
                    <NoteView noBarStart stavesExtra={2.5} data={[{clef:'treble', notes: exampleRangeTreble}]}/>
                    <p>Alto range: C3 - C5</p>
                    <NoteView noBarStart stavesExtra={2.5} data={[{clef:'alto', notes: exampleRangeAlto}]}/>
                    <p>Bass range: less than C4</p>
                    <NoteView noBarStart stavesExtra={2.5} data={[{clef:'bass', notes: exampleRangeBass}]}/>
                    <button onClick={()=>{setClefInfo(false)}}>Ok</button>
                </Bubble>
            </h1>
            
            <div className='ClefSummaryContainer Leftright'>
            <HintedDiv className='ClefSummary'
                hide={rangeState.adjustingClef}
                hintComponent={<Bubble stemDirection='down' className='AdjustClefHelp'>
                    {!rangeState.clefLock.treble ? 
                        <p>Drag up or down to adjust chances</p>
                    :
                        <p>Please change note range to adjust this clef chances</p>
                    }
                </Bubble>}
            >
                <ClefButton className={
                    (!rangeState.clefs.treble ? 'inactive ' : '') 
                    + (rangeState.clefLock.treble ? 'locked ' : '') 
                } type='treble' chance={Math.trunc(rangeState.clefs.treble*100)}
                    onPointerDown={(ev)=>{
                        ev.preventDefault()
                        rangeDispatch({type:'startClefChance', clef:'treble'})
                    }}
                    onPointerUp={(ev)=>{
                        ev.preventDefault()
                        rangeDispatch({type:'stopClefChance', clef:'treble'})
                    }}
                    onPointerMove={(ev)=>{
                        ev.preventDefault()
                        if(!rangeState.adjustingClef) return
                        rangeDispatch({type:'adjustClefChance', clef:'treble', movement:(-ev.movementY)})
                    }}
                    onPointerLeave={(ev)=>{
                        rangeDispatch({type:'stopClefChance', clef:'treble'})
                    }}
                    onPointerCancel={(ev)=>{
                        rangeDispatch({type:'stopClefChance', clef:'treble'})
                    }}/>
            </HintedDiv>
            <HintedDiv className='ClefSummary'
                hide={rangeState.adjustingClef}
                hintComponent={<Bubble stemDirection='down' className='AdjustClefHelp'>
                    {!rangeState.clefLock.alto  ? 
                        <p>Drag up or down to adjust chances</p>
                    :
                        <p>Please change note range to adjust this clef chances</p>
                    }
                </Bubble>}
            >
                <ClefButton className={
                    (!rangeState.clefs.alto ? 'inactive ' : '') 
                    + (rangeState.clefLock.alto ? 'locked ' : '')  
                }
                type='alto' chance={Math.trunc(rangeState.clefs.alto*100)}
                    onPointerDown={(ev)=>{
                        ev.preventDefault()
                        rangeDispatch({type:'startClefChance', clef:'alto'})
                    }}
                    onPointerUp={(ev)=>{
                        ev.preventDefault()
                        rangeDispatch({type:'stopClefChance', clef:'alto'})
                    }}
                    onPointerMove={(ev)=>{
                        ev.preventDefault()
                        if(!rangeState.adjustingClef) return
                        rangeDispatch({type:'adjustClefChance', clef:'alto', movement:(-ev.movementY)})
                    }}
                    onPointerLeave={(ev)=>{
                        rangeDispatch({type:'stopClefChance', clef:'alto'})
                    }}
                    onPointerCancel={(ev)=>{
                        rangeDispatch({type:'stopClefChance', clef:'alto'})
                    }}/>
            </HintedDiv>
            
            <HintedDiv className='ClefSummary'
                hide={rangeState.adjustingClef}
                hintComponent={<Bubble stemDirection='down' className='AdjustClefHelp'>
                    {!rangeState.clefLock.bass ? 
                        <p>Drag up or down to adjust chances</p>
                    :
                        <p>Please change note range to adjust this clef chances</p>
                    }
                </Bubble>}
            >
                <ClefButton className={
                    (!rangeState.clefs.bass ? 'inactive ' : '') 
                    + (rangeState.clefLock.bass ? 'locked ' : '') 
                } type='bass' chance={Math.trunc(rangeState.clefs.bass*100)}
                    onPointerDown={(ev)=>{
                        ev.preventDefault()
                        rangeDispatch({type:'startClefChance', clef:'bass'})
                    }}
                    onPointerUp={(ev)=>{
                        ev.preventDefault()
                        rangeDispatch({type:'stopClefChance', clef:'bass'})
                    }}
                    onPointerMove={(ev)=>{
                        ev.preventDefault()
                        if(!rangeState.adjustingClef) return
                        rangeDispatch({type:'adjustClefChance', clef:'bass', movement:(-ev.movementY)})
                    }}
                    onPointerLeave={(ev)=>{
                        rangeDispatch({type:'stopClefChance', clef:'bass'})
                    }}
                    onPointerCancel={(ev)=>{
                        rangeDispatch({type:'stopClefChance', clef:'bass'})
                    }}
                    />
            </HintedDiv>
            </div>
            <button onClick={()=>{setClefInfo(true)}}>?</button>

            <h1>Game:</h1>
            <button className='btnHealth Topdown'
                onClick={()=>{
                    setHearts(h => {
                        if(h===1) return 5
                        return h-1
                    })
                }}
            >
                <span>Starting Health</span>
                <span className='Hearts Leftright'>
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

            <button className='btnSpeed Topdown'
                onClick={()=>{
                    setTicksPerMove(t => {
                        if(t===8) return 4
                        if(t===4) return 2
                        if(t===2) return 1
                        if(t===1) return 8
                    })
                }}
            >
                <img alt='clock'/>
                <span>Snake Speed: {ticksPerMove} beat{ticksPerMove > 1 ? 's' : ''}/tile</span>
                
            </button>
            
            <button onClick={()=>setShowName(s=>!s)}>
                Show Input Note names: {humanBoolean(showName)}
            </button>
            
            <button className='btnRandom Leftright' onClick={()=>{  
                setHearts(rand(1,5))
                setLength(rand(3,6))
                setTicksPerMove(rand(1,2)*2)
                setBPM(Math.trunc(rand(100,150)/2) * 2,true)
                rangeDispatch({type:'random'})
            }}>
                <span>Pick for Me!</span>
                <Dice3D />
            </button>
        </section>
        </div>
        </>
        
        :

        <button className='btnCustom Leftright'
            onClick={()=>{
                setDifficulty(d => {
                    return {...d, custom: true}
                })
            }}
        >
            <img alt="note" src={flatSVG} />
            <span>Customize</span>
            <img alt="note" src={sharpSVG} />
        </button>}

        <div className={'SelectDifficultySummary Topdown Frame ' + (difficulty.custom ? (gameStatsSummary ? 'Floating' : 'Floating Hide') : '')}>
            <h1>Looks ok?</h1>
            <ul>
                <li>Tempo: {bpm} bpm</li>
                <li>Lives: {hearts}</li>
                <li>Start Length: {length}</li>
                <li>Speed: {ticksPerMove} beats/tile</li>
                <li>
                    <p>Clef chances:</p>
                    <ul>
                    {rangeState.clefs.treble ? <li>Treble {Math.trunc(rangeState.clefs.treble*100)}%</li> : null}
                    {rangeState.clefs.alto ? <li>Alto {Math.trunc(rangeState.clefs.alto*100)}%</li> : null}
                    {rangeState.clefs.bass ? <li>Bass {Math.trunc(rangeState.clefs.bass*100)}%</li> : null}
                    </ul>
                </li>
                <li> {chromaticString} <br/> {(rangeState.accidentals.use || rangeState.rangeChromatic === undefined) ? (
                    ' with a preference for ' + rangeState.accidentals.prefer + ' accidentals'
                ) : ''}</li>
                <li>Game will pick from {rangeState.range.length} notes:</li>
            </ul>
            <HintedDiv className={'RangeHintDiv'} hide={previewNotesSlide.adjusting} hintComponent={<Bubble stemDirection={'down'}>Drag left and right to see all notes</Bubble>}>
                <NoteView slide={previewNotesSlide.value} stavesExtra={rangeState.end > getMidi('B5') ? 4 : 2} noBarStart data={rangeState.previewNoteViewData}
                    onPointerDown={(ev)=>{
                        if(ev.buttons === 1)
                        setPreviewNotesSlide(s => {return {...s, adjusting:true}})
                    }}
                    onPointerUp={()=>{
                        setPreviewNotesSlide(s => {return {...s, adjusting:false}})
                    }}
                    onPointerLeave={()=>{
                        setPreviewNotesSlide(s => {return {...s, adjusting:false}})
                    }}
                    onPointerCancel={()=>{
                        setPreviewNotesSlide(s => {return {...s, adjusting:false}})
                    }}
                    onPointerMove={movePreviewRange}
                />
            </HintedDiv> 
            {difficulty.custom && <section className='Navigation Leftright'>

                <button className='btnBack Leftright'
                    onClick={()=>{
                        setGameStatsSummary(false)
                    }}>
                    <img alt="arrow" src={arrowSVG} />
                    <span>Edit</span> 
                </button>

                <button className='alt btnGo Leftright'
                    onClick={playGame}
                >
                    <span>Lets Go!</span> 
                    <img alt="arrow" src={arrowSVG} />
                </button>
            </section>}
        </div>

        <section className='Navigation Leftright'>
            <button className='btnBack Leftright'
            disabled={!ready}
            onClick={()=>{
                onPresent('/')
            }}>
                <img alt="arrow" src={arrowSVG} />
                <span>Back</span> 
            </button>
            <button className='alt btnGo Leftright'
            disabled={!ready}
            onClick={()=>{
                if(!difficulty.custom)
                playGame()
                else
                setGameStatsSummary(true)
            }}>
                <span>{difficulty.custom ? 'Confirm' : 'Lets Go!'}</span> 
                <img alt="arrow" src={arrowSVG} />
            </button>
        </section>
    </div>
    </>)
}

function ClefButton(props){
    const {type,chance,className, ...restProps} = props

    return <button className={'ClefButton ' + className} {...restProps}>
        <span>{type}</span>
        <NoteView 
        noBarStart 
        slide={-0.5}
        stavesExtra={0}
        data={[{clef:type}]}/>
        <span>{chance !== undefined ? '%'+chance : ''}</span>
    </button>
}

function NoteButton(props){
    const {label,clef = 'treble',note = 'C4',onClick,stavesExtra, ...restProps} = props
    return (
    <button 
        className={'btnNoteView btnNoteRange'}
        onClick={onClick}
        {...restProps}
    >
        <span>{label}</span>
        <NoteView 
            slide={stavesExtra ? -3.5 : -2}
            stavesExtra={stavesExtra ? stavesExtra : 2}
            data={[{clef, notes:[note + '-4n']}]}
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