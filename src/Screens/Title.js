import { useEffect, useState, useRef, useContext} from 'react'
import '../Styles/TitleScreen.css'
import '../Styles/Background.css'
import { SnakeLoadbar } from '../Components/SnakeView'
import VersionTag, {versionText,PatchNotes} from '../Components/Version'
import { MidiContext, SettingsContext } from '../App'
import { playGameInput, playSoundEffect } from '../Helpers/Sound'


export function Title({onPresent, theme}){
    const midiPlayer = useContext(MidiContext)
    const [settings, setSettings] = useContext(SettingsContext)

    const [submenu, setSubmenu] = useState()

    useEffect(()=>{
        midiPlayer.play(theme);
    },[theme])

    const newGamePitch = ()=>{
        onPresent('/pitch')
    }

    return <div className='TitleScreen Background'>
        <section className='MainTitle'>
            <h1>Sneel</h1>
            <SnakeLoadbar area={12}/>
        </section>
        
            <h2 className='SubTitle '>A sight reading game</h2>
            
            <section className={'Selections'}>
                    <div> {submenu === 'practice' ? 
                        <div className={'submenu selected'}>
                            <div>
                                <h2 className='title'>Practice:</h2>
                                <div>
                                    <button onClick={newGamePitch}> Pitch </button>
                                    <button disabled={true}> Rhythm </button>
                                </div>
                            </div>
                        </div>
                        :
                        <button onClick={()=>{setSubmenu('practice')}}> Practice </button>
                    }</div>
                    <button disabled={true}> Story </button>
                    <button disabled={false} onClick={()=>{onPresent('/learn')}}> Learn </button>
                    <div>  {submenu === 'options' ? 
                        <div className={'submenu selected'}>
                            <div className='Volumes'>
                                <h2 className='title'>Volumes:</h2>
                                    <div className='Frame Block'>
                                        <label className={'MusicVol'} htmlFor={'MusicVol'}> Music </label>
                                        <input type='range' id={'MusicVol'} max={100} min={0} step={1}
                                            value={settings.volume.music}
                                            onChange={(ev)=>{
                                                setSettings(s => {
                                                    let v = {...s}
                                                    v.volume.music = parseFloat(ev.target.value)
                                                    const db = 20 * Math.log(v.volume.music/100)
                                                    midiPlayer.nodes.output.volume.value = midiPlayer.musicMaxVol = db
                                                    return v
                                                })
                                            }}
                                        />
                                    </div>
                                    <div className='Frame Block'>
                                        <label className={'EffectsVol'} htmlFor={'EffectsVol'}> Effects </label>
                                        <input type='range' id={'EffectsVol'} max={100} min={0} step={1} 
                                            value={settings.volume.effects}
                                            onChange={(ev)=>{
                                                setSettings(s => {
                                                    let v = {...s}
                                                    v.volume.effects = parseFloat(ev.target.value)
                                                    const db = 20 * Math.log(v.volume.effects/100)
                                                    midiPlayer.nodes.effects.volume.value = db
                                                    return v
                                                })
                                            }}
                                            onPointerUp={(ev)=>{
                                                playSoundEffect(midiPlayer, 'ok.wav')
                                            }}
                                        />
                                    </div>
                                    <div className='Frame Block'>
                                        <label className={'InputVol'} htmlFor={'InputVol'}> Input Method </label>
                                        <input type='range' id={'InputVol'} max={100} min={0} step={1} 
                                            value={settings.volume.input}
                                            onChange={(ev)=>{
                                                setSettings(s => {
                                                    let v = {...s}
                                                    v.volume.input = parseFloat(ev.target.value)
                                                    const db = 20 * Math.log(v.volume.input/100)
                                                    midiPlayer.nodes.input.volume.value = db
                                                    return v
                                                })
                                            }}
                                            onPointerUp={(ev)=>{
                                                playGameInput(midiPlayer, 'C5')
                                            }}
                                        />
                                    </div>
                            </div>
                            <div>
                                <h2 className='title'>Development:</h2>
                                <button onClick={()=>{onPresent('/testzone')}}> Test Zone </button>
                            </div>
                        </div>
                        :<button disabled={false} onClick={()=>{setSubmenu('options')}}> Options </button>
                    }</div>
                    <button disabled={true}> About </button>
                
            </section>


        
        <VersionTag />
    </div>
}