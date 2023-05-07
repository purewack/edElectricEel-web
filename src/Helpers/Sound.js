import * as Tone from "tone";
import { QuanTime } from "./Hooks";
// Tone.setContext(new Tone.Context({ latencyHint : "playback", lookAhead: 0.5 }))

let gameTickId = null

export async function startPitchGameSong (midiPlayer,levelData,onGametick, onGameBar){
    if(gameTickId) await endGameSong()

    return new Promise(async (resolve)=>{

        await midiPlayer.stop();

        Tone.Transport.position = '0:0:0';
        await midiPlayer.prepare(levelData.song,null,'1:0:0',true)
        Tone.Transport.bpm.value = levelData.tempo
        
        const countdown = new Tone.Pattern((t,n)=>{
            midiPlayer.players.drums.triggerAttackRelease(n,'8n',t)
        },['F#2','F#2','F#2','D#3']).start('0:0:0').stop('1:0:0')
        gameTickId = Tone.Transport.scheduleRepeat((t)=>{
            Tone.Draw.schedule(()=>{
                onGametick()
            },t)
        }, levelData.gameTickInterval, '1:0:0')
        Tone.Transport.scheduleOnce((t)=>{
            Tone.Draw.schedule(resolve,t)
        },'1:0:0')
        if(onGameBar){
            Tone.Transport.scheduleRepeat(()=>{
                Tone.Draw(()=>{onGameBar()})
            },'1m','0:0:0');
        }
        ////console.log('startPitchGameSong prepare countdown')
        midiPlayer.begin()
        midiPlayer.mute();
        midiPlayer.unmute(['bass','drums'])  

    })
}

export function endGameSong(midiPlayer, now){
    return new Promise((resolve)=>{
        Tone.Transport.clear(gameTickId)
        gameTickId = null
        if(now){
            midiPlayer.stop()
            resolve()
        }
        else
            midiPlayer.stop(1.5).then(()=>{
                resolve();
            });
    })
}

export function setGameSongPitch(midiPlayer, root, force = false){
    const newRoot = Tone.Frequency(root).toMidi() % 12

    const when = QuanTime(Tone.Transport.position,[4,4])
    ////console.log(Tone.Transport.position, '->', when)
    if(!force) {
        Tone.Transport.scheduleOnce((tt)=>{
            midiPlayer.transpose(newRoot)
        }, Tone.Time(when).toSeconds() - 0.05)
    }
    else 
        midiPlayer.transpose(newRoot)
}

export function setGameSongParts(midiPlayer, instrumentSelection){
    midiPlayer.mute(null,2);
    midiPlayer.unmute(instrumentSelection,2);
    ////console.log('new game parts', instrumentSelection)
}

export function playSoundEffect(midiPlayer, name){
    const n = midiPlayer.effectsList[name]
    if(n){
        midiPlayer.nodes.effects.triggerAttackRelease(Tone.Midi(n).toNote(),'1n')
    }
    // else console.log("Effect sound not found ", name)
}

export function playGameInput(midiPlayer, note){
    midiPlayer.nodes.input.triggerAttackRelease(note,'8n','@8n');
}