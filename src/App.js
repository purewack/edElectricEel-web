import './Styles/BasePitch.css'

import * as Tone from 'tone'
import * as PIXI from "pixi.js";
import snake_atlas from "./Components/SnakeView/assets/snake.json";
import scene_atlas from "./Components/SnakeView/assets/scene.json";
import items_atlas from "./Components/SnakeView/assets/items.json";
import entity_atlas from "./Components/SnakeView/assets/entity.json";
import tiles_img from "./Components/SnakeView/assets/tiles64.png";

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
import { Disclaimer } from './Screens/Disclaimer';
import Learn from './Screens/Learn';

export const DebugContext = createContext(false);
export const MidiContext = createContext();
export const TextureContext = createContext();
export const SettingsContext = createContext();

const themes = {
    title: 'trio.mid',
    selectDifficulty: 'classy.mid',
    learn: 'jazzy.mid',
}

export default function App(){
    const [showDebug, setShowDebug] = useState(false)
    const [midiPlayer, setMidiPlayer] = useState()
    const [textures, setTextures] = useState({})
    const [settings, setSettings] = useState({
        volume:{
            music: 100,
            effects: 100,
            input: 100
        }
    })
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

    useEffect(() => {
        let _sprites
        const tex = PIXI.BaseTexture.from(tiles_img);
        const snake_SS = new PIXI.Spritesheet(tex, snake_atlas);
        const scene_SS = new PIXI.Spritesheet(tex, scene_atlas);
        const items_SS = new PIXI.Spritesheet(tex, items_atlas);
        const entity_SS = new PIXI.Spritesheet(tex, entity_atlas);

        Promise.all([snake_SS.parse(), scene_SS.parse(), items_SS.parse(), entity_SS.parse()]).then(
        (s) => {
            _sprites = { snake: s[0], scene: s[1], items: s[2], entity: s[3]}
            setTextures(_sprites);
            console.log("textures loaded",_sprites);
            setLoading(s => {return {...s, texturesLoadingState: true}})
        }
        );

        // return ()=>{
        //     if(_sprites)
        //     _sprites.destroy(true)
        // }
      }, []);

    useEffect(()=>{
        if(midiPlayer) {
            console.log(midiPlayer)
            setLoading(s => {return {...s, assetLoadingState: true}})
        }
        return ()=>{
            setLoading(s => {return {...s, assetLoadingState: false}})
        }
    },[midiPlayer])
    
    const [isPresenting, setIsPresenting] = useState('');

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

            setIsPresenting('')
        }
        if(bypass) go()
        else{
            setIsPresenting('PresentFade')
            setTimeout(go,inTime)
        }
    }

    return (<div className={'App ' + isPresenting}>
        {!loading.audioContextState ? 
        
        <Disclaimer loading={loading} setLoading={setLoading}/>
        
        :
        
        <DebugContext.Provider value={showDebug}>
        <MidiContext.Provider value={midiPlayer}>
        <TextureContext.Provider value={textures}>
        <SettingsContext.Provider value={[settings,setSettings]}>
            <Routes>
                <Route path="/"             element={<Title theme={themes.title} onPresent={handlePresentScreen}/>} />
                <Route path="/pitch"        element={<SelectDifficulty theme={themes.selectDifficulty} onPresent={handlePresentScreen}/>}/>
                <Route path="/pitch/single" element={<LevelBasePitch onPresent={handlePresentScreen}/>}/>
                <Route path="/learn"        element={<Learn theme={themes.learn} onPresent={handlePresentScreen}/>}/>
                <Route path="/testzone"     element={<TestZone onPresent={handlePresentScreen}/>}/>
            </Routes>
        </SettingsContext.Provider>
        </TextureContext.Provider>
        </MidiContext.Provider>
        </DebugContext.Provider>
        }
    </div>)
}