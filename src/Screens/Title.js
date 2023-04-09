import { useEffect, useState, useRef} from 'react'
import '../Styles/TitleScreen.css'
import '../Styles/Background.css'
import { SnakeLoadbar } from '../Components/SnakeView'
import VersionTag, {versionText,PatchNotes} from '../Components/Version'

export function Title({onPresent}){

    // useEffect(()=>{
    //     const s = new Tone.Synth().toDestination();
    //     s.volume.value = -12;
    //     s.triggerAttackRelease('c2','2n');
    //     return ()=>{
    //         s.dispose()
    //     }
    // })

    const newGamePitch = ()=>{
        onPresent('selectDifficulty')
    }

    return <div className='TitleScreen FlexDown Background'>
        <section className='MainTitle slide-in-blurred-top'>
            <h1>Sneel</h1>
            <SnakeLoadbar area={12}/>
        </section>
        
            <h2 className='SubTitle slide-in-fwd-center'>A sight reading game</h2>

            <section className='FlexDown slide-in-fwd-center'>
                <button onClick={newGamePitch}> Pitch Game </button>
                <button disabled={true}> Rhythm Game </button>
                <button disabled={true}> Options </button>
                <button disabled={true}> About </button>
            </section>

        <section className='WhatsNew Bubble Stem slide-in-bottom'>
            <div>
            <span>Check out the <a href="https://github.com/purewack/sneel-web">GitHub page</a></span>
            <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"></img>
            </div>
            <details>
                <summary>Patch notes: </summary>
                <PatchNotes/>
            </details>
        </section>

        <VersionTag />
    </div>
}