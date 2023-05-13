import '../Styles/TestZone.css'
import { useEffect, useState, useContext } from 'react'
import { playSoundEffect } from '../Helpers/Sound'
import { leadingZeros } from '../Helpers/Hooks'
import {enumerateRangePerClef, enumerateRangePerClefOverlap} from '../Helpers/Generators'
import { generateNewGuessPitch2 } from '../Helpers/NoteGuess'
import { MidiContext } from '../App'
import midiset from '../Helpers/midiset.json'
import Bubble from '../Components/Bubble'
import NoteView from '../Components/NoteView'

export function TestZone({onPresent}){

    const midiPlayer = useContext(MidiContext)
    useEffect(()=>{
        console.log(midiPlayer.songs)
        midiPlayer.stop(1);
        midiPlayer.prepare(midiPlayer.songs[0])
    },[])

    const [playing,setPlaying] = useState()
    const [seekHead, setSeekHead] = useState(0)

    const ts = [Math.trunc(seekHead * midiPlayer.loaded?.duration), Math.trunc(midiPlayer.loaded?.duration)]
    const tt = [
        `${Math.trunc(ts[0]/60)}:${leadingZeros(Math.trunc(ts[0]%60),2)}`,
        `${Math.trunc(ts[1]/60)}:${leadingZeros(Math.trunc(ts[1]%60),2)}`
    ]
    const seekPlayTime = playing ? `${
        tt[0]
    } / ${
        tt[1]
    }` : '0:00 / 0:00'

    const [results, setResults] = useState({})

    return <div className='TestZone'>
        <nav className='NavScreen'>
            <button className='btn Back'
                onClick={()=>{
                        onPresent('/')
                }}>
                <span>Back</span> 
            </button>
            <h1>Test Zone</h1>
        </nav>

        <section className='BGMPlayer'>
            <h2>MIDI Background Music Player {
                playing && <button onClick={()=>{
                    midiPlayer.stop()
                    setPlaying(null)
                    setSeekHead(0);
                }}>Stop</button>}
            </h2>
            
            
            <div className='Juke'>
                <div className={playing ? 'PlayDisc Spin' : 'PlayDisc'} >
                    <img alt='disc'/>
                </div>
                <label className={'SeekHead'} htmlFor={'seekHead'}> {seekPlayTime} </label>
                <input type='range' id={'seekHead'} max={1} min={0} step={0.001}
                    value={seekHead}
                    onChange={(ev)=>{
                        midiPlayer.seek(ev.target.value)
                        setSeekHead(ev.target.value)
                    }}
                    // onPointerDown={()=>{
                    //     midiPlayer.pause()
                    // }}
                    // onPointeUp={()=>{
                    //     midiPlayer.resume()
                    // }}
                /> 
                
                <p>{playing ? `Playing: ${playing}` : ''}</p>
                {/* <p>BPM: {midiPlayer.songs[midiPlayer.playing].header.tempos[0].bpm}</p> */}
            </div>


            {playing && midiPlayer.loaded && <Bubble stemDirection={'up'} className='Controls'>
                <span>Track volumes:</span>
                {   
                    midiPlayer.songs[midiPlayer.loaded.name].tracks
                    .map(t=> {
                    if(!t.name) return null 
                    const id = `track_slider_${t.name}`
                    return <div key={id}>
                        <label className={'TrackSliderLabel'} htmlFor={id}> {t.name} </label>
                        <input className={'TrackSlider'} type='range' id={id} max={midiset[t.name]?.volume} min={-48} 
                            defaultValue={0}
                            onChange={ev=>{
                                midiPlayer.players[t.name].volume.value = ev.target.value
                            }}
                        />
                        <br/>
                    </div>})
                }
            </Bubble>}

            <ul>
            {(Object.keys(midiPlayer.songs)).map(s => {
                return <li className={playing === s ? 'selected' : ''} key={`li_song_${s}`}>
                    <div className='ListAudio'>
                        <span>{s}</span>
                        <button className='PlayButton' onClick={async ()=>{
                            if(playing === s) {
                                midiPlayer.stop(0)
                                setPlaying(null)
                                return
                            }
                            
                            const onBeat = ()=>{
                                setSeekHead(midiPlayer.getProgress())
                            }

                            midiPlayer.play(s,{onBeat}).then(()=>{
                                setPlaying(s)
                            });
                        }}>{playing === s ? 'Stop' : 'Play'}</button>
                    </div>
                </li>
            })}
            </ul>
        </section>

        <section className='EffectsPlayer'>
            <h2>Sound Effects Player</h2>
            <ul>
            {(Object.keys(midiPlayer.effectsList)).map(e => {
                const name = e
                return <li key={`li_effect_${name}`}>
                    <div className='ListAudio'>
                        <span>{name}</span>
                        <button onClick={()=>{
                            playSoundEffect(midiPlayer, name)
                        }}>Play</button>
                    </div>
                </li>
            })}
            </ul>
        </section>

        <section className='Generators'>
            <h2>Generators</h2>
            <i>enumerateRangePerClef</i>
            <TestFunctionWithParams 
                fn={enumerateRangePerClef} 
                defInput={'["B3","C4","D4","E4","F4"]'}
                onResult={(r)=>{
                    setResults(res => {
                        return {...res,
                            enumerateRangePerClef: r
                        }
                    }) 
                }}/>
            <hr />

            <i>enumerateRangePerClefOverlap</i>
            <TestFunctionWithParams 
                fn={enumerateRangePerClefOverlap} 
                defInput={'["B3","C4","D4","E4","F4"]'}
                onResult={(r)=>{
                    setResults(res => {
                        return {...res,
                            enumerateRangePerClefOverlap: r
                        }
                    })
                }}/>
            <hr /> 

            <i>{'generateNewGuessPitch2({ notes[],clefs:{% % %},avoidNote:string })'}</i>
            <TestFunctionWithParams 
                fn={generateNewGuessPitch2} 
                defInput={'{"type":"range","notes":["C4","C5"], "clefs":{"treble":1}}'} 
                onResult={(r)=>{
                    setResults(res => {
                        return {...res,
                            generateNewGuessPitch2: r
                        }
                    }) 
                }}/>
            <p>Guess Results:</p>
            <NoteView 
                style={{width:200}} 
                noteNames noBarStart stavesExtra={1} 
                data={results.generateNewGuessPitch2 
                    ? [
                        {clef: results.generateNewGuessPitch2.clefs[0], notes: [results.generateNewGuessPitch2.notes[0]]},
                        {clef: results.generateNewGuessPitch2.clefs[1], notes: [results.generateNewGuessPitch2.notes[1]]}
                    ] 
                    : [{clef:'treble'}]}
                />
            <hr /> 
        </section>
    </div>
}

function TestFunctionWithParams ({fn, label, onResult, defInput = undefined}){
    const [object, setObject] = useState({input: defInput})

    return (<><form className="TestBlock" onSubmit={(ev)=>{
        ev.preventDefault()
        setObject(r => {
            let parse
            try{ 
                parse = JSON.parse(object.input)
            }
            catch{
                return {...r, error: 'JSON parse'}
            }

            try{
                const result = fn(parse)
                onResult(result)
                return {input: object.input, output: JSON.stringify(result)}
            }
            catch (er){
                console.log(er)
                return {...r, error: 'function call '}
            }
        });
    }}>
        <label>{label}<br/>
        <input onChange={(event)=>{
            setObject(o => {return {...o, input: event.target.value}});
        }} 
        value={object?.input}
        type={'text'}/>
    </label>
    {object?.error ? 
        <p>Error: {object.error}</p>
    : <p>  
        Input: <i>{object?.input}</i>
        <br/>
        Output: <i>{object?.output}</i>
    </p>}
    </form>
    </>)
}