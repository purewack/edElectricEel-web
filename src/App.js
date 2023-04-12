import './Styles/BasePitch.css'

import LevelBasePitch  from './Screens/GameModes/BasePitch'
import { SelectDifficulty } from './Screens/SelectDifficulty'
import {Title} from './Screens/Title'
import { createContext, useEffect, useState } from 'react'
import * as Tone from 'tone'
import { midiPlayer, songPlayer } from './Components/Sound'
import arrowSVG from './AssetsImport/icons/arrow.svg'

export const DebugContext = createContext(false);

export default function App(){
    const [showDebug, setShowDebug] = useState(false)

    const [loading, setLoading] = useState()
    const [loaded, setLoaded] = useState(false)
    useEffect(()=>{
        console.log(midiPlayer)
        window.toggleDebug = ()=>{setShowDebug(d=>!d)}
        const loadSound = async ()=>{
            const songList = ['jazzy.mp3','classy.mp3']
            const midiList = ['classy.mid', "jazzy.mid"]
            const songsLoader = (loadedItem, progressArray)=>{
                const str = `Song:${loadedItem} [${progressArray[0]}/${progressArray[1]}]`
                setLoading(str)
                console.log(str)
            }
            const midiLoader = (loadedItem, progressArray)=>{
                const str = `MIDI:${loadedItem} [${progressArray[0]}/${progressArray[1]}]`
                setLoading(str)
                console.log(str)
            }
            
            await songPlayer.load(songList, songsLoader)
            await midiPlayer.load(midiList, midiLoader)
            setLoaded(true)
        }
        loadSound()
    },[])
    
    const [screen, setScreen] = useState('info');
    const [isPresenting, setIsPresenting] = useState(false);

    const handlePresentScreen = (toPresent, bypass=false, data)=>{
        const go = ()=>{
            if(toPresent === 'title'){
                // midiPlayer.stop()
                // songPlayer.play('jazzy.mp3')

                midiPlayer.play('jazzy.mid');
            }
            else{
                // songPlayer.stop(0)
                // midiPlayer.play('classy.mid');

                midiPlayer.play('classy.mid');
            }
            setScreen(toPresent)
            setIsPresenting(false)
        }
        if(bypass) go()
        else{
            setIsPresenting(true)
            setTimeout(go,400)
        }
    }

    return (<div className={'App ' + (isPresenting ? 'PresentFade' : '')}>
        {screen === 'info' && <div className='FlexDown'>
            <h1>Disclaimer</h1>
            <h2>This app will make sound, please adjust your volume to hear it</h2>
            {loaded ? <div className='letsGoClick'> 
            Lets Go!
            <img alt="ok" src={arrowSVG} onClick={()=>{
                Tone.start().then(()=>{
                    handlePresentScreen('title',true)
                })
            }}/>
            </div>
            :
            <p>Loading... {loading}</p>
            }   
        </div>}

        <DebugContext.Provider value={showDebug}>
            {screen === 'title' && <Title onPresent={handlePresentScreen}/>}
            {screen === 'selectDifficulty' && <SelectDifficulty onPresent={handlePresentScreen}/>}
            {screen === 'game' && <LevelBasePitch  onPresent={handlePresentScreen}/>}
        </DebugContext.Provider>
    </div>)
}