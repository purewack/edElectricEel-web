import { useEffect, useState } from 'react'
import { midiPlayer, songPlayer } from '../Components/Sound'

export function TestZone({onPresent}){

    useEffect(()=>{
        console.log(midiPlayer.songs)
        midiPlayer.stop(1);
        midiPlayer.prepare(midiPlayer.songs[0])
    },[])

    const [playing,setPlaying] = useState()
    const [levels,setLevels] = useState()

    return <div className='TestZone'>
        <button className='btnBack GalleryFlex'
            onClick={()=>{
                    onPresent('title')
            }}>
            <img alt="arrow"/>
            <span>Back</span> 
        </button>

        <section className='BGMPlayer'>
            <h2>MIDI Background Music Player</h2>
            <img alt='disc'/>
            <span>{playing ? `Playing: ${playing}` : ''}</span>
            <button onClick={()=>{
                midiPlayer.stop()
                setPlaying(null)
            }}>Stop</button>
            {playing && midiPlayer.loaded && <div className='controls'>
                {   
                    midiPlayer.songs[midiPlayer.loaded].tracks
                    .map(t=> { 
                    const id = `track_slider_${t.name}`
                    return <div key={id}>
                        <label htmlFor={id}> {t.name} </label>
                        <input type='range' id={id} max={0} min={-48} 
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
                        midiPlayer.play(s,undefined,undefined,undefined,false).then(()=>{
                            setPlaying(s)
                        });
                    }}>Play</button>
                </li>
            })}
            </ul>
        </section>
    </div>
}