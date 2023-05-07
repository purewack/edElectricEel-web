import './Styles/BasePitch.css'

import * as Tone from 'tone'
import { createContext, useEffect, useState } from 'react'
import { Routes, Route, useNavigate, useSearchParams, createSearchParams} from 'react-router-dom';
import BGMPlayer from './Helpers/BGMPlayer'
import MidiFilePlayer from './Helpers/MidiPlayer'

import LevelBasePitch  from './Screens/GameModes/BasePitch'
import { SelectDifficulty } from './Screens/SelectDifficulty'
import { Title } from './Screens/Title'
import { TestZone } from './Screens/TestZone'
import arrow from './AssetsImport/icons/arrow.png'
import midiList from './midiList.json'

export const DebugContext = createContext(false);
export const MidiContext = createContext(false);

const themes = {
    title: 'trio.mid',
    selectDifficulty: 'classy.mid'
}

export default function App(){
    const [showDebug, setShowDebug] = useState(false)
    const [midiPlayer, setMidiPlayer] = useState()
    const [loading, setLoading] = useState({
        audioContextState: false,
        assetLoadingState: false,
        currentAssetLoadingString: '',
    })
    const navigate = useNavigate()
    const [search, setSearch] = useSearchParams()

    useEffect(()=>{
        if(loading.assetLoadingState) return
        window.toggleDebug = ()=>{setShowDebug(d=>!d)}
        
        const loadSound = async ()=>{
            // songPlayer = new BGMPlayer();
            // const songList = ['jazzy.mp3','classy.mp3']
            // await songPlayer.load(songList, (loadedItem, progressArray)=>{
            //     const str = `Song:${loadedItem} [${progressArray[0]}/${progressArray[1]}]`
            //     setLoading(str)
            //     console.log(str)
            // })
            const midi = new MidiFilePlayer();
            // console.log(midi,midiList,window.location.origin)

            await midi.load(midiList, (loadedItem, progressArray)=>{
                const str = `MIDI:${loadedItem} [${progressArray[0]}/${progressArray[1]}]`
                setLoading(s => {return {...s, currentAssetLoadingString: str}})
            }).then().catch(()=>{
                console.log('reject midi loading')
            })
            setMidiPlayer(midi)
        }
        loadSound()
    },[])

    useEffect(()=>{
        if(midiPlayer) {
            console.log(midiPlayer)
            setLoading(s => {return {...s, assetLoadingState: true}})
        }
        return ()=>{
            setLoading(s => {return {...s, assetLoadingState: false}})
        }
    },[midiPlayer])
    
    const [isPresenting, setIsPresenting] = useState(false);

    const handlePresentScreen = (toPresent, inTime = 400, bypass=false, data = null)=>{
        const go = ()=>{
            if(data) {
                // const enc = Base64.encode(JSON.stringify(data))
                // const dec = Base64.decode(enc)
                // console.log(enc,dec)
                // const search = '?' + createSearchParams({level:JSON.stringify(data)})
                navigate(toPresent,{state:data})
            } 
            else 
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
        <MidiContext.Provider value={midiPlayer}>
        <Routes>
            <Route path="/"             element={<Title theme={themes.title} onPresent={handlePresentScreen}/>} />
            <Route path="/pitch"        element={<SelectDifficulty theme={themes.selectDifficulty} onPresent={handlePresentScreen}/>}/>
            <Route path="/pitch/single" element={<LevelBasePitch onPresent={handlePresentScreen}/>}/>
            <Route path="/testzone"     element={<TestZone onPresent={handlePresentScreen}/>}/>
        </Routes>
        </MidiContext.Provider>
        </DebugContext.Provider>
        }
    </div>)
}