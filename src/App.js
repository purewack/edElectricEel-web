import './Styles/BasePitch.css'

import * as Tone from 'tone'
import { createContext, useEffect, useState } from 'react'
import { Routes, Route, useNavigate} from 'react-router-dom';

import LevelBasePitch  from './Screens/GameModes/BasePitch'
import { SelectDifficulty } from './Screens/SelectDifficulty'
import {Title} from './Screens/Title'
import { midiPlayer, songPlayer } from './Components/Sound'
import { TestZone } from './Screens/TestZone'
import arrow from './AssetsImport/icons/arrow.png'
import midiList from './midiList.json'

export const DebugContext = createContext(false);

export default function App(){
    const [showDebug, setShowDebug] = useState(false)
    const [loading, setLoading] = useState({
        audioContextState: false,
        assetLoadingState: false,
        currentAssetLoadingString: '',
    })
    const navigate = useNavigate()

    useEffect(()=>{
        if(loading.assetLoadingState) return
        console.log(midiPlayer,midiList,window.location.origin)
        window.toggleDebug = ()=>{setShowDebug(d=>!d)}
        const loadSound = async ()=>{
            // const songList = ['jazzy.mp3','classy.mp3']
            // await songPlayer.load(songList, (loadedItem, progressArray)=>{
            //     const str = `Song:${loadedItem} [${progressArray[0]}/${progressArray[1]}]`
            //     setLoading(str)
            //     console.log(str)
            // })
            await midiPlayer.load(midiList, (loadedItem, progressArray)=>{
                const str = `MIDI:${loadedItem} [${progressArray[0]}/${progressArray[1]}]`
                setLoading(s => {return {...s, currentAssetLoadingString: str}})
            }).then().catch(()=>{
                console.log('reject midi loading')
            })
            setLoading(s => {return {...s, assetLoadingState: true}})
        }
        loadSound()
    },[])
    
    const [isPresenting, setIsPresenting] = useState(false);

    const handlePresentScreen = (toPresent, inTime = 400, bypass=false, data)=>{
        const go = ()=>{
            navigate(toPresent)
            setIsPresenting(false)
        }
        if(bypass) go()
        else{
            setIsPresenting(true)
            setTimeout(go,inTime)
        }
    }

    return (<div className={'App ' + (isPresenting ? 'PresentFade' : '')}>
        {!loading.audioContextState ? <div className='FlexDown'>
            <h1>Disclaimer</h1>
            <h2>This app will make sound, please adjust your volume to hear it</h2>
            {loading.assetLoadingState ? <div className='letsGoClick'> 
            Lets Go!
            <img alt="ok" src={arrow} onClick={()=>{
                Tone.start().then(()=>{
                    setLoading(s=> { return {...s, audioContextState:true}})
                })
            }}/>
            </div>
            :
            <p>Loading... {loading.currentAssetLoadingString}</p>
            }   
        </div> 
        
        :
        
        <DebugContext.Provider value={showDebug}>
        <Routes>
            <Route path="/" element={<Title onPresent={handlePresentScreen}/>} />
            <Route path="/pitch" element={<SelectDifficulty onPresent={handlePresentScreen}/>}/>
            <Route path="/pitch/game" element={<LevelBasePitch onPresent={handlePresentScreen}/>}/>
            <Route path="/testzone" element={<TestZone onPresent={handlePresentScreen}/>}/>
        </Routes> 
        </DebugContext.Provider>
        }
    </div>)
}