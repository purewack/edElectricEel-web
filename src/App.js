import LevelChromaticOctave from './Screens/GameModes/levelChromaticOctave'
import { SelectDifficulty } from './Screens/SelectDifficulty'
import { SnakeLoadbar } from './SnakeView'
import {Title} from './Screens/Title'
import { createContext, useEffect, useState } from 'react'
import * as Tone from 'tone'

export const DebugContext = createContext(false);

export default function App(){
    const [showDebug, setShowDebug] = useState(false)
    useEffect(()=>{
        window.toggleDebug = ()=>{setShowDebug(d=>!d)}
    },[])
    
    const [screen, setScreen] = useState('info');
    const [isPresenting, setIsPresenting] = useState(false);

    const handlePresentScreen = (toPresent, data)=>{
        setIsPresenting(true)
        setTimeout(()=>{
            setScreen(toPresent)
            setIsPresenting(false)
        },400)
    }

    return (<div className={'App ' + (isPresenting ? 'PresentFade' : '')}>
        {screen === 'info' && <div className='FlexDown'>
            <h1>Disclaimer</h1>
            <h2>This app will make sound, please adjust your volume to hear it</h2>
            <button onClick={()=>{
                Tone.start()
                setScreen('title')
            }}>Ok!</button>   
        </div>}

        <DebugContext.Provider value={showDebug}>
            {screen === 'title' && <Title onPresent={handlePresentScreen}/>}
            {screen === 'selectDifficulty' && <SelectDifficulty onPresent={handlePresentScreen}/>}
            {screen === 'game' && <LevelChromaticOctave onPresent={handlePresentScreen}/>}
        </DebugContext.Provider>
    </div>)
}