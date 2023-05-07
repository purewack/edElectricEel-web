import { useEffect, useState, useRef, useContext} from 'react'
import '../Styles/TitleScreen.css'
import '../Styles/Background.css'
import { SnakeLoadbar } from '../Components/SnakeView'
import VersionTag, {versionText,PatchNotes} from '../Components/Version'
import { MidiContext } from '../App'


export function Title({onPresent, theme}){
    const midiPlayer = useContext(MidiContext)
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
                    <button disabled={true}> Learn </button>
                    <div>  {submenu === 'options' ? 
                        <div className={'submenu selected'}>
                            <div>
                                <h2 className='title'>Options:</h2>
                                <button disabled={true}> Music Volume </button>
                                <button disabled={true}> Input Volume </button>
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