import { useEffect, useState, useRef} from 'react'
import '../Styles/TitleScreen.css'
import '../Styles/Background.css'
import star from '../img/icons/star2.png'
import { SnakeLoadbar } from '../SnakeView'
import VersionTag from '../Version'

export function TitleScreen(){

    return <div className='TitleScreen FlexDown Background'>
        <section className='MainTitle slide-in-blurred-top'>
            <h1>Sneel</h1>
            <SnakeLoadbar area={12}/>
        </section>
        
            <h2 className='SubTitle slide-in-fwd-center'>A sight reading game</h2>

            <section className='FlexDown slide-in-fwd-center'>
                <button> Pitch Game </button>
                <button disabled={true}> Rhythm Game </button>
            </section>

            <section className='WhatsNew Bubble Stem slide-in-bottom'>
                <div>
                <span>Check out the <a href="https://github.com/purewack/sneel-web">GitHub page</a></span>
                <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"></img>
                </div>
            </section>

            <VersionTag />
    </div>
}