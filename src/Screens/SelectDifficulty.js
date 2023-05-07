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
import { 
    getNote, 
    getMidi, 
    toMidiArray, 
    makeSelectionFromRangeMidi,
    noAccidentals, 
    respellPitch, 
    respellPitches, 
    limit, 
    rand 
} from "../Helpers/Hooks";
import { useLocation } from 'react-router-dom'

const humanBoolean = bool=>bool ? 'Yes' : 'No'
const rangeEasy = ['C4','D4','E4']
const rangeMed = ['C4','D4','E4','F4','G4','A4','B4']
const rangeHard = ['C4','D4','E4','F4','G4','A4','B4','C#4','D#4','F#4','G#4','A#4']

const rangeInit = {
    range:rangeEasy,
    rangeChromatic: false,
    rangeHint:false,

    adjustingRange: false, 
    adjustingClef: false, 
    hoverClef: false,
    hoverRange: false,
    fine:false, 

    start: getMidi('C4'), 
    end: getMidi('E4'), 
    _low: getMidi('C4'),
    _high: getMidi('E4'),
    noteLow: 'C4',
    noteHigh: 'E4',

    accidentals: {
        use: false,
        prefer: 'sharp'
    },

    clefs:{
        treble:1,
        alto:0,
        bass:0
    }
}
const rangeReducer = (state, action)=>{
    let r = {...state}

    const bassTresh = getMidi('B3')
    const recalcRange = (range)=>{
        const newRangeMidi = toMidiArray(range)
        r.start = Math.min(...newRangeMidi)
        r.end = Math.max(...newRangeMidi)
        r.noteLow = getNote(r.start, r.accidentals.prefer === 'flat' ? 'flat' : undefined)
        r.noteHigh = getNote(r.end, r.accidentals.prefer === 'flat' ? 'flat' : undefined)
        
        const chancesBass = {treble: 0, bass:1, alto: 0}
        const chancesTreble = {treble: 1, bass:0, alto: 0}
        const chancesEqual = {treble: 0.5, bass:0.5, alto:0}
        if(r.start < bassTresh && r.end < bassTresh) r.clefs = {...r.clefs, ...chancesBass}
        else if(r.start < bassTresh && r.end >= bassTresh) r.clefs = {...r.clefs, ...chancesEqual}
        else r.clefs = {...r.clefs, ...chancesTreble}

        const bassNotes = range.filter(n => getMidi(n)<bassTresh)
        const trebNotes = range.filter(n => getMidi(n)>=bassTresh)
        let data = []
        if(bassNotes.length)
            data.push({clef:'bass', notes: [...bassNotes]})
        if(trebNotes)
            data.push({clef:'treble', notes: [...trebNotes]})
        r.previewNoteViewData = data
    }


    switch(action.type){
        case 'set':
            r.range = [...action.data.notes]
            r.clefs = {...action.data.clefs}
            r.accidentals = {
                use: action.data.accidentalPreference !== undefined,
                prefer: action.data.accidentalPreference
            }
            recalcRange(r.range)
            return r
        
        case 'startRangeAdjust': 
            r.adjustingRange = true 
            return r
        case 'stopRangeAdjust':
            r.adjustingRange = false
            return r
        case 'startFine':
            r.fine = true
            return r
        case 'endFine':
            r.fine = false
            return r
    
        case 'changeRangeMax':
        case 'changeRangeMin':{
            const dy = limit(action.movement,-1,1)
            if(r.range.length === 3 && dy < 0 && action.type === 'changeRangeMax') return r
            if(r.range.length === 3 && dy > 0 && action.type === 'changeRangeMin') return r

            if(action.type === 'changeRangeMin')
                r._low =  limit(r._low+dy,  getMidi('C2'), r._high-3)
            else
                r._high = limit(r._high+dy, r._low+3, getMidi('B6'))

            const newRange = makeSelectionFromRangeMidi(r._low,r._high)
            r.range = state.accidentals.use ? newRange : noAccidentals(newRange)
            r.rangeChromatic = state.accidentals.use
            recalcRange(r.range)
            return r
        }
        case 'keypress':{
            const n = action.key
            
            if(r.range.includes(n)) {
                if(r.range.length <= 4) return r
                r.range= r.range.filter(e => respellPitch(e,'sharp') !== n)
                r.rangeChromatic = undefined
                recalcRange(r.range)
                return r
            }
            else {
                let newRange = [...r.range]
                newRange.push(n)
                recalcRange(newRange)
                r.range = newRange
                r.rangeChromatic = undefined
                return r
            }
        }

        case 'noAccidentals':{
            let newRange = noAccidentals(makeSelectionFromRangeMidi(r.start,r.end))
            if(newRange.length < 3){
                if(newRange.at(-1) === 'B6') {
                    newRange = noAccidentals(makeSelectionFromRangeMidi(r.start-1,r.end))
                }
                else {
                    newRange = noAccidentals(makeSelectionFromRangeMidi(r.start,r.end+1))
                }
            }
            recalcRange(newRange)
            return {...r, range: newRange, rangeChromatic:false, accidentals: {...r.accidentals, use:false}}
        }
        case 'useAccidentals':{
            const newRange = makeSelectionFromRangeMidi(r.start,r.end)
            recalcRange(newRange)
            return {...r, range: newRange, rangeChromatic: true, accidentals: {...r.accidentals, use:true}}
        }
        case 'nextAccidentalPref': 
            let next
            if(r.accidentals.prefer === 'both') next = 'sharp'
            else if(r.accidentals.prefer === 'sharp') next = 'flat'
            else if(r.accidentals.prefer === 'flat') next = 'both'
            r.accidentals.prefer = next
            
            const rrange = respellPitches(r.range, (next === 'flat' ? 'flat' : 'sharp'))
            r.range = rrange

            recalcRange(r.range)
            return r

        
        case 'startClefChance':
            r.adjustingClef = true
            return r
    
        case 'stopClefChance':
            r.adjustingClef = false
            return r

        case 'adjustClefChance':{
            const c = action.clef
            const m = (action.movement/200)
            const hasBass = (r.start < bassTresh || r.end < bassTresh)
            const hasTreble = (r.start >= bassTresh || r.end >= bassTresh)
            const pureTreble = (r.start >= bassTresh && r.end >= bassTresh)
            const pureBass = (r.start < bassTresh && r.end < bassTresh)
            const alto = r.clefs.alto
            
            const balanceTrebleAlto = (pure) => {
                if(c === 'bass' && !pure && m > 0) {
                    r.clefs.bass = 0.01
                    return
                } 
                else if(c === 'bass' && m < 0 && !r.clefs.bass)
                    return
                else
                    r.clefs.bass = 0

                if(c === 'treble'){
                    r.clefs.treble += m
                    r.clefs.alto = 1-r.clefs.treble
                }
                else{
                    r.clefs.alto += m
                    r.clefs.treble = 1-r.clefs.alto
                }
                r.clefs.treble = limit(r.clefs.treble,0,1)
                r.clefs.alto = limit(r.clefs.alto,0,1)
            }
            const balanceBassAlto = (pure) => {
                if(c === 'treble' && !pure && m > 0) {
                    r.clefs.treble = 0.01
                    return
                } 
                else if(c === 'treble' && m < 0 && !r.clefs.treble)
                    return
                else
                    r.clefs.treble = 0

                if(c === 'bass'){
                    r.clefs.bass += m
                    r.clefs.alto = 1-r.clefs.bass
                }
                else{
                    r.clefs.alto += m
                    r.clefs.bass = 1-r.clefs.alto
                }
                r.clefs.bass = limit(r.clefs.bass,0,1)
                r.clefs.alto = limit(r.clefs.alto,0,1)
            }
            const balanceTrebleBass = () => {
                if(c === 'alto' && m > 0) {
                    r.clefs.alto = 0.01
                    return
                } 
                else if(c === 'alto' && m < 0 && !r.clefs.alto)
                    return
                else
                    r.clefs.alto = 0

                if(c === 'treble'){
                    r.clefs.treble += m
                    r.clefs.bass = 1-r.clefs.treble
                }
                else{
                    r.clefs.bass += m
                    r.clefs.treble = 1-r.clefs.bass
                }
                r.clefs.treble = limit(r.clefs.treble,0,1)
                r.clefs.bass = limit(r.clefs.bass,0,1)
            }
            const balanceAll = () => {
                if(c === 'treble'){
                    r.clefs.treble += m
                    r.clefs.bass -= m/2
                    r.clefs.alto -= m/2
                }
                else if(c === 'bass'){
                    r.clefs.treble -= m/2
                    r.clefs.bass += m
                    r.clefs.alto -= m/2
                }
                else if(c === 'alto'){
                    r.clefs.treble -= m/2
                    r.clefs.bass -= m/2
                    r.clefs.alto += m
                }
                r.clefs.treble = limit(r.clefs.treble,0,1)
                r.clefs.alto = limit(r.clefs.alto,0,1)
                r.clefs.bass = limit(r.clefs.bass,0,1)
            }

            if(pureBass){
                if((c === 'bass' || c === 'alto') && !r.clefs.treble){
                    // console.log('purebass - bassalto')
                    balanceBassAlto(true)
                }
            }
            else if(pureTreble){
                if((c === 'treble' || c === 'alto') && !r.clefs.bass){
                    // console.log('puretreb - trebalto')
                    balanceTrebleAlto(true)
                }
            }
            else {
                if(r.clefs.treble && r.clefs.bass && !r.clefs.alto){
                    // console.log('else - trebbass')
                    balanceTrebleBass()
                }
                else if(r.clefs.treble && !r.clefs.bass && r.clefs.alto){
                    // console.log('else - trebalto')
                    balanceTrebleAlto()
                }
                else if(!r.clefs.treble && r.clefs.bass && r.clefs.alto){
                    // console.log('else - bassalto')
                    balanceBassAlto()
                }
                else{
                    // console.log('else - all')
                    balanceAll()
                }
            }
            // else if(c === 'bass' && pureBass){
            //     r.movedClef.rangeHint = true
            //     return r
            // }
            // else if(c === 'treble' && pureTreble) {
            //     r.movedClef.rangeHint = true
            //     return r
            // }

            return r
        }

        case 'random':{
            r.clefs = {
                treble: 1.0,
                alto: 0.0,
                bass: 0.0
            }
            
            r.accidentals = {use: true, prefer: 'both'}

            r.range = makeSelectionFromRangeMidi(getMidi('C4'),getMidi('B4'))
            r.rangeChromatic = undefined
            r.range = r.range.map(n => {
                if(Math.random() > 0.5) return n
                return null
            })
            r.range = r.range.filter(e => e!==null)
            if(r.length < 3 ) r.range = [...rangeEasy]
            recalcRange(r.range)
            return r
        }

        case 'preset':
            r.clefs = {treble:1, bass:0, alto:0}
            r.rangeChromatic = false
            r.accidentals = {use:false,prefer:'sharp'}
            if(action.difficulty === 'hard'){
                r.range = [...rangeHard]
                r.rangeChromatic = true
                r.accidentals = {use:true, prefer:'sharp'}
            }
            else if(action.difficulty === 'medium')
                r.range = [...rangeMed]
            else 
                r.range = [...rangeEasy]
            
            recalcRange(r.range)
            return r

        default:
            return r
    }
}

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
                accidentalPreference: rangeState.accidentals.use ? rangeState.accidentals.prefer : null
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
    },[hearts,length,bpm,rangeState,showName,ticksPerMove])
    
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

    const chromaticString = `Using ${rangeState.rangeChromatic === undefined ? 'arbitrary' : (rangeState.rangeChromatic ? 'chromatic' : 'natural')} notes`

    useEffect(()=>{
        midiPlayer.play(theme).then(()=>{
            setReady(true)
            preset('easy')
        });
        return ()=>{
            setReady(false)
        }
    },[])

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
                            clef={(rangeState.start < getMidi('B3') ? 'bass' : 'treble')}
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
                            clef={(rangeState.end < getMidi('B3') ? 'bass' : 'treble')}
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

            <h1>Clefs:</h1>
            <HintedDiv className='ClefSummary'
                hide={rangeState.adjustingClef}
                hintComponent={<Bubble stemDirection='up' className='AdjustClefHelp'>
                    <p>Drag up or down to adjust range</p>
                </Bubble>}
            >
                <ClefButton className={!rangeState.clefs.treble ? 'inactive' : ''} type='treble' chance={Math.trunc(rangeState.clefs.treble*100)}
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
                <ClefButton className={!rangeState.clefs.alto ? 'inactive' : ''} type='alto' chance={Math.trunc(rangeState.clefs.alto*100)}
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
                <ClefButton className={!rangeState.clefs.bass ? 'inactive' : ''} type='bass' chance={Math.trunc(rangeState.clefs.bass*100)}
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
                midiPlayer.mute(null,1)
                midiPlayer.unmute(['drums'],1)
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
        slide={-1}
        stavesExtra={1}
        data={[{clef:type, extraText: chance !==undefined ? {text:'%'+chance, uy:1} : undefined},]}/>
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