import { useEffect, useState, useContext } from 'react'
import { playSoundEffect } from '../Helpers/Sound'
import { MidiContext } from '../App'
import midiset from '../Helpers/midiset.json'

export function TestZone({onPresent}){

    const midiPlayer = useContext(MidiContext)
    useEffect(()=>{
        console.log(midiPlayer.songs)
        midiPlayer.stop(1);
        midiPlayer.prepare(midiPlayer.songs[0])
    },[])

    const [playing,setPlaying] = useState()
    const [seekHead, setSeekHead] = useState(0)

    return <div className='TestZone'>
        <button className='btnBack GalleryFlex'
            onClick={()=>{
                    onPresent('/')
            }}>
            <span>Back</span> 
        </button>

        <section className='BGMPlayer'>
            <h2>MIDI Background Music Player</h2>
            <img alt='disc'/>
            
            <span>{playing ? `Playing: ${playing}` : ''}</span>
            <button onClick={()=>{
                midiPlayer.stop()
                setPlaying(null)
                setSeekHead(0);
            }}>Stop</button>

            {seekHead && <>
            <label htmlFor={'seekHead'}> {`${
                    Math.fround(seekHead * midiPlayer.loaded?.duration)
                } / ${
                    Math.fround(midiPlayer.loaded?.duration)
                }`} </label>
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
            </>}

            {playing && midiPlayer.loaded && <div className='controls'>
                {   
                    midiPlayer.songs[midiPlayer.loaded.name].tracks
                    .map(t=> {
                    if(!t.name) return null 
                    const id = `track_slider_${t.name}`
                    return <div key={id}>
                        <label htmlFor={id}> {t.name} </label>
                        <input type='range' id={id} max={midiset[t.name]?.volume} min={-48} 
                            defaultValue={0}
                            onChange={ev=>{
                                midiPlayer.players[t.name].volume.value = ev.target.value
                            }}
                        />
                        <br/>
                    </div>})
                }
            </div>}

            <ul>
            {(Object.keys(midiPlayer.songs)).map(s => {
                return <li className={playing === s ? 'selected' : ''} key={`li_song_${s}`}>
                    <span>{s}</span>
                    <button onClick={async ()=>{
                        if(playing === s) return
                        
                        const onBeat = ()=>{
                            setSeekHead(midiPlayer.getProgress())
                        }

                        midiPlayer.play(s,{onBeat}).then(()=>{
                            setPlaying(s)
                        });
                    }}>Play</button>
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
                    <span>{name}</span>
                    <button onClick={()=>{
                        playSoundEffect(midiPlayer, name)
                    }}>Play</button>
                </li>
            })}
            </ul>
        </section>
    </div>
}