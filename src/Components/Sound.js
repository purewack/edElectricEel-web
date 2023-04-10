import * as Tone from "tone";
import { Midi } from '@tonejs/midi'

let soundPrepared = false;

class SongPlayer {
    #transpose = 0;

    constructor(name){
        if(name) this.load(name)
        console.log("New SongPlayer")
    }

    async load(name){
        if(this.song){
            this.destroy()
        }

        const midiJson = await Midi.fromUrl("songs/" + name)
        console.log(midiJson)

        this.song = midiJson;

        Tone.Transport.cancel();
        Tone.Transport.clear();
        Tone.Transport.bpm.value = midiJson.header.tempos[0].bpm
        Tone.Transport.loopEnd = midiJson.duration;
        Tone.Transport.loopStart = 0;
        Tone.Transport.loop = true;

        this.voices = []

        midiJson.tracks.forEach(t => {
            if(!t.notes.length) return;
            const drums = t.instrument.percussion
            let vv;
            if(drums){
                vv = new Tone.Sampler({
                    urls: {
                        'C2':'Sounds/kick_soft.wav',
                        'D2':'Sounds/snare_noise.wav',
                        'F#2':'Sounds/hat8bit1.wav',
                    },
                    onload: () => {
                    console.log('samples loaded')
                    }
                }).toDestination();
            }
            else{
                vv = new Tone.PolySynth().toDestination()
            }

            this.voices.push(vv)
            t.notes.forEach(n => {
                if(drums){
                    Tone.Transport.schedule((tt)=>{
                        vv.triggerAttackRelease(n.name, '2n', tt, n.velocity);
                    },n.time)
                }
                else{
                    Tone.Transport.schedule((tt)=>{
                        const tr = this.getTranspose() 
                        vv.triggerAttackRelease(Tone.Midi(n.midi + tr).toFrequency(), n.duration, tt, n.velocity);
                    },n.time)
                }
            })
            vv.volume.value = drums ? -12 : -9;
        })
    }

    destroy(){
        Tone.Transport.stop();
        Tone.Transport.clear();
        Tone.Transport.cancel();
        this.song = null;
        if(this.voices.length) this.voices.forEach(v => {
            if(v.releaseAll) v.releaseAll()
            else v.dispose();
            console.log(v);
        })
        this.voices = null;
    }

    play(){
        if(!this.song) return;
        Tone.Transport.start("+0.5","0:0:0");
    }

    toggle(){

    }

    stop(){

    }

    getTranspose(){
        return this.#transpose;
    }

    setTranspose(t){
        this.#transpose = t;
    }
}
export const songPlayer = new SongPlayer('menu.mid');

export function prepareSound (levelData,setInstruments,setCurrentPatterns,onGametick){
    if(soundPrepared) return;
    soundPrepared = true;
    Tone.Transport.bpm.value = levelData.music.bpm

    const piano = new Tone.Synth().toDestination();
    piano.oscillator.type = "triangle";
    piano.volume.value = -18

    const bass = new Tone.Synth().toDestination();
    bass.oscillator.type = "pwm";
    bass.volume.value = -24

    const sampler = new Tone.Sampler({
        urls: levelData.music.samples,
        onload: () => {
        console.log('samples loaded')
        }
    }).toDestination();
    sampler.volume.value = -20

    setInstruments({
        piano, 
        sampler, 
        bass
    })


    const when = '1:0:0'
    const tickId = Tone.Transport.scheduleRepeat((t)=>{
        Tone.Draw.schedule(()=>{
            onGametick()
        })
    }, levelData.gameTickInterval, when)

    const moveInterval = parseInt(levelData.gameTickInterval) / levelData.ticksPerMove + 'n'
    const moveId = Tone.Transport.scheduleRepeat((t)=>{
        playSound(sampler, levelData.music.sounds.move)
    }, moveInterval, when)

    const beatLine = new Tone.Pattern((t,n)=>{
        sampler.triggerAttackRelease(n,'8n',t)
    },levelData.music.beat.data).start(when)
    beatLine.interval = levelData.music.beat.interval

    const bassLine = new Tone.Pattern((t,n)=>{
        bass.triggerAttackRelease(
            Tone.Midi(n).toFrequency(),
            Tone.Time(levelData.music.bass.interval).toSeconds()/2,
            t
        )
    })
    bassLine.interval = levelData.music.bass.interval

    setCurrentPatterns({tick: tickId, snake:moveId, beat:beatLine, bass:bassLine})

    const countdown = new Tone.Pattern((t,n)=>{
        sampler.triggerAttackRelease(n,'8n',t)
    },['C1','C1','C1','B1']).start('0:0:0').stop(when)
    
    Tone.Transport.position = '0:0:0'
    console.log(when)
    console.log(Tone.Transport.position)
    console.log(Tone.Transport.state)
    console.log(beatLine)
}

export function playSound(sampler, sound){
    sampler.triggerAttackRelease(sound[0], sound[1]);
}

export function newBassLine (root, instrument, bassData, currentPatterns, setCurrentPatterns){
    const nn  = Tone.Frequency(root).toMidi() % 12
    const midiRoot = bassData.root;
    const newRoot = midiRoot + nn
    const newPattern = bassData.data.map(p=>newRoot + p - 1)

    const when = QuanTime(Tone.Transport.position,bassData.grain,4)
    console.log(Tone.Transport.position, when)
    Tone.Transport.scheduleOnce((tt)=>{
        currentPatterns.bass.values = newPattern
    }, Tone.Time(when).toSeconds() - 0.05)
    if(currentPatterns.bass.state === 'stopped') currentPatterns.bass.start(when)
  }

export function endSound(currentPatterns,setCurrentPatterns){
    soundPrepared = false
    currentPatterns.bass && currentPatterns.bass.dispose()
    currentPatterns.beat && currentPatterns.beat.dispose()
    Tone.Transport.clear()
    Tone.Transport.cancel()
    setCurrentPatterns(null)
}

export function QuanTime(nowTime, atBeats, barBeats){
    const units = nowTime.split(':')
    const nowBar = parseInt(units[0])
    const nowBeat = parseInt(units[1])
  
    const quantize = (v,q)=>Math.floor((v + q)/q)*q;
  
    if(atBeats < barBeats){
      const adv =  quantize(nowBeat,atBeats)
      const nextBeat = adv%barBeats
      const nextBar = nowBar + Math.floor(adv/barBeats)
      return `${nextBar}:${nextBeat}:0`
    }
  
    const adv = atBeats/barBeats
    return `${quantize(nowBar,adv)}:0:0`
  }