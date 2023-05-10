import '../Styles/TestZone.css'
import { useEffect, useState, useContext } from 'react'
import { playSoundEffect } from '../Helpers/Sound'
import { MidiContext } from '../App'
import midiset from '../Helpers/midiset.json'
import { leadingZeros } from '../Helpers/Hooks'
import Bubble from '../Components/Bubble'
import NoteView from '../Components/NoteView'
import { generateNewGuessPitch2 } from '../Helpers/NoteGuess'

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


    const [guessNotes, setGuessNotes] = useState()
    const [guessData, setGuessData] = useState({value: '{"type":"range", "notes":["C2","C5"]}'})

    return <div className='TestZone'>
        <nav>
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

        <section className='NoteGuessPitch2'>
            <h2>Note Guess: Pitch2</h2>
            <i>generateNewGuessPitch2(guessData)</i>
            <form onSubmit={(ev)=>{
                ev.preventDefault()
                const data = JSON.parse(guessData.value)
                // console.log(data)
                setGuessData(r => {return {...r, data}});
            }}>
            <label>guessData<br/>
                <input onChange={(event)=>{
                    setGuessData(r => {return {...r, value: event.target.value}});
                }} 
                value={guessData.value}
                type={'text'}/>
            </label>
            </form>

            <p>Guess Results:</p>
            <NoteView noteNames noBarStart stavesExtra={2} data={[{clef:guessNotes?.clef, notes:guessNotes?.notes}]}/>
            
            <p>Status: {}</p>
            <button onClick={(ev)=>{
                setGuessNotes(generateNewGuessPitch2(guessData?.data?.avoidNote, {
                    ...guessData.data,
                    clefs: guessData.data.clefs ? guessData.data.clefs : {treble:1}
                }))
            }}
                disabled={!guessData.data}
            >Generate Next</button>

            <p>Debug: 
                <br/>
                Input: <i>{JSON.stringify(guessData.data)}</i>
                <br/>
                Output: <i>{JSON.stringify(guessNotes)}</i>
            </p>
        </section>
    </div>
}