import { useEffect, useState, useRef} from 'react'
import '../Styles/TitleScreen.css'
import '../Styles/Background.css'
import star from '../img/icons/star2.png'
import { SnakeLoadbar } from '../SnakeView'

export function TitleScreen(){

    return <div className='TitleScreen Background'>
        <section>
            <div className='TitleSnake'>
                <h1>Sneel</h1>
                <SnakeLoadbar area={12}/>
            </div>
        </section>
        
        <h2>A sight reading game</h2>

        <section>
            <button> Pitch Game </button>
            <button disabled={true}> Rhythm Game </button>
        </section>
    </div>
}