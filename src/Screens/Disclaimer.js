import '../Styles/Disclaimer.css'
import * as Tone from 'tone'

export function Disclaimer({loading, setLoading}){

    const letsGo = ()=>{
        Tone.start().then(()=>{
            setLoading(s=> { return {...s, audioContextState:true}})
        })
        Tone.context.resume()
    }

    return <div className='Disclaimer'>
        <h1>Hear hear ...</h1>
        <h2>This app will make sound, please adjust your volume to hear it</h2>
        {loading.assetLoadingState ? 
        <>
            <button className='letsGoClick' onClick={letsGo}> 
                Lets Go!
            </button>
            <div className='letsGoArrow' onClick={letsGo}>
                <img alt=">" />
            </div>
        </>
        :
            <p>Loading... {loading.currentAssetLoadingString}</p>
        }   

        <section className='PoweredBy'>
            <h3  align="center">Powered By:</h3>
            <div className='Logos Leftright'>
                <h4 align="center">
                    <a href="https://tonejs.github.io/">
                        <img alt='tone.js' src={'https://avatars.githubusercontent.com/u/11019186?s=200&v=4'}/>
                    </a>
                    <br/>
                    tone.js
                </h4>
                <h4 align="center">
                    <a href="https://pixijs.com/">
                        <img alt='pixi.js' src={'https://pixijs.com/images/logo.svg'}/>
                    </a>
                    <br/>
                    pixi.js
                </h4>
                <h4 align="center">
                    <a href="https://animejs.com"><img src="https://github.com/juliangarnier/anime/blob/master/documentation/assets/img/animejs-v3-header-animation.gif?raw=true" width="250"/></a>
                    <br/>
                    anime.js
                </h4>
            </div>
        </section>
    </div> 
}